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

    const sendMainMsg = (msg, time = 0) => setTimeout(() => socket.emit('main message', msg), time);
    const sendMainMsgBig = (msg, time = 0) => setTimeout(() => socket.emit('main message big', msg), time);
    const sendMainButton = (label, time = 0) => setTimeout(() => socket.emit('set main button', label), time);

    socket.on('session start', () => {
      const game = new Game();
      sendMainMsgBig('빈고 게임에 참여한 것을 환영합니다.', 100);
      sendMainMsg('이 게임에서 여러분은 빈고의 활동가가 됩니다.', 300);
      sendMainMsg('함께 빈고를 운영하며 빈고를 익히는 것이 이 게임의 목표입니다.', 500);
      sendMainMsg('그럼 시작해봅시다.', 1000);
      sendMainButton('시작한다!', 1200);

    });

  });

}