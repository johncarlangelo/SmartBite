import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Nutrition = {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

type AnalysisResult = {
  dishName: string
  cuisineType: string
  ingredients: string[]
  nutrition: Nutrition
  recipe: {
    servings: number
    prepMinutes: number
    cookMinutes: number
    steps: string[]
  }
  isHalal: boolean
  halalNotes?: string
  allergens: string[]
  isFood?: boolean
  confidenceFood?: number
  dietaryTags?: {
    isHighProtein: boolean
    containsGluten: boolean
    containsDairy: boolean
    isVegan: boolean
    isKeto: boolean
  }
  healthScore?: {
    overall: number
    macroBalance: number
    dietFriendly: number
  }
}

const SUPPORTED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"])

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null
    const offlineFlag = formData.get('offline') as string | null
    const imageHash = formData.get('imageHash') as string | null

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    if (!SUPPORTED_MIME_TYPES.has(imageFile.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Use PNG or JPG/JPEG.' }, { status: 415 })
    }

    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    
    // Model Configuration:
    // - llava:7b (Vision) - ONLY for image recognition: dish name & cuisine type
    // - llama3.2:3b (Text) - For ALL text generation: nutrition, ingredients, recipe, recommendations
    const visionModel = process.env.OLLAMA_VISION_MODEL || 'llava:7b'
    const textModel = process.env.OLLAMA_TEXT_MODEL || 'llama3.2:3b'
    const onlineModel = process.env.OLLAMA_ONLINE_MODEL || visionModel
    const visionModelToUse = offlineFlag === 'true' ? visionModel : onlineModel

    // ============================================
    // STAGE 1: VISION MODEL (llava:7b)
    // Purpose: Image recognition ONLY - identify dish name and cuisine type
    // Why: llava:7b is optimized for vision tasks, fast at identifying food
    // Output: dishName (e.g., "Spaghetti Carbonara"), cuisineType (e.g., "Italian")
    // ============================================
    const visionPrompt = [
      'You are a food identification AI. Look at this image and identify ONLY:',
      '1. Is this food? (true/false)',
      '2. What is the SPECIFIC dish name?',
      '3. What cuisine type is it?',
      '',
      'Return ONLY this JSON format, nothing else:',
      '{',
      '  "isFood": boolean,',
      '  "confidenceFood": number (0.0 to 1.0),',
      '  "dishName": string (specific name like "Spaghetti Carbonara", "Pad Thai", etc.),',
      '  "cuisineType": string (like "Italian", "Thai", "American", etc.)',
      '}',
      '',
      'Be very specific with the dish name. No extra text, just JSON.'
    ].join('\n')

    const visionResponse = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: visionModelToUse,
        prompt: visionPrompt,
        images: [base64Image],
        stream: false,
        format: 'json',
        options: {
          temperature: 0.2,
          num_predict: 150  // Limit tokens since we only need identification
        }
      })
    })

    if (!visionResponse.ok) {
      const text = await visionResponse.text().catch(() => '')
      throw new Error(`Vision model error ${visionResponse.status}: ${text}`)
    }

    const visionRaw = await visionResponse.json()
    const visionResult = JSON.parse(visionRaw.response)

    // Check if it's food
    const isFood = visionResult.isFood ?? true
    const confidence = typeof visionResult.confidenceFood === 'number' ? visionResult.confidenceFood : 0.0
    if (!isFood || confidence < 0.5) {
      return NextResponse.json(
        { error: 'This image does not appear to be a dish/meal. Please upload a food photo.', isFood, confidenceFood: confidence },
        { status: 422 }
      )
    }

    const dishName = visionResult.dishName || 'Unknown Dish'
    const cuisineType = visionResult.cuisineType || 'Mixed'

    // ============================================
    // STAGE 2: TEXT MODEL (llama3.2:3b)
    // Purpose: Generate ALL detailed text content
    // Why: llama3.2 is optimized for text generation, produces better quality content
    // Input: dishName + cuisineType from Stage 1
    // Output: Detailed nutrition facts, ingredients list, cooking recipe
    // ============================================
    const detailPrompt = [
      `Generate detailed nutritional information, ingredients, recipe, and dietary information for the STANDARD/BASIC version of: "${dishName}" (${cuisineType} cuisine).`,
      '',
      'IMPORTANT: Analyze the BASE dish without any added toppings or extras (like bacon bits, cheese, etc.) unless they are ESSENTIAL to the dish.',
      '',
      'Return ONLY this JSON format:',
      '{',
      '  "ingredients": string[] (list ONLY the core ingredients in the BASIC version of this dish),',
      '  "nutrition": {',
      '    "calories": number (per serving),',
      '    "protein_g": number,',
      '    "carbs_g": number,',
      '    "fat_g": number',
      '  },',
      '  "recipe": {',
      '    "servings": number,',
      '    "prepMinutes": number,',
      '    "cookMinutes": number,',
      '    "steps": string[] (8-12 detailed cooking steps)',
      '  },',
      '  "isHalal": boolean (based ONLY on the ingredients list above - true if all listed ingredients are halal),',
      '  "halalNotes": string (ONLY mention ingredients from the ingredients list above if not halal. Leave empty if halal.),',
      '  "allergens": string[] (based ONLY on the ingredients list above: "Dairy", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Wheat/Gluten", "Soy", etc.),',
      '  "dietaryTags": {',
      '    "isHighProtein": boolean (true if protein >= 20g per serving),',
      '    "containsGluten": boolean (true if contains wheat, barley, rye, or gluten-containing ingredients),',
      '    "containsDairy": boolean (true if contains milk, cheese, butter, cream, or dairy products),',
      '    "isVegan": boolean (true if NO animal products: no meat, dairy, eggs, honey),',
      '    "isKeto": boolean (true if carbs < 10g AND fat > 15g per serving)',
      '  },',
      '  "healthScore": {',
      '    "overall": number (0-100, consider: balanced macros, reasonable calories, nutrient density),',
      '    "macroBalance": number (0-100, ideal ratios: 30% protein, 50% carbs, 20% fat),',
      '    "dietFriendly": number (0-100, based on: high protein, moderate carbs/fat, reasonable calories)',
      '  }',
      '}',
      '',
      'CRITICAL RULES FOR CONSISTENCY:',
      '1. The "ingredients" list is the source of truth',
      '2. "isHalal" must be based ONLY on ingredients you listed (if no pork/alcohol/non-halal meat in ingredients list, then isHalal = true)',
      '3. "halalNotes" can ONLY mention ingredients that appear in the "ingredients" list',
      '4. "allergens" can ONLY mention allergens from ingredients in the "ingredients" list',
      '5. Do NOT assume extra toppings or additions that are not essential to the basic dish',
      '6. "dietaryTags" must be accurately calculated from nutrition and ingredients',
      '7. "healthScore" should reflect actual nutritional quality',
      '',
      'Health Score Guidelines:',
      '- overall: 80-100 (excellent nutrients, balanced), 60-79 (good), 40-59 (moderate), 0-39 (poor nutrition)',
      '- macroBalance: 100 (perfect 30/50/20), penalize deviations',
      '- dietFriendly: reward high protein, moderate carbs, healthy fats, reasonable calories',
      '',
      'Examples:',
      '- Hash Browns: Just potatoes, oil, salt, pepper (no bacon unless specifically stated)',
      '- Caesar Salad: Must include anchovies (essential), but not bacon (optional topping)',
      '- Spaghetti Carbonara: Must include pork/bacon (essential to the dish)',
      '',
      'Make the recipe steps very detailed and specific. Be accurate with nutrition based on typical serving sizes.',
      '',
      'Output ONLY valid JSON, no markdown, no extra text.'
    ].join('\n')

    const detailResponse = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: textModel,
        prompt: detailPrompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.3,
          num_predict: 1000  // Allow more tokens for detailed content
        }
      })
    })

    if (!detailResponse.ok) {
      const text = await detailResponse.text().catch(() => '')
      throw new Error(`Detail generation error ${detailResponse.status}: ${text}`)
    }

    const detailRaw = await detailResponse.json()
    const detailResult = JSON.parse(detailRaw.response)

    // Combine results
    const parsed: AnalysisResult = {
      dishName,
      cuisineType,
      ingredients: detailResult.ingredients || [],
      nutrition: detailResult.nutrition || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      recipe: detailResult.recipe || { servings: 1, prepMinutes: 0, cookMinutes: 0, steps: [] },
      isHalal: detailResult.isHalal ?? true,
      halalNotes: detailResult.halalNotes,
      allergens: detailResult.allergens || [],
      isFood: true,
      confidenceFood: confidence,
      dietaryTags: detailResult.dietaryTags || {
        isHighProtein: false,
        containsGluten: false,
        containsDairy: false,
        isVegan: false,
        isKeto: false
      },
      healthScore: detailResult.healthScore || {
        overall: 50,
        macroBalance: 50,
        dietFriendly: 50
      }
    }

    // NOTE: STAGE 3 (Recommendations) happens separately via /api/recommendations
    // The frontend will call that API endpoint with this analysis result
    // Recommendations also use llama3.2:3b for text generation

    // Validation
    if (!parsed.dishName || !Array.isArray(parsed.ingredients) || !parsed.recipe || !parsed.nutrition) {
      throw new Error('Incomplete AI response for food image')
    }

    // Save to database if we have an image hash
    if (imageHash) {
      db.saveAnalysis(imageHash, parsed)
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('Image analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image', details: error?.message ?? String(error) },
      { status: 500 }
    )
  }
}