const express = require("express");
const index = require("./server/routes/index");
const app = express();
const bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", __dirname + "/server/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use("/", index);

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

