import { NextResponse } from "next/server";
<<<<<<< HEAD
import { auth, currentUser } from "@clerk/nextjs/server";
=======
import { auth } from "@clerk/nextjs/server";
>>>>>>> 29dcb9637bbf7b4f08bd5427526be9aa151ca1bd
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

<<<<<<< HEAD
    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can view assessment questions.", { status: 403 });
    }

=======
>>>>>>> 29dcb9637bbf7b4f08bd5427526be9aa151ca1bd
    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Get the specific question
    const question = await prisma.assessmentQuestion.findUnique({
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
    console.log("[ASSESSMENT_QUESTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { assessmentId: string; questionId: string } }
) {
  try {
    const { userId } = auth();
    const { questionType, question, options, correctAnswer, marks, difficultyLevel, accessibilityOptions } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

<<<<<<< HEAD
    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can modify assessment questions.", { status: 403 });
    }

=======
>>>>>>> 29dcb9637bbf7b4f08bd5427526be9aa151ca1bd
    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Check if the question exists and belongs to the assessment
    const existingQuestion = await prisma.assessmentQuestion.findUnique({
      where: {
        id: params.questionId,
        assessmentId: params.assessmentId,
      },
    });

    if (!existingQuestion) {
      return new NextResponse("Question not found", { status: 404 });
    }

    // Update the question
    const updatedQuestion = await prisma.assessmentQuestion.update({
      where: {
        id: params.questionId,
      },
      data: {
        questionType: questionType !== undefined ? questionType : existingQuestion.questionType,
        question: question !== undefined ? question : existingQuestion.question,
        options: options !== undefined ? options : existingQuestion.options,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : existingQuestion.correctAnswer,
        marks: marks !== undefined ? marks : existingQuestion.marks,
        difficultyLevel: difficultyLevel !== undefined ? difficultyLevel : existingQuestion.difficultyLevel,
        accessibilityOptions: accessibilityOptions !== undefined ? accessibilityOptions : existingQuestion.accessibilityOptions,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.log("[ASSESSMENT_QUESTION_PATCH]", error);
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

<<<<<<< HEAD
    // Check if user is an instructor
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    if (!isInstructor) {
      return new NextResponse("Access denied. Only instructors can delete assessment questions.", { status: 403 });
    }

=======
>>>>>>> 29dcb9637bbf7b4f08bd5427526be9aa151ca1bd
    // Check if the assessment exists and belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: params.assessmentId,
        createdById: userId,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Check if the question exists and belongs to the assessment
    const question = await prisma.assessmentQuestion.findUnique({
      where: {
        id: params.questionId,
        assessmentId: params.assessmentId,
      },
    });

    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    // Delete the question
    await prisma.assessmentQuestion.delete({
      where: {
        id: params.questionId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[ASSESSMENT_QUESTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 