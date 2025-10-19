import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert file to array buffer for hashing
    const arrayBuffer = await imageFile.arrayBuffer();
    
    // Generate image hash
    const imageHash = db.generateImageHash(arrayBuffer);
    
    // First check for exact image match
    const cachedResult = db.findAnalysisByImageHash(imageHash);
    
    if (cachedResult) {
      // Parse the analysis JSON string back to an object
      const analysis = JSON.parse(cachedResult.analysis);
      return NextResponse.json({
        cached: true,
        exactMatch: true,
        analysis: analysis,
        id: cachedResult.id,
        createdAt: cachedResult.createdAt
      });
    }
    
    // If no exact match, try semantic matching by dish name
    // For this we need to analyze the image to get the dish name
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const visionModel = process.env.OLLAMA_VISION_MODEL || 'llava:7b';
    
    // More specific prompt to get detailed dish name
    const prompt = 'Identify the specific dish name in this image. Be as specific as possible (e.g., "Pepperoni Pizza" not just "Pizza", "Caesar Salad" not just "Salad"). Respond with ONLY the specific dish name, nothing else.';
    
    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: visionModel,
        prompt,
        images: [base64Image],
        stream: false,
        options: {
          temperature: 0.1 // Low temperature for consistency
        }
      })
    });
    
    if (!response.ok) {
      // If we can't get the dish name, just return no cache
      return NextResponse.json({
        cached: false,
        imageHash // Send hash to be used when saving the new analysis
      });
    }
    
    const raw = await response.json();
    const dishName = raw.response?.trim();
    
    // If we got a dish name, check for semantic matches
    if (dishName && dishName.length > 2) {
      const semanticMatch = db.findAnalysisByDishName(dishName);
      
      if (semanticMatch) {
        // Parse the analysis JSON string back to an object
        const analysis = JSON.parse(semanticMatch.analysis);
        return NextResponse.json({
          cached: true,
          exactMatch: false,
          semanticMatch: true,
          dishNameMatch: dishName,
          analysis: analysis,
          id: semanticMatch.id,
          createdAt: semanticMatch.createdAt
        });
      }
    }
    
    return NextResponse.json({
      cached: false,
      imageHash // Send hash to be used when saving the new analysis
    });
  } catch (error: any) {
    console.error('Cache check error:', error);
    // Even if cache check fails, we can still proceed with analysis
    return NextResponse.json({
      cached: false,
      error: 'Failed to check cache',
      details: error?.message ?? String(error)
    });
  }
}