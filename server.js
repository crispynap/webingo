const express = require("express");
const index = require("./server/routes/index");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", __dirname + "/server/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use("/", index);

const http = require("http").Server(app);
const io = require("socket.io")(http);

io.on("connection", function(socket) {
  console.log("a user connected");
  socket.broadcast.emit("hi");
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    console.log("message: " + msg);
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});

io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });
});
