import mongoose, { Schema, model } from 'mongoose';
import {
  TEach_Question,
  TMock_Interviews,
  TQuestion_Bank,
} from './mock_interviews.interface';

// Schema for each question inside a question bank
const EachQuestionSchema = new Schema<TEach_Question>({
  time_to_answer: { type: Number, required: true },
  question: { type: String, required: true },
});

// Question Bank Schema
const QuestionBankSchema = new Schema<TQuestion_Bank>({
  interview_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterview',
    required: true,
  },
  questionBank_name: { type: String, required: true },
  duration: { type: Number, required: true },
  difficulty_level: { type: String, required: true },
  question_Type: { type: String, required: true },
  description: { type: String, required: true },
  total_questions: { type: Number, required: true },
  what_to_expect: { type: [String], default: [] },
  isDeleted:{type:Boolean,default:false},
  question_bank: { type: [EachQuestionSchema], default: [] },
});

// Mock Interview Schema
const MockInterviewSchema = new Schema<TMock_Interviews>({
  img: { type: String, required: true, default:"img/link"},
  interview_name: { type: String, required: true },
  total_Positions: { type: Number, required: false },
  description: { type: String, required: true },
  isDeleted:{type:Boolean,default:false},
  question_bank_ids: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' ,default:[]},
  ],
});

// Models
export const QuestionBankModel = model('QuestionBank', QuestionBankSchema);
export const MockInterviewModel = model('MockInterview', MockInterviewSchema);
