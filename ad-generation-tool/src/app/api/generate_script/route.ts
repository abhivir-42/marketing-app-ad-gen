import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productName, targetAudience, keySellingPoints, tone, adLength, adSpeakerVoice } = body;

    // TODO: Integrate with the actual script_generation crew
    // For now, return mock data
    const mockScript = [
      {
        line: `Introducing ${productName} - the perfect solution for ${targetAudience}!`,
        artDirection: `Voice: ${adSpeakerVoice === 'Either' ? 'Enthusiastic' : adSpeakerVoice} speaker, ${tone.toLowerCase()} tone`
      },
      {
        line: keySellingPoints.split('\n')[0],
        artDirection: 'Voice: Confident and persuasive'
      },
      {
        line: 'Don\'t wait - try it today!',
        artDirection: 'Voice: Encouraging call-to-action'
      }
    ];

    return NextResponse.json({ script: mockScript });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
} 