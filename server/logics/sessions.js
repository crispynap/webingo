const _ = require('partial-js');
const Strings = require('../Strings');


module.exports = function (io) {
  let sessions = {
    list: [],
    add(session) { this.list.push(session); },

    remove(id) {
      this.list = _.filter(this.list, session => session.num !== id && session.clientId !== id);
    },

    getSession(id) {
      return _.find(this.list, session => session.num == id || session.clientId === id);
    }
  };

  class Session {
    constructor(clientId) {
      this.clientId = clientId;
      this.num = genSessionNum();
      this.players = [];
      this.game = new Game();
    }

    addPlayer(player) { this.players.push(player); }
    getPlayer(idOrNick) {
      return _.find(this.players, player => player.id == idOrNick || player.nick == idOrNick);
    }
    getPlayersNick() { return _.map(this.players, player => player.nick); }
    removePlayer(id) { this.players = _.filter(this.players, player => player.clientId !== id); }

  }

  class Player {
    constructor(clientId, nick) {
      this.clientId = clientId;
      this.nick = nick;
    }

  }

  class Game {
    constructor() {
      this.charactors = [];
      this.bingo = new Bingo();
    }

  }

  class Charactor {
    constructor(id, nick) {
      this.id = id;
      this.nick = nick;
    }
  }

  class Bingo {
    constructor() {
      this.communes = [];
      this.addCommune('', 8, 4000);
      this.addCommune('', 6, 2000);
      this.addCommune('', 5, 3000);
    }

    getCommuneNames() {
      return _.map(this.communes, ({ name }) => name);
    }

    addCommune(name, members, util, desc) {
      const commune = new Commune(name, members, util, desc);

      if (_.isEmpty(commune.name)) commune.name = Strings.getCommuneName(this.getCommuneNames());

      this.communes.push(commune);
    }

  }

  class Commune {
    constructor(name, members = 0, util = 0, desc = '') {
      this.name = name;
      this.members = members;
      this.util = util;
      this.desc = desc;
    }
  }

  io.on('connection', function (socket) {
    socket.on('disconnect', function () {
      if (sessions.getSession(socket.id)) {
        sessions.remove(socket.id);
        return;
      }

      if (socket.session) {
        socket.session.removePlayer(socket.id);
        io.to(socket.session.num).emit('player changed', socket.session.getPlayersNick());
      }
    });

    socket.on('new session', function () {
      const session = new Session(socket.id);
      sessions.add(session);
      socket.session = session;
      socket.game = session.game;
      socket.bingo = session.game.bingo;
      socket.join(session.num);
      socket.emit('set session number', session.num);
    });

    socket.on('close session', function () {
      sessions.remove(socket.id);
      io.to(socket.session.num).emit('session closed');
      socket.session = undefined;
    });

    socket.on('new player', function (nick, sessionNum) {
      const session = sessions.getSession(sessionNum);

      if (!session) { socket.emit('no session'); return; }
      if (session.getPlayer(nick)) { socket.emit('duplicated nick'); return; }

      session.addPlayer(new Player(socket.id, nick));
      socket.session = session;
      socket.join(session.num);
      socket.emit('player added', session.num);
      io.to(session.num).emit('player changed', session.getPlayersNick());
    });

    socket.on('session exit', () => {
      const session = socket.session;
      session.removePlayer(socket.id);
      io.to(session.num).emit('player changed', session.getPlayersNick());
      socket.session = undefined;
    });
  });


  const genSessionNum = () => {
    let sessionNum = _.random(1, 3);
    while (sessions.getSession(sessionNum)) sessionNum = _.random(1, 3);
    return sessionNum;
  };

  return sessions;
}