import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import vidoAnalysisServices from './video.service';

const submitVideoAnalysisAndAummary = catchAsync(async (req, res) => {
  const payLoad = req.body;

  const result =
    await vidoAnalysisServices.submitVideoAnalysisAndAummary(payLoad);

  res.status(200).json({
    success: true,
    message: 'Video Analysis submitted successfully',
    data: result,
  });
});

const getSummary = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const questionBank_id = req.query.questionBank_id as string;
  const convitedQuestionbank_id = idConverter(questionBank_id);
  const convirtedUserId = idConverter(user_id);

  if (!convirtedUserId) {
    throw Error('id convirsation failed to get sumary');
  }

  const result = await vidoAnalysisServices.getSummary(
    convirtedUserId as Types.ObjectId,
    convitedQuestionbank_id as Types.ObjectId,
  );

  res.status(200).json({
    success: true,
    message: 'Summary for this Interview',
    data: result,
  });
});

const getAllSummaries = catchAsync(async (req, res) => {
  try {
    const summaries = await vidoAnalysisServices.getSummaryAssessments();
    res.status(200).json(summaries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summaries', error });
  }
});

const videoAnalysisController = {
  submitVideoAnalysisAndAummary,
  getSummary,
  getAllSummaries,
};
export default videoAnalysisController;
