import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('Received refine script request');
    const body = await req.json();
    console.log('Request body:', body);
    
    const { selectedLines, improvementInstruction, script } = body;
    
    // Validate request data
    if (!selectedLines || !Array.isArray(selectedLines) || selectedLines.length === 0) {
      console.error('No selected lines provided');
      return NextResponse.json(
        { success: false, error: 'No selected lines provided' },
        { status: 400 }
      );
    }
    
    if (!improvementInstruction) {
      console.error('No improvement instruction provided');
      return NextResponse.json(
        { success: false, error: 'No improvement instruction provided' },
        { status: 400 }
      );
    }
    
    if (!script || !Array.isArray(script) || script.length === 0) {
      console.error('No script provided');
      return NextResponse.json(
        { success: false, error: 'No script provided' },
        { status: 400 }
      );
    }

    console.log('Refining script with instruction:', improvementInstruction);
    console.log('Selected lines:', selectedLines);

    // TODO: Integrate with the actual regenerate_script crew
    // For now, return mock refined data
    const refinedScript = [...script];
    selectedLines.forEach((index: number) => {
      if (index >= 0 && index < refinedScript.length) {
        refinedScript[index] = {
          ...refinedScript[index],
          line: `${refinedScript[index].line} (Refined: ${improvementInstruction})`,
          artDirection: `${refinedScript[index].artDirection} (Updated based on refinement)`
        };
      }
    });

    console.log('Returning refined script');
    return NextResponse.json({ 
      success: true, 
      script: refinedScript 
    });
  } catch (error) {
    console.error('Error refining script:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refine script', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 