import { NextRequest, NextResponse } from 'next/server'

type DishAnalysis = {
  dishName: string
  cuisineType: string
  ingredients: string[]
  nutrition: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
}

type RecommendationType = 
  | 'similar' 
  | 'healthier' 
  | 'seasonal' 
  | 'pairing'

type RecommendationRequest = {
  type: RecommendationType
  currentDish?: DishAnalysis
  recentDishes?: DishAnalysis[]
  month?: number
  offline?: boolean
}

type Recommendation = {
  dishName: string
  cuisineType: string
  description: string
  reason: string
  estimatedCalories: number
  estimatedPrepTime: number
  isHealthier?: boolean
  matchScore?: number
}

export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout

  try {
    const body: RecommendationRequest = await req.json()
    const { type, currentDish, recentDishes, month, offline } = body

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    // Use faster text-only model for recommendations (doesn't need vision)
    const recommendationModel = process.env.OLLAMA_RECOMMENDATION_MODEL || 'llama3.2:1b'
    const modelToUse = recommendationModel

    let prompt = ''
    
    switch (type) {
      case 'similar':
        prompt = generateSimilarDishesPrompt(recentDishes || [])
        break
      case 'healthier':
        prompt = generateHealthierAlternativesPrompt(currentDish!)
        break
      case 'seasonal':
        prompt = generateSeasonalDishesPrompt(month || new Date().getMonth() + 1)
        break
      case 'pairing':
        prompt = generatePairingRecommendationsPrompt(currentDish!)
        break
      default:
        clearTimeout(timeoutId)
        return NextResponse.json({ error: 'Invalid recommendation type' }, { status: 400 })
    }

    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        model: modelToUse,
        prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 1000,
        }
      }),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Ollama error ${response.status}: ${text}`)
    }

    const raw = await response.json()
    const recommendations: { recommendations: Recommendation[] } = JSON.parse(raw.response)

    if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
      throw new Error('Invalid AI response format')
    }

    return NextResponse.json({ 
      success: true,
      type,
      recommendations: recommendations.recommendations
    })

  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error('Recommendations API error:', error)
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to generate recommendations'
    let errorDetails = error?.message ?? String(error)
    
    if (error.name === 'AbortError' || error.message?.includes('timeout') || error.code === 'UND_ERR_HEADERS_TIMEOUT') {
      errorMessage = 'AI service is taking too long'
      errorDetails = 'The request timed out. Please try again or use a faster model.'
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to AI service'
      errorDetails = 'Please ensure Ollama is running on ' + (process.env.OLLAMA_BASE_URL || 'http://localhost:11434')
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

function generateSimilarDishesPrompt(recentDishes: DishAnalysis[]): string {
  const dishSummary = recentDishes.slice(0, 5).map(d => 
    `${d.dishName} (${d.cuisineType}, ${d.nutrition.calories} cal)`
  ).join(', ')

  const cuisineFrequency = recentDishes.reduce((acc, d) => {
    acc[d.cuisineType] = (acc[d.cuisineType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const preferredCuisines = Object.entries(cuisineFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cuisine]) => cuisine)

  const avgCalories = recentDishes.reduce((sum, d) => sum + d.nutrition.calories, 0) / recentDishes.length

  return [
    'You are a food recommendation AI. Based on user\'s recent dish analyses, suggest 6 dishes they might enjoy.',
    '',
    `Recent dishes: ${dishSummary}`,
    `Preferred cuisines: ${preferredCuisines.join(', ')}`,
    `Average calorie range: ${Math.round(avgCalories - 100)}-${Math.round(avgCalories + 100)} cal`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string,',
    '      "cuisineType": string,',
    '      "description": string (1 sentence, why user would like this),',
    '      "reason": string (1 sentence, connection to their history),',
    '      "estimatedCalories": number,',
    '      "estimatedPrepTime": number (minutes),',
    '      "matchScore": number (0-100, how well it matches their taste)',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Suggest diverse dishes, not all from same cuisine',
    '- Consider their calorie preferences',
    '- Make descriptions appetizing and specific',
    '- Match scores should vary (70-95)',
    '- Output ONLY valid JSON, no markdown',
  ].join('\n')
}

function generateHealthierAlternativesPrompt(currentDish: DishAnalysis): string {
  return [
    'You are a nutrition-focused food recommendation AI. Suggest 4 healthier alternatives to the given dish.',
    '',
    `Current dish: ${currentDish.dishName}`,
    `Cuisine: ${currentDish.cuisineType}`,
    `Calories: ${currentDish.nutrition.calories} cal`,
    `Protein: ${currentDish.nutrition.protein_g}g, Carbs: ${currentDish.nutrition.carbs_g}g, Fat: ${currentDish.nutrition.fat_g}g`,
    `Ingredients: ${currentDish.ingredients.join(', ')}`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string,',
    '      "cuisineType": string,',
    '      "description": string (what makes it healthier),',
    '      "reason": string (specific health benefit vs original),',
    '      "estimatedCalories": number (should be 15-30% lower),',
    '      "estimatedPrepTime": number (minutes),',
    '      "isHealthier": true',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Each alternative should be genuinely healthier (lower calories, better macros, or healthier cooking method)',
    '- Suggestions should still be satisfying and delicious',
    '- Include at least one dish from same cuisine type',
    '- Be specific about health improvements (e.g., "grilled instead of fried", "more vegetables", "less sodium")',
    '- Output ONLY valid JSON, no markdown',
  ].join('\n')
}

function generateSeasonalDishesPrompt(month: number): string {
  const seasons = {
    12: 'Winter', 1: 'Winter', 2: 'Winter',
    3: 'Spring', 4: 'Spring', 5: 'Spring',
    6: 'Summer', 7: 'Summer', 8: 'Summer',
    9: 'Fall', 10: 'Fall', 11: 'Fall'
  }
  
  const season = seasons[month as keyof typeof seasons] || 'Fall'
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  
  const seasonalIngredients = {
    'Winter': 'root vegetables, squash, citrus, hearty greens, warming spices',
    'Spring': 'asparagus, peas, spring onions, strawberries, fresh herbs',
    'Summer': 'tomatoes, berries, corn, zucchini, stone fruits, fresh basil',
    'Fall': 'pumpkin, apples, mushrooms, brussels sprouts, sweet potatoes, cranberries'
  }

  return [
    `You are a seasonal food expert. Suggest 5 delicious dishes perfect for ${season} (${monthNames[month]}).`,
    '',
    `Season: ${season}`,
    `Typical seasonal ingredients: ${seasonalIngredients[season as keyof typeof seasonalIngredients]}`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string,',
    '      "cuisineType": string,',
    '      "description": string (why it\'s perfect for this season),',
    '      "reason": string (what seasonal ingredients it features),',
    '      "estimatedCalories": number,',
    '      "estimatedPrepTime": number (minutes)',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Focus on dishes that use seasonal ingredients available in ' + season,
    '- Consider the weather (warm comfort foods for winter, light dishes for summer)',
    '- Include diverse cuisines',
    '- Make descriptions evocative of the season',
    '- Output ONLY valid JSON, no markdown',
  ].join('\n')
}

function generatePairingRecommendationsPrompt(currentDish: DishAnalysis): string {
  return [
    'You are a food pairing expert. Suggest 5 perfect pairings (sides, drinks, desserts) for the given dish.',
    '',
    `Main dish: ${currentDish.dishName}`,
    `Cuisine: ${currentDish.cuisineType}`,
    `Calories: ${currentDish.nutrition.calories} cal`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string (name of pairing item),',
    '      "cuisineType": string,',
    '      "description": string (what type: side dish, beverage, dessert, appetizer),',
    '      "reason": string (why it pairs well with the main dish),',
    '      "estimatedCalories": number,',
    '      "estimatedPrepTime": number (minutes)',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Include mix of: 2 side dishes, 2 beverages (wine, tea, cocktail, juice), 1 dessert',
    '- Consider flavor profiles (complement or contrast)',
    '- Respect cuisine traditions when relevant',
    '- Be specific about pairing reasons (e.g., "cuts through richness", "complements spices")',
    '- Output ONLY valid JSON, no markdown',
  ].join('\n')
}
