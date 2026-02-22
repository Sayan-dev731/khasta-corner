/* global process */
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import dotenv from "dotenv";


// dotenv.config({
//     path: "./.env",
// });

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "10kb" }));

app.use(express.static("Public"));

app.use(express.urlencoded({ limit: "10kb", extended: true }));

app.use(cookieParser());

import userRouter from "./routes/user.routes.js";

// user route decleration
app.use("/api/v1/users", userRouter);

export default app;
