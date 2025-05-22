import { Types } from 'mongoose';
import progressUtill from '../../util/setAndUpdateprogress';
import { TAssessmentPayload } from './video.interface';
import { AssessmentModel } from './video.model';
import processForSummary from './video.utill';



const submitVideoAnalysisAndAummary = async (payLoad: TAssessmentPayload) => {
  const {
    question_id,
    interview_id,
    questionBank_id,
    isSummary,
    user_id,
    islast,
    video_url,
    assessment,
  } = payLoad;

  // Validate top-level fields
  if (!question_id && !isSummary)
    throw new Error('question_id is required as its not summary');
  if (!interview_id) throw new Error('interview_id is required');
  if (!questionBank_id) throw new Error('questionBank_id is required');
  if (!user_id) throw new Error('user_id is required');
  if (islast === undefined || islast === null)
    throw new Error('islast is required');
  if (!video_url) throw new Error('video_url is required');

  // Validate assessment object
  if (!assessment) throw new Error('assessment is required');

  // Validate assessment subfields
  if (!assessment.Articulation)
    throw new Error('assessment.Articulation is required');
  if (!assessment.Articulation.feedback)
    throw new Error('assessment.Articulation.feedback is required');
  if (
    assessment.Articulation.score === undefined ||
    assessment.Articulation.score === null
  )
    throw new Error('assessment.Articulation.score is required');

  if (!assessment.Behavioural_Cue)
    throw new Error('assessment.Behavioural_Cue is required');
  if (!assessment.Behavioural_Cue.feedback)
    throw new Error('assessment.Behavioural_Cue.feedback is required');
  if (
    assessment.Behavioural_Cue.score === undefined ||
    assessment.Behavioural_Cue.score === null
  )
    throw new Error('assessment.Behavioural_Cue.score is required');

  if (!assessment.Problem_Solving)
    throw new Error('assessment.Problem_Solving is required');
  if (!assessment.Problem_Solving.feedback)
    throw new Error('assessment.Problem_Solving.feedback is required');
  if (
    assessment.Problem_Solving.score === undefined ||
    assessment.Problem_Solving.score === null
  )
    throw new Error('assessment.Problem_Solving.score is required');

  if (!assessment.Inprep_Score)
    throw new Error('assessment.Inprep_Score is required');
  if (
    assessment.Inprep_Score.total_score === undefined ||
    assessment.Inprep_Score.total_score === null
  )
    throw new Error('assessment.Inprep_Score.total_score is required');

  if (!assessment.what_can_i_do_better)
    throw new Error('assessment.what_can_i_do_better is required');
  if (!assessment.what_can_i_do_better.overall_feedback)
    throw new Error(
      'assessment.what_can_i_do_better.overall_feedback is required',
    );

  // Create the assessment document
  const storeAssessment = await AssessmentModel.create(payLoad);

  if (!isSummary) {
    await progressUtill.UpdateProgressOfSingleQuestionBank(
      interview_id,
      questionBank_id,
      user_id,
      islast,
      question_id,
    );
  }

  
  if (islast) {

    const genarateSummary = await processForSummary(
      interview_id,
      questionBank_id,
      user_id,
    );


    const saveAbleObject = {
      "user_id": user_id,
      "interview_id": interview_id,
      "questionBank_id": questionBank_id,
      "isSummary": true,
      "islast": true,
      "assessment":genarateSummary
    }
    

    console.log("blooooooooobbbbbbbbbbb=======>>>>>>>>>",saveAbleObject)

    // const storeSummary = await AssessmentModel.create({
      
    //     "user_id": user_id,
    //     "interview_id": interview_id,
    //     "questionBank_id": questionBank_id,
    //     "isSummary": true,
    //     "islast": true,
    //     "assessment":genarateSummary
    
    // });

    
  }

  await progressUtill.updateProgress(user_id, questionBank_id, false);
  await progressUtill.updateInterviewIfAllTheQuestionBankCompleted(
    user_id,
    interview_id,
  );

  return storeAssessment;
};


const getSummary= async(user_id:Types.ObjectId, questionBank_id:Types.ObjectId)=>{
const result = await AssessmentModel.findOne({user_id:user_id, questionBank_id:questionBank_id, isSummary:true})
return result
}

const vidoAnalysisServices = {
  submitVideoAnalysisAndAummary,getSummary
};

export default vidoAnalysisServices;
