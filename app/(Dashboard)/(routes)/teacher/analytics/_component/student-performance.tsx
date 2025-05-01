"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface StudentAssessment {
  id: string;
  title: string;
  score: number;
  completedAt: string;
  difficultyLevel: number;
}

interface StudentCourse {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  chaptersCompleted: number;
  totalChapters: number;
}

interface StudentPerformanceProps {
  studentId: string | null;
}

export const StudentPerformance = ({ studentId }: StudentPerformanceProps) => {
  const [assessments, setAssessments] = useState<StudentAssessment[]>([]);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    avgScore: 0,
    totalAssessments: 0,
    completedCourses: 0,
    totalCourses: 0
  });

  useEffect(() => {
    const fetchStudentPerformance = async () => {
      if (!studentId) {
        setAssessments([]);
        setCourses([]);
        setStats({
          avgScore: 0,
          totalAssessments: 0,
          completedCourses: 0,
          totalCourses: 0
        });
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await axios.get(`/api/analytics/student/${studentId}/performance`);
        
        if (response.data) {
          setAssessments(response.data.assessments || []);
          setCourses(response.data.courses || []);
          
          // Calculate stats
          const totalScores = response.data.assessments.reduce(
            (sum: number, a: StudentAssessment) => sum + a.score, 0
          );
          
          const avgScore = response.data.assessments.length > 0 
            ? Math.round(totalScores / response.data.assessments.length) 
            : 0;
            
          const completedCourses = response.data.courses.filter(
            (c: StudentCourse) => c.progress === 100
          ).length;
          
          setStats({
            avgScore,
            totalAssessments: response.data.assessments.length,
            completedCourses,
            totalCourses: response.data.courses.length
          });
        }
      } catch (error) {
        console.error("Error fetching student performance:", error);
        setAssessments([]);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentPerformance();
  }, [studentId]);

  if (!studentId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Function to get difficulty label
  const getDifficultyLabel = (level: number) => {
    switch(level) {
      case 1: return 'Easy';
      case 3: return 'Hard';
      case 2:
      default: return 'Medium';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.totalAssessments} assessments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedCourses}/{stats.totalCourses}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Courses completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments.length > 0 
                ? `${Math.max(...assessments.map(a => a.score))}%` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Highest score achieved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.filter(c => c.progress > 0 && c.progress < 100).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Courses in progress
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Performance</CardTitle>
          <CardDescription>Recent assessments taken by the student</CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No assessments taken by this student
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.slice(0, 5).map((assessment) => (
                <div key={assessment.id} className="flex items-center space-x-4 border-b pb-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{assessment.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(assessment.completedAt), 'MMM d, yyyy')}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{getDifficultyLabel(assessment.difficultyLevel)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div 
                      className={`font-medium ${
                        assessment.score >= 70 
                          ? 'text-green-600' 
                          : assessment.score >= 40 
                            ? 'text-amber-600' 
                            : 'text-red-600'
                      }`}
                    >
                      {assessment.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>Courses the student is enrolled in</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No courses enrolled
            </div>
          ) : (
            <div className="space-y-5">
              {courses.map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium">{course.title}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {course.progress}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Progress value={course.progress} className="h-2" />
                    <span className="text-xs text-muted-foreground ml-2">
                      {course.chaptersCompleted}/{course.totalChapters} chapters
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last accessed: {format(new Date(course.lastAccessed), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 