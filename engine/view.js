/*
 * 화면 그리기 — 판, 말, 주사위, 카드 창, 알림, 결과 화면
 *
 * 게임 진행은 "장면(scene)"의 연속입니다. 선생님 화면(또는 혼자 하기 기기)이 장면을 정하면
 * 모든 기기의 View가 같은 장면을 같은 방식으로 그리고 움직입니다.
 *   turn     : ○모둠 차례 — 주사위 버튼
 *   reflect  : 되돌아보기
 *   roll     : 주사위 굴러감
 *   move     : 말이 한 칸씩 이동
 *   jump     : 업로드(사다리 오르기) / 다운로드(뱀 타고 떨어지기)
 *   highlight: 도착한 칸 반짝
 *   card     : 카드(선택지 고르는 중, selected = 지금 고른 번호)
 *   reason   : 이유 말하기
 *   outcome  : 카드 결과
 *   announce : "2칸 앞으로!" 알림
 *   teacher  : 선생님께 질문하기
 *   finish   : 도착 축하
 *   result   : 결과 화면
 * 버튼을 누르면 View.onAction으로 등록된 함수에 (행동, 값)이 전달됩니다.
 * 카드팩 문구는 전부 esc()로 감싸서 넣습니다.
 */
(function () {
  'use strict';

  var BG = window.BG;
  var V = BG.View = {};
  var sound = BG.Sound;

  var cfg, pack, meta;
  var info = null;              // 지금 게임: { gid, size, layout, teams, speed, modeLabel, randomBoard }
  var board = null;             // 칸 정보 (BG.buildBoard)
  var ctx = { role: 'solo', myTeam: null, room: null };
  var snap = null;              // 말 위치·점수
  var scene = null;             // 지금 장면
  var displayPos = [];          // 화면에 보이는 말 위치
  var grid = {};                // { cols, rows, cell }
  var modal = null;             // 열린 카드 창 { kind, uid }
  var timers = [];
  var presence = {};
  var lastScores = null;        // 점수판에서 바뀐 점수를 톡 튀게 하려고 직전 값을 기억
  var lastTurnRank = null;      // 추월 알림: 직전 차례가 시작될 때의 순위
  var lastActor = null;         // 추월 알림: 직전 차례의 모둠
  var actionHandler = function () {};
  var observer = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  V.esc = esc;

  // 그림: 'svg:이름'(카드팩 art.js) / 이미지 경로 / 이모지
  function artHtml(art) {
    if (!art) return '';
    if (art.indexOf('svg:') === 0) return (pack.art && pack.art[art.slice(4)]) || '';
    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(art)) return '<img src="' + esc(art) + '" alt="">';
    return esc(art);
  }
  V.artHtml = artHtml;

  function teams() { return info ? info.teams : 1; }

  function teamName(i) {
    return teams() === 1 ? '우리 모둠' : (i + 1) + '모둠';
  }
  V.teamName = teamName;

  function teamColor(i) {
    var colors = cfg.theme.tokenColors;
    return colors[i % colors.length];
  }
  V.teamColor = teamColor;

  function label(key) {
    return (meta.scoreLabels && meta.scoreLabels[key]) || key;
  }

  function effectChips(effect) {
    return BG.describeEffect(effect || {}, meta.scoreLabels).map(function (e) {
      var cls = e.good === true ? 'good' : e.good === false ? 'bad' : 'even';
      return '<span class="chip ' + cls + '">' + esc(e.text) + '</span>';
    }).join('');
  }
  V.effectChips = effectChips;

  function isGood(effect) {
    effect = effect || {};
    return (effect.trust || 0) + (effect.judgment || 0) + (effect.move || 0) > 0;
  }

  function topicChip(card) {
    var topic = (meta.topics && meta.topics[card.topic]) || {};
    var name = card.label || topic.name || '';
    if (!name) return '';
    return '<span class="chip topic" style="--topic:' + esc(topic.color || cfg.theme.ink) + '">' + esc(name) + '</span>';
  }
  V.topicChip = topicChip;

  var ICONS = V.ICONS = {
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    trust: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" fill="currentColor"/></svg>',
    judgment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2zM9 20h6v2H9z" fill="currentColor"/></svg>'
  };

  V.init = function (config, p) {
    cfg = config;
    pack = p;
    meta = p.meta || {};
    window.addEventListener('resize', relayout);
    if (window.ResizeObserver) observer = new ResizeObserver(relayout);
  };

  V.onAction = function (fn) { actionHandler = fn; };

  function act(action, value) { actionHandler(action, value, scene); }

  // 이 기기에서 지금 장면의 버튼을 누를 수 있는지
  function canAct(s) {
    s = s || scene;
    if (!s) return false;
    if (ctx.role === 'solo' || ctx.role === 'host') return true;
    if (s.actor === 'host') return false;
    return s.team === ctx.myTeam;
  }
  V.canAct = canAct;

  function relayout() { if (info && $('#board-wrap')) layoutBoard(); }

  // 학급 방(선생님 화면·모둠 태블릿)에서만 경쟁 요소를 켬. 기기 하나로 하기는 조용하게
  function classroom() { return (ctx.role === 'host' || ctx.role === 'team') && teams() > 1; }
  function classCfg() { return cfg.classroom || {}; }

  function rankMap(tokens) {
    var m = {};
    BG.rankTeams(tokens, (info && info.rankBy) || classCfg().rankBy).forEach(function (x) { m[x.team] = x.rank; });
    return m;
  }

  var CROWN = '<svg class="crown" viewBox="0 0 24 18" aria-label="1등"><path d="M2 16 L1 4 L7 9 L12 1 L17 9 L23 4 L22 16 Z" fill="#FFCF33" stroke="#1B1A2E" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2" fill="#FF4D3D"/></svg>';

  /* ================= 소리 버튼 ================= */

  V.soundButton = function () {
    var off = sound.isMuted();
    return '<button class="icon-btn" id="sound-btn" aria-pressed="' + !off + '" title="효과음 ' + (off ? '켜기' : '끄기') + '">' +
      (off ? ICONS.mute : ICONS.sound) + '<span>' + (off ? '소리 꺼짐' : '소리 켜짐') + '</span></button>';
  };

  V.bindSoundButton = function () {
    var b = $('#sound-btn');
    if (!b) return;
    b.addEventListener('click', function () {
      sound.setMuted(!sound.isMuted());
      b.outerHTML = V.soundButton();
      V.bindSoundButton();
      sound.tap();
    });
  };

  /* ================= 게임 화면 만들기 ================= */

  // gameInfo: 게임 정보, context: { role, myTeam, room }
  V.mount = function (gameInfo, s, context) {
    info = gameInfo;
    ctx = context || { role: 'solo' };
    snap = s;
    scene = null;
    modal = null;
    board = BG.buildBoard(pack, info.size, info.layout);
    displayPos = s.tokens.map(function (t) { return t.pos; });
    lastScores = null;
    lastTurnRank = null;
    lastActor = null;
    closeModal();

    var roleTag = '';
    if (ctx.role === 'host') roleTag = '<span class="role-tag host">선생님 화면 · 방 ' + esc(ctx.room) + '</span>';
    if (ctx.role === 'team') roleTag = '<span class="role-tag" style="--c:' + teamColor(ctx.myTeam) + '"><span class="dot" style="--c:' + teamColor(ctx.myTeam) + '"></span>' + teamName(ctx.myTeam) + ' 태블릿</span>';

    $('#app').innerHTML =
      '<section class="screen game role-' + ctx.role + '">' +
        '<header class="topbar">' +
          '<span class="game-title">' + esc(cfg.title) + '</span>' +
          '<span class="mode-tag">' + esc(info.modeLabel) + ' ' + info.size + '칸' + (info.randomBoard ? ' · 새 판' : '') + '</span>' +
          roleTag +
          '<span class="spacer"></span>' +
          V.soundButton() +
          (ctx.role !== 'team' ? '<button class="btn small ghost" id="stop-btn">끝내기</button>' : '') +
        '</header>' +
        '<div class="board-wrap" id="board-wrap"><div class="board" id="board"></div></div>' +
        '<aside class="side">' +
          '<div class="turn" id="turn"></div>' +
          '<div class="dice-row">' +
            '<div class="die-stage"><div class="die" id="die" aria-hidden="true"></div></div>' +
            '<button class="btn big primary roll" id="roll-btn" disabled>주사위 굴리기</button>' +
          '</div>' +
          '<p class="status" id="status" aria-live="polite"></p>' +
          '<div class="scores" id="scores"></div>' +
        '</aside>' +
      '</section>';

    renderBoard();
    if (observer) { observer.disconnect(); observer.observe($('#board-wrap')); }
    renderDie(1);
    V.bindSoundButton();
    $('#roll-btn').addEventListener('click', function () {
      if (!scene || scene.kind !== 'turn' || !canAct()) return;
      this.disabled = true;
      sound.unlock();
      act('roll');
    });
    var stop = $('#stop-btn');
    if (stop) stop.addEventListener('click', confirmStop);
    renderPanel();
  };

  function confirmStop() {
    var root = $('#confirm-root');
    root.innerHTML = '<div class="overlay top"><div class="modal card plain" role="dialog" aria-modal="true"><div class="card-body">' +
      '<h2 class="card-title">게임을 끝내고 결과를 볼까요?</h2>' +
      '<div class="btn-row"><button class="btn big primary" data-yes>결과 보기</button>' +
      '<button class="btn big ghost" data-no>계속하기</button></div></div></div></div>';
    root.querySelector('[data-yes]').addEventListener('click', function () { root.innerHTML = ''; act('stop'); });
    root.querySelector('[data-no]').addEventListener('click', function () { root.innerHTML = ''; });
  }

  function renderBoard() {
    var labels = meta.tileLabels || {};
    var html = '';
    for (var n = 1; n <= info.size; n++) {
      var t = board.tiles[n];
      var lbl = t.type === 'event' ? labels[t.deck] : labels[t.type];
      var arrow = '';
      if (t.type === 'up') arrow = '<span class="jump-to">▲ ' + t.to + '</span>';
      if (t.type === 'down') arrow = '<span class="jump-to">▼ ' + t.to + '</span>';
      html += '<div class="tile t-' + t.type + (t.deck ? ' d-' + esc(t.deck) : '') + '" data-n="' + n + '" style="--tilt:' + tilt(n) + 'deg">' +
        '<span class="num">' + n + '</span>' + arrow +
        '<span class="art">' + artHtml(t.art) + '</span>' +
        (lbl ? '<span class="lbl">' + esc(lbl) + '</span>' : '') +
      '</div>';
    }
    html += '<svg class="jumps" id="jumps" aria-hidden="true"></svg><div class="tokens" id="tokens"></div><div class="fx" id="fx"></div>';
    $('#board').innerHTML = html;
    var tokenHtml = '';
    for (var i = 0; i < teams(); i++) {
      tokenHtml += '<span class="token" data-token="' + i + '" style="--c:' + teamColor(i) + '"><span class="piece"><i>' + (teams() > 1 ? i + 1 : '') + '</i></span></span>';
    }
    $('#tokens').innerHTML = tokenHtml;
    layoutBoard();
  }

  function tilt(n) { return (((n * 37) % 7) - 3) * 0.35; }

  function layoutBoard() {
    var wrap = $('#board-wrap');
    if (!wrap) return;
    var cs = getComputedStyle(wrap);
    var w = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var h = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (w <= 0 || h <= 0) return;
    var size = info.size, best = null;
    for (var cols = 3; cols <= size; cols++) {
      var rows = Math.ceil(size / cols);
      var cell = Math.floor(Math.min(w / cols, h / rows));
      if (!best || cell > best.cell) best = { cols: cols, rows: rows, cell: cell };
    }
    grid = best;
    var el = $('#board');
    el.style.width = grid.cols * grid.cell + 'px';
    el.style.height = grid.rows * grid.cell + 'px';
    el.style.setProperty('--cell', grid.cell + 'px');
    for (var n = 1; n <= size; n++) {
      var p = cellOf(n);
      var t = el.querySelector('[data-n="' + n + '"]');
      t.style.left = p.col * grid.cell + 'px';
      t.style.top = p.row * grid.cell + 'px';
    }
    drawJumps();
    placeTokens(true);
  }

  function cellOf(n) {
    var i = n - 1;
    var r = Math.floor(i / grid.cols);
    var c = i % grid.cols;
    if (r % 2 === 1) c = grid.cols - 1 - c;
    return { col: c, row: grid.rows - 1 - r };
  }

  function centerOf(n) {
    var p = cellOf(n);
    return { x: (p.col + 0.5) * grid.cell, y: (p.row + 0.5) * grid.cell };
  }

  function jumpGeom(n) {
    var t = board.tiles[n];
    var a = centerOf(n), b = centerOf(t.to);
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var px = -dy / len, py = dx / len;
    var bend = Math.min(len * 0.35, grid.cell * 1.1);
    return {
      a: a, b: b, len: len,
      c1: { x: a.x + dx / 3 + px * bend, y: a.y + dy / 3 + py * bend },
      c2: { x: a.x + 2 * dx / 3 - px * bend, y: a.y + 2 * dy / 3 - py * bend }
    };
  }

  function bezier(g, k) {
    var u = 1 - k;
    return {
      x: u * u * u * g.a.x + 3 * u * u * k * g.c1.x + 3 * u * k * k * g.c2.x + k * k * k * g.b.x,
      y: u * u * u * g.a.y + 3 * u * u * k * g.c1.y + 3 * u * k * k * g.c2.y + k * k * k * g.b.y
    };
  }

  function jumpPoint(n, k) {
    var g = jumpGeom(n);
    if (board.tiles[n].type === 'up') return { x: g.a.x + (g.b.x - g.a.x) * k, y: g.a.y + (g.b.y - g.a.y) * k };
    return bezier(g, k);
  }

  function r1(v) { return Math.round(v * 10) / 10; }

  // 업로드 = 사다리, 다운로드 = 뱀 (머리는 출발 칸, 꼬리는 도착 칸)
  function drawJumps() {
    var svg = $('#jumps');
    var c = grid.cell;
    svg.setAttribute('width', grid.cols * c);
    svg.setAttribute('height', grid.rows * c);
    var ladders = '', snakes = '';
    for (var n = 1; n <= info.size; n++) {
      var t = board.tiles[n];
      if (t.type === 'up') ladders += drawLadder(n, c);
      if (t.type === 'down') snakes += drawSnake(n, c);
    }
    svg.innerHTML = ladders + snakes;
  }

  function line(x1, y1, x2, y2, cls) {
    return '<line class="' + cls + '" x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"/>';
  }

  function drawLadder(n, c) {
    var g = jumpGeom(n);
    var dx = g.b.x - g.a.x, dy = g.b.y - g.a.y, len = g.len;
    var ux = dx / len, uy = dy / len, px = -uy, py = ux;
    var gap = c * 0.12, s = c * 0.24;
    var ax = g.a.x + ux * s, ay = g.a.y + uy * s, bx = g.b.x - ux * s, by = g.b.y - uy * s;
    var out = '<g class="ladder">';
    out += line(ax + px * gap, ay + py * gap, bx + px * gap, by + py * gap, 'rail');
    out += line(ax - px * gap, ay - py * gap, bx - px * gap, by - py * gap, 'rail');
    var rungs = Math.max(2, Math.floor((len - 2 * s) / (c * 0.26)));
    for (var k = 1; k < rungs; k++) {
      var f = k / rungs, rx = ax + (bx - ax) * f, ry = ay + (by - ay) * f;
      out += line(rx + px * gap, ry + py * gap, rx - px * gap, ry - py * gap, 'rung');
    }
    return out + '</g>';
  }

  function drawSnake(n, c) {
    var g = jumpGeom(n);
    var count = Math.max(16, Math.round(g.len / (c * 0.07)));
    var pts = [];
    for (var i = 0; i <= count; i++) pts.push(bezier(g, i / count));
    var radius = function (k) { return c * (0.12 - 0.08 * k) + 1.5; };
    var outline = '', body = '', spots = '';
    for (i = count; i >= 1; i--) {
      var k = i / count, p = pts[i], rr = radius(k);
      outline += '<circle cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="' + r1(rr + 2.5) + '"/>';
      body += '<circle cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="' + r1(rr) + '"/>';
      if (i % 4 === 0 && i < count - 1) spots += '<circle cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="' + r1(rr * 0.45) + '"/>';
    }
    // 머리: 몸 방향과 반대쪽을 바라봄
    var h = pts[0], nx = pts[1];
    var ang = Math.atan2(h.y - nx.y, h.x - nx.x) * 180 / Math.PI;
    var hw = c * 0.2, hh = c * 0.15;
    var head =
      '<g class="snake-head" transform="translate(' + r1(h.x) + ' ' + r1(h.y) + ') rotate(' + r1(ang) + ')">' +
        '<path class="tongue" d="M' + r1(hw * 0.8) + ' 0 L' + r1(hw * 1.5) + ' 0 M' + r1(hw * 1.5) + ' 0 l' + r1(hw * 0.25) + ' ' + r1(-hh * 0.35) + ' M' + r1(hw * 1.5) + ' 0 l' + r1(hw * 0.25) + ' ' + r1(hh * 0.35) + '"/>' +
        '<ellipse class="head" rx="' + r1(hw) + '" ry="' + r1(hh) + '"/>' +
        '<circle class="eye" cx="' + r1(hw * 0.25) + '" cy="' + r1(-hh * 0.48) + '" r="' + r1(hh * 0.36) + '"/>' +
        '<circle class="eye" cx="' + r1(hw * 0.25) + '" cy="' + r1(hh * 0.48) + '" r="' + r1(hh * 0.36) + '"/>' +
        '<circle class="pupil" cx="' + r1(hw * 0.33) + '" cy="' + r1(-hh * 0.48) + '" r="' + r1(hh * 0.17) + '"/>' +
        '<circle class="pupil" cx="' + r1(hw * 0.33) + '" cy="' + r1(hh * 0.48) + '" r="' + r1(hh * 0.17) + '"/>' +
      '</g>';
    return '<g class="snake"><g class="snake-outline">' + outline + '</g><g class="snake-body">' + body + '</g>' +
      '<g class="snake-spots">' + spots + '</g>' + head + '</g>';
  }

  function placeTokens(instant) {
    if (!grid.cell) return;
    var c = grid.cell;
    var groups = {};
    displayPos.forEach(function (pos, i) { (groups[pos] = groups[pos] || []).push(i); });
    var current = snap ? snap.current : -1;
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
      el.classList.toggle('active', i === current && !(snap && snap.over));
      el.style.width = el.style.height = sizePx + 'px';
      el.style.fontSize = Math.round(sizePx * 0.5) + 'px';
      el.style.left = (x - sizePx / 2) + 'px';
      el.style.top = (y - sizePx / 2) + 'px';
    });
  }

  /* ================= 점수판·차례 ================= */

  function renderPanel() {
    if (!snap || !$('#turn')) return;
    var cur = snap.current;
    var mine = ctx.role === 'team' && cur === ctx.myTeam;
    var turnEl = $('#turn');
    turnEl.className = 'turn glow' + (mine ? ' mine' : '');
    turnEl.style.setProperty('--tc', teamColor(cur));
    turnEl.innerHTML = '<span class="dot big" style="--c:' + teamColor(cur) + '"></span>' +
      '<span><b>' + (mine ? '우리 모둠' : esc(teamName(cur))) + '</b> 차례' + (mine ? '!' : '') + '</span>' +
      '<i class="twinkle t1">✦</i><i class="twinkle t2">✦</i><i class="twinkle t3">✦</i>';
    document.body.classList.toggle('my-turn', mine);
    var prev = lastScores;
    lastScores = snap.tokens.map(function (tk) { return { trust: tk.trust, judgment: tk.judgment }; });
    var bump = function (i, key) {
      if (!prev || !prev[i] || reduceMotion) return '';
      var d = snap.tokens[i][key] - prev[i][key];
      return d > 0 ? ' bump-up' : d < 0 ? ' bump-down' : '';
    };
    if (classroom() && classCfg().ranking !== false) {
      renderRanking(bump, cur);
      placeTokens(false);
      updateRollButton();
      return;
    }
    $('#scores').classList.remove('ranked');
    $('#scores').innerHTML = snap.tokens.map(function (tk, i) {
      var online = ctx.role === 'host' ? (presence[i] ? ' online' : ' offline') : '';
      return '<div class="score-row' + (i === cur ? ' current' : '') + (tk.finished ? ' done' : '') + online + '" style="--tc:' + teamColor(i) + '">' +
        '<span class="dot" style="--c:' + teamColor(i) + '"></span>' +
        '<span class="who">' + esc(teamName(i)) + '<small>' + (tk.finished ? '도착' : tk.pos + '칸') + (ctx.role === 'host' ? (presence[i] ? ' · 연결됨' : ' · 연결 전') : '') + '</small></span>' +
        '<span class="pt trust' + bump(i, 'trust') + '" title="' + esc(label('trust')) + ' (주 점수)">' + ICONS.trust + '<b>' + tk.trust + '</b></span>' +
        '<span class="pt judgment' + bump(i, 'judgment') + '" title="' + esc(label('judgment')) + ' (보조 점수)">' + ICONS.judgment + '<b>' + tk.judgment + '</b></span>' +
      '</div>';
    }).join('');
    placeTokens(false);
    updateRollButton();
  }

  // 실시간 순위표: 줄은 한 번 만들고 순위가 바뀌면 부드럽게 자리를 옮김
  function renderRanking(bump, cur) {
    var box = $('#scores');
    var n = snap.tokens.length;
    var ranking = box.querySelector('.ranking');
    if (!ranking || ranking.children.length !== n) {
      var rows = '';
      for (var t = 0; t < n; t++) rows += '<div class="rank-row" data-team="' + t + '" style="--tc:' + teamColor(t) + '"></div>';
      box.classList.add('ranked');
      box.innerHTML = '<div class="ranking-head"><b>실시간 순위</b><small>' +
        (((info && info.rankBy) || classCfg().rankBy) === 'position' ? '앞선 칸 순' : esc(label('trust')) + '+' + esc(label('judgment')) + ' 합계 순') + '</small></div>' +
        '<div class="ranking" style="--n:' + n + '">' + rows + '</div>';
      ranking = box.querySelector('.ranking');
    }
    var list = BG.rankTeams(snap.tokens, (info && info.rankBy) || classCfg().rankBy);
    var allTied = list.every(function (x) { return x.rank === 1; });
    list.forEach(function (x, k) {
      var tk = snap.tokens[x.team];
      var row = ranking.querySelector('[data-team="' + x.team + '"]');
      row.style.setProperty('--k', k);
      row.classList.toggle('current', x.team === cur);
      row.classList.toggle('first', x.rank === 1 && !allTied);
      row.classList.toggle('mine', ctx.role === 'team' && x.team === ctx.myTeam);
      var online = ctx.role === 'host' ? (presence[x.team] ? ' · 연결됨' : ' · 연결 전') : '';
      var sig = [x.rank, allTied, tk.pos, tk.finished, tk.trust, tk.judgment, online].join('|');
      if (row.dataset.sig === sig) return;
      row.dataset.sig = sig;
      row.innerHTML =
        '<span class="rank-no">' + (x.rank === 1 && !allTied ? CROWN : x.rank) + '</span>' +
        '<span class="dot" style="--c:' + teamColor(x.team) + '"></span>' +
        '<span class="who">' + esc(teamName(x.team)) + (ctx.role === 'team' && x.team === ctx.myTeam ? ' <em>우리</em>' : '') +
          '<small>' + (tk.finished ? '도착' : tk.pos + '칸') + online + '</small></span>' +
        '<span class="pt trust' + bump(x.team, 'trust') + '" title="' + esc(label('trust')) + '">' + ICONS.trust + '<b>' + tk.trust + '</b></span>' +
        '<span class="pt judgment' + bump(x.team, 'judgment') + '" title="' + esc(label('judgment')) + '">' + ICONS.judgment + '<b>' + tk.judgment + '</b></span>';
    });
  }

  // 추월 알림: 차례가 시작될 때, 직전 차례 모둠이 누구를 앞지르거나 누구에게 추월당했는지 한 번만 알림
  function overtakeMessage(sc, fast) {
    if (!classroom() || classCfg().overtakeAlerts === false || !snap) return null;
    var now = rankMap(snap.tokens);
    var msg = null;
    var a = lastActor;
    if (!fast && lastTurnRank && a !== null && a !== sc.team) {
      var passed = [], passedBy = [];
      Object.keys(now).forEach(function (k) {
        var t = +k;
        if (t === a) return;
        if (lastTurnRank[t] < lastTurnRank[a] && now[t] > now[a]) passed.push(t);
        if (lastTurnRank[t] > lastTurnRank[a] && now[t] < now[a]) passedBy.push(t);
      });
      var names = function (list) { return list.map(teamName).join(', '); };
      if (passed.length) msg = teamName(a) + '이 ' + names(passed) + '을 추월했어요.';
      else if (passedBy.length) msg = names(passedBy) + '이 ' + teamName(a) + '을 추월했어요.';
    }
    lastTurnRank = now;
    lastActor = sc.team;
    return msg;
  }

  function turnStart(sc, fast) {
    var msg = overtakeMessage(sc, fast);
    var mine = ctx.role === 'team' && sc.team === ctx.myTeam;
    if (fast || !sc.announce) return;
    if (!msg) return announceTurn(sc.team, mine);
    toast(msg, 'overtake');
    return wait(reduceMotion ? 300 : 1400).then(function () { return announceTurn(sc.team, mine); });
  }

  V.setPresence = function (map) {
    presence = map || {};
    if (info && ctx.role === 'host') renderPanel();
  };

  function updateRollButton() {
    var btn = $('#roll-btn');
    if (!btn || !snap) return;
    var cur = snap.current;
    var waitingRoll = scene && scene.kind === 'turn';
    btn.disabled = !(waitingRoll && canAct());
    btn.classList.toggle('pulse', waitingRoll && canAct());
    if (ctx.role === 'team') btn.textContent = cur === ctx.myTeam ? (waitingRoll ? '주사위 굴리기!' : '우리 차례 진행 중') : teamName(cur) + ' 차례예요';
    else if (ctx.role === 'host' && teams() > 1) btn.textContent = teamName(cur) + ' 주사위';
    else btn.textContent = '주사위 굴리기';
  }

  function setStatus(text) {
    var el = $('#status');
    if (el) el.textContent = text || '';
  }

  /* ================= 장면 재생 ================= */

  // fast: 애니메이션 없이 결과만 그리기 (늦게 들어온 기기, 놓친 장면)
  V.play = function (sc, s, fast) {
    scene = sc;
    if (s) snap = s;
    var run = handlers[sc.kind] || function () { return Promise.resolve(); };
    return Promise.resolve(run(sc, !!fast)).then(function () {
      if (fast && snap) {
        displayPos = snap.tokens.map(function (t) { return t.pos; });
      }
      renderPanel();
    });
  };

  var handlers = {
    turn: function (sc, fast) {
      closeModal();
      renderPanel();
      var mine = ctx.role === 'team' && sc.team === ctx.myTeam;
      setStatus(canAct(sc) ? (ctx.role === 'team' ? '우리 모둠이 주사위를 굴릴 차례예요.' : '주사위를 굴려 주세요.') : teamName(sc.team) + '이(가) 주사위를 굴릴 차례예요.');
      if (sc.announce || fast) return turnStart(sc, fast);
    },
    reflect: function (sc, fast) {
      renderPanel();
      showReflect(sc);
      if (sc.announce || fast) return turnStart(sc, fast);
    },
    roll: function (sc, fast) {
      closeModal();
      updateRollButton();
      setStatus(teamName(sc.team) + ' 주사위!');
      if (fast) { renderDie(sc.value); return; }
      return rollDieAnimation(sc.value).then(function () { setStatus(sc.value + '칸 앞으로!'); });
    },
    move: function (sc, fast) {
      if (fast) { displayPos[sc.team] = sc.path.length ? sc.path[sc.path.length - 1] : displayPos[sc.team]; return; }
      return animatePath(sc.team, sc.path);
    },
    highlight: function (sc, fast) { if (!fast) return highlightTile(sc.tile); },
    jump: function (sc, fast) {
      if (fast) { displayPos[sc.team] = sc.to; return; }
      var up = sc.to > sc.from;
      var labels = meta.tileLabels || {};
      toast((up ? (labels.up || '지름길') : (labels.down || '미끄럼틀')) + '! ' + sc.from + ' → ' + sc.to, up ? 'up' : 'down');
      return animateJump(sc.team, sc.from, sc.to);
    },
    card: function (sc, fast) {
      if (modal && modal.kind === 'card' && modal.uid === sc.uid) { updateCardSelection(sc); return; }
      showCard(sc, fast);
    },
    reason: function (sc) { showReason(sc); },
    outcome: function (sc, fast) { showOutcome(sc, fast); },
    announce: function (sc, fast) {
      closeModal();
      if (fast || !sc.move || sc.move.from === sc.move.to) return;
      var n = Math.abs(sc.move.to - sc.move.from), fwd = sc.move.to > sc.move.from;
      toast(fwd ? n + '칸 앞으로!' : n + '칸 뒤로...', fwd ? 'up' : 'down');
      return wait(reduceMotion ? 150 : 700);
    },
    teacher: function (sc) {
      if (modal && modal.kind === 'teacher' && modal.uid === sc.uid) { var el = $('#t-prompt'); if (el) el.textContent = sc.prompt; return; }
      showTeacher(sc);
    },
    finish: function (sc, fast) {
      closeModal();
      if (fast) return;
      sound.finish();
      confetti(140);
      burst(info.size, cfg.theme.accent);
      toast(teamName(sc.team) + ' 도착!', 'up');
      return wait(reduceMotion ? 400 : 3200);
    },
    result: function (sc) { V.showResult(sc.summary); }
  };

  function announceTurn(team, mine) {
    sound.turn();
    toast(mine ? '우리 모둠 차례!' : teamName(team) + ' 차례!', 'team', teamColor(team));
    return wait(reduceMotion ? 200 : 1100);
  }

  /* ================= 움직임 ================= */

  function speed() { return info.speed || { stepMs: 840, upMs: 4500, downMs: 4200, diceMs: 1000 }; }

  async function animatePath(team, path) {
    var el = $('#tokens [data-token="' + team + '"]');
    var back = path.length && path[0] < displayPos[team];
    if (back) return slideBack(team, path, el);
    var ms = reduceMotion ? 120 : speed().stepMs;
    if (el) el.style.setProperty('--hop', ms + 'ms');
    for (var i = 0; i < path.length; i++) {
      displayPos[team] = path[i];
      if (el) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }
      placeTokens(false);
      if (back) sound.stepBack(i); else sound.step(i);
      await wait(ms);
    }
    if (el) el.classList.remove('hop');
    if (path.length) { sound.land(); dust(path[path.length - 1]); }
    placeTokens(false);
  }

  // 카드 결과로 뒤로 갈 때: 통통 뛰지 않고 뒤로 "쭈르륵" 미끄러짐 + 화면 살짝 흔들림
  async function slideBack(team, path, el) {
    var ms = reduceMotion ? 80 : Math.max(220, speed().stepMs * 0.55);
    if (el) { el.style.setProperty('--hop', ms + 'ms'); el.classList.add('slipping'); }
    sound.slip(ms * path.length / 1000);
    for (var i = 0; i < path.length; i++) {
      displayPos[team] = path[i];
      placeTokens(false);
      await wait(ms);
    }
    if (el) el.classList.remove('slipping');
    sound.land();
    dust(path[path.length - 1]);
    shake($('.screen.game'), 'shake-screen');
    placeTokens(false);
    await wait(reduceMotion ? 0 : 350);
  }

  async function animateJump(team, from, to) {
    var up = board.tiles[from].type === 'up';
    var el = $('#tokens [data-token="' + team + '"]');
    var dur = reduceMotion ? 300 : (up ? speed().upMs : speed().downMs);
    if (up) sound.climb(dur / 1000); else sound.fall(dur / 1000);
    if (el) {
      el.style.setProperty('--jump', dur + 'ms');
      el.classList.add('instant', up ? 'climbing' : 'falling');
    }
    var half = el ? el.offsetWidth / 2 : 0;
    var t0 = performance.now();
    await new Promise(function (done) {
      var finished = false;
      var backup = setInterval(function () { frame(performance.now()); }, 50);
      function frame(now) {
        if (finished) return;
        var p = Math.min(1, (now - t0) / dur);
        var k = up ? (p + Math.sin(p * Math.PI * 16) * 0.012) : p * p;
        k = Math.max(0, Math.min(1, k));
        var pt = jumpPoint(from, k);
        if (el) {
          el.style.left = (pt.x - half) + 'px';
          el.style.top = (pt.y - half + grid.cell * 0.06) + 'px';
        }
        if (p < 1) requestAnimationFrame(frame);
        else { finished = true; clearInterval(backup); done(); }
      }
      requestAnimationFrame(frame);
    });
    displayPos[team] = to;
    if (el) el.classList.remove('climbing', 'falling');
    placeTokens(false);
    if (up) {
      sound.cheer(1.8);
      burst(to, cfg.theme.up);
      burst(to, cfg.theme.bg);
    } else {
      sound.sad();
      dust(to);
      shake($('.screen.game'), 'shake-screen');
    }
    await wait(reduceMotion ? 200 : 1100);
  }

  async function highlightTile(n) {
    var t = $('#board [data-n="' + n + '"]');
    if (!t) return;
    t.classList.remove('landing'); void t.offsetWidth; t.classList.add('landing');
    await wait(reduceMotion ? 150 : 650);
    t.classList.remove('landing');
  }

  /* ================= 주사위 ================= */

  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  function renderDie(v) {
    var die = $('#die');
    if (!die) return;
    var on = PIPS[v] || [];
    var html = '';
    for (var i = 0; i < 9; i++) html += '<i' + (on.indexOf(i) >= 0 ? ' class="on"' : '') + '></i>';
    die.innerHTML = html;
    die.setAttribute('data-value', v);
  }

  async function rollDieAnimation(finalValue) {
    var die = $('#die');
    var total = reduceMotion ? 300 : speed().diceMs;
    sound.dice(total / 1000);
    die.classList.remove('landed');
    die.classList.add('rolling');
    die.style.setProperty('--spin', Math.max(0.18, total / 5500) + 's');
    // 처음엔 빠르게, 점점 느리게 바뀌는 눈
    var elapsed = 0, gap = 50;
    while (elapsed < total * 0.85) {
      renderDie(1 + Math.floor(Math.random() * (cfg.dieFaces || 6)));
      await wait(gap);
      elapsed += gap;
      gap = Math.min(260, gap * 1.12);
    }
    renderDie(finalValue);
    die.classList.remove('rolling');
    void die.offsetWidth;
    die.classList.add('landed');
    await wait(Math.max(260, total * 0.15));
  }

  /* ================= 효과 ================= */

  function burst(n, color) {
    var fx = $('#fx');
    if (!fx) return;
    var c = centerOf(n);
    for (var i = 0; i < 10; i++) {
      var s = document.createElement('i');
      var ang = (Math.PI * 2 * i) / 10, dist = grid.cell * (0.5 + Math.random() * 0.3);
      s.style.left = c.x + 'px';
      s.style.top = c.y + 'px';
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      s.style.background = color;
      fx.appendChild(s);
      setTimeout(s.remove.bind(s), 700);
    }
  }

  function dust(n) {
    var fx = $('#fx');
    if (!fx || reduceMotion) return;
    var c = centerOf(n);
    var d = document.createElement('b');
    d.className = 'dust';
    d.style.left = c.x + 'px';
    d.style.top = (c.y + grid.cell * 0.22) + 'px';
    d.style.width = d.style.height = grid.cell * 0.7 + 'px';
    fx.appendChild(d);
    setTimeout(d.remove.bind(d), 500);
  }

  // short: 결과 카드용 짧은 색종이 (개수 적게, 빨리 끝남)
  function confetti(count, short) {
    if (reduceMotion) return;
    var root = document.createElement('div');
    root.className = 'confetti' + (short ? ' short' : '');
    var colors = cfg.theme.tokenColors;
    for (var i = 0; i < (count || 60); i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * (short ? 0.25 : 0.5) + 's';
      p.style.animationDuration = (short ? 1.1 + Math.random() * 0.7 : 1.6 + Math.random() * 1.2) + 's';
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      root.appendChild(p);
    }
    document.body.appendChild(root);
    setTimeout(function () { root.remove(); }, 4200);
  }
  V.confetti = confetti;

  function toast(text, kind, color) {
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    if (color) el.style.setProperty('--tc', color);
    el.textContent = text;
    $('#toast-root').appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 1300);
    setTimeout(function () { el.remove(); }, 1800);
  }
  V.toast = toast;

  /* ================= 창(모달) ================= */

  function openModal(html, cls, info2) {
    clearTimers();
    $('#modal-root').innerHTML = '<div class="overlay"><div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div></div>';
    modal = info2 || { kind: 'other' };
    var m = $('#modal-root .modal');
    var focus = m.querySelector('button:not([disabled])');
    if (focus) focus.focus({ preventScroll: true });
    return m;
  }

  function closeModal() {
    clearTimers();
    modal = null;
    var root = $('#modal-root');
    if (root) root.innerHTML = '';
  }
  V.closeModal = closeModal;

  function clearTimers() {
    timers.forEach(clearInterval);
    timers = [];
  }

  // 누가 고르고 있는지 알려 주는 줄 (다른 모둠 태블릿에서)
  function watchNote(sc, what) {
    if (canAct(sc)) return '';
    if (sc.actor === 'host') return '<p class="watch-note">선생님이 ' + (what || '평가') + '하고 있어요.</p>';
    return '<p class="watch-note" style="--tc:' + teamColor(sc.team) + '"><span class="dot" style="--c:' + teamColor(sc.team) + '"></span>' + esc(teamName(sc.team)) + '이(가) ' + (what || '고르고') + ' 있어요.</p>';
  }

  function cardArt(card) {
    var ca = meta.cardArt || {};
    var key = card.art || (card.type === 'chance' ? (ca.types || {}).chance : ((ca.topics || {})[card.topic] || (ca.types || {})[card.type]));
    return key ? '<div class="card-art" aria-hidden="true">' + artHtml(key) + '</div>' : '';
  }

  function cardHead(card, team) {
    var typeName = (meta.cardTypes && meta.cardTypes[card.type]) || card.type;
    var slotChips = '';
    var slotLabels = meta.slotLabels || {};
    Object.keys(card.picked || {}).forEach(function (slot) {
      var name = meta.slots && meta.slots[slot] && meta.slots[slot][card.picked[slot]];
      if (name) slotChips += '<span class="chip slot"><small>' + esc(slotLabels[slot] || slot) + '</small> ' + esc(name) + '</span>';
    });
    var teamChip = teams() > 1 && team !== undefined && team !== null
      ? '<span class="chip team" style="--c:' + teamColor(team) + '">' + esc(teamName(team)) + '</span>' : '';
    return '<div class="card-band">' +
        '<span class="band-type">' + esc(typeName) + '</span>' + teamChip + topicChip(card) +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-top">' + cardArt(card) +
          '<div class="card-headline">' +
            (slotChips ? '<div class="chips slots">' + slotChips + '</div>' : '') +
            '<h2 class="card-title">' + esc(card.title) + '</h2>' +
          '</div>' +
        '</div>' +
        '<p class="situation">' + esc(card.situation) + '</p>';
  }

  function showCard(sc, fast) {
    var card = sc.card;
    var mine = canAct(sc);
    if (!fast) sound.card();
    if (card.type === 'chance') {
      var good = isGood(card.effect);
      var m0 = openModal(cardHead(card, sc.team) +
        '<div class="result-box ' + (good ? 'is-good' : 'is-bad') + '">' + (card.feedback ? '<p>' + esc(card.feedback) + '</p>' : '') +
        '<div class="chips">' + effectChips(card.effect) + '</div></div>' +
        watchNote(sc, '확인하고') +
        (mine ? '<button class="btn big primary wide" data-ok>확인</button>' : '') + '</div>', 'card k-chance', { kind: 'card', uid: sc.uid });
      if (!fast) setTimeout(function () { if (good) sound.good(); else sound.bad(); }, 250);
      var ok = m0.querySelector('[data-ok]');
      if (ok) ok.addEventListener('click', function () { ok.disabled = true; act('ok'); });
      return;
    }

    var isQuiz = card.type === 'quiz';
    var items = isQuiz ? card.options : card.choices;
    var ox = isQuiz && items.every(function (o) { return o.label === 'O' || o.label === 'X'; });
    var body = cardHead(card, sc.team) +
      (isQuiz ? '<p class="question">' + esc(card.question) + '</p>' : '') +
      othersBox(sc) +
      (!isQuiz && cfg.discussionSeconds ? '<div class="timer"><div class="timer-bar" id="timer-bar"></div><span id="timer-text"></span></div>' : '') +
      (mine ? '<p class="hint">' + (isQuiz ? '모둠이 의논해서 답을 골라 주세요.' : '정답은 하나가 아니에요. 모둠이 이야기해서 하나를 골라 주세요.') + '</p>' : watchNote(sc)) +
      '<div class="choices' + (ox ? ' ox' : '') + '">' + items.map(function (c, i) {
        return '<button class="choice" data-i="' + i + '" aria-pressed="' + (sc.selected === i) + '"' + (mine ? '' : ' disabled') + '>' +
          '<span class="choice-label">' + esc(c.label) + '</span>' +
          '<span class="choice-text">' + esc(c.text) + '</span></button>';
      }).join('') + '</div>' +
      (mine ? '<button class="btn big primary wide" data-confirm' + (sc.selected === null || sc.selected === undefined ? ' disabled' : '') + '>이걸로 결정!</button>' : '') + '</div>';
    var m = openModal(body, 'card k-' + card.type + (mine ? '' : ' watching'), { kind: 'card', uid: sc.uid });
    if (!isQuiz && cfg.discussionSeconds) startTimer(cfg.discussionSeconds);

    if (!mine) return;
    m.querySelector('.choices').addEventListener('click', function (e) {
      var b = e.target.closest('.choice');
      if (!b) return;
      var i = +b.dataset.i;
      pressOnly(this, b);
      sound.tap();
      var confirm = m.querySelector('[data-confirm]');
      if (confirm) confirm.disabled = false;
      act('select', i);
    });
    m.querySelector('[data-confirm]').addEventListener('click', function () {
      if (!m.querySelector('.choice[aria-pressed="true"]')) return;
      this.disabled = true;
      act('confirm');
    });
  }

  // 다른 모둠이 먼저 푼 딜레마: 선택지별 비율만 (어느 모둠이 골랐는지, 점수는 보여 주지 않음)
  function othersBox(sc) {
    if (!sc.others || !classroom() || !sc.card.choices) return '';
    var rows = sc.card.choices.map(function (c, i) {
      var p = sc.others.percents[i] || 0;
      return '<div class="others-row"><span class="others-label">' + esc(c.label) + '</span>' +
        '<span class="others-bar"><i style="width:' + p + '%"></i></span><b>' + p + '%</b></div>';
    }).join('');
    return '<div class="others"><p class="others-title">다른 모둠은 이렇게 선택했어요 <small>' + sc.others.teams + '모둠 참고</small></p>' + rows + '</div>';
  }

  function updateCardSelection(sc) {
    var m = $('#modal-root .modal');
    if (!m) return;
    m.querySelectorAll('.choice').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.i === sc.selected); });
    var confirm = m.querySelector('[data-confirm]');
    if (confirm && sc.selected !== null && sc.selected !== undefined) confirm.disabled = false;
    if (!canAct(sc) && sc.selected !== null && sc.selected !== undefined) sound.tap();
  }

  function pressOnly(group, btn) {
    group.querySelectorAll('[aria-pressed]').forEach(function (x) { x.setAttribute('aria-pressed', x === btn); });
  }
  V.pressOnly = pressOnly;

  function chosenLine(card, selected) {
    var items = card.type === 'quiz' ? card.options : card.choices;
    var chosen = items && items[selected];
    if (!chosen) return '';
    return '<p class="picked">' + (card.type === 'quiz' ? '고른 답' : '우리의 선택') + ' <b>' + esc(chosen.label) + '. ' + esc(chosen.text) + '</b></p>';
  }

  function showReason(sc) {
    var def = meta.reason || {};
    var mine = canAct(sc);
    var m = openModal(cardHead(sc.card, sc.team) + chosenLine(sc.card, sc.selected) +
      '<div class="reason-box"><h3>이유 말하기</h3><p>' + esc(def.prompt) + '</p>' +
      (def.hint ? '<p class="hint">' + esc(def.hint) + '</p>' : '') + '</div>' +
      watchNote(sc, '이유를 말하고') +
      (mine ? '<div class="btn-row">' +
        '<button class="btn big primary" data-yes>이유를 말했어요 <span class="chips">' + effectChips(def.bonus || {}) + '</span></button>' +
        '<button class="btn big ghost" data-no>건너뛰기</button>' +
      '</div>' : '') + '</div>', 'card k-dilemma', { kind: 'reason', uid: sc.uid });
    if (!mine) return;
    m.querySelector('[data-yes]').addEventListener('click', function () { disableAll(m); sound.tap(); act('yes'); });
    m.querySelector('[data-no]').addEventListener('click', function () { disableAll(m); act('no'); });
  }

  // 결과 창: 한 줄 코멘트 + 점수 카운트업(+2 배지) + 좋으면 색종이, 아쉬우면 흔들림
  function showOutcome(sc, fast) {
    var card = sc.card, out = sc.outcome;
    var isQuiz = card.type === 'quiz';
    var tone = sc.tone || (isQuiz ? (out.correct ? 'great' : 'bad') : (isGood(out.effect) ? 'good' : 'bad'));
    var good = tone === 'great' || tone === 'good';
    var headline = isQuiz
      ? (out.correct ? '<p class="verdict good">정답이에요!</p>' : '<p class="verdict bad">정답은 ' + esc(card.options[card.answer].label) + '. ' + esc(card.options[card.answer].text) + '</p>')
      : chosenLine(card, sc.selected);
    var mine = canAct(sc);
    var m = openModal(cardHead(card, sc.team) +
      '<div class="result-box tone-' + tone + '">' +
      (sc.comment ? '<p class="comment">' + esc(sc.comment) + '</p>' : '') +
      headline +
      (out.feedback ? '<p>' + esc(out.feedback) + '</p>' : '') +
      scoreDeltas(sc) +
      '</div>' + watchNote(sc, '결과를 확인하고') +
      (mine ? '<button class="btn big primary wide" data-ok>확인</button>' : '') + '</div>', 'card k-' + card.type + ' result tone-' + tone, { kind: 'outcome', uid: sc.uid });
    var ok = m.querySelector('[data-ok]');
    if (ok) ok.addEventListener('click', function () { ok.disabled = true; act('ok'); });

    if (fast) { finishCounts(m); return; }
    if (tone === 'great') { sound.great(); confetti(46, true); }
    else if (good) { sound.good(); sparkleCard(m); }
    else { sound.bad(); if (tone === 'bad') setTimeout(function () { shake(m, 'shake-card'); }, 380); }
    runCounts(m);
  }

  // 점수 줄: 이유 말하기 보너스까지 포함한 전·후 값. (예전 형식이면 배지만)
  function scoreDeltas(sc) {
    var out = sc.outcome;
    if (!sc.before || !sc.after) {
      return '<div class="chips">' + effectChips(out.effect) + '</div>';
    }
    var rows = ['trust', 'judgment'].map(function (key) {
      var from = sc.before[key], to = sc.after[key], d = to - from;
      var cls = d > 0 ? 'up' : d < 0 ? 'down' : 'same';
      return '<div class="delta ' + key + ' ' + cls + '">' + ICONS[key] +
        '<span class="delta-name">' + esc(label(key)) + '</span>' +
        '<b class="count" data-from="' + from + '" data-to="' + to + '">' + from + '</b>' +
        (d ? '<span class="delta-badge">' + (d > 0 ? '+' : '') + d + '</span>' : '') + '</div>';
    }).join('');
    var mv = (out.effect && out.effect.move) || 0;
    var moveText = mv > 0 ? mv + '칸 앞으로' : mv < 0 ? (-mv) + '칸 뒤로' : '제자리';
    rows += '<div class="delta move ' + (mv > 0 ? 'up' : mv < 0 ? 'down' : 'same') + '"><span class="move-arrow">' + (mv > 0 ? '▲' : mv < 0 ? '▼' : '●') + '</span><span class="delta-name">' + moveText + '</span></div>';
    return '<div class="deltas">' + rows + '</div>' +
      (sc.bonus ? '<div class="chips"><span class="chip bonus">이유 말하기 ' + esc(BG.describeEffect(sc.bonus, meta.scoreLabels).map(function (e) { return e.text; }).join(' ')) + ' 포함</span></div>' : '');
  }

  // 숫자가 한 칸씩 올라가거나 내려가며 톡톡 튐 (가벼운 setTimeout + CSS만 사용)
  function runCounts(m) {
    var delay = reduceMotion ? 0 : 450;
    m.querySelectorAll('.count').forEach(function (el, idx) {
      var from = +el.dataset.from, to = +el.dataset.to;
      if (from === to || reduceMotion) { el.textContent = to; return; }
      var dir = to > from ? 1 : -1, v = from, i = 0;
      var badge = el.parentNode.querySelector('.delta-badge');
      setTimeout(function step() {
        if (!el.isConnected) return;
        v += dir;
        el.textContent = v;
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        sound.tick(dir > 0, i++);
        if (v !== to) setTimeout(step, 170);
        else if (badge) badge.classList.add('show');
      }, delay + idx * 260);
    });
  }

  function finishCounts(m) {
    m.querySelectorAll('.count').forEach(function (el) { el.textContent = el.dataset.to; });
    m.querySelectorAll('.delta-badge').forEach(function (b) { b.classList.add('show'); });
  }

  function sparkleCard(m) {
    if (reduceMotion) return;
    var box = m.querySelector('.result-box');
    if (!box) return;
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('i');
      s.className = 'spark';
      s.style.left = (10 + Math.random() * 80) + '%';
      s.style.top = (10 + Math.random() * 60) + '%';
      s.style.animationDelay = (i * 60) + 'ms';
      box.appendChild(s);
    }
  }

  // 흔들림: 창 하나(shake-card) 또는 게임 화면 전체(shake-screen)
  function shake(el, cls) {
    if (!el || reduceMotion) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 600);
  }

  function disableAll(m) { m.querySelectorAll('button').forEach(function (b) { b.disabled = true; }); }

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

  function showReflect(sc) {
    var def = meta.reflect || {};
    var reason = sc.reason || {};
    var mine = canAct(sc);
    var ca = (meta.cardArt || {}).types || {};
    var m = openModal(
      '<div class="card-band"><span class="band-type">' + esc(def.title || '되돌아보기') + '</span>' +
        (teams() > 1 ? '<span class="chip team" style="--c:' + teamColor(sc.team) + '">' + esc(teamName(sc.team)) + '</span>' : '') + '</div>' +
      '<div class="card-body">' +
      '<div class="card-top">' + (ca.reflect ? '<div class="card-art" aria-hidden="true">' + artHtml(ca.reflect) + '</div>' : '') +
        '<div class="card-headline"><h2 class="card-title">' + esc(def.prompt || '') + '</h2></div></div>' +
      '<p class="situation">지난 차례에 <b>' + esc(reason.title) + '</b> 카드' +
        (reason.choice ? '에서 고른 선택 「' + esc(reason.choice) + '」 때문에' : ' 때문에') +
        ' ' + (reason.slid || 0) + '칸 미끄러졌어요.</p>' +
      (def.hint ? '<p class="hint">' + esc(def.hint) + '</p>' : '') + watchNote(sc, '되돌아보고') +
      (mine ? '<div class="btn-row">' +
        '<button class="btn big primary" data-yes>설명했어요 <span class="chips">' + effectChips(def.success || {}) + '</span></button>' +
        '<button class="btn big ghost" data-no>통과</button>' +
      '</div>' : '') + '</div>', 'card k-reflect', { kind: 'reflect', uid: sc.uid });
    if (!mine) return;
    m.querySelector('[data-yes]').addEventListener('click', function () { disableAll(m); act('yes'); });
    m.querySelector('[data-no]').addEventListener('click', function () { disableAll(m); act('no'); });
  }

  function showTeacher(sc) {
    var def = meta.teacher || {};
    var levels = def.levels || [];
    var mine = canAct(sc);
    var ca = (meta.cardArt || {}).types || {};
    if (sc.sound !== false) sound.card();
    var m = openModal(
      '<div class="card-band"><span class="band-type">' + esc(def.title || '선생님께 질문하기') + '</span>' +
        (teams() > 1 ? '<span class="chip team" style="--c:' + teamColor(sc.team) + '">' + esc(teamName(sc.team)) + '</span>' : '') + '</div>' +
      '<div class="card-body">' +
      '<div class="card-top">' + (ca.teacher ? '<div class="card-art" aria-hidden="true">' + artHtml(ca.teacher) + '</div>' : '') +
        '<div class="card-headline"><h2 class="card-title">' + esc(def.intro || '') + '</h2></div></div>' +
      '<p class="question" id="t-prompt">' + esc(sc.prompt || '') + '</p>' +
      (mine ? '<button class="btn small ghost" data-next>다른 질문</button><p class="hint">선생님이 평가해 주세요.</p>' +
        '<div class="btn-col">' + levels.map(function (lv, i) {
          return '<button class="btn big' + (i === 0 ? ' primary' : '') + '" data-level="' + i + '">' + esc(lv.label) +
            ' <span class="chips">' + effectChips(lv.effect || {}) + '</span></button>';
        }).join('') + '</div>' : watchNote(sc, '평가')) + '</div>', 'card k-teacher', { kind: 'teacher', uid: sc.uid });
    if (!mine) return;
    m.querySelector('[data-next]').addEventListener('click', function () { sound.tap(); act('next'); });
    m.querySelector('.btn-col').addEventListener('click', function (e) {
      var b = e.target.closest('[data-level]');
      if (!b) return;
      disableAll(m);
      if (+b.dataset.level === 0) sound.good();
      act('level', +b.dataset.level);
    });
  }

  /* ================= 결과 ================= */

  V.showResult = function (sum) {
    closeModal();
    document.body.classList.remove('my-turn');
    $('#toast-root').innerHTML = '';
    var topics = meta.topics || {};
    var cardsById = {};
    (pack.cards || []).forEach(function (c) { cardsById[c.id] = c; });
    var n = sum.tokens.length;
    var nameOf = function (i) { return n === 1 ? '우리 모둠' : (i + 1) + '모둠'; };

    var ranks = classroom() ? rankMap(sum.tokens) : null;
    var allTied = ranks && Object.keys(ranks).every(function (k) { return ranks[k] === 1; });
    var tokenCards = sum.tokens.map(function (t) {
      var rankChip = ranks ? '<span class="chip rank">' + (ranks[t.id] === 1 && !allTied ? CROWN + ' ' : '') + ranks[t.id] + '위</span>' : '';
      return '<div class="result-token" style="--tc:' + teamColor(t.id) + '">' +
        '<h3><span class="dot big" style="--c:' + teamColor(t.id) + '"></span>' + esc(nameOf(t.id)) + rankChip + '</h3>' +
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
    var logItems = (sum.log || []).filter(function (e) { return e.kind === 'card' || e.kind === 'reflect' || e.kind === 'teacher'; }).map(function (e) {
      var who = n > 1 ? '<span class="dot" style="--c:' + teamColor(e.token) + '"></span>' : '';
      if (e.kind === 'card') {
        if (e.topic) seen[e.topic] = (seen[e.topic] || 0) + 1;
        var card = cardsById[e.cardId] || {};
        var mark = e.cardType === 'quiz' ? (e.correct ? ' (정답)' : ' (오답)') : '';
        return '<li>' + who + topicChip(card) + '<b>' + esc(e.title) + '</b>' +
          (e.choice ? '<span class="log-choice">' + esc(e.choice) + mark + '</span>' : '') +
          (e.reasoned ? '<span class="chip bonus">이유 말함</span>' : '') +
          '<span class="chips">' + effectChips(e.effect) + '</span></li>';
      }
      if (e.kind === 'reflect') return '<li class="minor">' + who + '<b>되돌아보기</b><span class="log-choice">' + (e.explained ? '이유를 설명했어요' : '통과') + '</span></li>';
      return '<li class="minor">' + who + '<b>선생님 질문</b><span class="log-choice">' + esc(e.level || '') + '</span></li>';
    }).join('');

    var topicList = Object.keys(topics).map(function (k) {
      return '<span class="chip topic' + (seen[k] ? '' : ' faded') + '" style="--topic:' + esc(topics[k].color) + '">' +
        esc(topics[k].name) + (seen[k] ? ' ' + seen[k] : '') + '</span>';
    }).join('');

    var debrief = ((meta.results && meta.results.debrief) || []).map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('');
    var controls = ctx.role === 'team'
      ? '<p class="wait-note">선생님이 새 게임을 시작하면 이 화면이 자동으로 바뀌어요.</p>'
      : '<div class="btn-row center">' +
          '<button class="btn big primary" id="again-btn">다시 하기</button>' +
          '<button class="btn big ghost" id="home-btn">' + (ctx.role === 'host' ? '방 닫고 처음 화면' : '처음 화면') + '</button>' +
        '</div>';

    $('#app').innerHTML =
      '<section class="screen result">' +
        '<h1 class="wordmark small">' + V.wordmark(cfg.title) + '</h1>' +
        '<p class="result-sub">한 판 끝! ' + (n > 1 ? '모든 모둠의' : '우리 모둠의') + ' 길을 돌아봐요.</p>' +
        '<div class="result-tokens">' + tokenCards + '</div>' +
        '<div class="panel"><h2>이번 판에서 만난 주제</h2><div class="chips wrap">' + topicList + '</div></div>' +
        (logItems ? '<div class="panel"><h2>우리가 고른 선택</h2><ol class="log">' + logItems + '</ol></div>' : '') +
        (debrief ? '<div class="panel"><h2>함께 이야기해요</h2><ol class="debrief">' + debrief + '</ol></div>' : '') +
        controls +
      '</section>';
    info = null;
    var again = $('#again-btn'), home = $('#home-btn');
    if (again) again.addEventListener('click', function () { act('again'); });
    if (home) home.addEventListener('click', function () { act('home'); });
    window.scrollTo(0, 0);
  };

  // 제목 글자 하나하나를 살짝 다른 높이로 — 오르락내리락 느낌
  V.wordmark = function (title) {
    return Array.from(title).map(function (ch, i) {
      if (ch === ' ') return '<span class="wm-space"> </span>';
      return '<span class="wm-ch" style="--i:' + i + '">' + esc(ch) + '</span>';
    }).join('');
  };
})();
