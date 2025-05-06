import express from "express"
import Mock_interviewsController from './mock_interviews.controller';
import auth from "../../middlewares/auth";
import { userRole } from "../../constents";

const MockInterviewRoutes = express.Router();


MockInterviewRoutes.get('/get_mock_interview', Mock_interviewsController.get_mock_interview);
MockInterviewRoutes.post('/create_mock_interview', Mock_interviewsController.create_mock_interview);
MockInterviewRoutes.post('/update_mock_interview', Mock_interviewsController.update_mock_interview);
MockInterviewRoutes.delete('/delete_mock_interview', Mock_interviewsController.delete_mock_interview);


MockInterviewRoutes.get('/get_question_bank', Mock_interviewsController.get_question_bank);
MockInterviewRoutes.post('/create_question_bank', Mock_interviewsController.create_question_bank);
MockInterviewRoutes.post('/update_question_bank', Mock_interviewsController.update_question_bank);
MockInterviewRoutes.delete('/delete_question_bank', Mock_interviewsController.delete_question_bank);

MockInterviewRoutes.get("/genarateQuestionSet_ByAi",auth([userRole.admin, userRole.user]), Mock_interviewsController.genarateQuestionSet_ByAi)
MockInterviewRoutes.post("/genarateSingleQuestion_ByAi_for_Retake",auth([userRole.admin, userRole.user]), Mock_interviewsController.genarateSingleQuestion_ByAi_for_Retake)


export default MockInterviewRoutes;
