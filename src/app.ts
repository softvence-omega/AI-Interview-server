import express from 'express';
const app = express();
import path from "path";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorhandeler";
import routeNotFound from "./middlewares/routNotFound";
import Routes from "./routes";

// middleWares
app.use(express.json());

app.use(cors({
  origin: ['*', 'http://localhost:5173', 'https://cerulean-pavlova-50e690.netlify.app', 'https://ai-interview-client-eta.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Welcome to AI Mock Interview server..!");
});

// Routes
app.use("/api/v1", Routes);

// route not found
app.use(routeNotFound);

// global error handeller
app.use(globalErrorHandler);

export default app;
