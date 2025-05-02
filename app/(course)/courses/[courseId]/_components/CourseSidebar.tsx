import { auth } from "@clerk/nextjs/server";
import { Chapter, Course, UserProgress } from "@prisma/client"
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/CourseProgress";
import { Progress } from "@/components/ui/progress";

import { CourseSidebarItem } from "./CourseSidebarItem";
import Logo from "@/app/(Dashboard)/_components/Logo";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[]
  };
  progressCount: number;
};

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      }
    }
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-4 flex flex-col border-b">
        <h2 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">
          {course.title}
        </h2>
        <div className="mt-2">
          <Progress
            value={progressCount}
            className="h-2"
            variant={progressCount === 100 ? "success" : "default"}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {progressCount}% Complete
          </p>
        </div>
      </div>
      <div className="flex-1">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree}
          />
        ))}
      </div>
    </div>
  )
}