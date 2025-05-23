import mongoose, { Schema, model } from 'mongoose';
import {
  TEach_Question,
  TMock_Interviews,
  TQuestion_Bank,
  TQuestionList,
} from './mock_interviews.interface';

// Schema for each question inside a question bank
const EachQuestionSchema = new Schema<TEach_Question>({
  interview_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'MockInterview',
  },
  questionBank_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'QuestionBank',
  },
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  time_to_answer: { type: Number, required: true },
  question: { type: String, required: true },
  isRetake:{type:Boolean, default:false},
  islast:{type:Boolean, default:false},
});

const QuestionListSchema = new Schema<TQuestionList>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    question_bank_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'QuestionBank',
    },
    interview_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Interview',
    },
    question_Set: { type: [EachQuestionSchema], required: true },
  },
  { timestamps: true },
);

// Question Bank Schema
const QuestionBankSchema = new Schema<TQuestion_Bank>({
  interview_id: {
    type: Schema.Types.ObjectId,
    ref: 'MockInterview',
    required: true,
  },
  img: { type: String, required: true, default:null },
  questionBank_name: { type: String, required: true },
  duration: { type: Number, required: true },
  difficulty_level: { type: String, required: true },
  question_Type: { type: String, required: true },
  description: { type: String, required: true },
  total_questions: { type: Number, required: false },
  what_to_expect: { type: [String], default: [] },
  isDeleted: { type: Boolean, default: false },
});

// Mock Interview Schema
const MockInterviewSchema = new Schema<TMock_Interviews>({
  img: { type: String, required: true, default: 'img/link' },
  interview_name: { type: String, required: true },
  total_Positions: { type: Number, required: false , default:0},
  description: { type: String, required: true 

  },
  isDeleted: { type: Boolean, default: false },
  question_bank_ids: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank', default: [] },
  ],
});

// Models
export const QuestionListModel = model<TQuestionList>(
  'QuestionList',
  QuestionListSchema,
);
export const QuestionBankModel = model('QuestionBank', QuestionBankSchema);
export const MockInterviewModel = model('MockInterview', MockInterviewSchema);
