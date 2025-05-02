import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";

const TeacherAssessmentResultsPage = async ({
  params
}: {
  params: { assessmentId: string }
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const assessment = await db.assessment.findUnique({
    where: {
      id: params.assessmentId,
      userId: userId,
    },
    include: {
      responses: {
        include: {
          user: true,
          answers: true,
        },
      },
    },
  });

  if (!assessment) {
    return redirect("/teacher/assessment");
  }

  const formattedResults = assessment.responses.map(response => {
    const totalQuestions = response.answers.length;
    const correctAnswers = response.answers.filter(answer => answer.isCorrect).length;
    const score = (correctAnswers / totalQuestions) * 100;

    return {
      id: response.id,
      studentName: response.user.firstName + " " + response.user.lastName,
      email: response.user.emailAddresses[0]?.emailAddress || "",
      score: score.toFixed(1) + "%",
      correctAnswers: `${correctAnswers}/${totalQuestions}`,
      submittedAt: response.createdAt,
    };
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="p-4 md:p-6 bg-white shadow-md rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {assessment.title} - Results
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Total Submissions: {assessment.responses.length}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable 
            columns={columns} 
            data={formattedResults}
            searchKey="studentName"
          />
        </div>
      </Card>
    </div>
  );
};

export default TeacherAssessmentResultsPage; 