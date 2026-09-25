/*
 * 화면 — 시작 화면, 판 그리기, 주사위, 카드 창, 결과 화면.
 * 규칙 계산은 모두 game.js(BG.Game)에 맡기고, 여기서는 보여주기·소리·입력만 담당합니다.
 * 카드팩 문구는 전부 esc()로 감싸서 넣습니다.
 */
(function () {
  'use strict';

  var BG = window.BG;
  var UI = BG.UI = {};
  var sound = BG.Sound;

  var cfg, pack, meta, game;
  var settings = {};            // 시작 화면에서 고른 값 { mode, tokens }
  var view = {};                // 판 배치 계산 결과 { cols, rows, cell }
  var displayPos = [];          // 화면에 보이는 말 위치(애니메이션 중에는 실제 위치와 다를 수 있음)
  var busy = false;
  var timers = [];
  var boardObserver = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 이 기기 브라우저에 "이미 나온 카드 번호"만 기억 (이름 등 개인정보는 저장하지 않음)
  function cardMemory() {
    var key = 'updown-road-seen:' + pack.id;
    return {
      load: function () {
        try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
      },
      save: function (ids) {
        try { localStorage.setItem(key, JSON.stringify(ids)); } catch (e) { /* 저장소를 못 쓰면 기억 없이 진행 */ }
      },
      clear: function () {
        try { localStorage.removeItem(key); } catch (e) { /* 무시 */ }
      }
    };
  }

  function seenCount() {
    var ids = {};
    (pack.cards || []).forEach(function (c) { ids[c.id] = true; });
    return cardMemory().load().filter(function (id) { return ids[id]; }).length;
  }

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 이모지 또는 이미지 경로
  function artHtml(art) {
    if (!art) return '';
    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(art)) return '<img src="' + esc(art) + '" alt="">';
    return esc(art);
  }

  function tokenName(i) {
    return game.tokens.length === 1 ? '우리 모둠' : (i + 1) + '모둠';
  }

  function tokenColor(i) {
    var colors = cfg.theme.tokenColors;
    return colors[i % colors.length];
  }

  function label(key) {
    return (meta.scoreLabels && meta.scoreLabels[key]) || key;
  }

  function effectChips(effect) {
    return BG.describeEffect(effect, meta.scoreLabels).map(function (e) {
      var cls = e.good === true ? 'good' : e.good === false ? 'bad' : 'even';
      return '<span class="chip ' + cls + '">' + esc(e.text) + '</span>';
    }).join('');
  }

  function isGood(effect) {
    var sum = (effect.trust || 0) + (effect.judgment || 0) + (effect.move || 0);
    return sum > 0;
  }

  function topicChip(card) {
    var topic = (meta.topics && meta.topics[card.topic]) || {};
    var name = card.label || topic.name || '';
    if (!name) return '';
    return '<span class="chip topic" style="--topic:' + esc(topic.color || cfg.theme.ink) + '">' + esc(name) + '</span>';
  }

  var ICONS = {
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    trust: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" fill="currentColor"/></svg>',
    judgment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2zM9 20h6v2H9z" fill="currentColor"/></svg>'
  };

  /* ================= 시작 ================= */

  UI.start = function (config, p, overrides) {
    cfg = config;
    pack = p;
    meta = p.meta || {};
    applyTheme();

    var mode = cfg.modes.filter(function (m) { return m.id === overrides.mode; })[0] ||
               cfg.modes.filter(function (m) { return m.id === cfg.defaultMode; })[0] || cfg.modes[0];
    var tokens = parseInt(overrides.tokens, 10);
    if (!(tokens >= 1 && tokens <= cfg.maxTokens)) tokens = cfg.defaultTokens;
    settings = { mode: mode, tokens: tokens, randomBoard: cfg.randomBoard !== false };

    // 판 영역 크기가 바뀌면(화면 회전, 점수판 줄 수 변화 등) 판을 다시 배치
    var relayout = function () { if (game && !game.over) layoutBoard(); };
    window.addEventListener('resize', relayout);
    if (window.ResizeObserver) boardObserver = new ResizeObserver(relayout);

    // 브라우저는 사용자가 한 번 누른 뒤에야 소리를 허락함
    document.addEventListener('pointerdown', sound.unlock, { once: true });
    showSetup();
  };

  function applyTheme() {
    var root = document.documentElement.style;
    var t = cfg.theme;
    Object.keys(t).forEach(function (k) {
      if (typeof t[k] === 'string') root.setProperty('--' + k, t[k]);
    });
    root.setProperty('--font', cfg.fontFamily);
    root.setProperty('--display', cfg.displayFont || cfg.fontFamily);
    root.setProperty('--numfont', cfg.numberFont || cfg.fontFamily);
    document.title = cfg.title;
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', t.bg);
  }

  function soundButton() {
    var off = sound.isMuted();
    return '<button class="icon-btn" id="sound-btn" aria-pressed="' + !off + '" title="효과음 ' + (off ? '켜기' : '끄기') + '">' +
      (off ? ICONS.mute : ICONS.sound) + '<span>' + (off ? '소리 꺼짐' : '소리 켜짐') + '</span></button>';
  }

  function bindSoundButton() {
    var b = $('#sound-btn');
    if (!b) return;
    b.addEventListener('click', function () {
      sound.setMuted(!sound.isMuted());
      b.outerHTML = soundButton();
      bindSoundButton();
      sound.tap();
    });
  }

  function showSetup() {
    game = null;
    closeModal();
    var modeButtons = cfg.modes.map(function (m) {
      return '<button class="opt" data-mode="' + esc(m.id) + '" aria-pressed="' + (m === settings.mode) + '">' +
        '<b>' + esc(m.label) + '</b><small>' + m.size + '칸</small></button>';
    }).join('');
    var boardButtons =
      '<button class="opt" data-board="random" aria-pressed="' + settings.randomBoard + '"><b>매번 새 판</b><small>길이 매번 바뀜</small></button>' +
      '<button class="opt" data-board="fixed" aria-pressed="' + !settings.randomBoard + '"><b>고정 판</b><small>늘 같은 길</small></button>';
    var tokenButtons = '';
    for (var i = 1; i <= cfg.maxTokens; i++) {
      tokenButtons += '<button class="opt tok" data-tokens="' + i + '" aria-pressed="' + (i === settings.tokens) + '" style="--c:' + tokenColor(i - 1) + '"><b>' + i + '</b></button>';
    }

    $('#app').innerHTML =
      '<section class="screen setup">' +
        '<div class="setup-top">' + soundButton() + '</div>' +
        '<div class="cover">' +
          '<div class="cover-art" aria-hidden="true">' +
            (cfg.logo ? '<img class="logo" src="' + esc(cfg.logo) + '" alt="">' : '') +
          '</div>' +
          '<h1 class="wordmark">' + wordmark(cfg.title) + '</h1>' +
          '<p class="subtitle">' + esc(cfg.subtitle) + '</p>' +
          '<p class="pack-name">카드팩 · ' + esc(meta.name || pack.id) + ' · 카드 ' + (pack.cards || []).length + '장</p>' +
          '<div class="setup-grid">' +
            '<div class="field"><h2>판 크기</h2><div class="opts" id="mode-opts">' + modeButtons + '</div></div>' +
            '<div class="field"><h2>판 배치</h2><div class="opts" id="board-opts">' + boardButtons + '</div></div>' +
            '<div class="field"><h2>모둠 수 <small>한 화면에서 함께 겨루는 모둠</small></h2><div class="opts tokens-opts" id="token-opts">' + tokenButtons + '</div></div>' +
          '</div>' +
          '<button class="btn big primary start" id="start-btn">시작하기</button>' +
          '<details class="rules"><summary>놀이 방법</summary><ol>' +
            '<li>모둠마다 차례로 주사위를 굴려 나온 수만큼 말이 움직여요.</li>' +
            '<li>도착한 칸마다 <b>딜레마</b>, <b>돌발 퀴즈</b>, <b>돌발 상황</b>이 기다려요.</li>' +
            '<li>딜레마는 정답이 하나가 아니에요. 모둠이 토의해서 고르고, <b>고른 이유</b>를 말하면 ' + esc(label('judgment')) + ' 점수를 더 받아요.</li>' +
            '<li>선택에 따라 <b>' + esc(label('trust')) + '</b>와 <b>' + esc(label('judgment')) + '</b> 점수가 바뀌고, 앞으로 가거나 미끄러져요.</li>' +
            '<li><b>업로드</b> 칸은 위로 슝, <b>다운로드</b> 칸은 아래로 쭉! <b>선생님 칸</b>에서는 선생님을 불러요.</li>' +
            '<li>판 배치를 "매번 새 판"으로 하면 업로드·다운로드 위치와 칸의 카드 종류가 게임마다 바뀌어요.</li>' +
            '<li>누가 먼저가 아니라, 모든 모둠이 함께 도착하는 게 목표예요.</li>' +
          '</ol></details>' +
          (cfg.rememberCards !== false ? '<p class="memory" id="memory-line"></p>' : '') +
          '<p class="privacy">이름이나 점수는 저장하지 않아요. 카드를 골고루 보도록 이 기기에 나온 카드 번호만 기억해요.</p>' +
        '</div>' +
        (cfg.credit ? '<p class="credit">' + esc(cfg.credit) + '</p>' : '') +
      '</section>';

    $('#mode-opts').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]');
      if (!b) return;
      settings.mode = cfg.modes.filter(function (m) { return m.id === b.dataset.mode; })[0];
      pressOnly(this, b);
      sound.tap();
    });
    $('#token-opts').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tokens]');
      if (!b) return;
      settings.tokens = +b.dataset.tokens;
      pressOnly(this, b);
      sound.tap();
    });
    $('#board-opts').addEventListener('click', function (e) {
      var b = e.target.closest('[data-board]');
      if (!b) return;
      settings.randomBoard = b.dataset.board === 'random';
      pressOnly(this, b);
      sound.tap();
    });
    $('#start-btn').addEventListener('click', startGame);
    bindSoundButton();
    renderMemoryLine();
  }

  function renderMemoryLine() {
    var el = $('#memory-line');
    if (!el) return;
    var n = seenCount(), total = (pack.cards || []).length;
    el.innerHTML = '이 기기에서 나온 카드 <b>' + n + ' / ' + total + '장</b>' +
      (n ? ' <button class="linklike" id="memory-reset">기록 지우기</button>' : '');
    var b = $('#memory-reset');
    if (b) b.addEventListener('click', function () { cardMemory().clear(); renderMemoryLine(); sound.tap(); });
  }

  // 제목 글자 하나하나를 살짝 다른 높이로 — 오르락내리락 느낌
  function wordmark(title) {
    return Array.from(title).map(function (ch, i) {
      if (ch === ' ') return '<span class="wm-space"> </span>';
      return '<span class="wm-ch" style="--i:' + i + '">' + esc(ch) + '</span>';
    }).join('');
  }

  function pressOnly(group, btn) {
    group.querySelectorAll('[aria-pressed]').forEach(function (x) { x.setAttribute('aria-pressed', x === btn); });
  }

  /* ================= 게임 화면 ================= */

  function startGame() {
    sound.unlock();
    game = new BG.Game({
      pack: pack,
      size: settings.mode.size,
      tokens: settings.tokens,
      endWhen: cfg.endWhen,
      dieFaces: cfg.dieFaces,
      randomBoard: settings.randomBoard,
      cardMemory: cfg.rememberCards !== false ? cardMemory() : null
    });
    displayPos = game.tokens.map(function () { return 1; });
    busy = false;

    $('#app').innerHTML =
      '<section class="screen game">' +
        '<header class="topbar">' +
          '<span class="game-title">' + esc(cfg.title) + '</span>' +
          '<span class="mode-tag">' + esc(settings.mode.label) + ' ' + game.size + '칸' + (settings.randomBoard ? ' · 새 판' : '') + '</span>' +
          '<span class="spacer"></span>' +
          soundButton() +
          '<button class="btn small ghost" id="stop-btn">끝내기</button>' +
        '</header>' +
        '<div class="board-wrap" id="board-wrap">' +
          '<div class="board" id="board"></div>' +
        '</div>' +
        '<aside class="side">' +
          '<div class="turn" id="turn"></div>' +
          '<div class="dice-row">' +
            '<div class="die-stage"><div class="die" id="die" aria-hidden="true"></div></div>' +
            '<button class="btn big primary roll" id="roll-btn">주사위 굴리기</button>' +
          '</div>' +
          '<p class="status" id="status" aria-live="polite"></p>' +
          '<div class="scores" id="scores"></div>' +
        '</aside>' +
      '</section>';

    renderBoard();
    if (boardObserver) boardObserver.observe($('#board-wrap'));
    renderDie(1);
    bindSoundButton();
    $('#roll-btn').addEventListener('click', takeTurn);
    $('#stop-btn').addEventListener('click', function () {
      // 브라우저 confirm()은 일부 미리보기 환경에서 막히므로 게임 안 창으로 확인
      if (busy) return;
      var m = openModal('<div class="card-body"><h2 class="card-title">게임을 끝내고 결과를 볼까요?</h2>' +
        '<div class="btn-row"><button class="btn big primary" data-yes>결과 보기</button>' +
        '<button class="btn big ghost" data-no>계속하기</button></div></div>', 'card plain');
      m.querySelector('[data-yes]').addEventListener('click', function () { game.stop(); showResult(); });
      m.querySelector('[data-no]').addEventListener('click', closeModal);
    });
    beginTurn();
  }

  function renderBoard() {
    var labels = meta.tileLabels || {};
    var html = '';
    for (var n = 1; n <= game.size; n++) {
      var t = game.tile(n);
      var lbl = t.type === 'event' ? labels[t.deck] : labels[t.type];
      var arrow = '';
      if (t.type === 'up') arrow = '<span class="jump-to">▲ ' + t.to + '</span>';
      if (t.type === 'down') arrow = '<span class="jump-to">▼ ' + t.to + '</span>';
      html += '<div class="tile t-' + t.type + (t.deck ? ' d-' + esc(t.deck) : '') + '" data-n="' + n + '" style="--tilt:' + tilt(n) + 'deg">' +
        '<span class="num">' + n + '</span>' +
        arrow +
        '<span class="art">' + artHtml(t.art) + '</span>' +
        (lbl ? '<span class="lbl">' + esc(lbl) + '</span>' : '') +
      '</div>';
    }
    html += '<svg class="jumps" id="jumps" aria-hidden="true"></svg><div class="tokens" id="tokens"></div><div class="fx" id="fx"></div>';
    $('#board').innerHTML = html;
    $('#tokens').innerHTML = game.tokens.map(function (tk, i) {
      return '<span class="token" data-token="' + i + '" style="--c:' + tokenColor(i) + '"><span class="piece"><i>' + (game.tokens.length > 1 ? i + 1 : '') + '</i></span></span>';
    }).join('');
    layoutBoard();
  }

  // 손그림처럼 칸마다 살짝 기울기 (칸 번호로 정해져서 매번 같음)
  function tilt(n) {
    return (((n * 37) % 7) - 3) * 0.35;
  }

  // 판이 들어갈 공간에 맞춰 가로·세로 칸 수와 칸 크기를 정함 (태블릿 가로 / 휴대폰 세로 모두)
  function layoutBoard() {
    var wrap = $('#board-wrap');
    if (!wrap) return;
    var cs = getComputedStyle(wrap);
    var w = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var h = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (w <= 0 || h <= 0) return;
    var size = game.size, best = null;
    for (var cols = 3; cols <= size; cols++) {
      var rows = Math.ceil(size / cols);
      var cell = Math.floor(Math.min(w / cols, h / rows));
      if (!best || cell > best.cell) best = { cols: cols, rows: rows, cell: cell };
    }
    view = best;
    var board = $('#board');
    board.style.width = view.cols * view.cell + 'px';
    board.style.height = view.rows * view.cell + 'px';
    board.style.setProperty('--cell', view.cell + 'px');

    for (var n = 1; n <= size; n++) {
      var p = cellOf(n);
      var el = board.querySelector('[data-n="' + n + '"]');
      el.style.left = p.col * view.cell + 'px';
      el.style.top = p.row * view.cell + 'px';
    }
    drawJumps();
    placeTokens(true);
  }

  // n번 칸의 (열, 행). 왼쪽 아래에서 출발해 한 줄마다 방향을 바꾸는 뱀 모양 경로
  function cellOf(n) {
    var i = n - 1;
    var r = Math.floor(i / view.cols);
    var c = i % view.cols;
    if (r % 2 === 1) c = view.cols - 1 - c;
    return { col: c, row: view.rows - 1 - r };
  }

  function centerOf(n) {
    var p = cellOf(n);
    return { x: (p.col + 0.5) * view.cell, y: (p.row + 0.5) * view.cell };
  }

  // 업로드는 곧은 사다리, 다운로드는 S자 곡선. 그리기와 말 이동이 같은 모양을 씀
  function jumpGeom(n) {
    var t = game.tile(n);
    var a = centerOf(n), b = centerOf(t.to);
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var px = -dy / len, py = dx / len;
    var bend = Math.min(len * 0.35, view.cell * 1.1);
    return {
      a: a, b: b, len: len,
      c1: { x: a.x + dx / 3 + px * bend, y: a.y + dy / 3 + py * bend },
      c2: { x: a.x + 2 * dx / 3 - px * bend, y: a.y + 2 * dy / 3 - py * bend }
    };
  }

  function jumpPoint(n, k) {
    var g = jumpGeom(n);
    if (game.tile(n).type === 'up') return { x: g.a.x + (g.b.x - g.a.x) * k, y: g.a.y + (g.b.y - g.a.y) * k };
    var u = 1 - k;
    return {
      x: u * u * u * g.a.x + 3 * u * u * k * g.c1.x + 3 * u * k * k * g.c2.x + k * k * k * g.b.x,
      y: u * u * u * g.a.y + 3 * u * u * k * g.c1.y + 3 * u * k * k * g.c2.y + k * k * k * g.b.y
    };
  }

  // 업로드(사다리 모양)와 다운로드(구불구불한 미끄럼틀)
  function drawJumps() {
    var svg = $('#jumps');
    var c = view.cell;
    svg.setAttribute('width', view.cols * c);
    svg.setAttribute('height', view.rows * c);
    var out = '';
    for (var n = 1; n <= game.size; n++) {
      var t = game.tile(n);
      if (t.type !== 'up' && t.type !== 'down') continue;
      var a = centerOf(n), b = centerOf(t.to);
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len, px = -uy, py = ux;
      if (t.type === 'up') {
        var gap = c * 0.12, s = c * 0.24;
        var ax = a.x + ux * s, ay = a.y + uy * s, bx = b.x - ux * s, by = b.y - uy * s;
        out += '<g class="ladder">';
        out += line(ax + px * gap, ay + py * gap, bx + px * gap, by + py * gap, 'rail');
        out += line(ax - px * gap, ay - py * gap, bx - px * gap, by - py * gap, 'rail');
        var rungs = Math.max(2, Math.floor((len - 2 * s) / (c * 0.26)));
        for (var k = 1; k < rungs; k++) {
          var f = k / rungs, rx = ax + (bx - ax) * f, ry = ay + (by - ay) * f;
          out += line(rx + px * gap, ry + py * gap, rx - px * gap, ry - py * gap, 'rung');
        }
        out += '</g>';
      } else {
        var g = jumpGeom(n);
        var c1x = g.c1.x, c1y = g.c1.y, c2x = g.c2.x, c2y = g.c2.y;
        var d = 'M' + r(a.x) + ' ' + r(a.y) + ' C' + r(c1x) + ' ' + r(c1y) + ' ' + r(c2x) + ' ' + r(c2y) + ' ' + r(b.x) + ' ' + r(b.y);
        out += '<g class="slide"><path class="slide-edge" d="' + d + '" style="stroke-width:' + r(c * 0.24) + '"/>' +
          '<path class="slide-body" d="' + d + '" style="stroke-width:' + r(c * 0.17) + '"/>' +
          '<path class="slide-stripe" d="' + d + '" style="stroke-width:' + r(c * 0.05) + '"/>' +
          '<circle class="slide-end" cx="' + r(b.x) + '" cy="' + r(b.y) + '" r="' + r(c * 0.12) + '"/></g>';
      }
    }
    svg.innerHTML = out;

    function line(x1, y1, x2, y2, cls) {
      return '<line class="' + cls + '" x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '"/>';
    }
    function r(v) { return Math.round(v * 10) / 10; }
  }

  // 말 그리기 — 같은 칸에 여러 말이 있으면 격자로 나눠 놓음 (최대 8개)
  function placeTokens(instant) {
    var c = view.cell;
    var groups = {};
    displayPos.forEach(function (pos, i) { (groups[pos] = groups[pos] || []).push(i); });
    document.querySelectorAll('#tokens .token').forEach(function (el) {
      var i = +el.dataset.token;
      var pos = displayPos[i];
      var group = groups[pos];
      var k = group.indexOf(i), m = group.length;
      var perRow = m <= 2 ? m : m <= 4 ? 2 : 3;
      var rowsN = Math.ceil(m / perRow);
      var sizePx = Math.max(16, Math.round(c * (m <= 1 ? 0.42 : m <= 4 ? 0.32 : 0.25)));
      var col = k % perRow, row = Math.floor(k / perRow);
      var inRow = Math.min(perRow, m - row * perRow);
      var center = centerOf(pos);
      var step = sizePx * 0.92;
      var x = center.x + (col - (inRow - 1) / 2) * step;
      var y = center.y + (row - (rowsN - 1) / 2) * step + c * 0.06;
      el.classList.toggle('instant', !!instant);
      el.classList.toggle('active', !!game && i === game.current && !game.over);
      el.style.width = el.style.height = sizePx + 'px';
      el.style.fontSize = Math.round(sizePx * 0.5) + 'px';
      el.style.left = (x - sizePx / 2) + 'px';
      el.style.top = (y - sizePx / 2) + 'px';
    });
  }

  // 한 칸씩 통통 뛰어 이동 (앞으로 / 뒤로)
  async function animatePath(tokenIndex, path) {
    var el = $('#tokens [data-token="' + tokenIndex + '"]');
    var back = path.length && path[0] < displayPos[tokenIndex];
    var ms = reduceMotion ? 120 : cfg.stepMs;
    if (el) el.style.setProperty('--hop', ms + 'ms');
    for (var i = 0; i < path.length; i++) {
      displayPos[tokenIndex] = path[i];
      if (el) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }
      placeTokens(false);
      if (back) sound.stepBack(i); else sound.step(i);
      await wait(ms);
    }
    if (el) el.classList.remove('hop');
    if (path.length) { sound.land(); dust(path[path.length - 1]); }
    placeTokens(false);
  }

  // 업로드: 사다리를 천천히 타고 오름 / 다운로드: 미끄럼틀을 따라 빙글빙글 떨어짐
  async function animateJump(tokenIndex, from, to) {
    var up = game.tile(from).type === 'up';
    var el = $('#tokens [data-token="' + tokenIndex + '"]');
    var dur = reduceMotion ? 300 : (up ? 2300 : 2100);
    if (up) sound.climb(dur / 1000); else sound.fall(dur / 1000);
    if (el) el.classList.add('instant', up ? 'climbing' : 'falling');
    var half = el ? el.offsetWidth / 2 : 0;
    var t0 = performance.now();
    await new Promise(function (done) {
      function frame(now) {
        var p = Math.min(1, (now - t0) / dur);
        // 오를 때는 한 칸씩 끙차끙차(계단식), 떨어질 때는 점점 빨라짐
        var k = up ? (p + Math.sin(p * Math.PI * 10) * 0.018) : p * p;
        k = Math.max(0, Math.min(1, k));
        var pt = jumpPoint(from, k);
        if (el) {
          el.style.left = (pt.x - half) + 'px';
          el.style.top = (pt.y - half + view.cell * 0.06) + 'px';
        }
        if (p < 1) requestAnimationFrame(frame); else done();
      }
      requestAnimationFrame(frame);
    });
    displayPos[tokenIndex] = to;
    if (el) el.classList.remove('climbing', 'falling');
    placeTokens(false);
    if (up) {
      sound.cheer(1.8);
      burst(to, cfg.theme.up);
      burst(to, cfg.theme.bg);
    } else {
      sound.sad();
      dust(to);
      var board = $('#board');
      if (board && !reduceMotion) { board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake'); }
    }
    await wait(reduceMotion ? 200 : 1100);
  }

  // 도착한 칸을 잠깐 반짝이게
  async function highlightTile(n) {
    var t = $('#board [data-n="' + n + '"]');
    if (!t) return;
    t.classList.remove('landing'); void t.offsetWidth; t.classList.add('landing');
    await wait(reduceMotion ? 150 : 650);
    t.classList.remove('landing');
  }

  // 결과에 따라 움직이기 전에 "2칸 전진!" 같은 알림
  async function announceMove(move) {
    if (!move || move.from === move.to) return;
    var n = Math.abs(move.to - move.from);
    var fwd = move.to > move.from;
    toast(fwd ? n + '칸 앞으로!' : n + '칸 뒤로...', fwd ? 'up' : 'down');
    await wait(reduceMotion ? 150 : 600);
  }

  function renderPanel() {
    var t = game.currentToken();
    $('#turn').innerHTML = '<span class="dot big" style="--c:' + tokenColor(t.id) + '"></span>' +
      '<span><b>' + esc(tokenName(t.id)) + '</b> 차례</span>';
    $('#scores').innerHTML = game.tokens.map(function (tk, i) {
      return '<div class="score-row' + (i === game.current ? ' current' : '') + (tk.finished ? ' done' : '') + '">' +
        '<span class="dot" style="--c:' + tokenColor(i) + '"></span>' +
        '<span class="who">' + esc(tokenName(i)) + '<small>' + (tk.finished ? '도착' : tk.pos + '칸') + '</small></span>' +
        '<span class="pt trust" title="' + esc(label('trust')) + ' (주 점수)">' + ICONS.trust + '<b>' + tk.trust + '</b></span>' +
        '<span class="pt judgment" title="' + esc(label('judgment')) + ' (보조 점수)">' + ICONS.judgment + '<b>' + tk.judgment + '</b></span>' +
      '</div>';
    }).join('');
    placeTokens(false);
  }

  function setStatus(text) {
    var el = $('#status');
    if (el) el.textContent = text;
  }

  function setBusy(v) {
    busy = v;
    var btn = $('#roll-btn');
    if (btn) btn.disabled = v;
  }

  /* ================= 차례 진행 ================= */

  async function beginTurn() {
    renderPanel();
    var t = game.currentToken();
    if (t.reflect) {
      setBusy(true);
      var explained = await showReflect(t.reflect);
      game.resolveReflect(explained);
      if (explained) sound.good();
      renderPanel();
    }
    setBusy(false);
    setStatus('주사위를 굴려 주세요.');
  }

  async function takeTurn() {
    if (busy || game.over) return;
    setBusy(true);
    var idx = game.current;

    var value = game.rollDie();
    await rollDieAnimation(value);
    setStatus(value + '칸 앞으로!');
    var move = game.moveBy(value);
    await animatePath(idx, move.path);

    var land = game.landing();
    if (land.kind !== 'none' && land.kind !== 'finish') await highlightTile(move.to);

    if (land.kind === 'jump') {
      // 업로드/다운로드 칸은 멈추지 않고 바로 이동
      var up = land.dir === 'up';
      var labels = meta.tileLabels || {};
      toast((up ? (labels.up || '지름길') : (labels.down || '미끄럼틀')) + '! ' + move.to + ' → ' + land.to, up ? 'up' : 'down');
      var from = move.to;
      game.applyJump();
      await animateJump(idx, from, land.to);
      renderPanel();
    } else if (land.kind === 'card') {
      // 카드의 문제·상황을 모두 해결한 뒤에 점수를 반영하고 말을 움직임
      var card = game.drawCard(land.deck);
      if (card) {
        var pick = await showCard(card);
        var res = game.resolveCard(card, pick.choice, { reasoned: pick.reasoned });
        renderPanel();
        if (res.move) {
          await announceMove(res.move);
          await animatePath(idx, res.move.path);
        }
      }
    } else if (land.kind === 'teacher') {
      var tr = await showTeacher();
      var tres = game.resolveTeacher(tr.level, tr.prompt);
      renderPanel();
      if (tres.move) {
        await announceMove(tres.move);
        await animatePath(idx, tres.move.path);
      }
    }

    displayPos[idx] = game.tokens[idx].pos;
    placeTokens(false);
    if (game.tokens[idx].finished) {
      sound.finish();
      confetti(140);
      burst(game.size, cfg.theme.accent);
      toast(tokenName(idx) + ' 도착!', 'up');
      await wait(reduceMotion ? 400 : 3200);
    }

    game.endTurn();
    if (game.over) { await wait(300); showResult(); return; }
    beginTurn();
  }

  /* ================= 주사위 ================= */

  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  function renderDie(v) {
    var on = PIPS[v] || [];
    var html = '';
    for (var i = 0; i < 9; i++) html += '<i' + (on.indexOf(i) >= 0 ? ' class="on"' : '') + '></i>';
    $('#die').innerHTML = html;
    $('#die').setAttribute('data-value', v);
  }

  async function rollDieAnimation(finalValue) {
    var die = $('#die');
    sound.dice();
    die.classList.remove('landed');
    die.classList.add('rolling');
    for (var i = 0; i < 11; i++) {
      renderDie(1 + Math.floor(Math.random() * (cfg.dieFaces || 6)));
      await wait(55 + i * 6);
    }
    renderDie(finalValue);
    die.classList.remove('rolling');
    void die.offsetWidth;
    die.classList.add('landed');
    await wait(260);
  }

  /* ================= 효과 ================= */

  // 칸 위에서 작은 별이 톡톡 터짐
  function burst(n, color) {
    var fx = $('#fx');
    if (!fx) return;
    var c = centerOf(n);
    for (var i = 0; i < 10; i++) {
      var s = document.createElement('i');
      var ang = (Math.PI * 2 * i) / 10, dist = view.cell * (0.5 + Math.random() * 0.3);
      s.style.left = c.x + 'px';
      s.style.top = c.y + 'px';
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      s.style.background = color;
      fx.appendChild(s);
      setTimeout(s.remove.bind(s), 700);
    }
  }

  // 말이 내려앉은 자리에 먼지 퍼짐
  function dust(n) {
    var fx = $('#fx');
    if (!fx || reduceMotion) return;
    var c = centerOf(n);
    var d = document.createElement('b');
    d.className = 'dust';
    d.style.left = c.x + 'px';
    d.style.top = (c.y + view.cell * 0.22) + 'px';
    d.style.width = d.style.height = view.cell * 0.7 + 'px';
    fx.appendChild(d);
    setTimeout(d.remove.bind(d), 500);
  }

  // 도착했을 때 화면 전체에 종이 조각
  function confetti(count) {
    var root = document.createElement('div');
    root.className = 'confetti';
    var colors = cfg.theme.tokenColors;
    for (var i = 0; i < (count || 60); i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.5 + 's';
      p.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      root.appendChild(p);
    }
    document.body.appendChild(root);
    setTimeout(function () { root.remove(); }, 4200);
  }

  /* ================= 창(모달) ================= */

  function openModal(html, cls) {
    clearTimers();
    $('#modal-root').innerHTML = '<div class="overlay"><div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div></div>';
    var m = $('#modal-root .modal');
    var focus = m.querySelector('button:not([disabled])');
    if (focus) focus.focus({ preventScroll: true });
    return m;
  }

  function closeModal() {
    clearTimers();
    $('#modal-root').innerHTML = '';
  }

  function clearTimers() {
    timers.forEach(clearInterval);
    timers = [];
  }

  // 카드 머리: 종류 띠 + 주제 + (바꿔 끼운 조각) + 제목 + 상황
  function cardHead(card) {
    var typeName = (meta.cardTypes && meta.cardTypes[card.type]) || card.type;
    var slotChips = '';
    var slotLabels = meta.slotLabels || {};
    Object.keys(card.picked || {}).forEach(function (slot) {
      var name = meta.slots && meta.slots[slot] && meta.slots[slot][card.picked[slot]];
      if (name) slotChips += '<span class="chip slot"><small>' + esc(slotLabels[slot] || slot) + '</small> ' + esc(name) + '</span>';
    });
    return '<div class="card-band">' +
        '<span class="band-type">' + esc(typeName) + '</span>' + topicChip(card) +
      '</div>' +
      '<div class="card-body">' +
        (slotChips ? '<div class="chips slots">' + slotChips + '</div>' : '') +
        '<h2 class="card-title">' + esc(card.title) + '</h2>' +
        '<p class="situation">' + esc(card.situation) + '</p>';
  }

  // 카드 보여주기 → 고르기 → (딜레마면 이유 말하기) → 결과 → { choice, reasoned }
  function showCard(card) {
    sound.card();
    return new Promise(function (resolve) {
      if (card.type === 'chance') {
        var good = isGood(card.effect || {});
        var m0 = openModal(cardHead(card) +
          '<div class="result-box ' + (good ? 'is-good' : 'is-bad') + '">' + (card.feedback ? '<p>' + esc(card.feedback) + '</p>' : '') +
          '<div class="chips">' + effectChips(card.effect) + '</div></div>' +
          '<button class="btn big primary wide" data-ok>확인</button></div>', 'card k-chance');
        setTimeout(function () { if (good) sound.good(); else sound.bad(); }, 250);
        m0.querySelector('[data-ok]').addEventListener('click', function () { closeModal(); resolve({ choice: 0 }); });
        return;
      }

      var isQuiz = card.type === 'quiz';
      var items = isQuiz ? card.options : card.choices;
      var ox = isQuiz && items.every(function (o) { return o.label === 'O' || o.label === 'X'; });
      var body = cardHead(card) +
        (isQuiz ? '<p class="question">' + esc(card.question) + '</p>' : '') +
        (!isQuiz && cfg.discussionSeconds ? '<div class="timer"><div class="timer-bar" id="timer-bar"></div><span id="timer-text"></span></div>' : '') +
        '<p class="hint">' + (isQuiz ? '모둠이 의논해서 답을 골라 주세요.' : '정답은 하나가 아니에요. 모둠이 이야기해서 하나를 골라 주세요.') + '</p>' +
        '<div class="choices' + (ox ? ' ox' : '') + '">' + items.map(function (c, i) {
          return '<button class="choice" data-i="' + i + '" aria-pressed="false">' +
            '<span class="choice-label">' + esc(c.label) + '</span>' +
            '<span class="choice-text">' + esc(c.text) + '</span></button>';
        }).join('') + '</div>' +
        '<button class="btn big primary wide" data-confirm disabled>이걸로 결정!</button></div>';
      var m = openModal(body, 'card k-' + card.type);
      var picked = null;

      if (!isQuiz && cfg.discussionSeconds) startTimer(cfg.discussionSeconds);

      m.querySelector('.choices').addEventListener('click', function (e) {
        var b = e.target.closest('.choice');
        if (!b) return;
        picked = +b.dataset.i;
        pressOnly(this, b);
        sound.tap();
        m.querySelector('[data-confirm]').disabled = false;
      });

      m.querySelector('[data-confirm]').addEventListener('click', function () {
        if (picked === null) return;
        if (card.type === 'dilemma' && meta.reason && meta.reason.enabled !== false) askReason();
        else showOutcome(false);
      });

      function askReason() {
        var def = meta.reason;
        var chosen = items[picked];
        var m1 = openModal(cardHead(card) +
          '<p class="picked">우리의 선택 <b>' + esc(chosen.label) + '. ' + esc(chosen.text) + '</b></p>' +
          '<div class="reason-box"><h3>이유 말하기</h3><p>' + esc(def.prompt) + '</p>' +
          (def.hint ? '<p class="hint">' + esc(def.hint) + '</p>' : '') + '</div>' +
          '<div class="btn-row">' +
            '<button class="btn big primary" data-yes>이유를 말했어요 <span class="chips">' + effectChips(def.bonus || {}) + '</span></button>' +
            '<button class="btn big ghost" data-no>건너뛰기</button>' +
          '</div></div>', 'card k-dilemma');
        m1.querySelector('[data-yes]').addEventListener('click', function () { sound.tap(); showOutcome(true); });
        m1.querySelector('[data-no]').addEventListener('click', function () { showOutcome(false); });
      }

      function showOutcome(reasoned) {
        var out = game.outcomeOf(card, picked);
        var chosen = items[picked];
        var good = isQuiz ? out.correct : isGood(out.effect);
        var headline = isQuiz
          ? (out.correct ? '<p class="verdict good">정답이에요!</p>' : '<p class="verdict bad">아쉬워요. 정답은 ' + esc(card.options[card.answer].label) + '. ' + esc(card.options[card.answer].text) + '</p>')
          : '<p class="picked">우리의 선택 <b>' + esc(chosen.label) + '. ' + esc(chosen.text) + '</b></p>';
        var bonus = reasoned ? game.reasonBonus() : null;
        var m2 = openModal(cardHead(card) +
          '<div class="result-box ' + (good ? 'is-good' : 'is-bad') + '">' + headline +
          (out.feedback ? '<p>' + esc(out.feedback) + '</p>' : '') +
          '<div class="chips">' + effectChips(out.effect) +
          (bonus ? '<span class="chip bonus">이유 말하기 ' + esc(BG.describeEffect(bonus, meta.scoreLabels).map(function (e) { return e.text; }).join(' ')) + '</span>' : '') +
          '</div></div>' +
          '<button class="btn big primary wide" data-ok>확인</button></div>', 'card k-' + card.type + ' result');
        if (good) sound.good(); else sound.bad();
        m2.querySelector('[data-ok]').addEventListener('click', function () { closeModal(); resolve({ choice: picked, reasoned: reasoned }); });
      }
    });
  }

  function startTimer(seconds) {
    var left = seconds;
    var bar = $('#timer-bar'), text = $('#timer-text');
    function tick() {
      if (!bar) return;
      bar.style.width = (left / seconds * 100) + '%';
      text.textContent = left > 0 ? '토의 시간 ' + left + '초' : '시간이 다 됐어요. 결정해 볼까요?';
      bar.parentNode.classList.toggle('done', left <= 0);
      if (left-- <= 0) clearTimers();
    }
    tick();
    timers.push(setInterval(tick, 1000));
  }

  function showReflect(reason) {
    var def = meta.reflect || {};
    sound.card();
    return new Promise(function (resolve) {
      var m = openModal(
        '<div class="card-band"><span class="band-type">' + esc(def.title || '되돌아보기') + '</span></div>' +
        '<div class="card-body">' +
        '<h2 class="card-title">' + esc(def.prompt || '') + '</h2>' +
        '<p class="situation">지난 차례에 <b>' + esc(reason.title) + '</b> 카드' +
          (reason.choice ? '에서 고른 선택 「' + esc(reason.choice) + '」 때문에' : ' 때문에') +
          ' ' + reason.slid + '칸 미끄러졌어요.</p>' +
        (def.hint ? '<p class="hint">' + esc(def.hint) + '</p>' : '') +
        '<div class="btn-row">' +
          '<button class="btn big primary" data-yes>설명했어요 <span class="chips">' + effectChips(def.success || {}) + '</span></button>' +
          '<button class="btn big ghost" data-no>통과</button>' +
        '</div></div>', 'card k-reflect');
      m.querySelector('[data-yes]').addEventListener('click', function () { closeModal(); resolve(true); });
      m.querySelector('[data-no]').addEventListener('click', function () { closeModal(); resolve(false); });
    });
  }

  function showTeacher() {
    var def = meta.teacher || {};
    var prompts = def.prompts || [];
    var levels = def.levels || [];
    var k = Math.floor(Math.random() * Math.max(1, prompts.length));
    sound.card();
    return new Promise(function (resolve) {
      var m = openModal(
        '<div class="card-band"><span class="band-type">' + esc(def.title || '선생님께 질문하기') + '</span></div>' +
        '<div class="card-body">' +
        '<h2 class="card-title">' + esc(def.intro || '') + '</h2>' +
        (prompts.length ? '<p class="question" id="t-prompt"></p><button class="btn small ghost" data-next>다른 질문</button>' : '') +
        '<p class="hint">선생님이 평가해 주세요.</p>' +
        '<div class="btn-col">' + levels.map(function (lv, i) {
          return '<button class="btn big' + (i === 0 ? ' primary' : '') + '" data-level="' + i + '">' + esc(lv.label) +
            ' <span class="chips">' + effectChips(lv.effect || {}) + '</span></button>';
        }).join('') + '</div></div>', 'card k-teacher');
      function showPrompt() { var el = m.querySelector('#t-prompt'); if (el) el.textContent = prompts[k]; }
      showPrompt();
      var next = m.querySelector('[data-next]');
      if (next) next.addEventListener('click', function () { k = (k + 1) % prompts.length; showPrompt(); sound.tap(); });
      m.querySelector('.btn-col').addEventListener('click', function (e) {
        var b = e.target.closest('[data-level]');
        if (!b) return;
        if (+b.dataset.level === 0) sound.good();
        closeModal();
        resolve({ level: +b.dataset.level, prompt: prompts[k] });
      });
    });
  }

  function toast(text, kind) {
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = text;
    $('#toast-root').appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 1300);
    setTimeout(function () { el.remove(); }, 1800);
  }

  /* ================= 결과 ================= */

  function showResult() {
    closeModal();
    $('#toast-root').innerHTML = '';
    var sum = game.summary();
    var topics = meta.topics || {};
    var cardsById = {};
    (pack.cards || []).forEach(function (c) { cardsById[c.id] = c; });

    var tokenCards = sum.tokens.map(function (t) {
      return '<div class="result-token">' +
        '<h3><span class="dot big" style="--c:' + tokenColor(t.id) + '"></span>' + esc(tokenName(t.id)) + '</h3>' +
        '<div class="big-scores">' +
          '<div class="big-score trust">' + ICONS.trust + '<small>' + esc(label('trust')) + '</small><b>' + t.trust + '</b></div>' +
          '<div class="big-score judgment">' + ICONS.judgment + '<small>' + esc(label('judgment')) + '</small><b>' + t.judgment + '</b></div>' +
        '</div>' +
        '<p class="meta-line">주사위 ' + t.rolls + '번 · ' + (t.finished ? '도착!' : t.pos + '칸까지') + '</p>' +
        t.awards.map(function (a) {
          return '<div class="award"><b>' + esc(a.title) + '</b><span>' + esc(a.message) + '</span></div>';
        }).join('') +
      '</div>';
    }).join('');

    var seen = {};
    var logItems = sum.log.filter(function (e) { return e.kind === 'card' || e.kind === 'reflect' || e.kind === 'teacher'; }).map(function (e) {
      var who = game.tokens.length > 1 ? '<span class="dot" style="--c:' + tokenColor(e.token) + '"></span>' : '';
      if (e.kind === 'card') {
        if (e.topic) seen[e.topic] = (seen[e.topic] || 0) + 1;
        var card = cardsById[e.cardId] || {};
        var mark = e.cardType === 'quiz' ? (e.correct ? ' (정답)' : ' (오답)') : '';
        return '<li>' + who + topicChip(card) + '<b>' + esc(e.title) + '</b>' +
          (e.choice ? '<span class="log-choice">' + esc(e.choice) + mark + '</span>' : '') +
          (e.reasoned ? '<span class="chip bonus">이유 말함</span>' : '') +
          '<span class="chips">' + effectChips(e.effect) + '</span></li>';
      }
      if (e.kind === 'reflect') {
        return '<li class="minor">' + who + '<b>되돌아보기</b><span class="log-choice">' + (e.explained ? '이유를 설명했어요' : '통과') + '</span></li>';
      }
      return '<li class="minor">' + who + '<b>선생님 질문</b><span class="log-choice">' + esc(e.level || '') + '</span></li>';
    }).join('');

    var topicList = Object.keys(topics).map(function (k) {
      return '<span class="chip topic' + (seen[k] ? '' : ' faded') + '" style="--topic:' + esc(topics[k].color) + '">' +
        esc(topics[k].name) + (seen[k] ? ' ' + seen[k] : '') + '</span>';
    }).join('');

    var debrief = ((meta.results && meta.results.debrief) || []).map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('');

    $('#app').innerHTML =
      '<section class="screen result">' +
        '<h1 class="wordmark small">' + wordmark(cfg.title) + '</h1>' +
        '<p class="result-sub">한 판 끝! 우리 모둠의 길을 돌아봐요.</p>' +
        '<div class="result-tokens">' + tokenCards + '</div>' +
        '<div class="panel"><h2>이번 판에서 만난 주제</h2><div class="chips wrap">' + topicList + '</div></div>' +
        (logItems ? '<div class="panel"><h2>우리가 고른 선택</h2><ol class="log">' + logItems + '</ol></div>' : '') +
        (debrief ? '<div class="panel"><h2>함께 이야기해요</h2><ol class="debrief">' + debrief + '</ol></div>' : '') +
        '<div class="btn-row center">' +
          '<button class="btn big primary" id="again-btn">다시 하기</button>' +
          '<button class="btn big ghost" id="home-btn">처음 화면</button>' +
        '</div>' +
      '</section>';
    $('#again-btn').addEventListener('click', startGame);
    $('#home-btn').addEventListener('click', showSetup);
    window.scrollTo(0, 0);
  }
})();
