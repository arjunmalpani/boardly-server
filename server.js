// server.js
import "dotenv/config";
import express from "express";
import { connectDB } from './libs/db.js';
import cors from "cors";
import { app, server } from "./libs/socket.js";
import cookieParser from "cookie-parser";

// Importing routes

import authRouter from './routes/auth.route.js';
import spaceRouter from './routes/space.route.js';
import morgan from "morgan";



const port = process.env.PORT || 3000;
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
    cors({
        origin: [process.env.CLIENT_URL],
        credentials: true,
    })
);
app.use(morgan("[API] :method :url :status :res[content-length] - :response-time ms"))
// Routes
app.use('/api/auth', authRouter)
app.use('/api/space', spaceRouter)
app.all('*path', (req, res) => {
    res.status(404).json({
        success: false,
        message: "Resource not found"
    });
});
const startServer = async () => {
    await connectDB()
    server.listen(port, () => {
        console.log(`[SERVER] Server Started http://localhost:${port}`)
    })
}
startServer()