import { NextRequest, NextResponse } from 'next/server'

type RecipeRequest = {
  dishName: string
  cuisineType: string
}

type FullRecipe = {
  dishName: string
  cuisineType: string
  servings: number
  prepTime: number
  cookTime: number
  difficulty: string
  ingredients: { item: string; amount: string }[]
  instructions: string[]
  tips: string[]
  nutrition: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

  try {
    const body: RecipeRequest = await req.json()
    const { dishName, cuisineType } = body

    if (!dishName || !cuisineType) {
      clearTimeout(timeoutId)
      return NextResponse.json(
        { error: 'Dish name and cuisine type are required' },
        { status: 400 }
      )
    }

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    // Use llama3.2:3b for text generation (recipe creation)
    const model = process.env.OLLAMA_RECIPE_MODEL || 'llama3.2:3b'

    const prompt = `You are a professional chef and nutritionist. Create a detailed, realistic recipe.

DISH: ${dishName}
CUISINE: ${cuisineType}

Generate a complete recipe with accurate nutritional information per serving.

REQUIRED JSON FORMAT (respond with ONLY valid JSON, no markdown):
{
  "dishName": "${dishName}",
  "cuisineType": "${cuisineType}",
  "servings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "difficulty": "Medium",
  "ingredients": [
    { "item": "chicken breast", "amount": "500g" },
    { "item": "olive oil", "amount": "2 tbsp" }
  ],
  "instructions": [
    "Preheat oven to 180°C (350°F)",
    "Season the chicken with salt and pepper",
    "Heat oil in a pan over medium heat"
  ],
  "tips": [
    "Use a meat thermometer to ensure chicken reaches 75°C internal temperature",
    "Let the dish rest for 5 minutes before serving"
  ],
  "nutrition": {
    "calories": 350,
    "protein": "35g",
    "carbs": "25g",
    "fat": "12g"
  }
}

CRITICAL REQUIREMENTS:
1. Calculate realistic nutrition values per serving (calories must be a number like 350, not 0)
2. Protein, carbs, and fat must include units (e.g., "35g", "25g", "12g")
3. Include 3-5 ingredients with amounts
4. Provide 5-7 clear cooking steps
5. Add 2-3 helpful tips
6. Difficulty must be: Easy, Medium, or Hard
7. Times must be realistic numbers in minutes

OUTPUT ONLY THE JSON OBJECT, NO EXPLANATIONS OR MARKDOWN.`

    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 2000, // Increased for more detailed response
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
    console.log('🤖 Raw AI response:', raw.response?.substring(0, 500))
    
    let recipe: FullRecipe
    try {
      recipe = JSON.parse(raw.response)
      console.log('✅ Successfully parsed recipe JSON')
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('Raw response:', raw.response)
      throw new Error('AI returned invalid JSON format')
    }

    // Validate and normalize recipe structure
    if (!recipe.dishName || !recipe.ingredients || !recipe.instructions) {
      console.error('❌ Missing required fields:', {
        hasDishName: !!recipe.dishName,
        hasIngredients: !!recipe.ingredients,
        hasInstructions: !!recipe.instructions
      })
      throw new Error('Invalid recipe format from AI')
    }
    
    console.log('📊 Raw nutrition from AI:', recipe.nutrition)
    
    // Smart fallback: Estimate nutrition if AI didn't provide it
    const hasValidNutrition = recipe.nutrition && 
                               recipe.nutrition.calories > 0 && 
                               recipe.nutrition.protein && 
                               recipe.nutrition.carbs && 
                               recipe.nutrition.fat
    
    let nutrition = recipe.nutrition
    
    if (!hasValidNutrition) {
      console.log('⚠️ AI nutrition data invalid, using smart estimation')
      // Estimate based on dish type (basic heuristics)
      const dishLower = dishName.toLowerCase()
      
      // Default moderate values
      let estimatedCalories = 350
      let estimatedProtein = '25g'
      let estimatedCarbs = '35g'
      let estimatedFat = '15g'
      
      // Adjust based on dish characteristics
      if (dishLower.includes('salad') || dishLower.includes('vegetable')) {
        estimatedCalories = 150
        estimatedProtein = '8g'
        estimatedCarbs = '20g'
        estimatedFat = '5g'
      } else if (dishLower.includes('burger') || dishLower.includes('pizza') || dishLower.includes('fries')) {
        estimatedCalories = 600
        estimatedProtein = '30g'
        estimatedCarbs = '60g'
        estimatedFat = '25g'
      } else if (dishLower.includes('chicken') || dishLower.includes('fish') || dishLower.includes('meat')) {
        estimatedCalories = 400
        estimatedProtein = '40g'
        estimatedCarbs = '25g'
        estimatedFat = '15g'
      } else if (dishLower.includes('pasta') || dishLower.includes('rice') || dishLower.includes('noodle')) {
        estimatedCalories = 450
        estimatedProtein = '15g'
        estimatedCarbs = '70g'
        estimatedFat = '10g'
      } else if (dishLower.includes('soup') || dishLower.includes('stew')) {
        estimatedCalories = 250
        estimatedProtein = '20g'
        estimatedCarbs = '30g'
        estimatedFat = '8g'
      }
      
      nutrition = {
        calories: estimatedCalories,
        protein: estimatedProtein,
        carbs: estimatedCarbs,
        fat: estimatedFat
      }
      
      console.log('💡 Estimated nutrition:', nutrition)
    }
    
    // Ensure nutrition data exists with final defaults
    const normalizedRecipe: FullRecipe = {
      ...recipe,
      nutrition: {
        calories: nutrition?.calories || 350,
        protein: nutrition?.protein || '25g',
        carbs: nutrition?.carbs || '35g',
        fat: nutrition?.fat || '15g'
      }
    }
    
    console.log('✅ Final recipe nutrition:', normalizedRecipe.nutrition)

    return NextResponse.json({ 
      success: true,
      recipe: normalizedRecipe
    })

  } catch (error: any) {
    clearTimeout(timeoutId)
    console.error('Recipe generation error:', error)
    
    let errorMessage = 'Failed to generate recipe'
    let errorDetails = error?.message ?? String(error)
    
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMessage = 'Recipe generation timed out'
      errorDetails = 'Please try again with a simpler dish name.'
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      errorMessage = 'Cannot connect to AI service'
      errorDetails = 'Please ensure Ollama is running.'
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
