import express from "express"
import Mock_interviewsController from './mock_interviews.controller';

const MockInterviewRoutes = express.Router();


MockInterviewRoutes.get('/get_mock_interview', Mock_interviewsController.get_mock_interview);
MockInterviewRoutes.post('/create_mock_interview', Mock_interviewsController.create_mock_interview);
MockInterviewRoutes.post('/update_mock_interview', Mock_interviewsController.update_mock_interview);
MockInterviewRoutes.delete('/delete_mock_interview', Mock_interviewsController.delete_mock_interview);


MockInterviewRoutes.get('/get_question_bank', Mock_interviewsController.get_question_bank);
MockInterviewRoutes.post('/create_question_bank', Mock_interviewsController.create_question_bank);
MockInterviewRoutes.post('/update_question_bank', Mock_interviewsController.update_question_bank);
MockInterviewRoutes.delete('/delete_question_bank', Mock_interviewsController.delete_question_bank);


MockInterviewRoutes.get('/getQuestionFrom_question_bank', Mock_interviewsController.getQuestionFrom_question_bank);
MockInterviewRoutes.post('/addQuestionTo_question_bank', Mock_interviewsController.addQuestionTo_question_bank);
MockInterviewRoutes.post('/updateQuestionIn_question_bank', Mock_interviewsController.updateQuestionIn_question_bank);
MockInterviewRoutes.delete('/deleteQuestionFrom_question_bank', Mock_interviewsController.deleteQuestionFrom_question_bank);


export default MockInterviewRoutes;
