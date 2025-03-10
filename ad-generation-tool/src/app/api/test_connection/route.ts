import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Determine the backend URL based on environment
    const isVercel = process.env.VERCEL === '1';
    // const backendUrl = isVercel 
    //   ? (process.env.NEXT_PUBLIC_VERCEL_API_URL || 'http://172.206.3.68:8000')
    //   : (process.env.BACKEND_URL || 'http://localhost:8001');
    const backendUrl = process.env.BACKEND_URL
    
    console.log('Testing connection to backend at:', backendUrl);
    console.log('Environment variables:', {
      VERCEL: process.env.VERCEL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      BACKEND_URL: process.env.BACKEND_URL,
      NEXT_PUBLIC_VERCEL_API_URL: process.env.NEXT_PUBLIC_VERCEL_API_URL
    });
    
    // Use our new test_connection endpoint
    const response = await fetch(`${backendUrl}/test_connection`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });
    
    // Try to get the response data
    let responseData = null;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Failed to parse backend response:', e);
    }
    
    const statusText = response.statusText;
    const status = response.status;
    const ok = response.ok;
    
    console.log('Backend connection test results:', { status, statusText, ok, data: responseData });
    
    return NextResponse.json({ 
      status: 'success',
      backendStatus: status,
      backendStatusText: statusText,
      backendConnected: ok,
      backendResponse: responseData,
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        BACKEND_URL: backendUrl,
        VERCEL: process.env.VERCEL,
        NEXT_PUBLIC_VERCEL_API_URL: process.env.NEXT_PUBLIC_VERCEL_API_URL
      }
    });
  } catch (error) {
    console.error('Error testing backend connection:', error);
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8001',
        VERCEL: process.env.VERCEL,
        NEXT_PUBLIC_VERCEL_API_URL: process.env.NEXT_PUBLIC_VERCEL_API_URL
      }
    }, { status: 500 });
  }
} 