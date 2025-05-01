import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { SettingsForm } from "./_components/settings-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AssessmentSettingsPage({
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
  });

  if (!assessment) {
    return redirect("/");
  }

  return (
    <div className="p-6">
      <Link href="/teacher/assessment">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
      </Link>
      <SettingsForm 
        assessment={assessment}
      />
    </div>
  );
} 