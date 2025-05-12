import { Types } from 'mongoose';
import { AssessmentModel } from './video.model';

const processForSummary = async (
  interview_id: Types.ObjectId,
  questionBank_id: Types.ObjectId,
  user_id: Types.ObjectId,
) => {
  try {
    const findAllAnnalysis = await AssessmentModel.find({
      interview_id,
      questionBank_id,
      user_id,
    }).select('assessment -_id');

    const assessmentsOnly = findAllAnnalysis
      .filter(item => item && item.assessment)
      .map(item => item.assessment);

    console.log('All related assessments:', assessmentsOnly);
    const stringifyArrary = JSON.stringify(assessmentsOnly)

    console.log(stringifyArrary)

    const url = `https://freepik.softvenceomega.com/in-prep/api/v1/overall_generator/overall-generator`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: stringifyArrary,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AI API response: over all', data);

    // You can return or process `data` as needed
    return data;

  } 
  catch (error) {
    console.error('Error in processForSummary:', error);
    throw error;
  }
};

export default processForSummary;

