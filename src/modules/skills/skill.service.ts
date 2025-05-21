import { Skill } from './skill.model';

export const createSkill = async (name: string) => {
  return await Skill.create({ name });
};

export const getAllSkills = async () => {
  return await Skill.find({});
};

export const getSkillById = async (id: string) => {
  return await Skill.findById(id);
};

export const updateSkill = async (id: string, name: string) => {
  return await Skill.findByIdAndUpdate(id, { name }, { new: true });
};

export const deleteSkill = async (id: string) => {
  return await Skill.findByIdAndDelete(id);
};
