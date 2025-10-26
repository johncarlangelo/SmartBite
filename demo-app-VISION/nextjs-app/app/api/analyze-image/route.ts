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
  isFood?: boolean
  confidenceFood?: number
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
    const visionModel = process.env.OLLAMA_VISION_MODEL || 'llava:7b'
    const textModel = process.env.OLLAMA_RECOMMENDATION_MODEL || 'llama3.2:1b'
    const onlineModel = process.env.OLLAMA_ONLINE_MODEL || visionModel
    const visionModelToUse = offlineFlag === 'true' ? visionModel : onlineModel

    // ============================================
    // STAGE 1: Vision Model (llava:7b) - Fast identification only
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
    // STAGE 2: Text Model (llama3.2:1b) - Detailed generation
    // ============================================
    const detailPrompt = [
      `Generate detailed nutritional information, ingredients, and recipe for: "${dishName}" (${cuisineType} cuisine).`,
      '',
      'Return ONLY this JSON format:',
      '{',
      '  "ingredients": string[] (8-12 specific ingredients),',
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
      '  }',
      '}',
      '',
      'Make the recipe steps very detailed and specific. Be accurate with nutrition based on typical serving sizes.',
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
      isFood: true,
      confidenceFood: confidence
    }

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