import fs from 'fs';
import path from 'path';
import { Skill } from '../modules/skills/skill.model';

const skillsSeeder = async () => {
  const filePath = path.join(__dirname, '../modules/skills/skills.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const skills: { name: string }[] = JSON.parse(data);

  // Load existing skill names from DB once
  const existingSkills = await Skill.find({}, { name: 1 }).lean();
  const existingSkillNames = new Set(existingSkills.map(s => s.name));

  // Only new skills
  const newSkills = skills.filter(skill => !existingSkillNames.has(skill.name));

  if (newSkills.length > 0) {
    console.log(`Seeding ${newSkills.length} new skills...`);
    try {
      await Skill.insertMany(newSkills, { ordered: false }); // Allows continuing even if a few fail
      console.log(`✅ Inserted ${newSkills.length} skills.`);
    } catch (err : any) {
      console.error('⚠️ Error inserting skills (some may already exist):', err.message);
    }
  } else {
    console.log('✅ All skills already exist. No new seeding needed.');
  }
};

export default skillsSeeder;
