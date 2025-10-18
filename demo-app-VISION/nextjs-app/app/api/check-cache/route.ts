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
    
    // Check if we have a cached analysis for this image
    const cachedResult = db.findAnalysisByImageHash(imageHash);
    
    if (cachedResult) {
      // Parse the analysis JSON string back to an object
      const analysis = JSON.parse(cachedResult.analysis);
      return NextResponse.json({
        cached: true,
        analysis: analysis,
        id: cachedResult.id,
        createdAt: cachedResult.createdAt
      });
    }
    
    return NextResponse.json({
      cached: false,
      imageHash // Send hash to be used when saving the new analysis
    });
  } catch (error: any) {
    console.error('Cache check error:', error);
    return NextResponse.json(
      { error: 'Failed to check cache', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}