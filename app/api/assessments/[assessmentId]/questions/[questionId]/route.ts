import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string; questionId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";

    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can view assessment questions.", { status: 403 });
    }

    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Get the specific question
    const question = await prisma.question.findUnique({
      where: {
        id: params.questionId,
        assessmentId: params.assessmentId,
      },
    });

    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.log("[QUESTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { assessmentId: string; questionId: string } }
) {
  try {
    const { userId } = auth();
    const { question, options, correctAnswer } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";

    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can modify assessment questions.", { status: 403 });
    }

    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: {
        id: params.questionId,
        assessmentId: params.assessmentId,
      },
      data: {
        question,
        options,
        correctAnswer,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.log("[QUESTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { assessmentId: string; questionId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";

    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can delete assessment questions.", { status: 403 });
    }

    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Delete the question
    await prisma.question.delete({
      where: {
        id: params.questionId,
        assessmentId: params.assessmentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[QUESTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 