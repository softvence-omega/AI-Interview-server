import { Request, Response } from 'express';
import * as SkillService from './skill.service';
import sendResponse from '../../util/sendResponse';

export const createSkill = async (req: Request, res: Response) => {
  const result = await SkillService.createSkill(req.body.name);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Skill created',
    data: result,
  });
};

export const getAllSkills = async (_: Request, res: Response) => {
  const result = await SkillService.getAllSkills();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Skills fetched',
    data: result,
  });
};

export const getSkillById = async (req: Request, res: Response) => {
  const result = await SkillService.getSkillById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Skill fetched',
    data: result,
  });
};

export const updateSkill = async (req: Request, res: Response) => {
  const result = await SkillService.updateSkill(req.params.id, req.body.name);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Skill updated',
    data: result,
  });
};

export const deleteSkill = async (req: Request, res: Response) => {
  const result = await SkillService.deleteSkill(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Skill deleted',
    data: result,
  });
};
