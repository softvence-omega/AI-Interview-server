import { Types } from 'mongoose';

export type TAssessmentPayload = {
  question_id?: Types.ObjectId | null;
  interview_id: Types.ObjectId;
  questionBank_id: Types.ObjectId;
  user_id: Types.ObjectId;
  islast: boolean;
  isSummary: boolean;
  video_url?: string;

  assessment: {
    overall_score?: number;

    // Allow both camelCase and snake_case keys
    Articulation?: {
      feedback: string;
      score: number;
    };
    articulation?: {
      feedback: string;
      score: number;
    };

    Behavioural_Cue?: {
      feedback: string;
      score: number;
    };
    behavioural_cue?: {
      feedback: string;
      score: number;
    };

    Problem_Solving?: {
      feedback: string;
      score: number;
    };
    problem_solving?: {
      feedback: string;
      score: number;
    };

    Inprep_Score?: {
      total_score: number;
    };
    inprep_score?: number;

    what_can_i_do_better:
      | { overall_feedback: string }
      | string;

    Content_Score?: number;
    content_score?: number;
  };
};

