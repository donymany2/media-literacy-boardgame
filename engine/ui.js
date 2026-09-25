/*
 * 화면 — 시작 화면, 판 그리기, 주사위, 카드 창, 결과 화면.
 * 규칙 계산은 모두 game.js(BG.Game)에 맡기고, 여기서는 보여주기와 입력만 담당합니다.
 * 카드팩 문구는 전부 esc()로 감싸서 넣습니다.
 */
(function () {
  'use strict';

  var BG = window.BG;
  var UI = BG.UI = {};

  var cfg, pack, meta, game;
  var settings = {};            // 시작 화면에서 고른 값 { mode, tokens }
  var view = {};                // 판 배치 계산 결과 { cols, rows, cell }
  var displayPos = [];          // 화면에 보이는 말 위치(애니메이션 중에는 실제 위치와 다를 수 있음)
  var busy = false;
  var boardObserver = null;
  var timers = [];

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
    return game.tokens.length === 1 ? '우리 모둠' : (i + 1) + '번 말';
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

  function topicChip(card) {
    var topic = (meta.topics && meta.topics[card.topic]) || {};
    var name = card.label || topic.name || '';
    if (!name) return '';
    return '<span class="chip topic" style="--topic:' + esc(topic.color || cfg.theme.event) + '">' + esc(name) + '</span>';
  }

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
    settings = { mode: mode, tokens: tokens };

    // 판 영역 크기가 바뀌면(화면 회전, 점수판 줄 수 변화 등) 판을 다시 배치
    var relayout = function () { if (game && !game.over) layoutBoard(); };
    window.addEventListener('resize', relayout);
    if (window.ResizeObserver) boardObserver = new ResizeObserver(relayout);
    showSetup();
  };

  function applyTheme() {
    var root = document.documentElement.style;
    var t = cfg.theme;
    Object.keys(t).forEach(function (k) {
      if (typeof t[k] === 'string') root.setProperty('--' + k, t[k]);
    });
    root.setProperty('--font', cfg.fontFamily);
    document.title = cfg.title;
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', t.bg);
  }

  function showSetup() {
    game = null;
    closeModal();
    var modeButtons = cfg.modes.map(function (m) {
      return '<button class="opt" data-mode="' + esc(m.id) + '" aria-pressed="' + (m === settings.mode) + '">' +
        '<b>' + esc(m.label) + '</b><small>' + m.size + '칸 · 약 ' + m.minutes + '분</small></button>';
    }).join('');
    var tokenButtons = '';
    for (var i = 1; i <= cfg.maxTokens; i++) {
      tokenButtons += '<button class="opt small" data-tokens="' + i + '" aria-pressed="' + (i === settings.tokens) + '"><b>' + i + '</b></button>';
    }

    $('#app').innerHTML =
      '<section class="screen setup">' +
        '<div class="panel setup-card">' +
          (cfg.logo ? '<img class="logo" src="' + esc(cfg.logo) + '" alt="">' : '') +
          '<h1>' + esc(cfg.title) + '</h1>' +
          '<p class="subtitle">' + esc(cfg.subtitle) + '</p>' +
          '<p class="pack-name">카드팩 · ' + esc(meta.name || pack.id) + '</p>' +
          '<h2>판 크기</h2><div class="opts" id="mode-opts">' + modeButtons + '</div>' +
          '<h2>말 개수 <small>(1 = 모둠 전체가 말 하나)</small></h2><div class="opts" id="token-opts">' + tokenButtons + '</div>' +
          '<button class="btn big primary" id="start-btn">시작하기</button>' +
          '<details class="rules"><summary>놀이 방법</summary><ol>' +
            '<li>주사위를 굴려 나온 수만큼 말이 움직여요.</li>' +
            '<li><b>카드 칸</b>에 서면 카드가 나와요. 모둠이 함께 이야기하고 선택지를 골라요.</li>' +
            '<li>선택에 따라 <b>' + esc(label('trust')) + ' 점수</b>와 <b>' + esc(label('judgment')) + ' 점수</b>가 바뀌고, 앞으로 가거나 미끄러져요.</li>' +
            '<li>카드 때문에 미끄러지면, 다음 차례에 <b>되돌아보기</b>로 이유를 말하고 점수를 되찾을 수 있어요.</li>' +
            '<li><b>지름길</b>과 <b>미끄럼틀</b>은 운이에요. <b>선생님 칸</b>에서는 선생님을 불러요.</li>' +
            '<li>누가 먼저가 아니라, 모두 함께 도착하는 게 목표예요.</li>' +
          '</ol></details>' +
          '<p class="privacy">이름이나 기록을 저장하지 않아요. 창을 닫으면 모두 지워져요.</p>' +
        '</div>' +
      '</section>';

    $('#mode-opts').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]');
      if (!b) return;
      settings.mode = cfg.modes.filter(function (m) { return m.id === b.dataset.mode; })[0];
      pressOnly(this, b);
    });
    $('#token-opts').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tokens]');
      if (!b) return;
      settings.tokens = +b.dataset.tokens;
      pressOnly(this, b);
    });
    $('#start-btn').addEventListener('click', startGame);
  }

  function pressOnly(group, btn) {
    group.querySelectorAll('[aria-pressed]').forEach(function (x) { x.setAttribute('aria-pressed', x === btn); });
  }

  /* ================= 게임 화면 ================= */

  function startGame() {
    game = new BG.Game({
      pack: pack,
      size: settings.mode.size,
      tokens: settings.tokens,
      endWhen: cfg.endWhen,
      dieFaces: cfg.dieFaces
    });
    displayPos = game.tokens.map(function () { return 1; });
    busy = false;

    $('#app').innerHTML =
      '<section class="screen game">' +
        '<header class="topbar">' +
          '<span class="game-title">' + esc(cfg.title) + '</span>' +
          '<span class="mode-tag">' + esc(settings.mode.label) + ' ' + game.size + '칸</span>' +
          '<button class="btn small ghost" id="stop-btn">끝내기</button>' +
        '</header>' +
        '<div class="board-wrap" id="board-wrap">' +
          '<div class="board" id="board"></div>' +
        '</div>' +
        '<aside class="side">' +
          '<div class="turn" id="turn"></div>' +
          '<div class="dice-row">' +
            '<div class="die" id="die" aria-hidden="true"></div>' +
            '<button class="btn big primary" id="roll-btn">주사위 굴리기</button>' +
          '</div>' +
          '<p class="status" id="status" aria-live="polite"></p>' +
          '<div class="scores" id="scores"></div>' +
        '</aside>' +
      '</section>';

    renderBoard();
    if (boardObserver) boardObserver.observe($('#board-wrap'));
    renderDie(1);
    $('#roll-btn').addEventListener('click', takeTurn);
    $('#stop-btn').addEventListener('click', function () {
      // 브라우저 confirm()은 일부 미리보기 환경에서 막히므로 게임 안 창으로 확인
      if (busy) return;
      var m = openModal('<h2 class="card-title">게임을 끝내고 결과를 볼까요?</h2>' +
        '<div class="btn-row"><button class="btn big primary" data-yes>결과 보기</button>' +
        '<button class="btn big ghost" data-no>계속하기</button></div>', 'card');
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
      if ((t.type === 'up' || t.type === 'down') && t.to) lbl = (lbl || '') + ' ' + t.to;
      html += '<div class="tile t-' + t.type + (t.deck ? ' d-' + esc(t.deck) : '') + ' tone-' + (n % 4) + '" data-n="' + n + '">' +
        '<span class="num">' + n + '</span>' +
        '<span class="art">' + artHtml(t.art) + '</span>' +
        (lbl ? '<span class="lbl">' + esc(lbl) + '</span>' : '') +
      '</div>';
    }
    html += '<svg class="jumps" id="jumps" aria-hidden="true"></svg><div class="tokens" id="tokens"></div>';
    $('#board').innerHTML = html;
    $('#tokens').innerHTML = game.tokens.map(function (tk, i) {
      return '<span class="token" data-token="' + i + '" style="--c:' + tokenColor(i) + '">' + (game.tokens.length > 1 ? i + 1 : '') + '</span>';
    }).join('');
    layoutBoard();
  }

  // 판이 들어갈 공간에 맞춰 가로·세로 칸 수와 칸 크기를 정함 (태블릿 가로 / 휴대폰 세로 모두)
  function layoutBoard() {
    var wrap = $('#board-wrap');
    if (!wrap) return;
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
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

  // 지름길(사다리 모양)과 미끄럼틀(구불구불한 띠)
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
        var gap = c * 0.13, s = c * 0.22;
        var ax = a.x + ux * s, ay = a.y + uy * s, bx = b.x - ux * s, by = b.y - uy * s;
        out += '<g class="ladder">';
        out += line(ax + px * gap, ay + py * gap, bx + px * gap, by + py * gap);
        out += line(ax - px * gap, ay - py * gap, bx - px * gap, by - py * gap);
        var rungs = Math.max(2, Math.floor((len - 2 * s) / (c * 0.28)));
        for (var k = 1; k < rungs; k++) {
          var f = k / rungs, rx = ax + (bx - ax) * f, ry = ay + (by - ay) * f;
          out += line(rx + px * gap, ry + py * gap, rx - px * gap, ry - py * gap);
        }
        out += '</g>';
      } else {
        var bend = Math.min(len * 0.35, c * 1.1);
        var c1x = a.x + dx / 3 + px * bend, c1y = a.y + dy / 3 + py * bend;
        var c2x = a.x + 2 * dx / 3 - px * bend, c2y = a.y + 2 * dy / 3 - py * bend;
        var d = 'M' + r(a.x) + ' ' + r(a.y) + ' C' + r(c1x) + ' ' + r(c1y) + ' ' + r(c2x) + ' ' + r(c2y) + ' ' + r(b.x) + ' ' + r(b.y);
        out += '<g class="slide"><path class="slide-body" d="' + d + '" style="stroke-width:' + r(c * 0.2) + '"/>' +
          '<path class="slide-stripe" d="' + d + '" style="stroke-width:' + r(c * 0.06) + '"/>' +
          '<circle class="slide-end" cx="' + r(b.x) + '" cy="' + r(b.y) + '" r="' + r(c * 0.12) + '"/></g>';
      }
    }
    svg.innerHTML = out;

    function line(x1, y1, x2, y2) {
      return '<line x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '"/>';
    }
    function r(v) { return Math.round(v * 10) / 10; }
  }

  // 말 그리기 — 같은 칸에 여러 말이 있으면 조금씩 비껴 놓음
  function placeTokens(instant) {
    var c = view.cell;
    var sizePx = Math.max(18, Math.round(c * 0.36));
    var groups = {};
    displayPos.forEach(function (pos, i) { (groups[pos] = groups[pos] || []).push(i); });
    document.querySelectorAll('#tokens .token').forEach(function (el) {
      var i = +el.dataset.token;
      var pos = displayPos[i];
      var group = groups[pos];
      var k = group.indexOf(i), m = group.length;
      var center = centerOf(pos);
      var off = m > 1 ? (k - (m - 1) / 2) * sizePx * 0.55 : 0;
      el.classList.toggle('instant', !!instant);
      el.classList.toggle('active', game && i === game.current && !game.over);
      el.style.width = el.style.height = sizePx + 'px';
      el.style.fontSize = Math.round(sizePx * 0.55) + 'px';
      el.style.left = (center.x - sizePx / 2 + off) + 'px';
      el.style.top = (center.y - sizePx / 2 + c * 0.12 + (m > 2 && k % 2 ? sizePx * 0.3 : 0)) + 'px';
    });
  }

  async function animatePath(tokenIndex, path, jump) {
    for (var i = 0; i < path.length; i++) {
      displayPos[tokenIndex] = path[i];
      placeTokens(false);
      var el = $('#tokens [data-token="' + tokenIndex + '"]');
      if (el) el.classList.toggle('flying', !!jump);
      await wait(jump ? 650 : cfg.stepMs);
    }
    var el2 = $('#tokens [data-token="' + tokenIndex + '"]');
    if (el2) el2.classList.remove('flying');
  }

  function renderPanel() {
    var t = game.currentToken();
    $('#turn').innerHTML = '<span class="dot" style="--c:' + tokenColor(t.id) + '"></span>' +
      '<b>' + esc(tokenName(t.id)) + '</b> 차례';
    $('#scores').innerHTML = game.tokens.map(function (tk, i) {
      return '<div class="score-row' + (i === game.current ? ' current' : '') + '">' +
        '<span class="dot" style="--c:' + tokenColor(i) + '"></span>' +
        '<span class="who">' + esc(tokenName(i)) + (tk.finished ? ' · 도착' : ' · ' + tk.pos + '칸') + '</span>' +
        '<span class="pt trust" title="주 점수">' + esc(label('trust')) + ' <b>' + tk.trust + '</b></span>' +
        '<span class="pt judgment" title="보조 점수">' + esc(label('judgment')) + ' <b>' + tk.judgment + '</b></span>' +
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
    if (land.kind === 'jump') {
      var up = land.dir === 'up';
      toast((up ? '지름길! ' : '미끄럼틀! ') + move.to + ' → ' + land.to, up ? 'good' : 'bad');
      await wait(500);
      var j = game.applyJump();
      await animatePath(idx, j.path, true);
    } else if (land.kind === 'card') {
      var card = game.drawCard(land.deck);
      if (card) {
        var choice = await showCard(card);
        var res = game.resolveCard(card, choice);
        renderPanel();
        if (res.move) await animatePath(idx, res.move.path);
      }
    } else if (land.kind === 'teacher') {
      var tr = await showTeacher();
      var tres = game.resolveTeacher(tr.level, tr.prompt);
      if (tres.move) await animatePath(idx, tres.move.path);
    }

    displayPos[idx] = game.tokens[idx].pos;
    if (game.tokens[idx].finished) {
      toast(tokenName(idx) + ' 도착!', 'good');
      await wait(700);
    }

    game.endTurn();
    if (game.over) { await wait(400); showResult(); return; }
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
    die.classList.add('rolling');
    for (var i = 0; i < 8; i++) {
      renderDie(1 + Math.floor(Math.random() * (cfg.dieFaces || 6)));
      await wait(70);
    }
    renderDie(finalValue);
    die.classList.remove('rolling');
    await wait(250);
  }

  /* ================= 창(모달) ================= */

  function openModal(html, cls) {
    clearTimers();
    $('#modal-root').innerHTML = '<div class="overlay"><div class="modal panel ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div></div>';
    var m = $('#modal-root .modal');
    var focus = m.querySelector('button');
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

  function cardHead(card) {
    var typeName = (meta.cardTypes && meta.cardTypes[card.type]) || card.type;
    return '<div class="card-head"><span class="chip type t-' + esc(card.type) + '">' + esc(typeName) + '</span>' + topicChip(card) + '</div>' +
      '<h2 class="card-title">' + esc(card.title) + '</h2>' +
      '<p class="situation">' + esc(card.situation) + '</p>';
  }

  // 카드 보여주기 → 모둠이 고르고 '결정' → 결과 확인 → 고른 번호를 돌려줌
  function showCard(card) {
    return new Promise(function (resolve) {
      if (card.type === 'chance') {
        var m0 = openModal(cardHead(card) +
          '<div class="result-box">' + (card.feedback ? '<p>' + esc(card.feedback) + '</p>' : '') +
          '<div class="chips">' + effectChips(card.effect) + '</div></div>' +
          '<button class="btn big primary" data-ok>확인</button>', 'card chance');
        m0.querySelector('[data-ok]').addEventListener('click', function () { closeModal(); resolve(0); });
        return;
      }

      var isQuiz = card.type === 'quiz';
      var items = isQuiz ? card.options : card.choices;
      var body = cardHead(card) +
        (isQuiz ? '<p class="question">' + esc(card.question) + '</p>' : '') +
        (!isQuiz && cfg.discussionSeconds ? '<div class="timer"><div class="timer-bar" id="timer-bar"></div><span id="timer-text"></span></div>' : '') +
        '<p class="hint">' + (isQuiz ? '모둠이 의논해서 답을 골라 주세요.' : '모둠이 함께 이야기하고 하나를 골라 주세요.') + '</p>' +
        '<div class="choices' + (isQuiz ? ' quiz' : '') + '">' + items.map(function (c, i) {
          return '<button class="choice" data-i="' + i + '" aria-pressed="false">' +
            '<span class="choice-label">' + esc(c.label || String.fromCharCode(65 + i)) + '</span>' +
            '<span class="choice-text">' + esc(c.text) + '</span></button>';
        }).join('') + '</div>' +
        '<button class="btn big primary" data-confirm disabled>이걸로 결정!</button>';
      var m = openModal(body, 'card ' + card.type);
      var picked = null;

      if (!isQuiz && cfg.discussionSeconds) startTimer(cfg.discussionSeconds);

      m.querySelector('.choices').addEventListener('click', function (e) {
        var b = e.target.closest('.choice');
        if (!b) return;
        picked = +b.dataset.i;
        pressOnly(this, b);
        m.querySelector('[data-confirm]').disabled = false;
      });

      m.querySelector('[data-confirm]').addEventListener('click', function () {
        if (picked === null) return;
        var out = game.outcomeOf(card, picked);
        var chosen = items[picked];
        var headline = isQuiz
          ? (out.correct ? '<p class="verdict good">정답이에요!</p>' : '<p class="verdict bad">아쉬워요. 정답은 ' + esc(card.options[card.answer].label) + '</p>')
          : '<p class="picked">우리의 선택: <b>' + esc(chosen.label ? chosen.label + '. ' : '') + esc(chosen.text) + '</b></p>';
        var m2 = openModal(cardHead(card) +
          '<div class="result-box">' + headline +
          (out.feedback ? '<p>' + esc(out.feedback) + '</p>' : '') +
          '<div class="chips">' + effectChips(out.effect) + '</div></div>' +
          '<button class="btn big primary" data-ok>확인</button>', 'card ' + card.type + ' result');
        m2.querySelector('[data-ok]').addEventListener('click', function () { closeModal(); resolve(picked); });
      });
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
    return new Promise(function (resolve) {
      var m = openModal(
        '<div class="card-head"><span class="chip type t-reflect">' + esc(def.title || '되돌아보기') + '</span></div>' +
        '<h2 class="card-title">' + esc(def.prompt || '') + '</h2>' +
        '<p class="situation">지난 차례에 <b>' + esc(reason.title) + '</b> 카드' +
          (reason.choice ? '에서 고른 선택 「' + esc(reason.choice) + '」 때문에' : ' 때문에') +
          ' ' + reason.slid + '칸 미끄러졌어요.</p>' +
        (def.hint ? '<p class="hint">' + esc(def.hint) + '</p>' : '') +
        '<div class="btn-row">' +
          '<button class="btn big primary" data-yes>설명했어요 <span class="chips">' + effectChips(def.success || {}) + '</span></button>' +
          '<button class="btn big ghost" data-no>통과</button>' +
        '</div>', 'card reflect');
      m.querySelector('[data-yes]').addEventListener('click', function () { closeModal(); resolve(true); });
      m.querySelector('[data-no]').addEventListener('click', function () { closeModal(); resolve(false); });
    });
  }

  function showTeacher() {
    var def = meta.teacher || {};
    var prompts = def.prompts || [];
    var levels = def.levels || [];
    var k = Math.floor(Math.random() * Math.max(1, prompts.length));
    return new Promise(function (resolve) {
      var m = openModal(
        '<div class="card-head"><span class="chip type t-teacher">' + esc(def.title || '선생님께 질문하기') + '</span></div>' +
        '<h2 class="card-title">' + esc(def.intro || '') + '</h2>' +
        (prompts.length ? '<p class="question" id="t-prompt"></p><button class="btn small ghost" data-next>다른 질문</button>' : '') +
        '<p class="hint">선생님이 평가해 주세요.</p>' +
        '<div class="btn-col">' + levels.map(function (lv, i) {
          return '<button class="btn big' + (i === 0 ? ' primary' : '') + '" data-level="' + i + '">' + esc(lv.label) +
            ' <span class="chips">' + effectChips(lv.effect || {}) + '</span></button>';
        }).join('') + '</div>', 'card teacher');
      function showPrompt() { var el = m.querySelector('#t-prompt'); if (el) el.textContent = prompts[k]; }
      showPrompt();
      var next = m.querySelector('[data-next]');
      if (next) next.addEventListener('click', function () { k = (k + 1) % prompts.length; showPrompt(); });
      m.querySelector('.btn-col').addEventListener('click', function (e) {
        var b = e.target.closest('[data-level]');
        if (!b) return;
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
    setTimeout(function () { el.classList.add('out'); }, 1400);
    setTimeout(function () { el.remove(); }, 1900);
  }

  /* ================= 결과 ================= */

  function showResult() {
    closeModal();
    var sum = game.summary();
    var topics = meta.topics || {};
    var cardsById = {};
    (pack.cards || []).forEach(function (c) { cardsById[c.id] = c; });

    var tokenCards = sum.tokens.map(function (t) {
      return '<div class="panel result-token">' +
        '<h3><span class="dot" style="--c:' + tokenColor(t.id) + '"></span>' + esc(tokenName(t.id)) + '</h3>' +
        '<div class="big-scores">' +
          '<div class="big-score trust"><small>' + esc(label('trust')) + ' 점수</small><b>' + t.trust + '</b></div>' +
          '<div class="big-score judgment"><small>' + esc(label('judgment')) + ' 점수</small><b>' + t.judgment + '</b></div>' +
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
        seen[e.topic] = (seen[e.topic] || 0) + 1;
        var card = cardsById[e.cardId] || {};
        var mark = e.cardType === 'quiz' ? (e.correct ? ' (정답)' : ' (오답)') : '';
        return '<li>' + who + topicChip(card) + '<b>' + esc(e.title) + '</b>' +
          (e.choice ? '<span class="log-choice">' + esc(e.choice) + mark + '</span>' : '') +
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
        '<h1>' + esc(cfg.title) + ' · 결과</h1>' +
        '<div class="result-tokens">' + tokenCards + '</div>' +
        '<div class="panel"><h2>이번 판에서 만난 주제</h2><div class="chips wrap">' + topicList + '</div></div>' +
        (logItems ? '<div class="panel"><h2>우리가 만난 카드</h2><ol class="log">' + logItems + '</ol></div>' : '') +
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
