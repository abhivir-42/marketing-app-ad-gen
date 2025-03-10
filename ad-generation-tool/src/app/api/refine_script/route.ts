import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('API route /api/refine_script received request:', body);
    
    // Validate the request
    if (!body || !body.selected_sentences || !Array.isArray(body.selected_sentences) || body.selected_sentences.length === 0) {
      console.error('Invalid request: No sentences selected for refinement');
      return NextResponse.json(
        { error: 'Invalid request: No sentences selected for refinement' },
        { status: 400 }
      );
    }
    
    if (!body.improvement_instruction || typeof body.improvement_instruction !== 'string' || body.improvement_instruction.trim() === '') {
      console.error('Invalid request: No improvement instruction provided');
      return NextResponse.json(
        { error: 'Invalid request: No improvement instruction provided' },
        { status: 400 }
      );
    }
    
    if (!body.current_script || !Array.isArray(body.current_script) || body.current_script.length === 0) {
      console.error('Invalid request: No script provided');
      return NextResponse.json(
        { error: 'Invalid request: No script provided' },
        { status: 400 }
      );
    }
    
    // Determine the backend URL based on environment
    const isVercel = process.env.VERCEL === '1';
    const backendUrl = isVercel 
      ? (process.env.NEXT_PUBLIC_VERCEL_API_URL || 'http://172.206.3.68:8000')
      : (process.env.BACKEND_URL || 'http://localhost:8000');
    
    console.log('Using backend URL:', backendUrl);
    
    // Forward the request to the backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
    
    try {
      // Forward the request to the backend's regenerate_script endpoint
      const response = await fetch(`${backendUrl}/regenerate_script`, {
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
      
      // Validate the response
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('Invalid response from backend:', data);
        return NextResponse.json(
          { error: 'Invalid response from backend' },
          { status: 500 }
        );
      }
      
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
    console.error('Error in refine_script API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 