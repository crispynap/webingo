$(document).ready(() => {

  const socket = io();

  $('#new_session_btn').click(() => {
    socket.emit('new session');
    $('.session_set').removeClass('on');
    $('.new_session').addClass('on');
  });

  $('#close_session_btn').click(() => {
    socket.emit('close session');
    $('.new_session').removeClass('on');
    $('.session_set').addClass('on');
  });

  $('#connect_session_btn').click(() => {
    const nick = $('#nick_input').val();
    const session = $('#session_input').val();
    socket.emit('new player', nick, session);
  });

  socket.on('set session number', sessionId => {
    $('#session_number').text(sessionId);
  });

  socket.on('no session', () => {
    $('.session_warn').addClass('on').text('세션 번호를 잘못 입력하였습니다.');
  });

  socket.on('duplicated nick', () => {
    $('.session_warn').addClass('on').text('동일한 별명이 존재합니다.');
  });

  socket.on('player added', (sessionId) => {
    $('.session_set').removeClass('on');
    $('.wait_session').addClass('on');
    $('#session_number').text(sessionId);
  });
});