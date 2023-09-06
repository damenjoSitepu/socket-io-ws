"use strict";
const io = require("socket.io")(3000, {
    cors: {
        origin: ["http://localhost:4200"]
    }
});
// User Namespace Socket
const userIo = io.of("/user");
userIo.on("connection", (socket) => {
    console.log("Connected With User Namespace Socket IO Instance");
});
io.on("connection", (socket) => {
    socket.on("send-message", (message, room) => {
        /**
         * If room not exists, we need to send the message (broadcasting) to
         * the entire user which is connected to our server. Otherwise, when the room was
         * available, just send the message to the relevan user with their unique room id
         */
        if (room === "") {
            socket.broadcast.emit("retrieve-message", message);
        }
        else {
            socket.to(room).emit("retrieve-message", message);
        }
    });
    socket.on("join-room", (room, currentRoom, callback) => {
        if (currentRoom === "") {
            socket.join(room);
            currentRoom = room;
            callback(`Joined Room: ${room}`, currentRoom);
        }
        else if (currentRoom !== "" && (currentRoom === room)) {
            callback(`You Already Joined (${room}) Room!`, currentRoom);
        }
        else if (currentRoom !== "" && room === "") {
            socket.leave(currentRoom);
            callback(`Leaving Room: ${currentRoom}`, room);
        }
        else if (currentRoom !== "" && (currentRoom !== room)) {
            const leavingCurrentRoom = currentRoom;
            socket.leave(currentRoom);
            socket.join(room);
            currentRoom = room;
            callback(`Leaving Room: ${leavingCurrentRoom} And Joined Room: ${room}`, currentRoom);
        }
    });
});
