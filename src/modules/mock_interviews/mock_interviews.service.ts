import { startSession, Types } from 'mongoose';
import { MockInterviewModel, QuestionBankModel, QuestionListModel } from './mock_interviews.model';
import { TMock_Interviews, TQuestion_Bank } from './mock_interviews.interface';
import idConverter from '../../util/idConvirter';
import { updateTotalQuestionsInBank } from '../../util/updateTotalQuestionInQB';

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



const get_mock_interview = async (query?: { _id?: string; interview_name?: string }) => {
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
};;

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
      { new: true }
    );
  }

  const countQuestionsAndUpdate = await updateTotalQuestionsInBank(createdQuestionBank._id)

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
    'what_to_expect'
  ];
  // Filter the payload to keep only allowed fields
  const filteredPayload: Partial<typeof payload> = {};
  
  for (const key of ALLOWED_FIELDS) {
    if (key in payload) {
      filteredPayload[key] = payload[key];
    }
  }

  // Update the document
  const result = await QuestionBankModel.findByIdAndUpdate(id, filteredPayload, {
    new: true,
  });

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

const genarateQuestionSet_ByAi = async (questionBank_id: Types.ObjectId, user_id: Types.ObjectId) => {
  const findQuestionBank = await QuestionBankModel.findOne({ _id: questionBank_id });
  if (!findQuestionBank) {
    throw new Error("Can't generate question set, no question bank found");
  }

  // Combine the question bank name with expectations
  const prompt = `${findQuestionBank.questionBank_name} ${findQuestionBank.what_to_expect.join(' ')}`;
  const encodedPrompt = encodeURIComponent(prompt); // important!

  const url = `https://freepik.softvenceomega.com/in-prep/api/v1/q_generator/generate-questions?topic=${encodedPrompt}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: '', // empty body as per the documentation
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();


    const makeQuestionList= await QuestionListModel.create({
      user_id: user_id,
      question_bank_id: questionBank_id,
      interview_id: findQuestionBank.interview_id,
      question_Set: data,
    })



    console.log("AI Response:", data);
    return data;
  } 
  catch (error) {
    console.error("Error generating question set:", error);
    throw error;
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


}
