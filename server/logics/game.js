const _ = require('partial-js');

module.exports = function (io, sessions) {

  io.on('connection', function (socket) {

    let game;

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

    const emit = (event, msg) => socket.emit(event, msg);
    const timeoutEmit = (event, msg, time = 0) => setTimeout(() => emit(event, msg), time);
    const mainDpMsg = (msg, time = 0) => timeoutEmit('main message', msg, time);
    const mainDpMsgBig = (msg, time = 0) => timeoutEmit('main message big', msg, time);
    const mainDpButton = (label, time = 0) => timeoutEmit('set main button', label, time);
    const mainDpClear = (time = 0) => timeoutEmit('set main button', label, time);

    socket.on('session start', () => {
      game = new Game();
      mainDpMsgBig('빈고 게임에 참여한 여러분을 환영합니다.', 100);
      mainDpMsg('이 게임에서 여러분은 빈고의 활동가가 됩니다.', 600);
      mainDpMsg('함께 빈고를 운영하며 빈고를 익히는 것이 이 게임의 목표입니다.', 1100);
      mainDpMsg('그럼 시작해봅시다.', 1600);
      mainDpButton('시작한다!', 2000);
    });

    socket.on('game start', () => {
      const game = new Game();
      mainDpClear();
      mainDpMsgBig('빈고 게임에 참여한 여러분을 환영합니다.', 100);
      mainDpMsg('이 게임에서 여러분은 빈고의 활동가가 됩니다.', 600);
      mainDpMsg('함께 빈고를 운영하며 빈고를 익히는 것이 이 게임의 목표입니다.', 1100);
      mainDpMsg('그럼 시작해봅시다.', 1600);
      mainDpButton('시작한다!', 2000);
    });

  });

}