import { Document, Types } from 'mongoose';

export type TMockInterviewTopicPreference ={
  questionBank_id:Types.ObjectId;
  user_id:Types.ObjectId;
  question_Type: string;
  difficulty_level: string;
  what_to_expect: string[];
}

export type TEach_Question = Document & {
  interview_id: Types.ObjectId;
  questionBank_id: Types.ObjectId;
  user_id: Types.ObjectId;
  time_to_answer: number;
  question: string;
  isRetake?: boolean;
  islast?: boolean;
};

export type TQuestionList = {
  user_id: Types.ObjectId;
  question_bank_id: Types.ObjectId;
  interview_id: Types.ObjectId;
  question_Set: TEach_Question[];
};

export type TQuestion_Bank = {
  interview_id: Types.ObjectId;
  img:string;
  questionBank_name: string;
  duration: number;
  difficulty_level: string;
  question_Type: string;
  description: string;
  total_questions: number;
  what_to_expect: string[]; // assume it's an array of strings
  isDeleted: boolean;
};

export type TMock_Interviews = {
  img: string;
  interview_name: string;
  total_Positions: number;
  description: string;
  isDeleted: boolean;
  question_bank_ids: Types.ObjectId[]; // Specify ObjectId array
};
