export interface AssessmentAnswer {
  questionId: string;
  answer: string;
}

export interface AssessmentSubmission {
  answers: AssessmentAnswer[];
} 