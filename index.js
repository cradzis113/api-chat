const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");

const { handleMessageEvents } = require("./socketHandlers/messageHandlers");
const { handleTypingEvents } = require("./socketHandlers/typingHandlers");
const { handleRoomEvents } = require("./socketHandlers/roomHandlers");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "https://client-chat-9deb.onrender.com",
        methods: ["GET", "POST"]
    },
});

const userData = {};
const typingUsers = {};
const listUserLeft = new Set();
const timeouts = {}; // Object để lưu trữ các timeout

io.on("connection", (socket) => {
    const userName = socket.handshake.query.name;
    
    if (listUserLeft.has(userName)) {
        clearTimeout(timeouts[userName]);
        delete timeouts[userName];
        listUserLeft.delete(userName);
    }

    handleMessageEvents(socket, io, userData);
    handleTypingEvents(socket, io, typingUsers);
    handleRoomEvents(socket, io, userData, timeouts, listUserLeft);
});

httpServer.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
