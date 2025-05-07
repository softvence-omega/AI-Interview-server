import { Router } from "express";
import { getDailyDetailedGraph } from "./graph.controller";

const graphRoutes = Router();

graphRoutes.get("/average-data", getDailyDetailedGraph);

export default graphRoutes;
