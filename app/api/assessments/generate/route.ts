import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can generate assessments.", { status: 403 });
    }

    const { topic, description, assessmentType, questionFormat, difficultyLevel } = await req.json();

    if (!topic) {
      return new NextResponse("Topic is required", { status: 400 });
    }

    // Determine question types to generate based on requested formats
    const questionTypes = Array.isArray(questionFormat) ? questionFormat : [questionFormat];
    
    // Set difficulty level - default to medium if not specified
    const difficulty = difficultyLevel || "MEDIUM";
    
    // Prepare prompt for the AI
    let prompt = `Create an assessment on the topic: "${topic}". `;
    
    if (description) {
      prompt += `Additional context: ${description}. `;
    }
    
    prompt += `The assessment is for ${assessmentType.toLowerCase()} mode and should include the following question types: ${questionTypes.join(", ")}. `;
    prompt += `The difficulty level should be ${difficulty.toLowerCase()}. `;
    
    prompt += `For each question type, generate appropriate questions with answers. `;
    prompt += `For MCQ questions, include 4 options with the correct answer marked. `;
    prompt += `Format the response as a JSON object with the following structure:
    {
      "questions": [
        {
          "type": "MCQ", 
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Explanation for the correct answer"
        },
        {
          "type": "DESCRIPTIVE",
          "question": "Question text here?",
          "sampleAnswer": "Sample answer here",
          "rubric": "Grading criteria here"
        },
        // Include other question types as applicable
      ]
    }
    Make sure your response is valid JSON that can be parsed with JSON.parse() and nothing else.`;
    
    // Call Gemini API to generate assessment content
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const generatedContent = response.text();
    
    let parsedContent;
    
    try {
      // Extract JSON from the response - sometimes Gemini adds markdown formatting
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                        generatedContent.match(/```\n([\s\S]*?)\n```/) || 
                        [null, generatedContent];
      
      const jsonString = jsonMatch[1] || generatedContent;
      
      // Parse the JSON response
      parsedContent = JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return new NextResponse("Failed to generate valid assessment content: " + generatedContent, { status: 500 });
    }

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.log("[ASSESSMENTS_GENERATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 