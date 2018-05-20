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

  $('#exit_session_btn').click(() => {
    socket.emit('session exit');
    $('.wait_session').removeClass('on');
    $('.session_set').addClass('on');
  });

  $('#connect_session_btn').click(() => {
    const nick = $('#nick_input').val();
    const session = $('#session_input').val();
    socket.emit('new player', nick, session);
  });

  $('#start_session_btn').click(() => {
    socket.emit('session start');
    $('.window_gameset').removeClass('on');
    $('.main_screen').addClass('on');
  });

  socket.on('set session number', sessionId => {
    $('.session_number').text(sessionId);
  });

  socket.on('no session', () => {
    $('.session_warn').addClass('on').text('세션 번호를 잘못 입력하였습니다.');
  });

  socket.on('session closed', () => {
    $('.wait_session').removeClass('on');
    $('.session_set').addClass('on');
    $('.session_warn').addClass('on').text('세션이 종료되었습니다.');
  });

  socket.on('duplicated nick', () => {
    $('.session_warn').addClass('on').text('동일한 별명이 존재합니다.');
  });

  socket.on('player added', sessionId => {
    $('.session_warn').removeClass('on');
    $('.session_set').removeClass('on');
    $('.wait_session').addClass('on');
    $('.session_number').text(sessionId);
  });

  socket.on('player changed', nicks => {
    $('.player_list').text(`${nicks.join(', ')} (${nicks.length}명)`);
  });



  socket.on('main clear', label => {
    $('.main_display .message_box').empty();
    $('.main_display .button_box').empty().append(`<button id="next_btn">다음</button>`);
    $('.button_box #next_btn').click(() => socket.emit('next queue'));

    socket.emit('next queue');
  });

  const mainMsgShow = (className, msg) => {
    $('.main_display .message_box .old2').removeClass('old2').addClass('old3');
    $('.main_display .message_box .old1').removeClass('old1').addClass('old2');
    $('.main_display .message_box .new').removeClass('new').addClass('old1');
    $('.main_display .message_box').append(`<span class="new ${className}">${msg}</span>`);
    $('.main_display .message_box').scrollTop($('.main_display .message_box')[0].scrollHeight);
  }

  socket.on('main message', msg => { mainMsgShow('main_msg', msg) });
  socket.on('main message big', msg => { mainMsgShow('main_msg_big', msg) });

  socket.on('set bank', msg => {
    $('.bingo_display .namespace').append(`작은 은행`);
  });

  socket.on('set communes', communes => {
    $('.communes_display .namespace').append(`공동체들`);

    _.each(communes, commune => {
      $('.communes_display').append(`
        <div class="commune">
          <i class="fas fa-home"></i>
          <h1 class="name">${commune.name}</h1>
          <h2 class="members">구성원: ${commune.members}명</h2>
          <h2 class="util">대출금: ${commune.util}</h2>
        </div>
      `);
    });
  });

});