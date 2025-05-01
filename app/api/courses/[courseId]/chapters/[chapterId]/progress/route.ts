import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isCompleted } = await req.json();

    console.log(`[CHAPTER_PROGRESS] Updating progress for userId: ${userId}, courseId: ${params.courseId}, chapterId: ${params.chapterId}, isCompleted: ${isCompleted}`);

    if (!userId) {
      console.log("[CHAPTER_PROGRESS] No userId found");
      return new NextResponse("Unauthorized", { status: 401 });
    } 

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: params.chapterId,
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId,
        chapterId: params.chapterId,
        isCompleted,
      }
    });

    console.log(`[CHAPTER_PROGRESS] Progress updated successfully:`, JSON.stringify(userProgress, null, 2));

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error("[CHAPTER_PROGRESS] Error updating progress:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}