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

  socket.on('set session number', function (num) {
    $('#session_number').text(num);
  });
})