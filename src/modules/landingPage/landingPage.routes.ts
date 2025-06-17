// import express from 'express';
// import {
//   updateBannerSectionController,
//   updateFeathersSectionController,
//   updateGuideSectionController,
//   updateAiCornerSectionController,
// } from "./landingPage.controller"
// import { upload } from '../../util/uploadImgToCludinary';


// const landingPageRouter = express.Router();

// // Route to update the banner section
// landingPageRouter.patch('/banner', upload.single('file'), updateBannerSectionController);

// // Route to update the feathers section
// landingPageRouter.patch('/feathers', updateFeathersSectionController);

// // Route to update the guide section
// landingPageRouter.patch('/guide', updateGuideSectionController);

// // Route to update the aiCorner section
// landingPageRouter.patch('/ai-corner', updateAiCornerSectionController);

// export default landingPageRouter;

// routes/landingPage.routes.ts
import express from "express";
import { upload } from '../../util/uploadImgToCludinary';
import { deleteCompanyLogoByIndex, getAllLandingData, updateLandingPageController } from "./landingPage.controller";

const landingPageRouter = express.Router();

// Route: /api/landing/update
// landingPageRouter.put("/update", upload.fields([
//   { name: "companyList", maxCount: 10 },
//   { name: "featureCardImages", maxCount: 10 },
// ]), updateLandingPageController);

landingPageRouter.put(
  "/update",
  upload.fields([
    { name: "companyList", maxCount: 10 },
    { name: "card0Image", maxCount: 1 },
    { name: "card1Image", maxCount: 1 },
    { name: "card2Image", maxCount: 1 },
    { name: "card3Image", maxCount: 1 },
  ]),
  updateLandingPageController
);


landingPageRouter.get("/landingPageData", getAllLandingData);

// Delete company logo by index
landingPageRouter.delete('/company-logo/:index', deleteCompanyLogoByIndex);

export default landingPageRouter;
