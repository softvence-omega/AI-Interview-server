import express from 'express';
import * as SkillController from './skill.controller';

const SkillsRoutes = express.Router();

SkillsRoutes.post('/create-skill', SkillController.createSkill);
SkillsRoutes.get('/all-skills', SkillController.getAllSkills);
SkillsRoutes.get('/single-skill/:id', SkillController.getSkillById);
SkillsRoutes.patch('/update-skill/:id', SkillController.updateSkill);
SkillsRoutes.delete('/delete-skill/:id', SkillController.deleteSkill);

export default SkillsRoutes;
