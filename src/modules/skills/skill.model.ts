import { Schema, model } from 'mongoose';

const skillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const Skill = model('Skill', skillSchema);
