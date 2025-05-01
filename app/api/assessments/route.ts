import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user to check if they are viewing their created assessments (instructor)
    // or published assessments (student)
    const user = await currentUser();
    const isInstructor = user?.publicMetadata?.role === "instructor";
    
    let assessments;
    
    if (isInstructor) {
      // Instructors see all their created assessments
      assessments = await prisma.assessment.findMany({
        where: {
          createdById: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Students only see published assessments
      assessments = await prisma.assessment.findMany({
        where: {
          isPublished: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(assessments);
  } catch (error) {
    console.log("[ASSESSMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request
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
      return new NextResponse("Access denied. Only instructors can create assessments.", { status: 403 });
    }

    const { title, description, assessmentType, questionFormat, inclusivityMode, courseId, aiGenerated, aiContent, difficultyLevel } = await req.json();

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Map string difficulty to numeric difficulty level for database
    const getDifficultyValue = (level: string) => {
      switch(level) {
        case "EASY": return 1;
        case "HARD": return 3;
        case "MEDIUM":
        default: return 2;
      }
    };

    // Create assessment without the unrecognized fields
    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        assessmentType,
        questionFormat: Array.isArray(questionFormat) ? JSON.stringify(questionFormat) : questionFormat,
        inclusivityMode: inclusivityMode || false,
        createdById: userId,
        courseId,
        difficultyLevel: difficultyLevel ? getDifficultyValue(difficultyLevel) : 2, // Default to medium
      },
    });

    // If this is an AI-generated assessment, create the questions automatically
    if (aiGenerated && aiContent && aiContent.questions) {
      // Get the questions from AI content
      const questions = aiContent.questions;
      
      // Numeric difficulty value from difficultyLevel string
      const difficulty = difficultyLevel ? getDifficultyValue(difficultyLevel) : 2;
      
      // Create each question in the database
      for (const q of questions) {
        // Handle different question types
        if (q.type === "MCQ") {
          await prisma.assessmentQuestion.create({
            data: {
              assessmentId: assessment.id,
              questionType: "MCQ",
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              marks: difficulty, // Adjust marks based on difficulty
              difficultyLevel: difficulty,
            }
          });
        } else if (q.type === "DESCRIPTIVE") {
          await prisma.assessmentQuestion.create({
            data: {
              assessmentId: assessment.id,
              questionType: "DESCRIPTIVE",
              question: q.question,
              correctAnswer: q.sampleAnswer,
              marks: difficulty + 1, // Descriptive questions worth more
              difficultyLevel: difficulty,
            }
          });
        } else if (q.type === "PRACTICAL" || q.type === "VIVA" || q.type === "PEN_PAPER") {
          await prisma.assessmentQuestion.create({
            data: {
              assessmentId: assessment.id,
              questionType: q.type,
              question: q.question,
              correctAnswer: q.sampleAnswer || q.correctAnswer || "",
              marks: difficulty + 1,
              difficultyLevel: difficulty,
            }
          });
        }
      }
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.log("[ASSESSMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 