import config from "../../config";
import idConverter from "../../util/idConvirter";
import { ProfileModel } from "../user/user.model";
import { QuestionBankModel } from "./mock_interviews.model";

const generateQuestions = async (prompt: string) => {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: Prompt must be a non-empty string');
    }
  
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${config.AI_BASE_URL}/q_generator/generate-questions?topic=${encodedPrompt}`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: '',
      });
  
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();

  
      return data;

  
 
    } catch (error: any) {
      console.error('Error generating questions:', { prompt, error: error.message });
      throw new Error(`Failed to generate questions: ${error.message || 'Unknown error'}`);
    }
};



const questionGenerationCreditReducer = async (userId: string, questionBank_id: string): Promise<boolean> => {
    // Validate user ID
    if (!userId) {
      throw new Error('Unauthorized: User not authenticated');
    }
  
    // Convert userId to ObjectId
    let User_id
    try {
      User_id = idConverter(userId);
    } catch (error: any) {
      throw new Error('Invalid user ID format');
    }
  
    // Validate questionBank_id
    if (!questionBank_id || typeof questionBank_id !== 'string') {
      throw new Error('Missing or invalid questionBank_id');
    }
  
    const conviredQuestionBank_id = idConverter(questionBank_id);
  
    // Query QuestionBankModel to get interviewId
    const questionBank = await QuestionBankModel.findOne({ _id: conviredQuestionBank_id })
      .select('interview_id')
      .lean();
  
    if (!questionBank || !questionBank.interview_id) {
      throw new Error('Invalid question bank or interview not found');
    }
    const interviewId = questionBank.interview_id;
  
    // Query user profile
    const findProfile = await ProfileModel.findOne({ user_id: User_id })
      .select('progress interviewsAvailable')
      .lean();
  
    // Throw error if no profile is found
    if (!findProfile) {
      throw new Error('No profile found');
    }
  
    // Check if interviewId and questionBank_id exist in progress
    const isValid = findProfile.progress?.some((entry) =>
      entry.interviewId.toString() === interviewId.toString() &&
      entry.questionBank_AndProgressTrack?.some(
        (track) => track.questionBaank_id.toString() === conviredQuestionBank_id!.toString()
      )
    ) || false;
  
    if (!isValid) {
      // Check interviewsAvailable before decrementing
      if (findProfile.interviewsAvailable <= 0) {
        throw new Error('You have crossed the maximum interview limit, please consider updating your plan');
      }
  
      // Decrement interviewsAvailable
      const updateAvailableInterviewsCount = await ProfileModel.findOneAndUpdate(
        { user_id: User_id },
        { $inc: { interviewsAvailable: -1 } },
        { new: true }
      );
  
      if (!updateAvailableInterviewsCount) {
        throw new Error('Failed to update interviews available');
      }
    }
  
    console.log(isValid); // Print true if found, false if not
  
    return isValid;
};



  
  const mockInterviewUtill={
    generateQuestions,questionGenerationCreditReducer
  }
  
  export default mockInterviewUtill;