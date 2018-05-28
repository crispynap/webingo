const _ = require('partial-js');
const Statics = require('../statics');


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

    addPlayer(id, nick) {
      const player = new Player(id, nick);
      player.potraitName = Statics.getPotraitName(this.getPotraitNames());
      this.players.push(player);
      return player;
    }

    getPlayer(idOrNick) {
      return _.find(this.players, player => player.id == idOrNick || player.nick == idOrNick);
    }
    getPlayersNick() { return _.map(this.players, player => player.nick); }
    getPotraitNames() { return _.map(this.players, player => player.potraitName); }
    removePlayer(id) { this.players = _.filter(this.players, player => player.clientId !== id); }

  }

  class Player {
    constructor(clientId, nick) {
      this.clientId = clientId;
      this.nick = nick;
      this.potraitName = '';
      this.state = Statics.states.startWaiting;
    }

  }

  class Game {
    constructor() {
      this.bingo = new Bingo();
    }

  }


  class Bingo {
    constructor() {
      this.communes = [];
      this.addCommune('', 8, 4000);
      this.addCommune('', 6, 2000);
      this.addCommune('', 5, 3000);
      this.members = 0;
    }

    getCommuneNames() {
      return _.map(this.communes, ({ name }) => name);
    }

    addCommune(name, members, util, desc) {
      const commune = new Commune(name, members, util, desc);

      if (_.isEmpty(commune.name)) commune.name = Statics.getCommuneName(this.getCommuneNames());

      this.communes.push(commune);
    }

  }

  class Commune {
    constructor(name, members = 0, util = 0, desc = '') {
      this.name = name;
      this.members = members;
      this.util = util;
      this.desc = desc;
      this.interest = 12;
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
      socket.roll = 'manager';
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

      const player = session.addPlayer(socket.id, nick);
      socket.session = session;
      socket.player = player;
      socket.join(session.num);
      socket.emit('player added', session.num, player);
      io.to(session.num).emit('player changed', session.getPlayersNick());
    });

    socket.on('get potrait names', function () {
      socket.emit('potrait names', Statics.potraitNames, socket.session.getPotraitNames());
    });

    socket.on('potrait changed', function (newPotraitName) {
      const oldPotraitName = socket.player.potraitName;
      socket.player.potraitName = newPotraitName;
      io.to(socket.session.num).emit('used potrait changed', oldPotraitName, newPotraitName)
    });

    socket.on('session exit', () => {
      const session = socket.session;
      session.removePlayer(socket.id);
      io.to(session.num).emit('player changed', session.getPlayersNick());
      socket.session = undefined;
    });
  });


  const genSessionNum = () => {
    let sessionNum = _.random(1, 99);
    while (sessions.getSession(sessionNum)) sessionNum = _.random(1, 99);
    return sessionNum;
  };

  return sessions;
}