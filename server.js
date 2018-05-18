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
  },
  getSession(sessionId) {
    return _.find(this.list, session => session.getSessionId() == sessionId)
  }
};

class Session {
  constructor(clientId) {
    this._clientId = clientId;
    this._sessionId = genSession();
    this._players = [];
  }

  getClientId() { return this._clientId }
  getSessionId() { return this._sessionId }
  addPlayer(player) { this._players.push(player) }
  getPlayer(idOrNick) {
    return _.find(this._players, player =>
      player.getId() == idOrNick || player.getNick() == idOrNick
    )
  }
  removePlayer(rPlayer) { this._players = _.filter(this._players, player => player.getId() !== rPlayer.getId()); }
}

class Player {
  constructor(clientId, nick) {
    this._clientId = clientId;
    this._nick = nick;
  }

  getId() { return this._clientId; }
  getNick() { return this._nick; }

}

io.on('connection', function (socket) {
  let thisSession;
  let thisPlayer;

  console.log('user connected:', socket.id);

  socket.on('disconnect', function () {
    console.log('user disconnected');
    if (thisSession) sessions.remove(thisSession);
  });

  socket.on('new session', function () {
    thisSession = new Session(socket.id);
    sessions.add(thisSession);
    socket.emit('set session number', thisSession.getSessionId());
  });

  socket.on('close session', function () {
    sessions.remove(thisSession);
    thisSession = undefined;
  });

  socket.on('new player', function (nick, sessionId) {
    const session = sessions.getSession(sessionId);

    if (!session) { socket.emit('no session'); return; }
    if (session.getPlayer(nick)) { socket.emit('duplicated nick'); return; }

    session.addPlayer(new Player(socket.id, nick));
    socket.emit('player added', session.getSessionId());
  });
});


const genSession = () => {
  let sessionNum = genNumber(1, 3);
  while (_.some(sessions, session => _.v(session, 'id') === sessionNum))
    sessionNum = genNumber(1, 3);
  return sessionNum;
};
const genNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;