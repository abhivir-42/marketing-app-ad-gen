import { NextResponse } from 'next/server';
import { Script } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { speed, pitch, script, voiceId } = body;
    
    // Extract just the text from the script
    const scriptText = script.map((item: Script) => item.line).join(' ');
    
    // Eleven Labs API configuration
    const ELEVEN_LABS_API_KEY = 'sk_f3a0a1655da25f5db6a84c2bbdcdb61e446be766de260d89';
    const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
    
    // Use provided voice ID or default to Rachel
    const VOICE_ID = voiceId || '21m00Tcm4TlvDq8ikWAM';
    
    // Prepare request to Eleven Labs API
    const response = await fetch(`${ELEVEN_LABS_API_URL}/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: scriptText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
          // Apply pitch and speed modifications
          speed: speed || 1.0,
          pitch: pitch || 1.0
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Eleven Labs API error: ${response.status} ${errorData.detail || response.statusText}`);
    }
    
    // Get the audio as an ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Convert ArrayBuffer to Base64
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
    
    // Create a data URL with the correct MIME type
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;
    
    return NextResponse.json({ audioUrl: audioDataUrl });
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