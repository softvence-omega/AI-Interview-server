// import { Request, Response, NextFunction } from 'express';
// import {
//   updateBannerSection,
//   updateFeathersSection,
//   updateGuideSection,
//   updateAiCornerSection,
// } from "./landingPage.service"

// // Controller to update the banner section
// const updateBannerSectionController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const file = req.file;
//     const data = req.body.data ? JSON.parse(req.body.data) : {};

//     const updatedLandingPage = await updateBannerSection(file, data);

//     res.status(200).json({
//       success: true,
//       data: updatedLandingPage,
//       message: 'Banner section updated successfully',
//     });
//   } catch (error: any) {
//     if (error.message === 'Image link creation failed') {
//       res.status(400).json({ success: false, error: error.message });
//       return;
//     }
//     next(error);
//   }
// };

// // Controller to update the feathers section
// const updateFeathersSectionController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const file = req.file;
//     const data = req.body.data ? JSON.parse(req.body.data) : {};
//     const newCardData = req.body.newCardData
//       ? JSON.parse(req.body.newCardData)
//       : undefined;

//     const updatedLandingPage = await updateFeathersSection(file, data, newCardData);

//     res.status(200).json({
//       success: true,
//       data: updatedLandingPage,
//       message: 'Feathers section updated successfully',
//     });
//   } catch (error: any) {
//     if (error.message === 'Image link creation failed') {
//       res.status(400).json({ success: false, error: error.message });
//       return;
//     }
//     next(error);
//   }
// };

// // Controller to update the guide section
// const updateGuideSectionController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const data = req.body.data ? JSON.parse(req.body.data) : {};

//     const updatedLandingPage = await updateGuideSection(data);

//     res.status(200).json({
//       success: true,
//       data: updatedLandingPage,
//       message: 'Guide section updated successfully',
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

// // Controller to update the aiCorner section
// const updateAiCornerSectionController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const data = req.body.data ? JSON.parse(req.body.data) : {};

//     const updatedLandingPage = await updateAiCornerSection(data);

//     res.status(200).json({
//       success: true,
//       data: updatedLandingPage,
//       message: 'AI Corner section updated successfully',
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

// export {
//   updateBannerSectionController,
//   updateFeathersSectionController,
//   updateGuideSectionController,
//   updateAiCornerSectionController,
// };


// controllers/landingPage.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../util/catchAsync";
import sendResponse from '../../util/sendResponse';
import landingPageService from './landingPage.service';

// export const updateLandingPageController = catchAsync(async (req: Request, res: Response) => {
//   const data = JSON.parse(req.body.data);
//   const files = req.files as {
//     companyList?: Express.Multer.File[];
//     featureCardImages?: Express.Multer.File[];
//   };

//   const companyListFiles = files?.companyList || [];
//   const featureCardFiles = files?.featureCardImages || [];

//   const updated = await landingPageService.updateLandingPage(data, companyListFiles, featureCardFiles);

//   res.status(200).json({
//     success: true,
//     message: "Landing page updated successfully",
//     data: updated,
//   });
// });

// controller


export const updateLandingPageController = catchAsync(
  async (req: Request, res: Response) => {
    const data = JSON.parse(req.body.data);
    const files = req.files as {
      companyList?: Express.Multer.File[];
      card0Image?: Express.Multer.File[];
      card1Image?: Express.Multer.File[];
      card2Image?: Express.Multer.File[];
      card3Image?: Express.Multer.File[];
    };

    const companyListFiles = files?.companyList || [];
    // Map card image files to an array based on index
    const featureCardFiles = [
      files?.card0Image?.[0] || undefined,
      files?.card1Image?.[0] || undefined,
      files?.card2Image?.[0] || undefined,
      files?.card3Image?.[0] || undefined,
    ].filter((file): file is Express.Multer.File => !!file); // Remove undefined entries

    const updated = await landingPageService.updateLandingPage(
      data,
      companyListFiles,
      featureCardFiles
    );

    res.status(200).json({
      success: true,
      message: "Landing page updated successfully",
      data: updated,
    });
  }
);


export const getAllLandingData = async (req: Request, res: Response) => {
  const result = await landingPageService.getLandingPageData();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Landing page data fetched successfully",
    data: result,
  })
}


export const deleteCompanyLogoByIndex = async (req: Request, res: Response) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      res.status(400).json({ error: 'Invalid index provided' });
      return;
    }
    const updatedPage = await landingPageService.deleteCompanyLogoByIndex(index);
    res.status(200).json(updatedPage);
    return;
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return;
  }
};