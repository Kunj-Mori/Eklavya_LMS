import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all purchases for courses created by this teacher
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId: userId
        }
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get all assessment sessions for assessments created by this teacher
    const assessmentSessions = await db.assessmentSession.findMany({
      where: {
        assessment: {
          createdById: userId
        }
      },
      include: {
        assessment: true
      }
    });

    // Get unique student IDs and count their enrollments and assessments
    const studentMap = new Map();

    // Process course purchases
    for (const purchase of purchases) {
      if (!studentMap.has(purchase.userId)) {
        studentMap.set(purchase.userId, {
          id: purchase.userId,
          enrolledCourses: 0,
          assessmentsTaken: 0,
          courses: new Set(),
          assessments: new Set()
        });
      }
      
      const studentData = studentMap.get(purchase.userId);
      studentData.courses.add(purchase.courseId);
      studentData.enrolledCourses = studentData.courses.size;
    }

    // Process assessment attempts
    for (const session of assessmentSessions) {
      if (!studentMap.has(session.userId)) {
        studentMap.set(session.userId, {
          id: session.userId,
          enrolledCourses: 0,
          assessmentsTaken: 0,
          courses: new Set(),
          assessments: new Set()
        });
      }
      
      const studentData = studentMap.get(session.userId);
      studentData.assessments.add(session.assessmentId);
      studentData.assessmentsTaken = studentData.assessments.size;
    }

    // Convert to array and fetch user names using Clerk API
    const studentIds = Array.from(studentMap.keys());
    
    // Note: In a real app, you would fetch user details from Clerk
    // This is a simplified version with mock names
    const students = Array.from(studentMap.values()).map((student, index) => {
      // In a real app, replace this with actual user data from Clerk
      return {
        id: student.id,
        name: `Student ${index + 1}`,
        email: `student${index + 1}@example.com`,
        enrolledCourses: student.enrolledCourses,
        assessmentsTaken: student.assessmentsTaken
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("[ANALYTICS_STUDENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 