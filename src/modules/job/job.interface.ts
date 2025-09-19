import { Types } from "mongoose";

export interface FilterParams {
  user_id:Types.ObjectId | string;
  company?: string;
  location?: string;
  position?: string;
  year?: string;
  isApplied?: string;
}