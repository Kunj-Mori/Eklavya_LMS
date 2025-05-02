import { NextResponse } from "next/server";

// Sample data
const assessments = [
  {
    id: 1,
    title: "Mathematics Assessment",
    description: "Basic algebra and arithmetic",
    duration: "60 minutes",
    totalMarks: 100
  },
  {
    id: 2,
    title: "Science Quiz",
    description: "Physics and Chemistry basics",
    duration: "45 minutes",
    totalMarks: 50
  }
];

// GET handler
export async function GET() {
  return NextResponse.json(assessments);
}

// POST handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const newAssessment = {
      id: assessments.length + 1,
      ...body
    };
    
    assessments.push(newAssessment);
    
    return NextResponse.json(newAssessment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
} 