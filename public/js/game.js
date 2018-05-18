$(document).ready(() => {

  const socket = io();

  $('#new_session_btn').click(() => {
    socket.emit('new session');
    $('.session_set').addClass('off');
    $('.new_session').addClass('on');
  });

  socket.on('set session number', function (num) {
    $('#session_number').text(num);
  });
})