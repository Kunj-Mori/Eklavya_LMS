"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { ArrowLeft, PlusCircle, MinusCircle, ShieldAlert, Sparkles } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  description: z.string().optional(),
  assessmentType: z.enum(["ONLINE", "OFFLINE", "BLENDED"]),
  questionFormats: z.array(
    z.enum(["MCQ", "DESCRIPTIVE", "PRACTICAL", "VIVA", "PEN_PAPER"])
  ).min(1, { message: "Select at least one question format" }),
  inclusivityMode: z.boolean().default(false),
  isAIGenerated: z.boolean().default(false),
  aiTopic: z.string().optional(),
  difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
});

const CreateAssessmentPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Check if user has instructor role
  useEffect(() => {
    if (isLoaded) {
      const isInstructor = user?.publicMetadata?.role === "instructor";
      
      if (!isInstructor) {
        toast.error("Only instructors can create assessments");
        router.push("/teacher/assessment");
      } else {
        setIsCheckingPermission(false);
      }
    }
  }, [user, isLoaded, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      assessmentType: "ONLINE",
      questionFormats: ["MCQ"],
      inclusivityMode: false,
      isAIGenerated: false,
      aiTopic: "",
      difficultyLevel: "MEDIUM",
    },
  });

  // Watch isAIGenerated to conditionally show AI topic fields
  const isAIGenerated = form.watch("isAIGenerated");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      if (values.isAIGenerated) {
        setIsGeneratingAI(true);
        toast.success("Generating assessment with Gemini AI...");
        
        // First generate AI content
        const aiResponse = await axios.post("/api/assessments/generate", {
          topic: values.aiTopic || values.title,
          description: values.description,
          assessmentType: values.assessmentType,
          questionFormat: values.questionFormats,
          difficultyLevel: values.difficultyLevel,
        });
        
        // Then create assessment with AI generated content
        const response = await axios.post("/api/assessments", {
          title: values.title,
          description: values.description,
          assessmentType: values.assessmentType,
          questionFormat: values.questionFormats,
          inclusivityMode: values.inclusivityMode,
          aiGenerated: true,
          aiContent: aiResponse.data,
          difficultyLevel: values.difficultyLevel,
        });
        
        router.push(`/teacher/assessment/${response.data.id}`);
        toast.success("AI-generated assessment created successfully");
      } else {
        // Standard assessment creation
        const response = await axios.post("/api/assessments", {
          title: values.title,
          description: values.description,
          assessmentType: values.assessmentType,
          questionFormat: values.questionFormats,
          inclusivityMode: values.inclusivityMode,
        });
        
        router.push(`/teacher/assessment/${response.data.id}`);
        toast.success("Assessment created successfully");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsGeneratingAI(false);
    }
  };

  // Show loading state while checking permissions
  if (isCheckingPermission) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show different loading state when generating AI content
  if (isGeneratingAI) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Generating assessment with Gemini AI...</p>
          <p className="text-sm text-muted-foreground mt-2">This might take a minute</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            onClick={() => router.push("/teacher/assessment")} 
            variant="ghost" 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Assessment</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Title</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isLoading} 
                      placeholder="e.g. 'Web Development Skills Assessment'" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Give your assessment a clear, descriptive title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      disabled={isLoading} 
                      placeholder="Describe the purpose and content of this assessment" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what skills or knowledge this assessment will evaluate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Mode</FormLabel>
                  <Select 
                    disabled={isLoading} 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assessment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                      <SelectItem value="BLENDED">Blended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how candidates will take this assessment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionFormats"
              render={() => (
                <FormItem>
                  <FormLabel>Question Formats</FormLabel>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("MCQ")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "MCQ"]
                                  : field.value.filter((value) => value !== "MCQ");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Multiple Choice Questions</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("DESCRIPTIVE")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "DESCRIPTIVE"]
                                  : field.value.filter((value) => value !== "DESCRIPTIVE");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Descriptive Questions</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("PRACTICAL")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "PRACTICAL"]
                                  : field.value.filter((value) => value !== "PRACTICAL");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Practical Exam</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("VIVA")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "VIVA"]
                                  : field.value.filter((value) => value !== "VIVA");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Viva Voce</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="questionFormats"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("PEN_PAPER")}
                              onCheckedChange={(checked) => {
                                const updatedFormats = checked
                                  ? [...field.value, "PEN_PAPER"]
                                  : field.value.filter((value) => value !== "PEN_PAPER");
                                field.onChange(updatedFormats);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Pen-Paper Exam</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormDescription>
                    Select all question formats that will be included in this assessment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inclusivityMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable inclusivity features for Persons with Disabilities (PWD)</FormLabel>
                    <FormDescription>
                      This will add additional accessibility options like text-to-speech, voice-to-text, 
                      and other accommodations for candidates with disabilities.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAIGenerated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                      Generate assessment with Gemini AI
                    </FormLabel>
                    <FormDescription>
                      Let Gemini AI create questions, answers, and options based on your topic.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {isAIGenerated && (
              <FormField
                control={form.control}
                name="aiTopic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Topic</FormLabel>
                    <FormControl>
                      <Textarea 
                        disabled={isLoading} 
                        placeholder="Describe the topic in detail for AI to generate relevant questions (e.g. 'JavaScript fundamentals including variables, functions, and basic DOM manipulation')" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a specific topic and any details you want the AI to focus on. The more details you provide, the better the questions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isAIGenerated && (
              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select 
                      disabled={isLoading} 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the difficulty level for the AI-generated questions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="pt-4 flex justify-end">
              <Button 
                disabled={isLoading} 
                type="submit"
              >
                {isAIGenerated ? "Generate AI Assessment" : "Create Assessment"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateAssessmentPage;