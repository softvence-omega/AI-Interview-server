import mongoose, { Types } from 'mongoose';
import { QuestionBankModel } from '../modules/mock_interviews/mock_interviews.model';


// Helper to convert to ObjectId if needed
const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
};

export const updateTotalQuestionsInBank = async (inputId: string | Types.ObjectId) => {
  const objectId = toObjectId(inputId);

  // Find the Question Bank
  const questionBank = await QuestionBankModel.findById(objectId);
  if (!questionBank) {
    throw new Error('Question bank not found');
  }

  // // Count the number of questions
  // const totalQuestions = questionBank.question_bank.length;

  // // Update the total_questions field
  // questionBank.total_questions = totalQuestions;
  // await questionBank.save();

  return questionBank;
};


