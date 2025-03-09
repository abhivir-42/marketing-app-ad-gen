import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API route /api/generate_script received request:', body);
    
    // Determine the backend URL based on environment
    const isVercel = process.env.VERCEL === '1';
    const backendUrl = isVercel 
      ? (process.env.NEXT_PUBLIC_VERCEL_API_URL || 'http://172.206.3.68:8000')
      : (process.env.BACKEND_URL || 'http://localhost:8001');
    
    console.log('Using backend URL:', backendUrl);
    
    // Forward the request to the backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
    
    try {
      const response = await fetch(`${backendUrl}/generate_script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Backend returned error status:', response.status);
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        console.error('Error details:', errorText);
        
        return NextResponse.json(
          { error: `Backend error: ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out');
        return NextResponse.json(
          { error: 'Request timed out', details: 'The backend did not respond within the timeout period' },
          { status: 504 }
        );
      }
      throw fetchError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error in generate_script API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 