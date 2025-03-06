import { NextResponse } from 'next/server';
import { Script } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { speed, pitch, script, voiceId } = body;
    
    // Determine if we're running locally or in production
    const isProduction = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    console.log(`Calling ${isProduction ? 'production' : 'local'} backend at ${backendUrl}`);
    
    // Prepare request to our FastAPI backend
    const response = await fetch(`${backendUrl}/generate_audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script,
        speed: speed || 1.0,
        pitch: pitch || 1.0,
        voiceId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Backend API error: ${response.status} ${errorData.detail || response.statusText}`);
    }
    
    // Return the audio URL from the backend
    const data = await response.json();
    return NextResponse.json({ audioUrl: data.audioUrl });
    
  } catch (error) {
    console.error('Error generating audio:', error);
    
    let errorMessage = 'Failed to generate audio';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // More specific error handling
      if (errorMessage.includes('timeout')) {
        errorMessage = 'Audio generation timed out. Please try again.';
        statusCode = 504;
      } else if (errorMessage.includes('unauthorized')) {
        errorMessage = 'Authentication failed with TTS service';
        statusCode = 401;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 