import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    console.log(`[GET_PROGRESS] Starting progress calculation for userId: ${userId}, courseId: ${courseId}`);
    
    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    console.log(`[GET_PROGRESS] Found ${publishedChapters.length} published chapters`);
    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    if (!publishedChapterIds.length) {
      console.log("[GET_PROGRESS] No published chapters found, returning 0%");
      return 0;
    }

    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId: userId,
        chapterId: {
          in: publishedChapterIds,
        },
        isCompleted: true,
      },
    });

    console.log(`[GET_PROGRESS] Found ${validCompletedChapters} completed chapters out of ${publishedChapterIds.length} total chapters`);
    const progressPercentage = (validCompletedChapters / publishedChapterIds.length) * 100;
    const roundedProgress = Math.round(progressPercentage);
    console.log(`[GET_PROGRESS] Calculated progress: ${roundedProgress}%`);

    return roundedProgress;
  } catch (error) {
    console.error("[GET_PROGRESS] Error calculating progress:", error);
    return 0;
  }
};