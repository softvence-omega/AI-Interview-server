import { Request, Response } from "express";
import { calculateDailyDetailedAveragesFromDB } from "./graph.service";

export const getDailyDetailedGraph = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;
    const data = await calculateDailyDetailedAveragesFromDB(userId);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process detailed graph data." });
  }
};
