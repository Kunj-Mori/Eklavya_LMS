import { db } from "@/lib/db";
import { Assessment, AssessmentSession } from "@prisma/client";

type AssessmentWithSessions = Assessment & {
  sessions: AssessmentSession[];
};

// Function to convert numeric difficulty level to string
const getDifficultyLabel = (level: number): string => {
  switch(level) {
    case 1: return 'EASY';
    case 3: return 'HARD';
    case 2:
    default: return 'MEDIUM';
  }
};

export const getAssessmentAnalytics = async (userId: string) => {
  try {
    // Get all assessments created by the teacher with their sessions
    const assessments = await db.assessment.findMany({
      where: {
        createdById: userId
      },
      include: {
        sessions: true,
      }
    });

    // Prepare assessment performance data for chart
    const assessmentData = assessments.map(assessment => {
      const attemptCount = assessment.sessions.length;
      
      // Calculate average score if there are attempts
      const totalScore = assessment.sessions.reduce((sum, session) => 
        sum + (session.score || 0), 0);
      const avgScore = attemptCount > 0 
        ? Math.round(totalScore / attemptCount) 
        : 0;
      
      return {
        name: assessment.title.length > 20 
          ? `${assessment.title.substring(0, 20)}...` 
          : assessment.title,
        score: avgScore,
        attempts: attemptCount
      };
    });

    // Calculate total assessments
    const totalAssessments = assessments.length;
    
    // Calculate total attempts across all assessments
    const totalAttempts = assessments.reduce(
      (sum, assessment) => sum + assessment.sessions.length, 0
    );
    
    // Calculate overall average score
    let overallAvgScore = 0;
    if (totalAttempts > 0) {
      const allScores = assessments.flatMap(assessment => 
        assessment.sessions.map(session => session.score || 0)
      );
      const totalScore = allScores.reduce((sum, score) => sum + score, 0);
      overallAvgScore = Math.round(totalScore / allScores.length);
    }

    // Group assessments by difficulty level
    const assessmentsByDifficulty: Record<string, { count: number, avgScore: number }> = {
      'EASY': { count: 0, avgScore: 0 },
      'MEDIUM': { count: 0, avgScore: 0 },
      'HARD': { count: 0, avgScore: 0 }
    };

    // Process each assessment by difficulty
    assessments.forEach(assessment => {
      const difficultyKey = getDifficultyLabel(assessment.difficultyLevel || 2);
      assessmentsByDifficulty[difficultyKey].count += 1;
      
      // Calculate average score for this difficulty level
      const sessionScores = assessment.sessions.map(s => s.score || 0);
      if (sessionScores.length > 0) {
        const difficultyTotalScore = sessionScores.reduce((sum, score) => sum + score, 0);
        const difficultyAvgScore = Math.round(difficultyTotalScore / sessionScores.length);
        
        // Update the running average for this difficulty
        const currentTotal = assessmentsByDifficulty[difficultyKey].avgScore * 
          (assessmentsByDifficulty[difficultyKey].count - 1);
        
        assessmentsByDifficulty[difficultyKey].avgScore = 
          Math.round((currentTotal + difficultyAvgScore) / assessmentsByDifficulty[difficultyKey].count);
      }
    });

    return {
      assessmentData,
      totalAssessments,
      totalAttempts,
      avgScore: overallAvgScore,
      assessmentsByDifficulty
    };
  } catch (error) {
    console.log("[GET_ASSESSMENT_ANALYTICS]", error);
    return {
      assessmentData: [],
      totalAssessments: 0,
      totalAttempts: 0,
      avgScore: 0,
      assessmentsByDifficulty: {
        'EASY': { count: 0, avgScore: 0 },
        'MEDIUM': { count: 0, avgScore: 0 },
        'HARD': { count: 0, avgScore: 0 }
      }
    };
  }
}; 