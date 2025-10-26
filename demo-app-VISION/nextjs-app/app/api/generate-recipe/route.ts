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
    const model = process.env.OLLAMA_RECOMMENDATION_MODEL || 'llama3.2:1b'

    const prompt = [
      `Generate a detailed recipe for: ${dishName} (${cuisineType} cuisine)`,
      '',
      'STRICT JSON SCHEMA:',
      '{',
      '  "dishName": string,',
      '  "cuisineType": string,',
      '  "servings": number,',
      '  "prepTime": number (minutes),',
      '  "cookTime": number (minutes),',
      '  "difficulty": string (Easy/Medium/Hard),',
      '  "ingredients": [',
      '    { "item": string, "amount": string }',
      '  ],',
      '  "instructions": [string] (detailed step by step, 5-8 steps),',
      '  "tips": [string] (2-3 helpful cooking tips),',
      '  "nutrition": {',
      '    "calories": number,',
      '    "protein": string (e.g., "25g"),',
      '    "carbs": string (e.g., "45g"),',
      '    "fat": string (e.g., "12g")',
      '  }',
      '}',
      '',
      'Rules:',
      '- Provide realistic amounts and times',
      '- Make instructions clear and actionable',
      '- Include practical cooking tips',
      '- Output ONLY valid JSON, no markdown',
    ].join('\n')

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
          num_predict: 1500, // Allow more tokens for detailed recipe
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
    const recipe: FullRecipe = JSON.parse(raw.response)

    // Validate recipe structure
    if (!recipe.dishName || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Invalid recipe format from AI')
    }

    return NextResponse.json({ 
      success: true,
      recipe
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
