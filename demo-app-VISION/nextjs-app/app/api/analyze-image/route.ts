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
    const imageHash = formData.get('imageHash') as string | null // New parameter

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
    const onlineModel = process.env.OLLAMA_ONLINE_MODEL || visionModel
    const modelToUse = offlineFlag === 'true' ? visionModel : onlineModel

    const prompt = [
      'You are NutriLens AI. Analyze the single image and return JSON ONLY.',
      'First, determine if the image contains a dish/meal/food. If not food, set isFood=false and provide a reasonable confidenceFood between 0 and 1.',
      'If isFood=true, infer dish name, cuisine, ingredients, rough calories and macros per serving, and a concise recipe.',
      '',
      'STRICT JSON SCHEMA:',
      '{',
      '  "dishName": string,',
      '  "cuisineType": string,',
      '  "ingredients": string[],',
      '  "nutrition": { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number },',
      '  "recipe": { "servings": number, "prepMinutes": number, "cookMinutes": number, "steps": string[] },',
      '  "isFood": boolean,',
      '  "confidenceFood": number',
      '}',
      '',
      'Rules:',
      '- Output ONLY valid JSON, no markdown, no extra text.',
      '- Use integers for minutes and nutrition numbers; calories can be an integer.',
      '- Keep steps between 5 and 10 concise actions.',
      '- If the photo is not food, set isFood=false and still output all fields with empty or default values for dish/ingredients/recipe/nutrition.',
    ].join('\n')

    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        prompt,
        images: [base64Image],
        stream: false,
        format: 'json',
        options: {
          temperature: 0.3
        }
      })
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Ollama error ${response.status}: ${text}`)
    }

    const raw = await response.json()
    const parsed: AnalysisResult = JSON.parse(raw.response)

    // Basic sanity validation
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid AI response shape')
    }
    const isFood = parsed.isFood ?? true
    const confidence = typeof parsed.confidenceFood === 'number' ? parsed.confidenceFood : 0.0
    if (!isFood || confidence < 0.5) {
      return NextResponse.json(
        { error: 'This image does not appear to be a dish/meal. Please upload a food photo.', isFood, confidenceFood: confidence },
        { status: 422 }
      )
    }

    // Additional field checks when food is detected
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