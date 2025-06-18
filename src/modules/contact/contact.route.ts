// src/modules/contact/contact.route.ts
import { Router } from 'express';
import { contactUs } from './contact.controller';

const contactRoutes = Router();

contactRoutes.post('/contact-us', contactUs);

export default contactRoutes;
