import { NextResponse } from 'next/server';
import { Script } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { speed, pitch, script, voiceId } = body;
    
    // Determine the backend URL based on environment
    const isVercel = process.env.VERCEL === '1';
    const backendUrl = isVercel 
      ? (process.env.NEXT_PUBLIC_VERCEL_API_URL || 'http://172.206.3.68:8000')
      : (process.env.BACKEND_URL || 'http://localhost:8001');
    
    console.log(`Calling backend at ${backendUrl} (Vercel: ${isVercel})`);
    
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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: await response.text() };
      }
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