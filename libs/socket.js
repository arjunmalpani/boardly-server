// socket.js
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { setupSocketIO } from './server_socket.js';

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL],
        methods: ["GET", "POST"],
        credentials: true,
    },
})
setupSocketIO(io);

export { app, server, io }