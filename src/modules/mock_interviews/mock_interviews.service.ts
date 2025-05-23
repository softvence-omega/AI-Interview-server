/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { startSession, Types } from 'mongoose';
import {
  MockInterviewModel,
  QuestionBankModel,
  QuestionListModel,
} from './mock_interviews.model';
import { TMock_Interviews, TQuestion_Bank } from './mock_interviews.interface';
import idConverter from '../../util/idConvirter';
import mockInterviewUtill from './mock_interview.utill';
import { AssessmentModel } from '../vodeoAnalytics/video.model';
import progressUtill from '../../util/setAndUpdateprogress';
import { ProfileModel } from '../user/user.model';
import { uploadImgToCloudinary } from '../../util/uploadImgToCludinary';

// ---------------- MOCK INTERVIEW ----------------
const create_mock_interview = async (file:any, data: any) => {

  if(!file)
  {
    throw Error ("img file is required yoooooooo")
  }
    const uploadImg = await uploadImgToCloudinary(file.name,file.path);
    console.log(uploadImg)


const updateData = {...data, img:uploadImg.secure_url}

  const result = await MockInterviewModel.create(updateData);
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

const get_mock_interview = async (
  user_id: Types.ObjectId,
  query?: {
    _id?: string;
    interview_name?: string;
  }
) => {
  const filter: any = { isDeleted: false };

  const hasQuery = query && (query._id || query.interview_name);

  if (hasQuery) {
    if (query?._id) {
      filter._id = query._id;
    }
    if (query?.interview_name) {
      filter.interview_name = { $regex: query.interview_name, $options: 'i' };
    }
    const interviews = await MockInterviewModel.find(filter).populate('question_bank_ids');
    return interviews;
  } else {
    const userProfile = await ProfileModel.findOne({ user_id }).select('experienceLevel');

    if (!userProfile || !userProfile.experienceLevel) {
      const allInterviews = await MockInterviewModel.find(filter).populate('question_bank_ids');
      return {
        suggested: [],
        all_InterView: allInterviews,
      };
    }

    const experienceLevel = userProfile.experienceLevel;

    const matchingInterviews = await MockInterviewModel.find({
      ...filter,
      interview_name: { $regex: experienceLevel, $options: 'i' },
    }).populate('question_bank_ids');

    const nonMatchingInterviews = await MockInterviewModel.find({
      ...filter,
      interview_name: { $not: { $regex: experienceLevel, $options: 'i' } },
    }).populate('question_bank_ids');

    return {
      suggested: matchingInterviews,
      all_InterView: nonMatchingInterviews,
    };
  }
};


// ---------------- QUESTION BANK ----------------

const create_question_bank = async (file:any, payload: Partial<TQuestion_Bank>) => {

  if(!file)
    {
      throw Error ("img file is required yoooooooo")
    }
      const uploadImg = await uploadImgToCloudinary(file.name,file.path);
      console.log(uploadImg)
  
  
  const updateData = {...payload, img:uploadImg.secure_url}
  // Step 1: Create the Question Bank
  const createdQuestionBank = await QuestionBankModel.create(updateData);

  // Step 2: Add the Question Bank ID to its corresponding Mock Interview
  if (payload.interview_id) {
    await MockInterviewModel.findByIdAndUpdate(
      payload.interview_id,
      {
        $addToSet: {
          question_bank_ids: createdQuestionBank._id, // Add to array
        },
        $inc: {
          total_Positions: 1, // Increment by 1
        },
      },
      { new: true }
    );
  }

  // Step 3: Return the created Question Bank
  return createdQuestionBank;
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
  // Step 1: Find the question bank to get its interview_id
  const questionBank = await QuestionBankModel.findById(id);
  if (!questionBank) {
    throw new Error("Question bank not found");
  }

  // Step 2: Remove the question bank ID from the MockInterviewModel and decrement total_Positions
  if (questionBank.interview_id) {
    await MockInterviewModel.findByIdAndUpdate(
      questionBank.interview_id,
      {
        $pull: {
          question_bank_ids: id, // Remove the question bank ID from the array
        },
        $inc: {
          total_Positions: -1, // Decrement by 1
        },
      },
      { new: true }
    );
  }

  // Step 3: Delete the question bank
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


    // console.log("does it exist ..........................",existing)

    // Step 2: Get question bank
    const findQuestionBank = await QuestionBankModel.findOne({
      _id: questionBank_id,
    });

    if (!findQuestionBank) {
      throw new Error("Can't generate question set, no question bank found");
    }

    if (!isRetake && existing) {
      // Fetch user profile
      const profile = await ProfileModel.findOne({
        user_id: user_id,
        'progress.interviewId': findQuestionBank.interview_id,
      });

      // Find the specific progress entry
      const progressEntry = profile?.progress.find(
        (p) =>
          p.interviewId.toString() === findQuestionBank.interview_id.toString(),
      );

      // console.log("progress entry*****", progressEntry);

      const qbProgress = progressEntry?.questionBank_AndProgressTrack.find(
        (qb) => qb.questionBaank_id.toString() === questionBank_id.toString(),
      );

      // console.log("qb progress****", qbProgress);

      const lastAnswered = qbProgress?.lastQuestionAnswered_id;

      console.log("last question answered***", lastAnswered);

      const findQuestionList = await QuestionListModel.findOne({
        user_id: user_id,
        question_bank_id: questionBank_id,
        interview_id: findQuestionBank.interview_id,
      }).select('question_Set');

      if (!findQuestionList) {
        throw new Error('Question list not found');
      }

      console.log("find question List &&&&&", findQuestionList);

      // ✅ Safely determine the index
      let index = -1; // Default to -1 for no progress
      if (lastAnswered) {
        const foundIndex = findQuestionList.question_Set.findIndex(
          (q: any) =>
            q._id &&
            q._id.toString() === lastAnswered.toString()
        );
        index = foundIndex; // Use foundIndex directly, including -1 if not found
      }

      console.log("question index found:=>=>=>=>", index);

      // Get remaining questions
      let remainingQuestions:any = [];
      if (findQuestionList.question_Set && Array.isArray(findQuestionList.question_Set)) {
        if (index >= 0) {
          // Valid question answered: exclude up to and including it
          remainingQuestions = findQuestionList.question_Set.slice(index + 1);
        } else {
          // No progress (index = -1): return full question set
          remainingQuestions = findQuestionList.question_Set;
        }
      }

      console.log("remaining questions", remainingQuestions);

      return {
        message: 'remaining questions',
        remainingQuestions,
      };
    }

    // Step 3: If retake, delete previous assessment
    if (isRetake) {
      await AssessmentModel.deleteMany({
        questionBank_id: questionBank_id,
        user_id: user_id,
      });
    }

    // Step 4: Prepare prompt and generate new questions
    const prompt = `${findQuestionBank.questionBank_name} ${findQuestionBank.what_to_expect.join(' ')}`;
    const data = await mockInterviewUtill.generateQuestions(prompt);

    const modifyQuestionList = data.questions.map((item: any) => ({
      interview_id: findQuestionBank.interview_id,
      questionBank_id: questionBank_id,
      user_id: user_id,
      question: item.question,
      time_to_answer: item.time_limit,
      isRetake: !!isRetake,
    }));

    let result;

    // Step 5: Save or update question list
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
        { new: true },
      );
    } else {
      result = await QuestionListModel.create({
        user_id: user_id,
        question_bank_id: questionBank_id,
        interview_id: findQuestionBank.interview_id,
        question_Set: modifyQuestionList,
        isRetake: false,
      });
    }

    // Step 6: Update progress
    await progressUtill.updateProgress(user_id, questionBank_id, isRetake);
    await progressUtill.updateInterviewIfAllTheQuestionBankCompleted(
      user_id,
      findQuestionBank.interview_id,
    );

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
