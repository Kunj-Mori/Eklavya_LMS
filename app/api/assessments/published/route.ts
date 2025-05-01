import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let query: any = {
      isPublished: true,
    };

    // Add type filter if specified
    if (type) {
      query = {
        ...query,
        assessmentType: type,
      };
    }

    console.log("[ASSESSMENTS_PUBLISHED] Query:", query); // Debug log

    const assessments = await db.assessment.findMany({
      where: query,
      select: {
        id: true,
        title: true,
        assessmentType: true,
        createdAt: true,
        updatedAt: true,
        isPublished: true,
        description: true,
        questionFormat: true,
        difficultyLevel: true,
        questions: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("[ASSESSMENTS_PUBLISHED] Found assessments:", assessments.length); // Debug log
    return NextResponse.json(assessments);
  } catch (error: any) {
    console.log("[ASSESSMENTS_PUBLISHED] Detailed error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
} 