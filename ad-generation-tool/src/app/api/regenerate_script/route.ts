import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API route /api/regenerate_script received request:', body);
    
    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://172.206.3.68';
    const response = await fetch(`${backendUrl}/regenerate_script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error('Backend returned error status:', response.status);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Backend response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in regenerate_script API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 