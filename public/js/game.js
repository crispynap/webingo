$(document).ready(() => {

  const socket = io();
  const toggle = el => el.hasClass('on') ? off(el) : on(el);
  const on = el => el.removeClass('off').addClass('on');
  const off = el => el.removeClass('on').addClass('off');

  $('#new_session_btn').click(() => {
    socket.emit('new session');
    off($('.session_set'));
    on($('.new_session'));
  });

  $('#close_session_btn').click(() => {
    socket.emit('close session');
    off($('.new_session'));
    on($('.session_set'));
  });

  $('#exit_session_btn').click(() => {
    socket.emit('session exit');
    off($('.wait_session'));
    on($('.session_set'));
  });

  $('#connect_session_btn').click(() => {
    const nick = $('#nick_input').val();
    const session = $('#session_input').val();
    socket.emit('new player', nick, session);
  });

  $('#start_session_btn').click(() => {
    socket.emit('session start');
    off($('.window_gameset'));
    on($('.main_screen'));
  });

  socket.on('set session number', sessionId => {
    $('.session_number').text(sessionId);
  });

  socket.on('no session', () => {
    on($('.session_warn')).text('세션 번호를 잘못 입력하였습니다.');
  });

  socket.on('session closed', () => {
    off($('.wait_session'));
    on($('.session_set'));
    on($('.session_warn')).text('세션이 종료되었습니다.');
  });

  socket.on('duplicated nick', () => {
    on($('.session_warn')).text('동일한 별명이 존재합니다.');
  });

  socket.on('player added', (sessionId, player) => {
    off($('.session_warn'));
    off($('.session_set'));
    on($('.wait_session'));
    $('.session_number').text(sessionId);
    $('.session_nick > .nick').text(player.nick);
    $('.session_potrait > img').attr("src", `/img/potraits/${player.potraitName}`);
  });

  socket.on('player changed', nicks => {
    $('.player_list').text(`${nicks.join(', ')} (${nicks.length}명)`);
  });

  const changePotrait = () => {
    off($('.wait_session'));
    on($('.potrait_picker'));
    socket.emit('get potrait names');
  };
  $('.session_potrait > img').click(changePotrait);
  $('.session_potrait > button').click(changePotrait);

  socket.on('potrait names', (potraitNames, usedPotraitNames) => {
    const potraits = _.reduce(potraitNames, (memo, potraitName) => {
      return memo + `<img src="/img/potraits/${potraitName}">`;
    }, '');

    console.log(potraits);
    $('.picker_window').append(potraits);
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
    $('.main_display .message_box .new').removeClass('new').removeClass('fadeIn').addClass('old1');
    $('.main_display .message_box').append(`<span class="new ${className} fadeIn" >${msg}</span>`);
    $('.main_display .message_box').scrollTop($('.main_display .message_box')[0].scrollHeight);
  }

  socket.on('main message', msg => { mainMsgShow('main_msg', msg) });
  socket.on('main message big', msg => { mainMsgShow('main_msg_big', msg) });

  socket.on('set bank', msg => {
    $('.bingo_display').append(`
      <div class="namespace delayedFadeIn">
        <div class="animated_bottom_line"></div>
        <div class="changing_name">
          <span>작은 은행</span>
        </div>
      </div>`);
  });

  socket.on('set bank name to bingo', msg => {
    $('.bingo_display .namespace span').addClass('fadeOut');
    $('.bingo_display .namespace').append('<span class="fadeIn">빈고</span>');
  });

  socket.on('set communes', communes => {
    $('.communes_display').append(`
      <div class="communes delayedFadeIn">
        <div class="namespace">
          <div class="animated_bottom_line"></div>
          공동체들
        </div>
      </div>
    `);
  });

  socket.on('add commune', commune => {
    $('.communes_display .communes').append(`
      <div class="commune">
        <i class="fas fa-home animated_icon"></i>
        <h1 class="name delayedFadeIn">${commune.name}</h1>
        <h2 class="members delayedFadeIn">구성원: ${commune.members}명</h2>
      </div>
    `);
  });

});