import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AssessmentCandidatesPage({
  params
}: {
  params: { assessmentId: string }
}) {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const assessment = await db.assessment.findUnique({
    where: {
      id: params.assessmentId,
      createdById: userId,
    },
    include: {
      sessions: {
        select: {
          id: true,
          userId: true,
          status: true,
          startTime: true,
          endTime: true,
          responses: {
            include: {
              question: {
                select: {
                  id: true,
                  question: true,
                  marks: true,
                  questionType: true,
                  options: true
                }
              }
            }
          }
        },
        orderBy: {
          endTime: "desc"
        }
      }
    }
  });

  if (!assessment) {
    return redirect("/");
  }

  const formattedSessions = assessment.sessions.map(session => {
    const totalMarks = session.responses.reduce((sum, response) => {
      return sum + (response.question?.marks || 0);
    }, 0);

    return {
      ...session,
      score: totalMarks
    };
  });

  return (
    <div className="p-6">
      <Link href="/teacher/assessment">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
      </Link>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Assessment Candidates</h1>
          <span className="text-sm text-slate-700">
            Manage your assessment candidates and their responses
          </span>
        </div>
      </div>
      <div className="mt-8">
        <DataTable columns={columns} data={formattedSessions} />
      </div>
    </div>
  );
} 