import cookieParser from "cookie-parser";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./middleware/error.middleware.js";
import multer from "multer";
import packageRouter from "./routes/package.routes.js";
import ServiceRouter from "./routes/service.routes.js";
import testRouter from "./routes/test.routes.js";


config();

// Initialize Express app
const app = express();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:5174",
      "https://freelance.webakash1806.com",
      "https://ayush.webakash1806.com",
      "https://ucscab.com",
      "https://master.ucscab.com",
      "https://drmanasaggrawalji.netlify.app",
      "https://drmanasdashboard.netlify.app"
    ],
    credentials: true,
  })
);
app.use(morgan("dev"));


 
// router


app.use("/api/v1/package",packageRouter)
app.use("/api/v1/service",ServiceRouter)
app.use("/api/v1/test",testRouter)






app.get("/test", (req, res) => {
  res.status(200).json({
    message: "testis running and ready.",
  });
});

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running and ready.",
  });
});

// Catch-all route for undefined endpoints
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: "Oops! pagal h kya  Not Found",
  });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;