import mongoose, { Schema, model } from 'mongoose';
import {
  TEach_Question,
  TMock_Interviews,
  TMockInterviewTopicPreference,
  TQuestion_Bank,
  TQuestionList,
} from './mock_interviews.interface';



const mockInterviewTopicPreferenceSchema = new Schema<TMockInterviewTopicPreference>(
  {
    questionBank_id: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionBank', // Reference to QuestionBank model
      required: [true, 'Question bank ID is required'],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'UserCollection', // Reference to User model
      required: [true, 'User ID is required'],
    },
    question_Type: {
      type: String,
      required: [true, 'Question type is required'],
      trim: true,
    },
    difficulty_level: {
      type: String,
      required: [true, 'Difficulty level is required'],
      trim: true,
    },
    what_to_expect: {
      type: [String],
      required: [true, 'What to expect is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'What to expect must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);



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
  img: { type: String, required: false, default: 'https://res.cloudinary.com/dpgcpei5u/image/upload/v1750939089/103131-OMJDY9-759_qi0rbh.jpg' },
  questionBank_name: { type: String, required: true },
  duration: { type: Number, required: false , default:30 },
  difficulty_level: { type: String, required: false, default: 'Easy' },
  question_Type: { type: String, required: false , default:"MCQ"},
  description: { type: String, required: true },
  total_questions: { type: Number, required: false },
  what_to_expect: { type: [String], default: [] },
  isDeleted: { type: Boolean, default: false },
});

// Mock Interview Schema
const MockInterviewSchema = new Schema<TMock_Interviews>({
  img: { type: String, required: false, default: 'https://res.cloudinary.com/dpgcpei5u/image/upload/v1750938963/3feb22_general_nuraghies_11_hv1fjx.jpg' },
  interview_name: { type: String, required: true },
  total_Positions: { type: Number, required: false , default:0},
  description: { type: String, required: true },
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
export const MocTopicPreferenceModel = model<TMockInterviewTopicPreference>(
  'MockInterviewTopicPreference',
  mockInterviewTopicPreferenceSchema
);
