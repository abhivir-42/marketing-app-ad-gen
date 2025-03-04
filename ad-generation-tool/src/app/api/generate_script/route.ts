import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('Received generate script request');
    const body = await req.json();
    console.log('Request body:', body);
    
    // Extract fields from the request body
    // The frontend should be sending snake_case keys now
    const { 
      product_name, 
      target_audience, 
      key_selling_points, 
      tone, 
      ad_length, 
      speaker_voice 
    } = body;
    
    // Check if any required fields are missing
    if (!product_name || !target_audience || !key_selling_points || !tone || !ad_length || !speaker_voice) {
      console.error('Missing required fields:', { 
        product_name, 
        target_audience, 
        key_selling_points, 
        tone, 
        ad_length, 
        speaker_voice 
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('Extracted fields:', { 
      product_name, 
      target_audience, 
      key_selling_points, 
      tone, 
      ad_length, 
      speaker_voice 
    });

    // TODO: Integrate with the actual script_generation crew
    // For now, return mock data
    const mockScript = [
      {
        line: `Introducing ${product_name} - the perfect solution for ${target_audience}!`,
        artDirection: `Voice: ${speaker_voice === 'Either' ? 'Enthusiastic' : speaker_voice} speaker, ${tone.toLowerCase()} tone`
      },
      {
        line: key_selling_points.split('\n')[0],
        artDirection: 'Voice: Confident and persuasive'
      },
      {
        line: 'Don\'t wait - try it today!',
        artDirection: 'Voice: Encouraging call-to-action'
      }
    ];

    console.log('Returning mock script:', mockScript);
    return NextResponse.json({ success: true, script: mockScript });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate script', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 