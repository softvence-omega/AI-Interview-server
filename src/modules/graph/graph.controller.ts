import { Request, Response } from "express";
import { calculateDailyDetailedAverages } from "./graph.service";

export const getDailyDetailedGraph = (req: Request, res: Response) => {
  try {
    const data = calculateDailyDetailedAverages();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to process detailed graph data." });
  }
};
