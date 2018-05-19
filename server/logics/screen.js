const _ = require('partial-js');


module.exports = function (io, sessions) {

  io.on('connection', function (socket) {

    const startScripts = [
      { type: 'clear' },
      { type: 'msg big', msg: `빈고 게임에 참여한 여러분을 환영합니다.` },
      { type: 'msg', msg: `이 게임에서 여러분은 빈고의 활동가가 됩니다.` },
      { type: 'msg', msg: `함께 빈고를 운영하며 빈고를 익히는 것이 이 게임의 목표입니다.` },
      { type: 'msg', msg: `그럼 시작해봅시다.` },
      { type: 'clear' },
      { type: 'msg', msg: `20XX년, 여러분은 작은 은행을 하나 만듭니다.`, more: true },
      { type: 'set bank' },
      { type: 'msg', msg: `빈집이라는 주거 공동체들의 전월세 보증금을 모으기 위해서였습니다.`, more: true },
      { type: 'function', type: 'set communes', func: () => 'a' },
      { type: 'msg', msg: `여러분 중에는 빈집에 살고 있는 사람도 있었고,` },
      { type: 'msg', msg: `빈집에 놀러오는 사람이나 관심이 있는 사람도 있었으며,` },
      { type: 'msg', msg: `빈집은 잘 모르지만 이 은행의 취지에 공감한 사람도 있었습니다.` },
      { type: 'msg', msg: `여러분은 이 은행의 이름을 빈마을 금고라는 의미에서 <b>빈고</b>라 지었습니다.`, more: true },
      { type: 'set bank name to bingo' },
    ];

    const emit = (event, data) => { socket.emit(event, data) };
    const timeoutEmit = (event, data, time = 0) => setTimeout(() => emit(event, data), time);
    const mainDpMsg = (data, time = 0) => timeoutEmit('main message', data, time);
    const mainDpMsgBig = (data, time = 0) => timeoutEmit('main message big', data, time);
    const mainDpClear = () => timeoutEmit('main clear');

    const genScriptsQueue = function* (scripts) {
      for (let script of scripts) {
        switch (script.type) {
          case 'clear': mainDpClear(script.time); break;
          case 'msg': mainDpMsg(script.data, script.time); break;
          case 'msg big': mainDpMsgBig(script.data, script.time); break;
          case 'function': timeoutEmit(script.event, script.func(), script.time); break;
          default: timeoutEmit(script.event, script.data, script.time);
        }
        if (script.more) continue;
        yield;
      };
    }

    socket.on('session start', () => {
      socket.scriptQueue = genScriptsQueue(startScripts);
      socket.scriptQueue.next();
    });

    socket.on('next queue', () => {
      socket.scriptQueue.next();
    });

  });

}