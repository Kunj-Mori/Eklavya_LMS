import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new session when starting an assessment
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

    // Check if user already has an active session
    const existingSession = await prisma.assessmentSession.findFirst({
      where: {
        assessmentId: params.assessmentId,
        userId,
        status: {
          in: ["NOT_STARTED", "IN_PROGRESS"]
        }
      }
    });

    if (existingSession) {
      return NextResponse.json(existingSession);
    }

    // Create a new session
    const session = await prisma.assessmentSession.create({
      data: {
        assessmentId: params.assessmentId,
        userId,
        status: "IN_PROGRESS",
        startTime: new Date(),
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[ASSESSMENT_SESSION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get current session status
export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await prisma.assessmentSession.findFirst({
      where: {
        assessmentId: params.assessmentId,
        userId,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!session) {
      return new NextResponse("No session found", { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("[ASSESSMENT_SESSION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 