const _ = require('partial-js');

module.exports = function (io, sessions) {

  io.on('connection', function (socket) {

    const getThisSession = () => sessions.getSession(socket.sessionId);

    class Charactor {
      constructor(id, nick) {
        this._id = id;
        this._nick = nick;
      }
    }

    class Bingo {
      constructor(id, nick) {
        this._id = id;
        this._nick = nick;
      }
    }

    class Game {
      constructor() {
        this._charactors = _.map(getThisSession().getPlayers(),
          player => new Charactor(player.getId(), player.getNick()));
        this._bingo = new Bingo();
      }
    }



    socket.on('session start', () => {
      const game = new Game();

    });

  });

}