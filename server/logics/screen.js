const _ = require('partial-js');
const Statics = require('../statics');

module.exports = function (io, sessions) {

  io.on('connection', function (socket) {

    const emit = (event, data) => { socket.emit(event, data) };
    const timeoutEmit = (event, data, time = 0) => setTimeout(() => emit(event, data), time);
    const screenMsg = (data, time = 0) => timeoutEmit('main message', data, time);
    const screenMsgBig = (data, time = 0) => timeoutEmit('main message big', data, time);
    const screenClear = () => timeoutEmit('main clear');

    const genScriptsQueue = function* (scripts) {
      for (let script of scripts) {
        switch (script.type) {
          case 'clear': screenClear(script.time); break;
          case 'msg': screenMsg(script.data, script.time); break;
          case 'msg big': screenMsgBig(script.data, script.time); break;
          case 'function': timeoutEmit(script.event, script.func(), script.time); break;
          default: timeoutEmit(script.event, script.data, script.time);
        }
        if (script.more) continue;
        yield;
      };
    }

    const addCommune1 = () => socket.bingo.communes[0];
    const addCommune2 = () => socket.bingo.communes[1];
    const addCommune3 = () => socket.bingo.communes[2];

    const setPlayers = () => socket.bingo.players;
    const setMembers1 = () => Math.floor(socket.bingo.members * 0.64);
    const setMembers2 = () => Math.floor(socket.bingo.members * 0.83);
    const setMembers3 = () => socket.bingo.members;

    const startScripts = [
      { type: 'clear' },
      { type: 'msg big', data: `빈고 게임에 참여한 여러분을 환영합니다.` },
      { type: 'msg', data: `이 게임에서 여러분은 빈고의 활동가가 됩니다.` },
      { type: 'msg', data: `함께 빈고를 운영하며 빈고를 익히는 것이 이 게임의 목표입니다.` },
      { type: 'msg', data: `그럼 시작해봅시다.` },
      { type: 'clear' },
      { type: 'msg', data: `20XX년, 어떤 사람들은 작은 은행을 하나 만듭니다.`, more: true },
      { event: 'set bank' },
      { type: 'msg', data: `빈집이라는 주거 공동체들의 전월세 보증금을 모으기 위해서였습니다.`, more: true },
      { event: 'set communes', more: true },
      { type: 'function', event: 'add commune', func: addCommune1, more: true, time: 1000 },
      { type: 'function', event: 'add commune', func: addCommune2, more: true, time: 1500 },
      { type: 'function', event: 'add commune', func: addCommune3, time: 2000 },
      { type: 'msg', data: `사람들 중에는 빈집에 살고 있는 사람도 있었고,`, more: true },
      { type: 'function', event: 'set members', func: setMembers1, time: 300 },
      { type: 'msg', data: `빈집에 놀러오는 사람이나 관심이 있는 사람도 있었으며,`, more: true },
      { type: 'function', event: 'change members', func: setMembers2, time: 200 },
      { type: 'msg', data: `빈집은 잘 모르지만 이 은행의 취지에 공감한 사람도 있었습니다.`, more: true },
      { type: 'function', event: 'change members', func: setMembers3, time: 200 },
      { type: 'msg', data: `그 중 몇 사람은 빈고의 운영에 좀 더 깊이 참여하고자 했고,` },
      { type: 'msg', data: `그게 바로 여러분이었습니다.`, more: true },
      { type: 'function', event: 'set players', func: setPlayers, time: 200 },
      { type: 'msg', data: `그리고 여러분은 이 은행의 이름을 빈마을의 금고라는 의미에서` },
      { type: 'msg', data: `<b>빈고</b>라고 지었습니다.`, more: true },
      { event: 'set bank name to bingo' },
    ];

    socket.on('session start', () => {
      socket.bingo.members = 40 + socket.session.players.length;

      socket.scriptQueue = genScriptsQueue(startScripts);
      socket.scriptQueue.next();
    });

    socket.on('next queue', () => {
      socket.scriptQueue.next();
    });

  });

}