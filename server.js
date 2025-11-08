// server.js
import "dotenv/config";
import express from "express";
import { connectDB } from './libs/db.js';
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';
import { app, server } from "./libs/socket.js";
import cookieParser from "cookie-parser";

// Importing routes

import authRouter from './routes/auth.route.js';
import spaceRouter from './routes/space.route.js';



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
// Routes
app.use('/api/auth', authRouter)
app.use('/api/space', spaceRouter)

const startServer = async () => {
    await connectDB()
    server.listen(port, () => {
        console.log(`The Server is running at http://localhost:${port}`)
    })
}
startServer()