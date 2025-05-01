"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, UserCheck, AlertCircle, Sparkles, Zap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useUser } from "@clerk/nextjs";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessmentType: string;
  questionFormat: string | string[];
  isPublished: boolean;
  resultsPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionType: string;
  question: string;
  options: any;
  marks: number;
  difficultyLevel: number;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AssessmentExamPage({
  params
}: {
  params: { assessmentId: string }
}) {
  const router = useRouter();
  const { user } = useUser();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMarks, setTotalMarks] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);
  const { ref: cardRef, inView: cardInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch the assessment details
        const assessmentResponse = await axios.get(`/api/assessments/published/${params.assessmentId}`);
        setAssessment(assessmentResponse.data);
        
        // Fetch the questions for this assessment
        const questionsResponse = await axios.get(`/api/assessments/published/${params.assessmentId}/questions`);
        setQuestions(questionsResponse.data);
        
        // Calculate total marks
        const total = questionsResponse.data.reduce((sum: number, q: AssessmentQuestion) => sum + q.marks, 0);
        setTotalMarks(total);

        // Check if the user has already attempted this assessment
        try {
          const checkResponse = await axios.get(`/api/assessments/${params.assessmentId}/responses`);
          if (checkResponse.data && checkResponse.data.length > 0) {
            setHasAttempted(true);
          }
        } catch (error) {
          // If 404 or other error, user hasn't attempted or isn't authorized - that's fine
          console.log("No previous attempts found");
        }
      } catch (error) {
        console.error("Error fetching assessment details:", error);
        toast.error("Failed to load assessment");
        router.push("/examination");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentDetails();
  }, [params.assessmentId, router, user]);

  const startAssessment = () => {
    router.push(`/examination/${params.assessmentId}/session`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-3.5rem)]" style={{background: 'hsl(var(--theme-bg))'}}>
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-20 h-20 mb-6">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Loading assessment details...
          </p>
          <p className="text-slate-500 text-sm">Preparing your AI-powered learning experience</p>
        </motion.div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-6" style={{background: 'hsl(var(--theme-bg))'}}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={() => router.push("/examination")} 
            className="flex items-center text-slate-700 hover:text-blue-600 transition-colors mb-6 px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Assessments</span>
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-red-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <CardTitle className="text-xl mb-2">Assessment Not Found</CardTitle>
              <CardDescription>
                The assessment you're looking for is not available or has been unpublished.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button 
                onClick={() => router.push("/examination")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
              >
                Return to Assessments
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (hasAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold">Assessment Already Attempted</h2>
          <p className="text-gray-600">You have already taken this assessment.</p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push(`/examination/${params.assessmentId}/completed`)}
              className="w-full"
            >
              View Your Results
            </Button>
            <Button 
              onClick={() => router.push("/examination")}
              variant="outline"
              className="w-full"
            >
              Back to Assessments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" style={{background: 'hsl(var(--theme-bg))'}}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => router.push("/examination")} 
          className="flex items-center text-slate-700 hover:text-blue-600 transition-colors mb-6 px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Assessments</span>
        </button>
      </motion.div>

      <motion.div
        ref={cardRef}
        variants={fadeInUp}
        initial="hidden"
        animate={cardInView ? "visible" : "hidden"}
        className="grid gap-6"
      >
        <Card className="border-blue-100">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <div>
                <CardTitle className="text-2xl mb-2">{assessment.title}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {assessment.assessmentType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Questions</p>
                  <p className="text-lg font-semibold">{questions.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-50">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Marks</p>
                  <p className="text-lg font-semibold">{totalMarks}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <motion.div 
            className="p-6 border-t border-blue-100 flex justify-end"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={startAssessment}
              className={`w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Assessment
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
} 