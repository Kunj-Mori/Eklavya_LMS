import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get results for a specific assessment for the current student
export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First check if student has taken this assessment - more efficient query
    const session = await prisma.assessmentSession.findFirst({
      where: {
        assessmentId: params.assessmentId,
        userId: userId,
      },
      include: {
        assessment: {
          select: {
            isPublished: true,
            resultsPublished: true,
            title: true,
          }
        },
        responses: {
          select: {
            id: true,
            answer: true,
            score: true,
            isCorrect: true,
            questionId: true,
            question: {
              select: {
                question: true,
                marks: true,
                questionType: true,
                options: true,
                correctAnswer: true,
              }
            }
          }
        },
      },
    });

    if (!session) {
      return new NextResponse("You have not taken this assessment", { status: 404 });
    }

    // Check if results are published
    if (!session.assessment.isPublished || !session.assessment.resultsPublished) {
      return new NextResponse("Results have not been published yet", { status: 404 });
    }

    // If the correctAnswer field is not coming through, we need to fetch it separately
    if (session.responses.some(r => !r.question.correctAnswer)) {
      // Find all question IDs in the responses
      const questionIds = session.responses.map(r => r.questionId);
      
      // Fetch all questions with correct answers directly
      const questions = await prisma.assessmentQuestion.findMany({
        where: {
          id: { in: questionIds }
        },
        select: {
          id: true,
          correctAnswer: true,
        }
      });
      
      // Create a map of question IDs to correct answers
      const correctAnswersMap = new Map();
      questions.forEach(q => {
        correctAnswersMap.set(q.id, q.correctAnswer);
      });
      
      // Update the responses with the correct answers
      session.responses = session.responses.map(response => ({
        ...response,
        question: {
          ...response.question,
          correctAnswer: correctAnswersMap.get(response.questionId) || response.question.correctAnswer || 'Not available'
        }
      }));
    }

    return NextResponse.json(session);
  } catch (error) {
    console.log("[ASSESSMENT_STUDENT_RESULTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 