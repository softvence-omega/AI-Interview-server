import { Router } from "express";
import { getDailyDetailedGraph } from "./graph.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../constents";

const graphRoutes = Router();

graphRoutes.get("/average-data", auth([userRole.admin, userRole.user]), getDailyDetailedGraph);

export default graphRoutes;
