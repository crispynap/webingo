$(document).ready(() => {

  $(function () {
    var socket = io();
    $('form').submit(function () {
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
  });

  $('#new_session_btn').click(() => {
    $('.session_set').addClass('off');
    $('.new_session').addClass('on');
  });
})