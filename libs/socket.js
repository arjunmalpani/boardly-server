// socket.js
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL]
    },
})
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

export { app, server, io }