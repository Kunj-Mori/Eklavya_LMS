"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { toast } from "sonner";

interface SettingsFormProps {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    questionFormat: any;
    isPublished: boolean;
  };
}

export const SettingsForm = ({
  assessment
}: SettingsFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const requiredFields = [
    assessment.title,
    assessment.description,
    assessment.questionFormat,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await fetch(`/api/assessments/${assessment.id}`, {
        method: "DELETE",
      });
      toast.success("Assessment deleted");
      router.refresh();
      router.push("/teacher/assessment");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onPublish = async () => {
    try {
      setIsLoading(true);
      await fetch(`/api/assessments/${assessment.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isPublished: !assessment.isPublished
        })
      });
      toast.success(assessment.isPublished ? "Assessment unpublished" : "Assessment published");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Assessment Settings</h1>
          <span className="text-sm text-slate-700">
            Complete all fields ({completionText})
          </span>
        </div>
        <ConfirmModal 
          onConfirm={onDelete}
        >
          <Button 
            size="sm" 
            variant="destructive"
            disabled={isLoading}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </ConfirmModal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <h2 className="text-xl">Assessment Details</h2>
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-y-2">
              <Link href={`/teacher/assessment/${assessment.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Edit Assessment Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <h2 className="text-xl">Assessment Status</h2>
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col gap-y-2">
              <Button 
                onClick={onPublish}
                variant={assessment.isPublished ? "outline" : "default"}
                disabled={isLoading}
              >
                {assessment.isPublished ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 