import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import { MockInterviewsService } from './mock_interviews.service';
import idConverter from '../../util/idConvirter';
import { Types } from 'mongoose';

// ---------------- MOCK INTERVIEW ----------------

const create_mock_interview = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MockInterviewsService.create_mock_interview(req.body);
    res.status(201).json({
      success: true,
      message: 'Mock interview created successfully',
      body: result,
    });
  },
);

const update_mock_interview = catchAsync(
  async (req: Request, res: Response) =>
  {
    const interview_id = req.query.interview_id as string;
    const converted_interview_id = idConverter(interview_id);

    const result = await MockInterviewsService.update_mock_interview(
      converted_interview_id as Types.ObjectId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Mock interview updated successfully',
      body: result,
    });
  },

);

const delete_mock_interview = catchAsync(
  async (req: Request, res: Response) => {

    const interview_id = req.query.interview_id as string
    const converted_id = idConverter(interview_id)

    const result = await MockInterviewsService.delete_mock_interview(converted_id as Types.ObjectId);
    
    res.status(200).json({
      success: true,
      message: 'Mock interview deleted successfully',
      body: result,
    });
  },
);

const get_mock_interview = catchAsync(async (req: Request, res: Response) => {
  const result = await MockInterviewsService.get_mock_interview(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Mock interview(s) retrieved successfully',
    body: result,
  });
});

// ---------------- QUESTION BANK ----------------

const create_question_bank = catchAsync(async (req: Request, res: Response) => {
  const result = await MockInterviewsService.create_question_bank(req.body);
  res.status(201).json({
    success: true,
    message: 'Question bank created successfully',
    body: result,
  });
});

const update_question_bank = catchAsync(async (req: Request, res: Response) => {
  const result = await MockInterviewsService.update_question_bank(
    req.params.id,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: 'Question bank updated successfully',
    body: result,
  });
});

const delete_question_bank = catchAsync(async (req: Request, res: Response) => {
  const result = await MockInterviewsService.delete_question_bank(
    req.params.id,
  );
  res.status(200).json({
    success: true,
    message: 'Question bank deleted successfully',
    body: result,
  });
});

const get_question_bank = catchAsync(async (req: Request, res: Response) => {
  const result = await MockInterviewsService.get_question_bank(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Question bank(s) retrieved successfully',
    body: result,
  });
});

// ---------------- QUESTIONS ----------------

const getQuestionFrom_question_bank = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MockInterviewsService.getQuestionFrom_question_bank(
      req.params.id,
    );
    res.status(200).json({
      success: true,
      message: 'Questions retrieved successfully',
      body: result,
    });
  },
);

const addQuestionTo_question_bank = catchAsync(
  async (req: Request, res: Response) => {
    const result = await MockInterviewsService.addQuestionTo_question_bank(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Question added successfully',
      body: result,
    });
  },
);

const updateQuestionIn_question_bank = catchAsync(
  async (req: Request, res: Response) => {
    const { index } = req.params;
    const result = await MockInterviewsService.updateQuestionIn_question_bank(
      req.params.id,
      Number(index),
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      body: result,
    });
  },
);

const deleteQuestionFrom_question_bank = catchAsync(
  async (req: Request, res: Response) => {
    const { index } = req.params;
    const result = await MockInterviewsService.deleteQuestionFrom_question_bank(
      req.params.id,
      Number(index),
    );
    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      body: result,
    });
  },
);

// ---------------- EXPORT ----------------

const Mock_interviewsController = {
  get_mock_interview,
  create_mock_interview,
  update_mock_interview,
  delete_mock_interview,

  get_question_bank,
  create_question_bank,
  update_question_bank,
  delete_question_bank,

  getQuestionFrom_question_bank,
  addQuestionTo_question_bank,
  updateQuestionIn_question_bank,
  deleteQuestionFrom_question_bank,
};

export default Mock_interviewsController;
