import { startSession, Types } from 'mongoose';
import { MockInterviewModel, QuestionBankModel } from './mock_interviews.model';
import { TMock_Interviews } from './mock_interviews.interface';

// ---------------- MOCK INTERVIEW ----------------
const create_mock_interview = async (data: any) => {
  const result = await MockInterviewModel.create(data);
  return result;
};

const update_mock_interview = async (
  id: Types.ObjectId,
  data: Partial<TMock_Interviews>,
) => {

  console.log("update mock ",id, data)
  const result = await MockInterviewModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  return result;
};

const delete_mock_interview = async (id: Types.ObjectId) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Soft delete mock interview
    const deleteInterview = await MockInterviewModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session }
    );

    if (!deleteInterview) {
      throw new Error("Mock Interview not found");
    }

    // Soft delete related question banks
    const deleteQuestionBank = await QuestionBankModel.updateMany(
      { interview_id: id },
      { isDeleted: true },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      interview: deleteInterview,
      questionBanks: deleteQuestionBank,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const get_mock_interview = async (id?: string) => {
  if (id) {
    return await MockInterviewModel.findById(id).populate('question_bank_ids');
  }
  return await MockInterviewModel.find().populate('question_bank_ids');
};

// ---------------- QUESTION BANK ----------------

const create_question_bank = async (data: any) => {
  const result = await QuestionBankModel.create(data);
  return result;
};

const update_question_bank = async (id: string, data: any) => {
  const result = await QuestionBankModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  return result;
};

const delete_question_bank = async (id: string) => {
  const result = await QuestionBankModel.findByIdAndDelete(id);
  return result;
};

const get_question_bank = async (id?: string) => {
  if (id) {
    return await QuestionBankModel.findById(id);
  }
  return await QuestionBankModel.find();
};

// ---------------- QUESTIONS INSIDE QUESTION BANK ----------------

// Get all questions from a question bank
const getQuestionFrom_question_bank = async (questionBankId: string) => {
  const questionBank = await QuestionBankModel.findById(questionBankId);
  return questionBank?.question_bank || [];
};

// Add a question to a question bank
const addQuestionTo_question_bank = async (
  questionBankId: string,
  newQuestion: any,
) => {
  const updated = await QuestionBankModel.findByIdAndUpdate(
    questionBankId,
    { $push: { question_bank: newQuestion } },
    { new: true },
  );
  return updated;
};

// Update a specific question in a question bank
const updateQuestionIn_question_bank = async (
  questionBankId: string,
  questionIndex: number,
  updatedQuestion: any,
) => {
  const questionBank = await QuestionBankModel.findById(questionBankId);
  if (!questionBank) return null;

  questionBank.question_bank[questionIndex] = updatedQuestion;
  await questionBank.save();
  return questionBank;
};

// Delete a question by index from a question bank
const deleteQuestionFrom_question_bank = async (
  questionBankId: string,
  questionIndex: number,
) => {
  const questionBank = await QuestionBankModel.findById(questionBankId);
  if (!questionBank) return null;

  questionBank.question_bank.splice(questionIndex, 1);
  await questionBank.save();
  return questionBank;
};

// ---------------- EXPORT ALL ----------------

export const MockInterviewsService = {
  create_mock_interview,
  update_mock_interview,
  delete_mock_interview,
  get_mock_interview,

  create_question_bank,
  update_question_bank,
  delete_question_bank,
  get_question_bank,

  getQuestionFrom_question_bank,
  addQuestionTo_question_bank,
  updateQuestionIn_question_bank,
  deleteQuestionFrom_question_bank,
};
