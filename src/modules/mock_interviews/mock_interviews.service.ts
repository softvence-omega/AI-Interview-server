import { startSession, Types } from 'mongoose';
import {
  MockInterviewModel,
  QuestionBankModel,
  QuestionListModel,
} from './mock_interviews.model';
import { TMock_Interviews, TQuestion_Bank } from './mock_interviews.interface';
import idConverter from '../../util/idConvirter';
import { updateTotalQuestionsInBank } from '../../util/updateTotalQuestionInQB';
import mockInterviewUtill from './mock_interview.utill';
import { AssessmentModel } from '../vodeoAnalytics/video.model';

// ---------------- MOCK INTERVIEW ----------------
const create_mock_interview = async (data: any) => {
  const result = await MockInterviewModel.create(data);
  return result;
};

const update_mock_interview = async (
  id: Types.ObjectId,
  data: Partial<TMock_Interviews>,
) => {
  console.log('update mock ', id, data);
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
      { new: true, session },
    );

    if (!deleteInterview) {
      throw new Error('Mock Interview not found');
    }

    // Soft delete related question banks
    const deleteQuestionBank = await QuestionBankModel.updateMany(
      { interview_id: id },
      { isDeleted: true },
      { session },
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

const get_mock_interview = async (query?: {
  _id?: string;
  interview_name?: string;
}) => {
  const filter: any = { isDeleted: false };

  if (query) {
    if (query._id) {
      filter._id = idConverter(query._id);
    }
    if (query.interview_name) {
      // Case-insensitive partial match using RegExp
      filter.interview_name = { $regex: query.interview_name, $options: 'i' };
    }
  }

  return await MockInterviewModel.find(filter).populate('question_bank_ids');
};

// ---------------- QUESTION BANK ----------------

const create_question_bank = async (payload: Partial<TQuestion_Bank>) => {
  // Step 1: Create the Question Bank
  const createdQuestionBank = await QuestionBankModel.create(payload);

  // Step 2: Add the Question Bank ID to its corresponding Mock Interview
  if (payload.interview_id) {
    await MockInterviewModel.findByIdAndUpdate(
      payload.interview_id,
      {
        $addToSet: {
          question_bank_ids: createdQuestionBank._id,
        },
      },
      { new: true },
    );
  }

  const countQuestionsAndUpdate = await updateTotalQuestionsInBank(
    createdQuestionBank._id,
  );

  // Step 3: Return the created Question Bank
  return countQuestionsAndUpdate;
};

const update_question_bank = async (id: Types.ObjectId, payload: any) => {
  const ALLOWED_FIELDS = [
    'questionBank_name',
    'duration',
    'difficulty_level',
    'question_Type',
    'description',
    'what_to_expect',
  ];
  // Filter the payload to keep only allowed fields
  const filteredPayload: Partial<typeof payload> = {};

  for (const key of ALLOWED_FIELDS) {
    if (key in payload) {
      filteredPayload[key] = payload[key];
    }
  }

  // Update the document
  const result = await QuestionBankModel.findByIdAndUpdate(
    id,
    filteredPayload,
    {
      new: true,
    },
  );

  return result;
};

const delete_question_bank = async (id: string) => {
  const result = await QuestionBankModel.findByIdAndDelete(id);
  return result;
};

const get_question_bank = async (Query: any) => {
  const filter: Record<string, any> = {};

  // Filter by questionBank_id if provided
  if (Query?.questionBank_id) {
    const convertedId = idConverter(Query.questionBank_id);
    if (convertedId) {
      filter._id = convertedId;
    }
  }

  // Filter by interview_id if provided
  if (Query?.interview_id) {
    const convertedId = idConverter(Query.interview_id);
    if (convertedId) {
      filter.interview_id = convertedId;
    }
  }

  // Return matching results
  return await QuestionBankModel.find(filter);
};

// ..................GENARATE QUESTION BY AI.........................

const genarateQuestionSet_ByAi = async (
  questionBank_id: Types.ObjectId,
  user_id: Types.ObjectId,
  isRetake?: boolean,
) => {
  try {
    // Step 1: Check for existing question list
    const existing = await QuestionListModel.findOne({
      user_id: user_id,
      question_bank_id: questionBank_id,
    });

    if (!isRetake && existing) {
      throw new Error(
        'You have already attempted this test. Cannot generate questions again.',
      );
    }

    // Step 2: Get question bank
    const findQuestionBank = await QuestionBankModel.findOne({
      _id: questionBank_id,
    });

    if (!findQuestionBank) {
      throw new Error("Can't generate question set, no question bank found");
    }

    // if retake delete all the previous results that has been submited based on video analysis
    //delete history of previous question set
    if(isRetake)
    {
      const deleteFromVidoAnalisis = await AssessmentModel.deleteMany({
        questionBank_id: questionBank_id,
        user_id: user_id,
      })
    }

    // Step 3: Prepare prompt and generate questions
    const prompt = `${findQuestionBank.questionBank_name} ${findQuestionBank.what_to_expect.join(' ')}`;
    const data = await mockInterviewUtill.generateQuestions(prompt);
    console.log(data);

    const modifyQuestionList = data.questions.map((item: any) => ({
      interview_id: findQuestionBank.interview_id,
      questionBank_id: questionBank_id,
      user_id: user_id,
      question: item.question,
      time_to_answer: item.time_limit,
      isRetake: !!isRetake,
    }));

    let result;

    // Step 4: If retake, update the existing record
    if (isRetake && existing) {
      result = await QuestionListModel.findOneAndUpdate(
        {
          user_id: user_id,
          question_bank_id: questionBank_id,
        },
        {
          question_Set: modifyQuestionList,
          isRetake: true,
        },
        { new: true }
      );
    } else {
      // Step 5: Otherwise, create a new question list
      result = await QuestionListModel.create({
        user_id: user_id,
        question_bank_id: questionBank_id,
        interview_id: findQuestionBank.interview_id,
        question_Set: modifyQuestionList,
        isRetake: false,
      });
    }

    return result;
  } catch (error) {
    console.error('Error generating question set:', error);
    throw error;
  }
};


const genarateSingleQuestion_ByAi_for_Retake = async (
  questionBank_id: Types.ObjectId,
  user_id: Types.ObjectId,
  interview_id: Types.ObjectId,
  question_id: Types.ObjectId,
) => {
  try {
    // Fetch question bank details for the prompt
    const findQuestionBank = await QuestionBankModel.findOne({
      _id: questionBank_id,
    });
    if (!findQuestionBank) {
      throw new Error('Question bank not found');
    }

    // Generate prompt for AI API
    const prompt = `${findQuestionBank.questionBank_name} ${findQuestionBank.what_to_expect.join(' ')} based on those give me a single question with time limit.`;
    const encodedPrompt = encodeURIComponent(prompt);

    const url = `https://freepik.softvenceomega.com/in-prep/api/v1/q_generator/generate-questions?topic=${encodedPrompt}`;

    // Call AI API to generate a single question
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      throw new Error(
        `AI API request failed: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    // Take the first question from the API response

    console.log(data.questions[0].question);

    // find that specific question and update the time limit and question

    const questionToUpdate = await QuestionListModel.findOneAndUpdate(
      {
        user_id: user_id,
        question_bank_id: questionBank_id,
        interview_id: interview_id,
        'question_Set._id': question_id,
      },
      {
        $set: {
          'question_Set.$.question': data.questions[0].question,
          'question_Set.$.time_to_answer': data.questions[0].time_limit,
        },
      },
      { new: true },
    );

    console.log('updated one', questionToUpdate);

    if (!questionToUpdate) {
      throw new Error('Question not found or not updated');
    }
    // Loop through question_Set to find the matching question
    let result = null;
    for (const question of questionToUpdate.question_Set) {
      if ((question._id as Types.ObjectId).equals(question_id)) {
        result = {
          _id: question._id,
          interview_id: question.interview_id,
          questionBank_id: question.questionBank_id,
          user_id: question.user_id,
          time_to_answer: question.time_to_answer,
          question: question.question,
        };
        break;
      }
    }

    if (!result) {
      throw new Error('Updated question not found in question_Set');
    }

    console.log('Newly generated question:', result);
    return result;
  } catch (error: any) {
    console.error('Error generating single question');
    throw new Error(
      `Failed to generate question: ${error.message || 'Unknown error'}`,
    );
  }
};

export const MockInterviewsService = {
  create_mock_interview,
  update_mock_interview,
  delete_mock_interview,
  get_mock_interview,

  create_question_bank,
  update_question_bank,
  delete_question_bank,
  get_question_bank,

  genarateQuestionSet_ByAi,
  genarateSingleQuestion_ByAi_for_Retake,
};
