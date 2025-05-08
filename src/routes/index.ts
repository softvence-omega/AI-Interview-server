import express from 'express';
import authRouter from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import MockInterviewRoutes from '../modules/mock_interviews/mock_interviews.routes';
import resumeRoutes from '../modules/resume/resume.route';
import path from "path";
import videoRoutes from '../modules/vodeoAnalytics/vodeo.routes';
import graphRoutes from '../modules/graph/graph.route';
import jobRoutes from '../modules/job/job.route';
import notificationRouter from '../modules/notifications/notifiacations.routes';

const Routes = express.Router();
// Array of module routes
const moduleRouts = [
  {
    path: '/auth',
    router: authRouter,
  },
  {
    path: '/users',
    router:userRoutes,
  },
  {
    path: '/interview',
    router:MockInterviewRoutes,
  },
  {
    path: '/resume',
    router: resumeRoutes,
  },
  {
    path: '/video',
    router:videoRoutes,
  },
  {
    path: '/graph',
    router: graphRoutes,
  },
  {
    path: '/job',
    router: jobRoutes,
  },
  {
    path: '/notifications',
    router: notificationRouter,
  }
];

moduleRouts.forEach(({ path, router }) => {
  Routes.use(path, router);
});

export default Routes;
