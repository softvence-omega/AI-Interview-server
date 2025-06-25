import express from 'express';
import authRouter from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import MockInterviewRoutes from '../modules/mock_interviews/mock_interviews.routes';
import resumeRoutes from '../modules/resume/resume.route';
// import path from "path";
import videoRoutes from '../modules/vodeoAnalytics/vodeo.routes';
import graphRoutes from '../modules/graph/graph.route';
import jobRoutes from '../modules/job/job.route';
import planRoutes from '../modules/plan/plan.route';
// import paymentRoutes from '../modules/payment/payment.route';
import notificationRouter from '../modules/notifications/notifiacations.routes';
// import PaymentRoutes from '../modules/payment/stripe/stripe.route';
import stripeRoutes from '../modules/payment/stripe/stripe.route';
import SkillsRoutes from '../modules/skills/skill.route';
import websiteRoutes from '../modules/websiteConfig/websiteconfig.route';
import landingPageRouter from '../modules/landingPage/landingPage.routes';
import contactRoutes from '../modules/contact/contact.route';
import positionRoues from '../modules/autoInterviewAndPosiionCreation/position.routes';

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
    path: '/plan',
    router: planRoutes,
  },
  {
    path: '/payment',
    router: stripeRoutes,
  },
  {
    path: '/notifications',
    router: notificationRouter,
  },
  {
    path: '/skill',
    router: SkillsRoutes,
  },
  {
    path: '/website',
    router: websiteRoutes,
  },
  {
    path: '/landingPage',
    router: landingPageRouter,
  },
  {
    path: '/contact',
    router: contactRoutes,
  },
  {
    path: '/positions',
    router: positionRoues,
  }
];

moduleRouts.forEach(({ path, router }) => {
  Routes.use(path, router);
});

export default Routes;
