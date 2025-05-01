import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";
import { CourseWithProgressWithCategory, DashboardCourses } from "@/types";

export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    console.log("[GET_DASHBOARD_COURSES] Starting to fetch courses for userId:", userId);
    
    const purchasedCourses = await db.purchase.findMany({
      where: {
        userId: userId,
      },
      include: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });

    console.log("[GET_DASHBOARD_COURSES] Found purchased courses:", purchasedCourses.length);

    const courses = await Promise.all(
      purchasedCourses.map(async (purchase) => {
        const progress = await getProgress(userId, purchase.course.id);
        return {
          ...purchase.course,
          progress,
        };
      })
    );

    console.log("[GET_DASHBOARD_COURSES] Mapped courses with progress:", courses.length);

    const completedCourses = courses.filter(
      (course) => (course.progress ?? 0) === 100
    );
    const coursesInProgress = courses.filter(
      (course) => (course.progress ?? 0) < 100
    );

    console.log("[GET_DASHBOARD_COURSES] Completed courses:", completedCourses.length);
    console.log("[GET_DASHBOARD_COURSES] Courses in progress:", coursesInProgress.length);

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.error("[GET_DASHBOARD_COURSES] Error:", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
