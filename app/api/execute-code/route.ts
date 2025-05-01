import { NextResponse } from 'next/server';

// You'll need to replace this with your actual Judge0 API key and endpoint
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';

const languageIds = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
};

export async function POST(req: Request) {
  try {
    const { language, code } = await req.json();

    if (!language || !code) {
      return NextResponse.json(
        { error: 'Language and code are required' },
        { status: 400 }
      );
    }

    const languageId = languageIds[language as keyof typeof languageIds];
    
    if (!languageId) {
      return NextResponse.json(
        { error: 'Unsupported programming language' },
        { status: 400 }
      );
    }

    // First, submit the code
    const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY!,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: '',
      }),
    });

    const { token } = await submitResponse.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Failed to submit code' },
        { status: 500 }
      );
    }

    // Wait for a short time to allow processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the result
    const resultResponse = await fetch(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY!,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      }
    );

    const result = await resultResponse.json();

    if (result.status?.description === 'Accepted') {
      return NextResponse.json({ output: result.stdout || 'No output' });
    } else {
      return NextResponse.json({
        error: result.stderr || result.compile_output || 'Execution error',
      });
    }
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 