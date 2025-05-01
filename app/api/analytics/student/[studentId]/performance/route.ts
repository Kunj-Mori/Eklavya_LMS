import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    // Get all courses the student has purchased that are created by this teacher
    const coursePurchases = await db.purchase.findMany({
      where: {
        userId: studentId,
        course: {
          userId: userId
        }
      },
      include: {
        course: true
      }
    });

    // Get all assessment sessions for this student on assessments created by this teacher
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
        updatedAt: "desc"
      }
    });

    // Get progress data for courses
    const courseProgress = await Promise.all(
      coursePurchases.map(async (purchase) => {
        // Get chapters for this course
        const chapters = await db.chapter.findMany({
          where: {
            courseId: purchase.courseId
          }
        });

        // Get completed chapters for this student
        const completedChapters = await db.userProgress.count({
          where: {
            userId: studentId,
            chapterId: {
              in: chapters.map(chapter => chapter.id)
            },
            isCompleted: true
          }
        });

        const totalChapters = chapters.length;
        const progress = totalChapters > 0 
          ? Math.round((completedChapters / totalChapters) * 100) 
          : 0;

        // Get last access time
        const lastProgress = await db.userProgress.findFirst({
          where: {
            userId: studentId,
            chapterId: {
              in: chapters.map(chapter => chapter.id)
            }
          },
          orderBy: {
            updatedAt: "desc"
          }
        });

        return {
          id: purchase.courseId,
          title: purchase.course.title,
          progress,
          chaptersCompleted: completedChapters,
          totalChapters,
          lastAccessed: lastProgress?.updatedAt || purchase.createdAt
        };
      })
    );

    // Format assessment data
    const assessments = assessmentSessions.map(session => ({
      id: session.assessmentId,
      title: session.assessment.title,
      score: session.score || 0,
      completedAt: session.endTime || session.updatedAt,
      difficultyLevel: session.assessment.difficultyLevel || 2
    }));

    return NextResponse.json({
      courses: courseProgress,
      assessments
    });
  } catch (error) {
    console.error("[STUDENT_PERFORMANCE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 