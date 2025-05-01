import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Simple fallback response for testing
    const response = `This is a fallback response for your prompt: "${prompt}". 
    
I'm a simulated AI assistant. The actual Gemini API integration is having issues, but this proves that the chat widget itself is working correctly.

You can try:
1. Double-checking your API key in the .env file
2. Making sure you're using the correct model name (gemini-1.5-flash)
3. Check the API documentation for any changes to the endpoint or parameters`;

    // Simulate a slight delay to feel more natural
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ message: response });
  } catch (error: any) {
    console.error("Fallback chatbot error:", error);
    return NextResponse.json(
      { error: "Failed to process your request: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
} 