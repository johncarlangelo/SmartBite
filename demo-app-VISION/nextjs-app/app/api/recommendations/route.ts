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
  const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout (increased)

  try {
    const body: RecommendationRequest = await req.json()
    const { type, currentDish, recentDishes, month, offline } = body

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    
    // ============================================
    // STAGE 3: TEXT MODEL (llama3.2:3b) - Recommendations
    // Purpose: Generate food recommendations based on analyzed dishes
    // Why: llama3.2 excels at reasoning and generating creative suggestions
    // Input: Current dish analysis and/or recent dishes history
    // Output: Similar dishes, healthier alternatives, seasonal suggestions, pairings
    // ============================================
    const textModel = process.env.OLLAMA_TEXT_MODEL || 'llama3.2:3b'

    let prompt = ''
    
    switch (type) {
      case 'similar':
        // Support both currentDish (similar to analyzed dish) and recentDishes (based on history)
        if (currentDish) {
          prompt = generateSimilarToCurrentDishPrompt(currentDish)
        } else {
          prompt = generateSimilarDishesPrompt(recentDishes || [])
        }
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
        model: textModel,
        prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 500,  // Reduced from 800 for much faster generation
          num_ctx: 2048,     // Reduced context window for speed
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

function generateSimilarToCurrentDishPrompt(currentDish: DishAnalysis): string {
  return [
    'You are a food recommendation AI. Suggest 4-6 dishes similar to the analyzed dish.',
    '',
    `Current dish: ${currentDish.dishName} (${currentDish.cuisineType})`,
    `Calories: ${currentDish.nutrition.calories} cal`,
    `Nutrition: Protein ${currentDish.nutrition.protein_g}g, Carbs ${currentDish.nutrition.carbs_g}g, Fat ${currentDish.nutrition.fat_g}g`,
    `Key ingredients: ${currentDish.ingredients.slice(0, 5).join(', ')}`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string,',
    '      "cuisineType": string,',
    '      "description": string (1 short sentence),',
    '      "reason": string (why it\'s similar - 1 short sentence),',
    '      "estimatedCalories": number,',
    '      "estimatedPrepTime": number (minutes),',
    '      "matchScore": number (75-95)',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Suggest dishes with similar ingredients, cuisine, or cooking methods',
    '- Include a mix of same cuisine and fusion dishes',
    '- Keep descriptions VERY brief',
    '- Match score should reflect similarity',
    '- Output ONLY valid JSON',
  ].join('\n')
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
    'You are a food recommendation AI. Based on user\'s recent dish analyses, suggest 4-6 dishes they might enjoy.',
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
    '      "description": string (1 short sentence),',
    '      "reason": string (1 short sentence),',
    '      "estimatedCalories": number,',
    '      "estimatedPrepTime": number (minutes),',
    '      "matchScore": number (70-95)',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Suggest 4 diverse dishes',
    '- Keep descriptions VERY brief',
    '- Output ONLY valid JSON',
  ].join('\n')
}

function generateHealthierAlternativesPrompt(currentDish: DishAnalysis): string {
  return [
    'You are a nutrition AI. Suggest 4-5 healthier alternatives to this dish.',
    '',
    `Current: ${currentDish.dishName} (${currentDish.cuisineType}, ${currentDish.nutrition.calories} cal)`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string,',
    '      "cuisineType": string,',
    '      "description": string (brief, what makes it healthier),',
    '      "reason": string (brief health benefit),',
    '      "estimatedCalories": number (15-30% lower),',
    '      "estimatedPrepTime": number,',
    '      "isHealthier": true',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- 4-5 alternatives only',
    '- VERY brief descriptions',
    '- Output ONLY JSON',
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

  return [
    `Suggest 5 ${season} dishes.`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string,',
    '      "cuisineType": string,',
    '      "description": string (brief),',
    '      "reason": string (seasonal ingredient),',
    '      "estimatedCalories": number,',
    '      "estimatedPrepTime": number',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- 5 dishes for ' + season,
    '- VERY brief',
    '- Output ONLY JSON',
  ].join('\n')
}

function generatePairingRecommendationsPrompt(currentDish: DishAnalysis): string {
  return [
    `Suggest 4 perfect pairings for: ${currentDish.dishName} (${currentDish.cuisineType})`,
    '',
    'STRICT JSON SCHEMA:',
    '{',
    '  "recommendations": [',
    '    {',
    '      "dishName": string,',
    '      "cuisineType": string,',
    '      "description": string (type: side/drink/dessert),',
    '      "reason": string (brief pairing reason),',
    '      "estimatedCalories": number,',
    '      "estimatedPrepTime": number',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- 2 sides, 1 drink, 1 dessert',
    '- VERY brief',
    '- Output ONLY JSON',
  ].join('\n')
}
