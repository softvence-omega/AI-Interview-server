import express from 'express';
import websiteConfigController from './websiteconfig.controller';
import { upload } from '../../util/uploadImgToCludinary';

const websiteRoutes = express.Router();

websiteRoutes.get('/get-website', websiteConfigController.getConfig);
websiteRoutes.post('/create-website', upload.single('logo'), websiteConfigController.createOrUpdateConfig);
websiteRoutes.put('/update-website', upload.single('logo'), websiteConfigController.websiteUpdateConfig);

export default websiteRoutes;
