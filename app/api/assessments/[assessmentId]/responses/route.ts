import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { AssessmentAnswer, AssessmentSubmission } from "@/types/assessment";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the assessment exists and is published
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        isPublished: true,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found or not published", { status: 404 });
    }

    const body = await req.json();
    const { answers } = body as AssessmentSubmission;

    if (!answers || !Array.isArray(answers)) {
      return new NextResponse("Invalid answers data", { status: 400 });
    }

    const now = new Date();

    // Create a new assessment session
    const session = await prisma.assessmentSession.create({
      data: {
        assessmentId: params.assessmentId,
        userId,
        status: "COMPLETED",
        startTime: now,
        endTime: now,
        totalScore: 0,
      },
    });

    // Save all responses with proper types
    await Promise.all(
      answers.map(async (answerData: AssessmentAnswer) => {
        return prisma.assessmentResponse.create({
          data: {
            sessionId: session.id,
            questionId: answerData.questionId,
            answer: answerData.answer || null,
            isCorrect: null,
            score: null,
            aiEvaluation: null,
          } as any,
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
    });
  } catch (error) {
    console.error("[ASSESSMENT_RESPONSE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get all responses for a specific assessment (for instructors)
export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify that the requester is the creator of the assessment
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found or not authorized", { status: 404 });
    }

    // Get all sessions for this assessment
    const sessions = await prisma.assessmentSession.findMany({
      where: {
        assessmentId: params.assessmentId,
      },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
      orderBy: {
        endTime: "desc",
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[ASSESSMENT_RESPONSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 