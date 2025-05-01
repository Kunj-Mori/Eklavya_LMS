"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, Award, X, Check } from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PageProps {
  params: {
    assessmentId: string;
  };
}

const AssessmentCompletedPage = ({ params }: PageProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        const response = await axios.get(`/api/assessments/${params.assessmentId}/student-results`);
        console.log("Student results received:", response.data);
        
        // Check if correctAnswers are present
        if (response.data.responses && response.data.responses.length > 0) {
          const missingAnswers = response.data.responses.filter((r: any) => !r.question.correctAnswer);
          if (missingAnswers.length > 0) {
            console.warn("Missing correct answers for questions:", missingAnswers);
          }
        }
        
        setResults(response.data);
      } catch (error: any) {
        console.error("Error fetching results:", error);
        if (error.response?.status === 404) {
          if (error.response?.data === "Assessment not found or results not published") {
            setError("Results have not been published yet");
          } else if (error.response?.data === "You have not taken this assessment") {
            setError("You haven't taken this assessment");
          } else {
            setError("Results are not available");
          }
        } else {
          setError("Failed to load results");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [params.assessmentId, router, user]);

  // Format MCQ options for display
  const formatOptions = (options: any) => {
    if (!options) return [];
    try {
      if (typeof options === 'string') {
        return JSON.parse(options);
      }
      return options;
    } catch (error) {
      console.error("Error parsing options:", error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent animate-[spin_2s_linear_infinite]" />
              </div>
              <p className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loading results...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">{error}</h3>
              <p className="text-gray-600 mb-4">Please check back later or contact your instructor.</p>
              <Button
                onClick={() => router.push("/examination")}
                variant="outline"
              >
                Back to Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
              <p className="text-gray-600 mb-4">Results have not been published yet.</p>
              <Button
                onClick={() => router.push("/examination")}
                variant="outline"
              >
                Back to Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Assessment Results</CardTitle>
          <CardDescription>
            Here are your assessment results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-100 p-3 rounded-lg text-center">
            <div className="flex justify-center items-center mb-2">
              <Award className="h-5 w-5 text-amber-500 mr-2" />
              <h3 className="font-semibold">Your Score</h3>
            </div>
            <div className="text-center">
              <Badge className={`px-2 py-1 ${results.score >= 70 ? 'bg-green-500' : (results.score ? 'bg-red-500' : 'bg-gray-500')}`}>
                {results.score !== null && results.score !== undefined ? `${results.score}%` : 'Not graded yet'}
              </Badge>
            </div>
            {results.feedback && (
              <div className="mt-3 text-left">
                <p className="text-xs font-medium mb-1">Feedback:</p>
                <p className="text-xs text-gray-700 bg-white p-2 rounded border">{results.feedback}</p>
              </div>
            )}
          </div>

          {results.responses && results.responses.length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Answer Key</h3>
              <Accordion type="single" collapsible className="w-full">
                {results.responses.map((response: any, index: number) => (
                  <AccordionItem key={response.id} value={`question-${index}`}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex items-center text-left">
                        <span className="mr-2">Question {index + 1}:</span> 
                        <span className="font-normal text-gray-700 truncate max-w-xs">{response.question.question.substring(0, 50)}...</span>
                        {response.score !== null ? (
                          response.score > 0 ? (
                            <span className="ml-auto flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                            </span>
                          ) : (
                            <span className="ml-auto flex items-center text-red-600">
                              <X className="h-4 w-4 mr-1" />
                            </span>
                          )
                        ) : (
                          <Badge className="ml-auto" variant="outline">Pending</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm p-2 bg-slate-50 rounded">
                        <div>
                          <p className="font-medium">Question:</p>
                          <p className="mt-1">{response.question.question}</p>
                        </div>
                        
                        {response.question.questionType === 'MCQ' && (
                          <div>
                            <p className="font-medium mt-2">Options:</p>
                            <ul className="mt-1 space-y-1">
                              {formatOptions(response.question.options).map((option: string, i: number) => (
                                <li key={i} className={`flex items-center ${option === response.question.correctAnswer ? 'text-green-700 font-medium' : ''}`}>
                                  {option === response.question.correctAnswer && (
                                    <Check className="h-4 w-4 mr-1 text-green-600" />
                                  )}
                                  {option}
                                  {option === response.answer && option !== response.question.correctAnswer && (
                                    <span className="ml-1 text-red-500"> (Your answer)</span>
                                  )}
                                  {option === response.answer && option === response.question.correctAnswer && (
                                    <span className="ml-1 text-green-500"> (Your answer - Correct)</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <p className="font-medium">Your Answer:</p>
                          <p className={`mt-1 ${response.score > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {response.answer || 'No answer provided'}
                          </p>
                        </div>
                        
                        <div className="mt-2">
                          <p className="font-medium">Correct Answer:</p>
                          <p className="mt-1 text-green-700">{response.question.correctAnswer || 'Not available'}</p>
                        </div>
                        
                        <div className="mt-2 flex justify-between">
                          <span className="font-medium">Points:</span>
                          <span>{response.score !== null ? response.score : 'Pending'} / {response.question.marks}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => router.push("/examination")}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Return to Assessments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssessmentCompletedPage; 