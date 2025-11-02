// server.js
import "dotenv/config";
import express from "express";
import { connectDB } from './libs/db.js';
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';
import { app, server } from "./libs/socket.js";

const port = process.env.PORT || 3000

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json())             
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/',(req,res)=>{
    return res.json({
        message:"Backend is saying you heelloooow"
    })
})
const startServer = async () => {
    await connectDB()
    server.listen(port, () => {
        console.log(`The Server is running at http://localhost:${port}`)
    })
}
startServer()