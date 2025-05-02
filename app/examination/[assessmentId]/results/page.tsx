import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ExamResultsPage = async ({ params }: { params: { assessmentId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const results = await db.assessmentResponse.findFirst({
    where: {
      assessmentId: params.assessmentId,
      userId: userId,
    },
    include: {
      assessment: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!results) {
    return redirect("/examination");
  }

  const totalQuestions = results.answers.length;
  const correctAnswers = results.answers.filter(answer => answer.isCorrect).length;
  const score = (correctAnswers / totalQuestions) * 100;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="p-4 md:p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-xl md:text-2xl font-bold mb-4">
          {results.assessment.title} - Results
        </h1>
        
        <div className="space-y-4">
          <div className="bg-slate-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Score Overview</h2>
            <div className="space-y-2">
              <Progress value={score} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Score: {score.toFixed(1)}%
              </p>
              <p className="text-sm">
                Correct Answers: {correctAnswers} / {totalQuestions}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detailed Results</h2>
            {results.answers.map((answer, index) => (
              <Card key={answer.id} className={`p-4 border-l-4 ${
                answer.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm md:text-base font-medium">
                      Question {index + 1}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      answer.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {answer.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm md:text-base">{answer.question.text}</p>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Your Answer: {answer.answer}</p>
                    {!answer.isCorrect && (
                      <p className="text-green-600">
                        Correct Answer: {answer.question.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExamResultsPage; 