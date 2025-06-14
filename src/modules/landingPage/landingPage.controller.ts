import { Request, Response, NextFunction } from 'express';
import {
  updateBannerSection,
  updateFeathersSection,
  updateGuideSection,
  updateAiCornerSection,
} from "./landingPage.service"

// Controller to update the banner section
const updateBannerSectionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    const data = req.body.data ? JSON.parse(req.body.data) : {};

    const updatedLandingPage = await updateBannerSection(file, data);

    res.status(200).json({
      success: true,
      data: updatedLandingPage,
      message: 'Banner section updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Image link creation failed') {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    next(error);
  }
};

// Controller to update the feathers section
const updateFeathersSectionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    const data = req.body.data ? JSON.parse(req.body.data) : {};
    const newCardData = req.body.newCardData
      ? JSON.parse(req.body.newCardData)
      : undefined;

    const updatedLandingPage = await updateFeathersSection(file, data, newCardData);

    res.status(200).json({
      success: true,
      data: updatedLandingPage,
      message: 'Feathers section updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Image link creation failed') {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    next(error);
  }
};

// Controller to update the guide section
const updateGuideSectionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body.data ? JSON.parse(req.body.data) : {};

    const updatedLandingPage = await updateGuideSection(data);

    res.status(200).json({
      success: true,
      data: updatedLandingPage,
      message: 'Guide section updated successfully',
    });
  } catch (error: any) {
    next(error);
  }
};

// Controller to update the aiCorner section
const updateAiCornerSectionController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = req.body.data ? JSON.parse(req.body.data) : {};

    const updatedLandingPage = await updateAiCornerSection(data);

    res.status(200).json({
      success: true,
      data: updatedLandingPage,
      message: 'AI Corner section updated successfully',
    });
  } catch (error: any) {
    next(error);
  }
};

export {
  updateBannerSectionController,
  updateFeathersSectionController,
  updateGuideSectionController,
  updateAiCornerSectionController,
};