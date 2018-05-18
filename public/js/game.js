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

  socket.on('set session number', function (num) {
    $('#session_number').text(num);
  });

  socket.on('no session', function (num) {
    $('#session_number').text(num);
  });
})