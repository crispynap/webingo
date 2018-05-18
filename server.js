const _ = require('partial-js');
const express = require("express");
const index = require("./server/routes/index");
const app = express();
const bodyParser = require("body-parser");
const log = console.log

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
  remove(sessionId) {
    this.list = _.filter(this.list, session => session.getSessionId() !== sessionId &&
      session.getClientId() !== sessionId);
  },
  getSession(sessionId) {
    return _.find(this.list, session => session.getSessionId() == sessionId ||
      session.getClientId() === sessionId);
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
  getPlayersNick() { return _.map(this._players, player => player._nick); }

  removePlayer(playerId) { this._players = _.filter(this._players, player => player.getId() !== playerId); }
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
  console.log('user connected:', socket.id);

  socket.on('disconnect', function () {
    console.log('user disconnected');
    if (sessions.getSession(socket.id)) sessions.remove(socket.id);
  });

  socket.on('new session', function () {
    const session = new Session(socket.id);
    sessions.add(session);
    sessionId = session.getSessionId();
    socket.sessionId = sessionId;
    socket.join(sessionId);
    socket.emit('set session number', sessionId);
  });

  socket.on('close session', function () {
    sessions.remove(socket.id);
    io.to(socket.sessionId).emit('session closed');
    socket.sessionId = undefined;
  });

  socket.on('new player', function (nick, sessionId) {
    const session = sessions.getSession(sessionId);

    if (!session) { socket.emit('no session'); return; }
    if (session.getPlayer(nick)) { socket.emit('duplicated nick'); return; }

    session.addPlayer(new Player(socket.id, nick));
    socket.sessionId = sessionId;
    socket.join(sessionId);
    socket.emit('player added', sessionId);
    io.to(sessionId).emit('player changed', session.getPlayersNick());
  });

  socket.on('session exit', () => {
    const session = sessions.getSession(socket.sessionId)
    session.removePlayer(socket.id);
    io.to(socket.sessionId).emit('player changed', session.getPlayersNick());
    socket.sessionId = undefined;
  });
});


const genSession = () => {
  let sessionNum = genNumber(1, 3);
  while (_.some(sessions, session => _.v(session, 'id') === sessionNum))
    sessionNum = genNumber(1, 3);
  return sessionNum;
};
const genNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;