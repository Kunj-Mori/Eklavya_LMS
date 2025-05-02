import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { getProgress } from "@/actions/get-progress";

import { CourseNavbar } from "./_components/CourseNavbar";
import { CourseSidebar } from "./_components/CourseSidebar";

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/")
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            }
          }
        },
        orderBy: {
          position: "asc"
        }
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  // @ts-ignore
  const progressCount: number = await getProgress(userId, course.id);

  return (
    <div className="h-full">
      <div className="h-[60px] md:h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          progressCount={progressCount}
        />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
        />
      </div>
      <main className="md:pl-80 pt-[60px] md:pt-[80px] h-full">
        <div className="mx-auto max-w-screen-xl p-4">
          {children}
        </div>
      </main>
    </div>
  )
}

export default CourseLayout