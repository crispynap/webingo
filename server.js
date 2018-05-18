const _ = require('partial-js');
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

http.listen(3000, function () {
  console.log('listening on *:3000');
});





let sessions = {
  list: [],
  add(session) { this.list.push(session); },
  remove(rSession) {
    this.list = _.filter(this.list, session => session.getSessionId() !== rSession.getSessionId());
  }
};

class Session {
  constructor(clientId) {
    this._clientId = clientId;
    this._sessionId = genSession();
  }

  getClientId() { return this._clientId }
  getSessionId() { return this._sessionId }
}

io.on('connection', function (socket) {
  let thisSession;

  console.log('user connected:', socket.id);

  socket.on('disconnect', function () {
    console.log('user disconnected');
    sessions.remove(thisSession);
    console.log('sessions:', sessions);
  });

  socket.on('new session', function () {
    thisSession = new Session(socket.id);
    sessions.add(thisSession);
    socket.emit('set session number', thisSession.getSessionId());

    console.log('sessions:', sessions);
  });

  socket.on('close session', function () {
    sessions.remove(thisSession);
    thisSession = undefined;
    console.log('sessions:', sessions);
  });
});


const genSession = () => {
  let sessionNum = genNumber(1, 9999);
  while (_.some(sessions, session => _.v(session, 'id') === sessionNum))
    sessionNum = genNumber(1, 9999);
  return sessionNum;
};
const genNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;