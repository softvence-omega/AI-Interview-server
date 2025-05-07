export interface InterviewData {
  Articulation: { feedback: string; score: number };
  Behavioural_Cue: { feedback: string; score: number };
  Problem_Solving: { feedback: string; score: number };
  Inprep_Score: { total_score: number };
  createdAt: string;
}

export interface DailyAverage {
  Articulation: number;
  Behavioural_Cue: number;
  Problem_Solving: number;
  Inprep_Score: number;
}

export interface GroupData {
    Articulation: number;
    Behavioural_Cue: number;
    Problem_Solving: number;
    Inprep_Score: number;
    count: number;
  }