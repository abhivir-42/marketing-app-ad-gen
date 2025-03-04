import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { selectedLines, improvementInstruction, script } = body;

    // TODO: Integrate with the actual regenerate_script crew
    // For now, return mock refined data
    const refinedScript = [...script];
    selectedLines.forEach((index: number) => {
      refinedScript[index] = {
        ...refinedScript[index],
        line: `${refinedScript[index].line} (Refined: ${improvementInstruction})`,
        artDirection: `${refinedScript[index].artDirection} (Updated based on refinement)`
      };
    });

    return NextResponse.json({ script: refinedScript });
  } catch (error) {
    console.error('Error refining script:', error);
    return NextResponse.json(
      { error: 'Failed to refine script' },
      { status: 500 }
    );
  }
} 