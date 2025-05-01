"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Settings, Users, Award, AccessibilityIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface AssessmentCardProps {
  id: string;
  title: string;
  description: string;
  assessmentType: string;
  inclusivityMode: boolean;
  isPublished: boolean;
  createdAt: string;
}

const assessmentTypeColors = {
  "ONLINE": "bg-green-100 text-green-800",
  "OFFLINE": "bg-blue-100 text-blue-800",
  "BLENDED": "bg-purple-100 text-purple-800",
};

export const AssessmentCard = ({
  id,
  title,
  description,
  assessmentType,
  inclusivityMode,
  isPublished,
  createdAt,
}: AssessmentCardProps) => {
  const router = useRouter();

  const formatCreatedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Date unavailable";
      }
      return `Created ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch (error) {
      return "Date unavailable";
    }
  };

  const onCardClick = () => {
    router.push(`/teacher/assessment/${id}`);
  };

  return (
    <Card 
      className="w-full hover:shadow-md transition cursor-pointer" 
      onClick={onCardClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {inclusivityMode && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                <AccessibilityIcon className="h-3 w-3 mr-1" />
                PWD Support
              </Badge>
            )}
          </div>
          <Badge 
            variant={isPublished ? "default" : "outline"}
            className={isPublished ? "bg-green-700" : "text-slate-500 border-slate-500"}
          >
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        <div className="mt-4 flex items-center gap-x-2 text-sm text-gray-500">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {assessmentType}
          </Badge>
          <span>•</span>
          <span>{formatCreatedDate(createdAt)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-x-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/teacher/assessment/${id}/questions`);
            }}
            variant="outline"
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Questions
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/teacher/assessment/${id}/candidates`);
            }}
            variant="outline"
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Candidates
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/teacher/assessment/${id}/settings`);
            }}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}; 