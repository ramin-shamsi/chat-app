const http = require("http");
const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const { generateMessage, generateLocation } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  console.log("new WebSocket connection");
  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage("chat app", `welcome ${user.username}`)
    );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("chat app", `${user.username} has join`)
      );
    callback();
  });

  socket.on("newMessage", (text, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(text)) {
      // Ackhowledgement
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, text));
    // Ackhowledgement
    callback();
  });

  socket.on("shareLocation", (locationData, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "location",
      generateLocation(
        user.username,
        `https://google.com/maps?q=${locationData.latitude},${locationData.longitude}`
      )
    );
    // Ackhowledgement
    callback();
  });

  // built in event
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("chat app", `${user.username} has left`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => console.log(`server listening on ${port}`));
