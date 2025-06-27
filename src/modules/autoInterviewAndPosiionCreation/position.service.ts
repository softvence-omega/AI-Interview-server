import { Types } from 'mongoose';
import {
  MockInterviewModel,
  QuestionBankModel,
} from '../mock_interviews/mock_interviews.model';
import idConverter from '../../util/idConvirter';

// Interface for the output result
interface QuestionBankResult {
  _id: string;
  questionBank_name: string;
}

const getAllPositions = async (
  interView_id?: Types.ObjectId,
): Promise<QuestionBankResult[]> => {
  try {
    const pipeline: any[] = [
      // Match non-deleted question banks
      { $match: { isDeleted: false } },
    ];

    // If interView_id is provided, filter by interview_id
    if (interView_id) {
      if (!Types.ObjectId.isValid(interView_id)) {
        throw new Error('Invalid interview ID');
      }
      pipeline.push({
        $match: {
          interview_id: interView_id,
        },
      });
    }

    // Continue with grouping and projection
    pipeline.push(
      // Group by questionBank_name (case-insensitive) for uniqueness
      {
        $group: {
          _id: { $toLower: '$questionBank_name' },
          questionBank_name: { $first: '$questionBank_name' },
          original_id: { $first: '$_id' },
        },
      },
      // Project to shape output
      {
        $project: {
          _id: 0,
          id: '$original_id',
          questionBank_name: 1,
        },
      },
      // Sort alphabetically by questionBank_name
      { $sort: { questionBank_name: 1 } },
    );

    const result = await QuestionBankModel.aggregate(pipeline);

    // Map to match QuestionBankResult interface
    const formattedResult: QuestionBankResult[] = result.map(
      ({ id, questionBank_name }) => ({
        _id: id.toString(),
        questionBank_name,
      }),
    );

    return formattedResult;
  } catch (error: any) {
    console.error('Error fetching unique question banks:', error);
    throw new Error(error.message || 'Failed to fetch question banks');
  }
};

interface InterviewResult {
  _id: string;
  interview_name: string;
}

const getAllInterviews = async (): Promise<InterviewResult[]> => {
  try {
    const result = await MockInterviewModel.aggregate([
      // Match non-deleted documents
      { $match: { isDeleted: false } },
      // Group by interview_name (case-insensitive) to ensure uniqueness
      {
        $group: {
          _id: { $toLower: '$interview_name' }, // Normalize for case-insensitive uniqueness
          interview_name: { $first: '$interview_name' }, // Keep original case
          original_id: { $first: '$_id' }, // Keep first _id for the name
        },
      },
      // Project to shape the output
      {
        $project: {
          _id: 0,
          id: '$original_id', // Temporary field to avoid duplicate _id
          interview_name: 1,
        },
      },
      // Sort alphabetically by interview_name
      { $sort: { interview_name: 1 } },
    ]);

    // Map to match InterviewResult interface
    const formattedResult: InterviewResult[] = result.map(
      ({ id, interview_name }) => ({
        _id: id.toString(), // Ensure _id is string
        interview_name,
      }),
    );

    return formattedResult;
  } catch (error: any) {
    console.error('Error fetching unique interviews:', error);
    throw new Error(error.message || 'Failed to fetch interviews');
  }
};




const automateInterviewAndPositionCreation = async (payload: any) => {
  console.log('here is the payload', payload);

  const {
    user_id,
    isInterviewMatched,
    isPositionMatched,
    interview_id,
    position_id,
    interviewName,
    interviewDetail,
    positionName,
    positionDetail,
  } = payload;


  const convirtedInterview_id =interview_id &&  idConverter(interview_id) as Types.ObjectId | undefined;
  const convirtedPosition_id =position_id && idConverter(position_id) as Types.ObjectId | undefined;



  if (!user_id) {
    throw Error('user_id is missing');
  }

  // call the user for the skill that he has 

  // const userSkills = await 




  // Case 1: Both isInterviewMatched and isPositionMatched are true ======>>> just update the questionBank
  if (isInterviewMatched && isPositionMatched) {
    if (!interview_id || !position_id) {
      throw Error('Both interview_id and position_id are required when isInterviewMatched and isPositionMatched are true');
    }

    

    // calling update question bank from the mock interview
    // const updateQuestionBank = await 

    return; 
  }

  // Case 2: Neither isInterviewMatched nor isPositionMatched is true ======>>> create interview and create questionBank
  if (!isInterviewMatched && !isPositionMatched) {
    if (!interviewName || !interviewDetail || !positionName || !positionDetail) {
      throw Error('interviewName, interviewDetail, positionName, and positionDetail are required when neither isInterviewMatched nor isPositionMatched is true');
    }
    return; // All required fields for creation are present
  }

  // Case 3: Only isInterviewMatched is true ======>>> just create questionBank
  if (isInterviewMatched && !isPositionMatched) {
    if (!interview_id) {
      throw Error('interview_id is required when isInterviewMatched is true');
    }
    if (!positionName || !positionDetail) {
      throw Error('positionName and positionDetail are required when isInterviewMatched is true and isPositionMatched is false');
    }

    // const createQuestionBank = 
    return; // All required fields are present
  }


};



const positionServices = {
  getAllPositions,
  getAllInterviews,
  automateInterviewAndPositionCreation,
};
export default positionServices;
