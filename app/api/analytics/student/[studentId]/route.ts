import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { startOfMonth, subMonths, format, isSameMonth } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const studentId = params.studentId;

    if (!studentId) {
      return new NextResponse("Student ID is required", { status: 400 });
    }

    // Get all progress updates for this student on courses by this teacher
    const userProgress = await db.userProgress.findMany({
      where: {
        userId: studentId,
        Chapter: {
          course: {
            userId: userId
          }
        }
      },
      include: {
        Chapter: {
          include: {
            course: true
          }
        }
      },
      orderBy: {
        updatedAt: "asc"
      }
    });

    // Get all assessment sessions for this student on assessments by this teacher
    const assessmentSessions = await db.assessmentSession.findMany({
      where: {
        userId: studentId,
        assessment: {
          createdById: userId
        }
      },
      include: {
        assessment: true
      },
      orderBy: {
        updatedAt: "asc"
      }
    });

    // Generate data for the last 6 months
    const currentDate = new Date();
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthName = format(monthDate, 'MMM');

      // Calculate course progress for this month
      const progressItems = userProgress.filter(progress => 
        isSameMonth(new Date(progress.updatedAt), monthDate)
      );
      
      // Count completed chapters this month
      const completedChapters = progressItems.filter(p => p.isCompleted).length;

      // Get assessment scores for this month
      const monthlyAssessments = assessmentSessions.filter(session => 
        isSameMonth(new Date(session.updatedAt), monthDate)
      );
      
      // Calculate average score
      const totalScore = monthlyAssessments.reduce(
        (sum, session) => sum + (session.score || 0), 0
      );
      const avgScore = monthlyAssessments.length > 0 
        ? Math.round(totalScore / monthlyAssessments.length) 
        : 0;
        
      // Add to monthly data
      monthlyData.push({
        month: monthName,
        progress: completedChapters, // Using completed chapters as progress metric
        score: avgScore
      });
    }

    return NextResponse.json({
      enrollmentData: monthlyData
    });
  } catch (error) {
    console.error("[STUDENT_ENROLLMENT_DATA]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 