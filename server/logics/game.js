const _ = require('partial-js');


module.exports = function (io, sessions) {

  io.on('connection', function (socket) {

    let game;

    const startMsgs = [
      { event: 'clear' },
      { event: 'msg big', msg: `빈고 게임에 참여한 여러분을 환영합니다.` },
      { event: 'msg', msg: `이 게임에서 여러분은 빈고의 활동가가 됩니다.` },
      { event: 'msg', msg: `함께 빈고를 운영하며 빈고를 익히는 것이 이 게임의 목표입니다.` },
      { event: 'msg', msg: `그럼 시작해봅시다.` },
      { event: 'clear' },
      { event: 'msg', msg: `20XX년, 여러분은 작은 은행을 하나 만듭니다.`, more: true },
      { event: 'set bank' },
      { event: 'msg', msg: `빈집이라는 주거 공동체들의 전월세 보증금을 모으기 위해서였습니다.`, more: true },
      { event: 'set communes', game },
      { event: 'msg', msg: `여러분 중에는 빈집에 살고 있는 사람도 있었고,` },
      { event: 'msg', msg: `빈집에 놀러오는 사람이나 관심이 있는 사람도 있었으며,` },
      { event: 'msg', msg: `빈집은 잘 모르지만 이 은행의 취지에 공감한 사람도 있었습니다.` },
      { event: 'msg', msg: `여러분은 이 은행의 이름을 빈마을 금고라는 의미에서 <b>빈고</b>라 지었습니다.`, more: true },
      { event: 'set bank name to bingo' },
    ];

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
        this._queue = function* () { };
      }

      setQueue(queue) { this._queue = queue; }
      nextQueue() { this._queue.next(); }
    }

    const emit = (event, msg) => socket.emit(event, msg);
    const timeoutEmit = (event, msg, time = 0) => setTimeout(() => emit(event, msg), time);
    const mainDpMsg = (msg, time = 0) => timeoutEmit('main message', msg, time);
    const mainDpMsgBig = (msg, time = 0) => timeoutEmit('main message big', msg, time);
    const mainDpClear = () => timeoutEmit('main clear');

    const emitsQueue = function* (items) {
      for (let item of items) {
        switch (item.event) {
          case 'clear': mainDpClear(item.time); break;
          case 'msg': mainDpMsg(item.msg, item.time); break;
          case 'msg big': mainDpMsgBig(item.msg, item.time); break;
          default: timeoutEmit(item.event, item.msg, item.time);
        }
        if (item.more) continue;
        yield;
      };
    }

    socket.on('session start', () => {
      game = new Game();
      game.setQueue(emitsQueue(startMsgs));
      game.nextQueue();
    });

    socket.on('next queue', () => {
      game.nextQueue();
    });

  });

}