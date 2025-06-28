import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import { MockInterviewsService } from './mock_interviews.service';
import idConverter from '../../util/idConvirter';
import { Types } from 'mongoose';

// ---------------- MOCK INTERVIEW ----------------

const create_mock_interview = catchAsync(async (req: Request, res: Response) => {
  let file: Express.Multer.File | undefined;
  
  try {


    req.body = req.body.data ? JSON.parse(req.body.data) : {};
    if(req.file )
    {
      file = req.file;
    }
  } 
  catch (error: any) {
    return res.status(error instanceof SyntaxError ? 400 : 500).json({
      success: false,
      message: error instanceof SyntaxError ? 'Invalid JSON in data' : 'Server error',
      error: error.message,
    });
  }

  const result = await MockInterviewsService.create_mock_interview( req.body,file,);

  res.status(201).json({
    success: true,
    message: 'Mock interview created successfully',
    body: result,
  });
});

const update_mock_interview = catchAsync(
  async (req: Request, res: Response) => {
    const interview_id = req.query.interview_id as string;
    const converted_interview_id = idConverter(interview_id);

    let file: Express.Multer.File | undefined;
    let payload: any = {};

    try {
      // Parse data from formdata.data if present, otherwise use empty object
      if (req.body.data) {
        payload = JSON.parse(req.body.data);
      }
      file = req.file; // File from multer, if uploaded
    } catch (error: any) {
      return res.status(error instanceof SyntaxError ? 400 : 500).json({
        success: false,
        message: error instanceof SyntaxError ? 'Invalid JSON in data' : 'Server error',
        error: error.message,
      });
    }

    const result = await MockInterviewsService.update_mock_interview(
      converted_interview_id as Types.ObjectId,
      file,
      payload,
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
    const interview_id = req.query.interview_id as string;
    const converted_id = idConverter(interview_id);

    const result = await MockInterviewsService.delete_mock_interview(
      converted_id as Types.ObjectId,
    );

    res.status(200).json({
      success: true,
      message: 'Mock interview deleted successfully',
      body: result,
    });
  },
);

const get_mock_interview = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.user.id as string;
  const convirtedUserId = idConverter(user_id);
  const query = req.query;

  const result = await MockInterviewsService.get_mock_interview(
    convirtedUserId as Types.ObjectId,
    query,
  );
  res.status(200).json({
    success: true,
    message: 'Mock interview(s) retrieved successfully',
    body: result,
  });
});



// ---------------- QUESTION BANK ----------------

// const create_question_bank = catchAsync(async (req: Request, res: Response) => {

//   let file: Express.Multer.File | undefined;
  
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'No file uploaded' });
//     }

//     req.body = req.body.data ? JSON.parse(req.body.data) : {};
//     file = req.file;
//   } catch (error: any) {
//     return res.status(error instanceof SyntaxError ? 400 : 500).json({
//       success: false,
//       message: error instanceof SyntaxError ? 'Invalid JSON in data' : 'Server error',
//       error: error.message,
//     });
//   }



//   const result = await MockInterviewsService.create_question_bank(file, req.body);
//   res.status(201).json({
//     success: true,
//     message: 'Question bank created successfully',
//     body: result,
//   });
// });




const create_question_bank = catchAsync(async (req: Request, res: Response) => {
  let payload

  // Parse and validate request body
  try {
    payload = req.body.data ? JSON.parse(req.body.data) : {};
  } catch (error: any) {
    return res.status(error instanceof SyntaxError ? 400 : 500).json({
      success: false,
      message: error instanceof SyntaxError ? 'Invalid JSON in data' : 'Server error',
      error: error.message,
    });
  }

  // Validate payload
  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request payload is missing or empty',
    });
  }

  // Call the service to create the question bank
  try {
    const result = await MockInterviewsService.create_question_bank(payload, req.file);
    return res.status(201).json({
      success: true,
      message: 'Question bank created successfully',
      body: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create question bank',
      error: error.message,
    });
  }
});

const update_question_bank = catchAsync(async (req: Request, res: Response) => {
  const question_bank_id = req.query.question_bank_id as string;
  const converted_QB_id = idConverter(question_bank_id);

  let file: Express.Multer.File | undefined;
  let payload: any = {};

  try {
    // Parse data from formdata.data if present, otherwise use empty object
    if (req.body.data) {
      payload = JSON.parse(req.body.data);
    }
    file = req.file; // File from multer, if uploaded
  } catch (error: any) {
    return res.status(error instanceof SyntaxError ? 400 : 500).json({
      success: false,
      message: error instanceof SyntaxError ? 'Invalid JSON in data' : 'Server error',
      error: error.message,
    });
  }

  const result = await MockInterviewsService.update_question_bank(
    converted_QB_id as Types.ObjectId,
    file,
    payload,
  );

  res.status(200).json({
    success: true,
    message: 'Question bank updated successfully',
    body: result,
  });
});

const delete_question_bank = catchAsync(async (req: Request, res: Response) => {
  const result = await MockInterviewsService.delete_question_bank(
    req.query.questionBank_id as string,
  );
  res.status(200).json({
    success: true,
    message: 'Question bank deleted successfully',
    body: result,
  });
});

const get_question_bank = catchAsync(async (req: Request, res: Response) => {
  const result = await MockInterviewsService.get_question_bank(req.query);
  res.status(200).json({
    success: true,
    message: 'Question bank(s) retrieved successfully',
    body: result,
  });
});

// ---------------- GENARATE QUESTION BY AI ----------------

const genarateQuestionSet_ByAi = catchAsync(async (req, res) => {
  const questionBank_id = req.query.questionBank_id as string;
  const converted_QB_id = idConverter(questionBank_id);
  const user_id = req.user.id as string;
  const converted_user_id = idConverter(user_id);
  const isRetake = req.query.isRetake as string;
  const converted_isRetake = isRetake === 'true' ? true : false;

  const topicPreference = req.body

  const result = await MockInterviewsService.genarateQuestionSet_ByAi(
    converted_QB_id as Types.ObjectId,
    converted_user_id as Types.ObjectId,
    topicPreference,
    converted_isRetake,
  );

  res.status(200).json({
    success: true,
    message: 'Question bank updated successfully',
    body: result,
  });
});

const genarateSingleQuestion_ByAi_for_Retake = catchAsync(async (req, res) => {
  const questionBank_id = req.body.questionBank_id as string;
  const converted_QB_id = idConverter(questionBank_id);
  const user_id = req.user.id as string;
  const converted_user_id = idConverter(user_id);
  const interview_id = req.body.interview_id as string;
  const converted_interview_id = idConverter(interview_id);
  const question_id = req.body.question_id as string;
  const converted_question_id = idConverter(question_id);

  const result =
    await MockInterviewsService.genarateSingleQuestion_ByAi_for_Retake(
      converted_QB_id as Types.ObjectId,
      converted_user_id as Types.ObjectId,
      converted_interview_id as Types.ObjectId,
      converted_question_id as Types.ObjectId,
    );

  res.status(200).json({
    success: true,
    message: 'Question bank updated successfully',
    body: result,
  });
});


const getIncompleteInterviews = catchAsync(async(req,res)=>{
 const user_id = req.user.id
 const convirtedUser_id = idConverter(user_id)

const result = await MockInterviewsService.getIncompleteInterviews(convirtedUser_id as Types.ObjectId)

res.status(200).json({
  success: true,
    message: 'incomplete interviews found',
    body: result,
})

})


//===============get prefarance based on question bank id========================

const getUserPreferenceBasedOnQuestionBankId= catchAsync(async (req: Request, res: Response) => {
  const questionBank_id = req.query.questionBank_id as string;
  const converted_QB_id = idConverter(questionBank_id);
  const user_id = req.user.id as string;
  const converted_user_id = idConverter(user_id);

  const result = await MockInterviewsService.getUserPreferenceBasedOnQuestionBankId(
    converted_QB_id as Types.ObjectId,
    converted_user_id as Types.ObjectId,
  );
  res.status(200).json({
    success: true,
    message: 'User preference retrieved successfully',
    body: result,
  });
});

const Mock_interviewsController = {
  get_mock_interview,
  create_mock_interview,
  update_mock_interview,
  delete_mock_interview,

  get_question_bank,
  create_question_bank,
  update_question_bank,
  delete_question_bank,

  genarateQuestionSet_ByAi,
  genarateSingleQuestion_ByAi_for_Retake,

  getIncompleteInterviews,

  getUserPreferenceBasedOnQuestionBankId
};

export default Mock_interviewsController;
