import express from 'express';
import {
  updateBannerSectionController,
  updateFeathersSectionController,
  updateGuideSectionController,
  updateAiCornerSectionController,
} from "./landingPage.controller"
import { upload } from '../../util/uploadImgToCludinary';


const landingPageRouter = express.Router();

// Route to update the banner section
landingPageRouter.patch('/banner', upload.single('file'), updateBannerSectionController);

// Route to update the feathers section
landingPageRouter.patch('/feathers', updateFeathersSectionController);

// Route to update the guide section
landingPageRouter.patch('/guide', updateGuideSectionController);

// Route to update the aiCorner section
landingPageRouter.patch('/ai-corner', updateAiCornerSectionController);

export default landingPageRouter;