import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Export assessment results as CSV
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
      include: {
        questions: true,
      },
    });

    if (!assessment) {
      return new NextResponse("Assessment not found or not authorized", { status: 404 });
    }

    // Get all sessions for this assessment with responses
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
        createdAt: "desc",
      },
    });

    // Create CSV content
    let csvContent = 'Student ID,Submission Date,Status,Score,Feedback';
    
    // Add question headers
    assessment.questions.forEach((question) => {
      csvContent += `,Q${question.id.substring(0, 4)} (${question.marks} marks)`;
    });
    
    csvContent += '\n';

    // Add rows for each session
    sessions.forEach((session) => {
      const date = new Date(session.createdAt).toLocaleDateString();
      csvContent += `${session.userId},${date},${session.status},${session.score || 'N/A'},${session.feedback || 'N/A'}`;
      
      // Add response data
      assessment.questions.forEach((question) => {
        const response = session.responses.find(r => r.questionId === question.id);
        csvContent += `,${response ? (response.score || 'N/A') : 'N/A'}`;
      });
      
      csvContent += '\n';
    });

    // Return CSV content
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${assessment.title.replace(/\s+/g, '_')}_results.csv`,
      },
    });
  } catch (error) {
    console.log("[ASSESSMENT_EXPORT_RESULTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 