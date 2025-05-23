import { Types } from 'mongoose';
import { ProfileModel } from '../modules/user/user.model';
import { QuestionBankModel } from '../modules/mock_interviews/mock_interviews.model';
import { eachQuestionbankProgress } from '../modules/user/user.interface';

const updateProgress = async (
    user_id: Types.ObjectId,
    questionBank_id: Types.ObjectId,
    isRetake: boolean = false
  ) => {
    const findQuestionBank = await QuestionBankModel.findById(questionBank_id);
    if (!findQuestionBank) {
      throw new Error('Question bank not found');
    }
  
    const interviewId = findQuestionBank.interview_id;
  
    const userProfile = await ProfileModel.findOne({
      user_id: user_id,
      'progress.interviewId': interviewId,
    });
  
    if (userProfile) {
      const targetProgress = userProfile.progress.find(
        (p) => p.interviewId.toString() === interviewId.toString()
      );
  
      const alreadyExists = targetProgress?.questionBank_AndProgressTrack.some(
        (qb) => qb.questionBaank_id.toString() === questionBank_id.toString()
      );
  
      if (alreadyExists && isRetake) {
        // ✅ Reset existing question bank progress
        await ProfileModel.updateOne(
          {
            user_id: user_id,
            'progress.interviewId': interviewId,
          },
          {
            $set: {
              'progress.$[i].questionBank_AndProgressTrack.$[j].lastQuestionAnswered_id': null,
              'progress.$[i].questionBank_AndProgressTrack.$[j].iscompleted': false,
            },
          },
          {
            arrayFilters: [
              { 'i.interviewId': interviewId },
              { 'j.questionBaank_id': questionBank_id },
            ],
          }
        );
      }
  
      if (!alreadyExists) {
        // ✅ Push new question bank progress into existing interview progress
        await ProfileModel.findOneAndUpdate(
          {
            user_id: user_id,
            'progress.interviewId': interviewId,
          },
          {
            $push: {
              'progress.$.questionBank_AndProgressTrack': {
                questionBaank_id: questionBank_id,
                lastQuestionAnswered_id: null,
                iscompleted: false,
              },
            },
          }
        );
      }
    } else {
      // ✅ No interview progress yet — create it with all question banks under this interview
      const allQuestionBanks = await QuestionBankModel.find({
        interview_id: interviewId,
      });
  
      const newProgressArray: eachQuestionbankProgress[] = allQuestionBanks.map(
        (eachQuestionBank) => ({
          questionBaank_id: eachQuestionBank._id,
          lastQuestionAnswered_id: null,
          iscompleted: false,
        })
      );
  
      await ProfileModel.findOneAndUpdate(
        { user_id: user_id },
        {
          $push: {
            progress: {
              interviewId: interviewId,
              isCompleted: false,
              questionBank_AndProgressTrack: newProgressArray,
            },
          },
        }
      );
    }
  
    const updatedProfile = await ProfileModel.findOne({ user_id });
    return updatedProfile;
};


const updateInterviewIfAllTheQuestionBankCompleted = async (
    user_id: Types.ObjectId,
    interview_id: Types.ObjectId
  ) => {
    const userProfile = await ProfileModel.findOne({
      user_id,
      'progress.interviewId': interview_id,
    });
  
    if (!userProfile) {
      throw new Error('User profile with the given interview ID not found.');
    }
  
    const interviewProgress = userProfile.progress.find(
      (p) => p.interviewId.toString() === interview_id.toString()
    );
  
    if (!interviewProgress) {
      throw new Error('Interview progress not found in profile.');
    }
  
    const allCompleted = interviewProgress.questionBank_AndProgressTrack.every(
      (qb) => qb.iscompleted === true
    );
  
    if (allCompleted && !interviewProgress.isCompleted) {
      await ProfileModel.updateOne(
        {
          user_id,
          'progress.interviewId': interview_id,
        },
        {
          $set: {
            'progress.$.isCompleted': true,
          },
        }
      );
    }
  
    return allCompleted;
  };





const UpdateProgressOfSingleQuestionBank = async (
    interviewId: Types.ObjectId,
    questionBankId: Types.ObjectId,
    user_id: Types.ObjectId,
    islast: boolean,
    questionId: Types.ObjectId | null,
  ) => {
    const findProfileWithInterviewId = await ProfileModel.findOne({
      user_id: user_id,
      'progress.interviewId': interviewId,
    });
  
    if (!findProfileWithInterviewId) {
      throw new Error('Profile with interview ID is not found');
    }
  
    const updatePayload: any = {
      'progress.$[i].questionBank_AndProgressTrack.$[j].lastQuestionAnswered_id': questionId ?? null,
    };
  
    if (islast) {
      updatePayload['progress.$[i].questionBank_AndProgressTrack.$[j].iscompleted'] = true;
    }
  
    await ProfileModel.updateOne(
      {
        user_id: user_id,
      },
      {
        $set: updatePayload,
      },
      {
        arrayFilters: [
          { 'i.interviewId': interviewId },
          { 'j.questionBaank_id': questionBankId }, 
        ],
      }
    );
  
    const updatedProfile = await ProfileModel.findOne({ user_id });
    if(islast)
    {
        await updateInterviewIfAllTheQuestionBankCompleted(user_id,interviewId)
    }
    return updatedProfile;
};

const progressUtill = {
    updateProgress,UpdateProgressOfSingleQuestionBank,updateInterviewIfAllTheQuestionBankCompleted
}
export default progressUtill;
