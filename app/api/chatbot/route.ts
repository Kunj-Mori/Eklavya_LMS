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

    const API_KEY = process.env.GEMINI_API_KEY;
    
    // Using the v1 endpoint with the gemini-1.5-flash model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        }),
      }
    );

    console.log("API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error data:", errorData);
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("API response data:", JSON.stringify(data).substring(0, 500) + "...");
    
    let text = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      text = data.candidates[0].content.parts[0].text;
    }

    return NextResponse.json({ message: text || "No response content found in API response" });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to process your request: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
} 