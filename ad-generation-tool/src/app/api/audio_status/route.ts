import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // Determine the backend URL based on environment
    const isVercel = process.env.VERCEL === '1';
    const backendUrl = isVercel 
      ? (process.env.NEXT_PUBLIC_VERCEL_API_URL || 'http://172.206.3.68:8000')
      : (process.env.BACKEND_URL || 'http://localhost:8001');
    
    console.log(`Checking audio status at ${backendUrl} (Vercel: ${isVercel})`);
    
    // Get the audio status from our FastAPI backend
    const response = await fetch(`${backendUrl}/audio_status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
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
    
    // Return the audio status data from the backend
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error checking audio status:', error);
    
    let errorMessage = 'Failed to check audio status';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 