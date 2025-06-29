/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { startSession, Types } from 'mongoose';
import {
  MockInterviewModel,
  MocTopicPreferenceModel,
  QuestionBankModel,
  QuestionListModel,
} from './mock_interviews.model';
import {
  TMock_Interviews,
  TMockInterviewTopicPreference,
  TQuestion_Bank,
} from './mock_interviews.interface';
import idConverter from '../../util/idConvirter';
import mockInterviewUtill from './mock_interview.utill';
import progressUtill from '../../util/setAndUpdateprogress';
import { ProfileModel } from '../user/user.model';
import { uploadImgToCloudinary } from '../../util/uploadImgToCludinary';
import { AssessmentModel } from '../vodeoAnalytics/video.model';
import { Resume } from '../resume/resume.model';
import config from '../../config';

// ---------------- MOCK INTERVIEW ----------------
// const create_mock_interview = async (file: any, data: any) => {
//   if (!file) {
//     throw Error('img file is required yoooooooo');
//   }
//   const uploadImg = await uploadImgToCloudinary(file.name, file.path);
//   console.log(uploadImg);

//   const updateData = { ...data, img: uploadImg.secure_url };

//   const result = await MockInterviewModel.create(updateData);
//   return result;
// };

const create_mock_interview = async (data: any, file?: any) => {
  // Validate data exists
  if (!data) {
    throw new Error('Data payload is missing');
  }

  let updateData = { ...data };

  // Handle file upload if provided
  if (file) {
    // if (!file.name || !file.path) {
    //   throw new Error('File object must contain name and path properties');
    // }

    try {
      const uploadImg = await uploadImgToCloudinary(file.name, file.path);
      if (!uploadImg?.secure_url) {
        throw new Error('Failed to retrieve secure_url from Cloudinary');
      }
      updateData = { ...data, img: uploadImg.secure_url };
    } catch (error: any) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Create record in MockInterviewModel
  const result = await MockInterviewModel.create(updateData);
  return result;
};

const update_mock_interview = async (
  id: Types.ObjectId,
  file?: any,
  payload?: any,
) => {
  const ALLOWED_FIELDS = ['interview_name', 'description'];

  // Filter the payload to keep only allowed fields
  const filteredPayload: Partial<typeof payload> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in payload) {
      filteredPayload[key] = payload[key];
    }
  }

  // Handle image upload if file is provided
  let updateData = { ...filteredPayload };
  if (file) {
    const uploadImg = await uploadImgToCloudinary(file.name, file.path);
    console.log(uploadImg);
    updateData = { ...updateData, img: uploadImg.secure_url };
  }

  // Update the document
  const result = await MockInterviewModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!result) {
    throw new Error('Mock interview not found or update failed');
  }

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
  },
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
    const interviews =
      await MockInterviewModel.find(filter).populate('question_bank_ids');
    return interviews;
  } else {
    const findSkills = await Resume.findOne({ user_id }).select(
      'technicalSkills',
    );

    if (
      !findSkills ||
      !findSkills.technicalSkills ||
      findSkills.technicalSkills.length === 0
    ) {
      const allInterviews =
        await MockInterviewModel.find(filter).populate('question_bank_ids');
      return {
        suggested: [],
        all_InterView: allInterviews,
      };
    }

    const skills = findSkills.technicalSkills; // Array of skills, e.g., ["JavaScript", "Python"]

    // Fetch all interviews with populated question_bank_ids
    const allInterviews =
      await MockInterviewModel.find(filter).populate('question_bank_ids');

    // Manually filter interviews based on skills matching what_to_expect
    const matchingInterviews = allInterviews.filter((interview) => {
      // Check if any question_bank_ids.what_to_expect contains any skill
      return interview.question_bank_ids.some((questionBank: any) => {
        if (
          !questionBank.what_to_expect ||
          !Array.isArray(questionBank.what_to_expect)
        ) {
          return false;
        }
        return questionBank.what_to_expect.some((expect: string) =>
          skills.some((skill) => new RegExp(skill, 'i').test(expect)),
        );
      });
    });

    // Non-matching interviews are those not in matchingInterviews
    const nonMatchingInterviews = allInterviews.filter(
      (interview) => !matchingInterviews.includes(interview),
    );

    return {
      suggested: matchingInterviews,
      all_InterView: nonMatchingInterviews,
    };
  }
};

// ---------------- QUESTION BANK ----------------

// const create_question_bank = async (
//   file: any,
//   payload: Partial<TQuestion_Bank>,
// ) => {
//   if (!file) {
//     throw Error('img file is required yoooooooo');
//   }
//   const uploadImg = await uploadImgToCloudinary(file.name, file.path);
//   console.log(uploadImg);

//   const updateData = { ...payload, img: uploadImg.secure_url };
//   // Step 1: Create the Question Bank
//   const createdQuestionBank = await QuestionBankModel.create(updateData);

//   // Step 2: Add the Question Bank ID to its corresponding Mock Interview
//   if (payload.interview_id) {
//     await MockInterviewModel.findByIdAndUpdate(
//       payload.interview_id,
//       {
//         $addToSet: {
//           question_bank_ids: createdQuestionBank._id, // Add to array
//         },
//         $inc: {
//           total_Positions: 1, // Increment by 1
//         },
//       },
//       { new: true },
//     );
//   }

//   // Step 3: Return the created Question Bank
//   return createdQuestionBank;
// };

const create_question_bank = async (
  payload: Partial<TQuestion_Bank>,
  file?: any,
) => {
  let updateData = { ...payload };

  // Handle file upload if provided
  if (file) {
    // if (!file.name || !file.path) {
    //   throw new Error('File object must contain name and path properties');
    // }

    try {
      const uploadImg = await uploadImgToCloudinary(file.name, file.path);
      if (!uploadImg?.secure_url) {
        throw new Error('Failed to retrieve secure_url from Cloudinary');
      }
      updateData = { ...payload, img: uploadImg.secure_url };
    } catch (error: any) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

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
      { new: true },
    );
  }

  // Step 3: Return the created Question Bank
  return createdQuestionBank;
};

const update_question_bank = async (
  id: Types.ObjectId,
  file?: any,
  payload?: any,
) => {
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

  // Handle image upload if file is provided
  let updateData = { ...filteredPayload };
  if (file) {
    const uploadImg = await uploadImgToCloudinary(file.name, file.path);
    console.log(uploadImg);
    updateData = { ...updateData, img: uploadImg.secure_url };
  }

  // Update the document
  const result = await QuestionBankModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!result) {
    throw new Error('Question bank not found or update failed');
  }

  return result;
};

const delete_question_bank = async (id: string) => {
  // Step 1: Find the question bank to get its interview_id
  const questionBank = await QuestionBankModel.findById(id);
  if (!questionBank) {
    throw new Error('Question bank not found');
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
      { new: true },
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

// const genarateQuestionSet_ByAi = async (
//   questionBank_id: Types.ObjectId,
//   user_id: Types.ObjectId,
//   topicPreference: Partial<TMockInterviewTopicPreference>,
//   isRetake?: boolean,
// ) => {
//   try {
  
//     // Step 1: Check for existing question list
//     const existing = await QuestionListModel.findOne({
//       user_id: user_id,
//       question_bank_id: questionBank_id,
//     });


//     //check if interview was finished or not
//     const lookForSummary = await AssessmentModel.findOne({
//       user_id: user_id,
//       questionBank_id: questionBank_id,
//       isSummary: true,
//     });


//     console.log('looking for summary   =============>', lookForSummary);


//     //<<<<<+++++++++++++++ now return the history as summary is found ++++++++++++>>>>>>>>>
//     if (existing && lookForSummary && !isRetake) {
//       const returnHistory = await AssessmentModel.find({
//         user_id: user_id,
//         questionBank_id: questionBank_id,
//       });
//       return {
//         message: 'History found',
//         history: returnHistory,
//       };
//     }



//     // Step 2: Get question bank to check if question  bank is really there or not 
//     const findQuestionBank = await QuestionBankModel.findOne({
//       _id: questionBank_id,
//     });
//     if (!findQuestionBank) {
//       throw new Error("Can't generate question set, no question bank found");
//     }


//     //<<<<<+++++++++++++find remaining questions ++++++++++++++>>>>>>>
//     if (!isRetake && existing)
//     {
//       // Fetch user profile
//       const profile = await ProfileModel.findOne({
//         user_id: user_id,
//         'progress.interviewId': findQuestionBank.interview_id,
//       });

//       // Find the specific progress entry
//       const progressEntry = profile?.progress.find(
//         (p) =>
//           p.interviewId.toString() === findQuestionBank.interview_id.toString(),
//       );

//       // console.log("progress entry*****", progressEntry);

//       const qbProgress = progressEntry?.questionBank_AndProgressTrack.find(
//         (qb) => qb.questionBaank_id.toString() === questionBank_id.toString(),
//       );

//       // console.log("qb progress****", qbProgress);

//       const lastAnswered = qbProgress?.lastQuestionAnswered_id;

//       console.log('last question answered***', lastAnswered);

//       const findQuestionList = await QuestionListModel.findOne({
//         user_id: user_id,
//         question_bank_id: questionBank_id,
//         interview_id: findQuestionBank.interview_id,
//       }).select('question_Set');

//       if (!findQuestionList) {
//         throw new Error('Question list not found');
//       }

//       console.log('find question List &&&&&', findQuestionList);

//       // ✅ Safely determine the index
//       let index = -1; // Default to -1 for no progress
//       if (lastAnswered) {
//         const foundIndex = findQuestionList.question_Set.findIndex(
//           (q: any) => q._id && q._id.toString() === lastAnswered.toString(),
//         );
//         index = foundIndex; // Use foundIndex directly, including -1 if not found
//       }

//       console.log('question index found:=>=>=>=>', index);

//       // Get remaining questions
//       let remainingQuestions: any = [];
//       if (findQuestionList.question_Set && Array.isArray(findQuestionList.question_Set))
//       {
//         if (index >= 0)
//         {
//           // Valid question answered: exclude up to and including it
//           remainingQuestions = findQuestionList.question_Set.slice(index + 1);
//         }
//         else
//         {
//           // No progress (index = -1): return full question set
//           remainingQuestions = findQuestionList.question_Set;
//         }
//       }

//       console.log('remaining questions', remainingQuestions);

//       return {
//         message: 'remaining questions',
//         remainingQuestions,
//       };
//     }



//     //check credit availability ===========>>>>>>>>>>>
//     const findIfthereIsCredit = await ProfileModel.findOne({
//       user_id: user_id,
//     }).select('interviewsAvailable');

//     if (!findIfthereIsCredit || findIfthereIsCredit.interviewsAvailable <= 0) {
//       throw new Error(
//         "You don't have enough credits to retake this question bank. consider purchasing a plan",
//       );
//     }


// // <<<<<<<++++++++++++Step 3: If retake, delete previous assessment+++++++++>>>>>>>>
//     if (isRetake) {
//       await AssessmentModel.deleteMany({
//         questionBank_id: questionBank_id,
//         user_id: user_id,
//       });
//     }

//     if (!topicPreference.what_to_expect) {
//       throw new Error('what to expect is required for question generation');
//     }
//     if (!topicPreference.question_Type) {
//       throw new Error('question_Type is required for question generation');
//     }
//     if (!topicPreference.difficulty_level) {
//       throw new Error('difficulty_level is required for question generation');
//     }

//     // create question preference and if exist then update the preference

//     console.log("incomming data ======******===>>" , topicPreference)
//     // Create or update question preference
//     const createOrUpdateQuestionPreference =
//       await MocTopicPreferenceModel.findOneAndUpdate(
//         {
//           questionBank_id: questionBank_id,
//           user_id: user_id,
//         },
//         {
//           what_to_expect: topicPreference.what_to_expect,
//           question_Type: topicPreference.question_Type,
//           difficulty_level: topicPreference.difficulty_level,
//           questionBank_id: questionBank_id,
//           user_id: user_id,
//         },
//         {
//           upsert: true, // Create if not exists
//           new: true, // Return the updated document
//         },
//       );
//     if (!createOrUpdateQuestionPreference) {
//       throw new Error(
//         'Failed to create or update question preference during question generation',
//       );
//     }

//     console.log(
//       'updated preference*******************',
//       createOrUpdateQuestionPreference,
//     );

//     // Step 4: Prepare prompt and generate new questions

//     const prompt = `${findQuestionBank?.questionBank_name || ''} position. topics are${topicPreference.what_to_expect.join(' ')} based on those give me minimum 8 question with time limit and question type will be ${topicPreference.question_Type}. and question difficulty will be ${topicPreference.difficulty_level}.if question_Type is MCQ question then give me 4 options for each question and make sure to include the correct answer in the options.`;

//     const data = await mockInterviewUtill.generateQuestions(prompt);

//     if (data.questions.length > 0) {
//       const updateAvailableInterviewsCount =
//         await ProfileModel.findOneAndUpdate(
//           { user_id: user_id },
//           {
//             $inc: { interviewsAvailable: -1, interviewTaken: 1 }, //interview taken updated here
//           },
//           { new: true },
//         );
//       if (!updateAvailableInterviewsCount) {
//         throw new Error('failed to update available interviews count');
//       }
//     }

//     const modifyQuestionList = data.questions.map((item: any) => ({
//       interview_id: findQuestionBank.interview_id,
//       questionBank_id: questionBank_id,
//       user_id: user_id,
//       question: item.question,
//       time_to_answer: item.time_limit,
//       isRetake: !!isRetake,
//     }));

//     let result;

//     // Step 5: Save or update question list
//     if (isRetake && existing) {
//       result = await QuestionListModel.findOneAndUpdate(
//         {
//           user_id: user_id,
//           question_bank_id: questionBank_id,
//         },
//         {
//           question_Set: modifyQuestionList,
//           isRetake: true,
//         },
//         { new: true },
//       );
//     }
//     else {
//       result = await QuestionListModel.create({
//         user_id: user_id,
//         question_bank_id: questionBank_id,
//         interview_id: findQuestionBank.interview_id,
//         question_Set: modifyQuestionList,
//         isRetake: false,
//       });
//     }

//     // Step 6: Update progress
//     await progressUtill.updateProgress(user_id, questionBank_id, isRetake);
//     await progressUtill.updateInterviewIfAllTheQuestionBankCompleted(
//       user_id,
//       findQuestionBank.interview_id,
//     );

//     return result;
//   }
//   catch (error) {
//     console.error('Error generating question set:', error);
//     throw error;
//   }
// };


const genarateQuestionSet_ByAi = async (
  questionBank_id: Types.ObjectId,
  user_id: Types.ObjectId,
  topicPreference: Partial<TMockInterviewTopicPreference>,
  isRetake?: boolean,
) => {
  try {

    // Step 1: Check for existing question list
    const existing = await QuestionListModel.findOne({
      user_id: user_id,
      question_bank_id: questionBank_id,
    });

    // Check if interview was finished or not
    const lookForSummary = await AssessmentModel.findOne({
      user_id: user_id,
      questionBank_id: questionBank_id,
      isSummary: true,
    });

    console.log('looking for summary   =============>', lookForSummary);

    // Return history if summary is found and not a retake
    if (existing && lookForSummary && !isRetake) {
      const returnHistory = await AssessmentModel.find({
        user_id: user_id,
        questionBank_id: questionBank_id,
      });
      return {
        message: 'History found',
        history: returnHistory,
      };
    }

    // Step 2: Get question bank to check if it exists
    const findQuestionBank = await QuestionBankModel.findOne({
      _id: questionBank_id,
    });
    if (!findQuestionBank) {
      throw new Error("Can't generate question set, no question bank found");
    }

    // Handle non-retake case with existing questions
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

      const qbProgress = progressEntry?.questionBank_AndProgressTrack.find(
        (qb) => qb.questionBaank_id.toString() === questionBank_id.toString(),
      );

      const lastAnswered = qbProgress?.lastQuestionAnswered_id;

      console.log('last question answered***', lastAnswered);

      const findQuestionList = await QuestionListModel.findOne({
        user_id: user_id,
        question_bank_id: questionBank_id,
        interview_id: findQuestionBank.interview_id,
      }).select('question_Set');

      if (!findQuestionList) {
        throw new Error('Question list not found');
      }

      console.log('find question List &&&&&', findQuestionList);

      // Safely determine the index
      let index = -1; // Default to -1 for no progress
      if (lastAnswered) {
        const foundIndex = findQuestionList.question_Set.findIndex(
          (q: any) => q._id && q._id.toString() === lastAnswered.toString(),
        );
        index = foundIndex; // Use foundIndex directly, including -1 if not found
      }

      console.log('question index found:=>=>=>=>', index);

      // Get remaining questions
      let remainingQuestions: any = [];
      if (findQuestionList.question_Set && Array.isArray(findQuestionList.question_Set)) {
        if (index >= 0) {
          // Valid question answered: exclude up to and including it
          remainingQuestions = findQuestionList.question_Set.slice(index + 1);
        } else {
          // No progress (index = -1): return full question set
          remainingQuestions = findQuestionList.question_Set;
        }
      }

      console.log('remaining questions', remainingQuestions);

      return {
        message: 'remaining questions',
        remainingQuestions,
      };
    }

    // Check credit availability
    const findIfthereIsCredit = await ProfileModel.findOne({
      user_id: user_id,
    }).select('interviewsAvailable');

    if (!findIfthereIsCredit || findIfthereIsCredit.interviewsAvailable <= 0) {
      throw new Error(
        "You don't have enough credits to retake this question bank. Consider purchasing a plan",
      );
    }

    // Validate topic preferences
    if (!topicPreference.what_to_expect) {
      throw new Error('what to expect is required for question generation');
    }
    if (!topicPreference.question_Type) {
      throw new Error('question_Type is required for question generation');
    }
    if (!topicPreference.difficulty_level) {
      throw new Error('difficulty_level is required for question generation');
    }

    // Create or update question preference
    console.log("incomming data ======******===>>", topicPreference);
    const createOrUpdateQuestionPreference = await MocTopicPreferenceModel.findOneAndUpdate(
      {
        questionBank_id: questionBank_id,
        user_id: user_id,
      },
      {
        what_to_expect: topicPreference.what_to_expect,
        question_Type: topicPreference.question_Type,
        difficulty_level: topicPreference.difficulty_level,
        questionBank_id: questionBank_id,
        user_id: user_id,
      },
      {
        upsert: true, // Create if not exists
        new: true, // Return the updated document
      },
    );
    if (!createOrUpdateQuestionPreference) {
      throw new Error(
        'Failed to create or update question preference during question generation',
      );
    }

    console.log(
      'updated preference*******************',
      createOrUpdateQuestionPreference,
    );

    // Step 3: Prepare prompt and generate new questions
    const prompt = `${findQuestionBank?.questionBank_name || ''} position. topics are ${topicPreference.what_to_expect.join(' ')} based on those give me minimum 8 question with time limit and question type will be ${topicPreference.question_Type}. and question difficulty will be ${topicPreference.difficulty_level}.if question_Type is MCQ question then give me 4 options for each question and make sure to include the correct answer in the options.`;

    const data = await mockInterviewUtill.generateQuestions(prompt);
    const questionsJson = JSON.parse(data.questions)

    // Step 4: Update available interviews count
    if (questionsJson.length > 0) {
      const updateAvailableInterviewsCount = await ProfileModel.findOneAndUpdate(
        { user_id: user_id },
        {
          $inc: { interviewsAvailable: -1, interviewTaken: 1 },
        },
        { new: true },
      );
      if (!updateAvailableInterviewsCount) {
        throw new Error('Failed to update available interviews count');
      }
    }


    // console.log("here is the generate data =======#####====+====>>>>>>",typeof(data.questions),"data>>>>>>>>>>",data)
    

    const modifyQuestionList = questionsJson.map((item: any) => ({
      interview_id: findQuestionBank.interview_id,
      questionBank_id: questionBank_id,
      user_id: user_id,
      question: item.question,
      time_to_answer: item.time_limit,
      isRetake: !!isRetake,
    }));

    let result;

    // Step 5: If retake, delete previous assessment *after* successful question generation
    if (isRetake && questionsJson.length>0) {
      await AssessmentModel.deleteMany({
        questionBank_id: questionBank_id,
        user_id: user_id,
      });
    }

    // Step 6: Save or update question list
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

    // Step 7: Update progress
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

    // find question generation preference here=========>>>>>>>>>>
    const findQuestionPreference = await MocTopicPreferenceModel.findOne({
      questionBank_id: questionBank_id,
      user_id: user_id,
    });

    if (!findQuestionPreference) {
      throw new Error('Question preference not found cant retake question');
    }

    // console.log("i am from single retake  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",findQuestionPreference )

    // Generate prompt for AI API
    const prompt = `${findQuestionBank.questionBank_name}position. topics are ${findQuestionPreference.what_to_expect.join(' ')} based on those give me single question with time limit and question type will be ${findQuestionPreference.question_Type}. and question difficulty will be ${findQuestionPreference.difficulty_level}.if question_Type is MCQ question then give me 4 options for each question and make sure to include the correct answer in the options.`;


    // console.log("promt for single retake =====================>", prompt);


    const encodedPrompt = encodeURIComponent(prompt);

    const url = `${config.AI_BASE_URL}/q_generator/generate-questions?topic=${encodedPrompt}`;

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
    const QuestionParse= JSON.parse(data.questions) 

    console.log("here3333333333##########","data",data,"Parse data",typeof(QuestionParse),"first question",QuestionParse[0].question);

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
          'question_Set.$.question': QuestionParse[0].question,
          'question_Set.$.time_to_answer': QuestionParse[0].time_limit,
        },
      },
      { new: true },
    );

    console.log('updated one****************', questionToUpdate);

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

const getIncompleteInterviews = async (user_id: Types.ObjectId) => {
  // Find profile by user_id
  const findProfile = await ProfileModel.findOne({ user_id: user_id }).lean();

  if (!findProfile) {
    throw new Error('Profile not found');
  }

  // Filter incomplete interviews from progress array
  const incompleteInterviewIds = findProfile.progress
    .filter((item) => !item.isCompleted)
    .map((item) => item.interviewId);

  if (incompleteInterviewIds.length === 0) {
    return [];
  }

  // Fetch interview details from MockInterviewModel
  const incompleteInterviews = await MockInterviewModel.find({
    _id: { $in: incompleteInterviewIds },
  }).lean();

  return incompleteInterviews;
};



//========get user preference based on question bank id========================

const getUserPreferenceBasedOnQuestionBankId = async (
  questionBank_id: Types.ObjectId,
  user_id: Types.ObjectId,
) => {
 const findQuestionPreference = await MocTopicPreferenceModel.findOne({
    questionBank_id: questionBank_id,
    user_id: user_id,
  });
  return findQuestionPreference;
}

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

  getIncompleteInterviews,
  getUserPreferenceBasedOnQuestionBankId
};
