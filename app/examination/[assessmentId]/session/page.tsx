"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Save, 
  CheckCircle, 
  Volume2,
  Brain,
  Sparkles,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { SpeechToText } from "@/components/ui/SpeechToText";

interface Assessment {
  id: string;
  title: string;
  inclusivityMode: boolean;
}

interface Question {
  id: string;
  question: string;
  questionType: "MCQ" | "DESCRIPTIVE";
  options?: string[];
}

interface Answer {
  questionId: string;
  answer: string;
}

export default function AssessmentSessionPage({
  params
}: {
  params: { assessmentId: string }
}) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  
  // Accessibility features
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  
  // For GSAP animations
  const questionCardRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const [assessmentResponse, questionsResponse] = await Promise.all([
          axios.get(`/api/assessments/${params.assessmentId}`),
          axios.get(`/api/assessments/${params.assessmentId}/questions`)
        ]);

        setAssessment(assessmentResponse.data);
        setQuestions(questionsResponse.data);
        
        // Initialize answers array
        const initialAnswers = questionsResponse.data.map((q: Question) => ({
          questionId: q.id,
          answer: ""
        }));
        setAnswers(initialAnswers);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching assessment data:", error);
        toast.error("Failed to load assessment");
        router.push("/teacher/assessments");
      }
    };

    fetchAssessmentData();

    // Cleanup function
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [params.assessmentId, router]);

  // Animation for question transition
  useEffect(() => {
    if (!isLoading && questionCardRef.current) {
      gsap.fromTo(
        questionCardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      
      if (optionsRef.current) {
        gsap.fromTo(
          optionsRef.current.children,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
      }
    }
  }, [currentQuestionIndex, isLoading]);

  const handleAnswerChange = (value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].answer = value;
    setAnswers(updatedAnswers);
  };

  const handleTranscript = (text: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].answer = text;
    setAnswers(updatedAnswers);
  };

  const saveProgress = async () => {
    try {
      setIsSaving(true);
      await axios.post(`/api/assessments/${params.assessmentId}/progress`, {
        answers: answers
      });
      toast.success("Progress saved");
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    } finally {
      setIsSaving(false);
    }
  };

  const submitAssessment = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if all questions have been answered
      const unansweredCount = answers.filter(a => !a.answer.trim()).length;
      if (unansweredCount > 0) {
        const proceed = window.confirm(
          `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`
        );
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Submit answers to the backend
      await axios.post(`/api/assessments/${params.assessmentId}/responses`, {
        answers: answers
      });
      
      toast.success("Assessment submitted successfully");
      router.push(`/examination/${params.assessmentId}/completed`);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
      setIsSubmitting(false);
    }
  };
  
  // Text-to-Speech function
  const speakText = () => {
    if (!speechSynthesis) {
      toast.error("Text-to-speech is not supported in your browser");
      return;
    }
    
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    let textToSpeak = currentQuestion.question;
    
    if (currentQuestion.questionType === "MCQ" && currentQuestion.options) {
      textToSpeak += ". Options: ";
      currentQuestion.options.forEach((option, index) => {
        textToSpeak += `Option ${index + 1}: ${option}. `;
      });
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-3.5rem)]">
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
          <motion.p 
            className="text-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading assessment...
          </motion.p>
          <p className="text-gray-500 text-sm">Preparing your AI examination experience</p>
        </motion.div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Assessment Not Found</h3>
              <p className="text-gray-500 mb-4">This assessment may have been deleted or you don't have access to it.</p>
              <Button onClick={() => router.push("/teacher/assessments")}>
                Back to Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex]?.answer || "";
  const questionProgress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const renderQuestionContent = () => {
    if (currentQuestion.questionType === "MCQ") {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-6"
            ref={optionsRef}
          >
            <RadioGroup
              value={currentAnswer}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    className="border-2"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        </AnimatePresence>
      );
    } else {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-6"
          >
            <div className="relative">
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[200px] focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all pr-12"
              />
              <div className="absolute right-2 top-2">
                <SpeechToText
                  onTranscript={handleTranscript}
                  className="hover:scale-105 transition-transform"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <div className="text-sm text-slate-500">
                {currentAnswer.length > 0 ? `${currentAnswer.length} characters` : 'No input yet'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="overflow-hidden border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500" ref={questionCardRef}>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mb-1">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Brain className="h-5 w-5 text-purple-500" />
                </motion.div>
                <span className="text-sm font-medium text-purple-700">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <CardTitle className="text-xl md:text-2xl">
                {currentQuestion.question}
              </CardTitle>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={speakText}
                className={`p-2 rounded-full ${isSpeaking ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} hover:shadow-md transition-all`}
              >
                <Volume2 className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 h-1 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${questionProgress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${questionProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardHeader>
        {renderQuestionContent()}
        <CardFooter className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t">
          <div className="flex justify-between items-center w-full">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <Button
                onClick={saveProgress}
                variant="outline"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Progress
                  </>
                )}
              </Button>
              {currentQuestionIndex === questions.length - 1 && (
                <Button
                  onClick={submitAssessment}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </motion.div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Submit Assessment
                    </>
                  )}
                </Button>
              )}
            </div>
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={currentQuestionIndex === questions.length - 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 