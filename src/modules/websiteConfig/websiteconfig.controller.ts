import { Request, Response } from 'express';
import websiteConfigService from './websiteconfig.service';
import { uploadImgToCloudinary } from '../../util/uploadImgToCludinary';
import { WebsiteConfig } from './websiteconfig.model';

const createOrUpdateConfig = async (req: Request, res: Response) => {
  try {
    const { title, triggerText } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Logo image is required' });
      return;
    }

    const cloudinaryUpload = await uploadImgToCloudinary(
      `website-logo-${Date.now()}`,
      file.path,
    );

    let config = await WebsiteConfig.findOne();
    if (config) {
      config.title = title;
      config.logoUrl = cloudinaryUpload.secure_url;
      config.triggerText = triggerText;
      await config.save();
    } else {
      config = await WebsiteConfig.create({
        title,
        logoUrl: cloudinaryUpload.secure_url,
        triggerText,
      });
    }

    res.status(200).json({ message: 'Config saved', data: config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await websiteConfigService.getWebsiteConfig();
    res.status(200).json({ data: config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const websiteUpdateConfig = async (req: Request, res: Response) => {
    try {
      const { title, triggerText } = req.body;
      const file = req.file;
  
      let logoUrl = req.body.logoUrl;
  
      if (file) {
        const cloudinaryUpload = await uploadImgToCloudinary(
          `website-logo-${Date.now()}`,
          file.path
        );
        logoUrl = cloudinaryUpload.secure_url;
      }
  
      let config = await WebsiteConfig.findOne();
      if (config) {
        if (title) config.title = title;
        if (logoUrl) config.logoUrl = logoUrl;
        if (triggerText) config.triggerText = triggerText;
        await config.save();
      } else {
        config = await WebsiteConfig.create({
          title,
          logoUrl,
          triggerText,
        });
      }
  
      res.status(200).json({ message: 'Config saved', data: config });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  

const websiteConfigController = {
  createOrUpdateConfig,
  getConfig,
  websiteUpdateConfig,
};

export default websiteConfigController;
