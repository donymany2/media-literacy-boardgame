/*
 * 앱 — 시작 화면, 학급 방(선생님 화면), 모둠 참여(태블릿), 게임 진행(감독)
 *
 * 역할
 *   solo : 기기 하나로 하기. 이 기기가 게임을 계산하고 모든 버튼을 누를 수 있음
 *   host : 선생님 화면(전자칠판). 게임을 계산하고 장면을 방에 올림. 선생님 칸 평가, 끝내기
 *   team : 모둠 태블릿. 선생님 화면과 같은 장면을 보여 주고, 자기 모둠 차례에만 버튼이 켜짐
 *
 * 감독(Director)은 게임 규칙(BG.Game)으로 장면을 차례로 만들고,
 * 입력이 필요한 장면에서는 버튼(이 기기 또는 해당 모둠 태블릿)을 기다립니다.
 */
(function () {
  'use strict';

  var BG = window.BG;
  var App = BG.App = {};
  var View = BG.View;
  var sound = BG.Sound;

  var cfg, pack, meta, params;
  var settings = {};
  var STOP = { stop: true };
  var HOST_KEY = 'updownroad-host';
  var TEAM_KEY = 'updownroad-team:';

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var esc = View.esc;

  /* ================= 시작 ================= */

  App.start = function (config, p, urlParams) {
    cfg = config;
    pack = p;
    meta = p.meta || {};
    params = urlParams;
    applyTheme();
    View.init(cfg, pack);
    document.addEventListener('pointerdown', sound.unlock, { once: true });

    var mode = find(cfg.modes, params.get('mode')) || find(cfg.modes, cfg.defaultMode) || cfg.modes[0];
    var tokens = parseInt(params.get('tokens'), 10);
    if (!(tokens >= 1 && tokens <= cfg.maxTokens)) tokens = cfg.defaultTokens;
    settings = { mode: mode, tokens: tokens, randomBoard: cfg.randomBoard !== false, speed: cfg.defaultSpeed || 'normal' };

    var room = (params.get('room') || '').replace(/\D/g, '');
    if (room) joinScreen(room);
    else showSetup();
  };

  function find(list, id) { return list.filter(function (m) { return m.id === id; })[0]; }

  function applyTheme() {
    var root = document.documentElement.style;
    var t = cfg.theme;
    Object.keys(t).forEach(function (k) { if (typeof t[k] === 'string') root.setProperty('--' + k, t[k]); });
    root.setProperty('--font', cfg.fontFamily);
    root.setProperty('--display', cfg.displayFont || cfg.fontFamily);
    root.setProperty('--numfont', cfg.numberFont || cfg.fontFamily);
    document.title = cfg.title;
    var mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.setAttribute('content', t.bg);
  }

  function netConfig() {
    var net = {};
    Object.keys(cfg.net || {}).forEach(function (k) { net[k] = cfg.net[k]; });
    // 시험용: ?broker=ws://localhost:포트 (이 컴퓨터 안의 중계 서버만 허용)
    var b = params.get('broker');
    if (b && /^wss?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/.test(b)) net.brokers = [{ url: b }];
    return net;
  }

  function useLocalNet() { return params.get('net') === 'local'; }

  function setNetStatus(text, kind) {
    var el = $('#net-status');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'net-status' + (kind ? ' ' + kind : '') + (text ? ' show' : '');
  }

  function speedPreset() {
    var s = (cfg.speeds || {})[settings.speed] || {};
    return { stepMs: s.stepMs || 840, upMs: s.upMs || 4500, downMs: s.downMs || 4200, diceMs: s.diceMs || 1000 };
  }

  function cardMemory() {
    if (cfg.rememberCards === false) return null;
    var key = 'updown-road-seen:' + pack.id;
    return {
      load: function () { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } },
      save: function (ids) { try { localStorage.setItem(key, JSON.stringify(ids)); } catch (e) { /* 기억 없이 진행 */ } }
    };
  }

  function readHostSave() {
    try {
      var d = JSON.parse(localStorage.getItem(HOST_KEY) || 'null');
      if (d && Date.now() - d.savedAt < 3 * 3600 * 1000 && d.game && !d.game.over) return d;
    } catch (e) { /* 무시 */ }
    return null;
  }

  function clearHostSave() { try { localStorage.removeItem(HOST_KEY); } catch (e) { /* 무시 */ } }

  /* ================= 시작 화면 ================= */

  function optButtons(list, current, attr) {
    return list.map(function (o) {
      return '<button class="opt" ' + attr + '="' + esc(o.id) + '" aria-pressed="' + (o.id === current) + '"><b>' + esc(o.label) + '</b>' +
        (o.sub ? '<small>' + esc(o.sub) + '</small>' : '') + '</button>';
    }).join('');
  }

  function showSetup() {
    View.closeModal();
    setNetStatus('');
    var tokenButtons = '';
    for (var i = 1; i <= cfg.maxTokens; i++) {
      tokenButtons += '<button class="opt tok" data-tokens="' + i + '" aria-pressed="' + (i === settings.tokens) + '" style="--c:' + View.teamColor(i - 1) + '"><b>' + i + '</b></button>';
    }
    var speeds = cfg.speeds || {};
    var speedList = Object.keys(speeds).map(function (k) { return { id: k, label: speeds[k].label || k }; });
    var saved = readHostSave();

    $('#app').innerHTML =
      '<section class="screen setup">' +
        '<div class="setup-top">' + View.soundButton() + '</div>' +
        '<div class="cover">' +
          '<div class="cover-art" aria-hidden="true">' + (cfg.logo ? '<img class="logo" src="' + esc(cfg.logo) + '" alt="">' : '') + '</div>' +
          '<h1 class="wordmark">' + View.wordmark(cfg.title) + '</h1>' +
          '<p class="subtitle">' + esc(cfg.subtitle) + '</p>' +
          '<p class="pack-name">카드팩 · ' + esc(meta.name || pack.id) + ' · 카드 ' + (pack.cards || []).length + '장</p>' +
          (saved ? '<div class="resume-box"><p>진행 중인 학급 방이 있어요 (방 ' + esc(saved.room) + ')</p>' +
            '<button class="btn primary" id="resume-btn">이어서 하기</button><button class="linklike" id="resume-clear">지우기</button></div>' : '') +
          '<div class="setup-grid">' +
            '<div class="field"><h2>판 크기</h2><div class="opts" id="mode-opts">' +
              optButtons(cfg.modes.map(function (m) { return { id: m.id, label: m.label, sub: m.size + '칸' }; }), settings.mode.id, 'data-mode') + '</div></div>' +
            '<div class="field"><h2>판 배치</h2><div class="opts" id="board-opts">' +
              optButtons([{ id: 'random', label: '매번 새 판', sub: '길이 매번 바뀜' }, { id: 'fixed', label: '고정 판', sub: '늘 같은 길' }], settings.randomBoard ? 'random' : 'fixed', 'data-board') + '</div></div>' +
            '<div class="field"><h2>모둠 수</h2><div class="opts tokens-opts" id="token-opts">' + tokenButtons + '</div></div>' +
            (speedList.length ? '<div class="field"><h2>말 속도</h2><div class="opts" id="speed-opts">' + optButtons(speedList, settings.speed, 'data-speed') + '</div></div>' : '') +
          '</div>' +
          '<div class="start-buttons">' +
            '<button class="btn big primary start" id="start-btn">기기 하나로 시작</button>' +
            '<button class="btn big class-btn" id="host-btn">학급 방 만들기 <small>선생님 화면(전자칠판)에서</small></button>' +
          '</div>' +
          '<button class="linklike join-link" id="join-link">모둠 태블릿으로 참여하기 (방 번호 입력)</button>' +
        '</div>' +
        (cfg.credit ? '<p class="credit">' + esc(cfg.credit) + '</p>' : '') +
      '</section>';

    bindOpts('#mode-opts', 'data-mode', function (v) { settings.mode = find(cfg.modes, v); });
    bindOpts('#board-opts', 'data-board', function (v) { settings.randomBoard = v === 'random'; });
    bindOpts('#token-opts', 'data-tokens', function (v) { settings.tokens = +v; });
    bindOpts('#speed-opts', 'data-speed', function (v) { settings.speed = v; });
    $('#start-btn').addEventListener('click', function () { sound.unlock(); startSolo(); });
    $('#host-btn').addEventListener('click', function () { sound.unlock(); createRoom(); });
    $('#join-link').addEventListener('click', function () { joinScreen(''); });
    var rb = $('#resume-btn');
    if (rb) rb.addEventListener('click', function () { resumeRoom(saved); });
    var rc = $('#resume-clear');
    if (rc) rc.addEventListener('click', function () { clearHostSave(); showSetup(); });
    View.bindSoundButton();
  }

  function bindOpts(sel, attr, fn) {
    var g = $(sel);
    if (!g) return;
    g.addEventListener('click', function (e) {
      var b = e.target.closest('[' + attr + ']');
      if (!b) return;
      fn(b.getAttribute(attr));
      View.pressOnly(g, b);
      sound.tap();
    });
  }

  /* ================= 게임 만들기 ================= */

  function newGame() {
    return new BG.Game({
      pack: pack,
      size: settings.mode.size,
      tokens: settings.tokens,
      endWhen: cfg.endWhen,
      dieFaces: cfg.dieFaces,
      randomBoard: settings.randomBoard,
      cardMemory: cardMemory()
    });
  }

  function gameInfo(game) {
    return {
      gid: 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      size: game.size,
      layout: game.layout,
      teams: game.tokens.length,
      speed: speedPreset(),
      modeLabel: settings.mode.label,
      randomBoard: settings.randomBoard,
      speedId: settings.speed,
      modeId: settings.mode.id,
      rankBy: (cfg.classroom || {}).rankBy || 'score'
    };
  }

  /* ================= 혼자 하기 ================= */

  function startSolo() {
    var game = newGame();
    var d = new Director({ game: game, info: gameInfo(game), role: 'solo' });
    View.onAction(function (action, value) {
      if (action === 'stop') return d.stop();
      if (action === 'again') return startSolo();
      if (action === 'home') return showSetup();
      d.input(action, value, null);
    });
    d.start();
  }

  /* ================= 감독 ================= */

  function Director(o) {
    this.game = o.game;
    this.info = o.info;
    this.role = o.role;
    this.conn = o.conn || null;
    this.room = o.room || null;
    this.seq = o.seq || 0;
    this.pending = null;
    this.backlog = [];
    this.stopped = false;
    this.done = false;
    // 학급 방에서만: 딜레마별로 모둠들이 고른 선택(원래 순서 기준) 모음 { 카드id: { counts: [], teams: {} } }
    this.shared = o.role === 'host' ? (o.shared || {}) : null;
  }

  function classCfg() { return cfg.classroom || {}; }

  Director.prototype.start = function () {
    View.mount(this.info, this.game.snap(), { role: this.role, room: this.room });
    if (this.onMount) this.onMount();
    return this.run();
  };

  Director.prototype.state = function (sc) {
    return { v: 1, ts: Date.now(), seq: this.seq, room: this.room, game: this.info, snap: this.game.snap(), scene: sc };
  };

  Director.prototype.show = function (sc) {
    if (this.stopped && sc.kind !== 'result') return Promise.reject(STOP);
    this.seq++;
    var st = this.state(sc);
    if (this.conn) this.conn.publishState(st);
    if (this.role === 'host') {
      try {
        localStorage.setItem(HOST_KEY, JSON.stringify({ room: this.room, info: this.info, game: this.game.toJSON(), seq: this.seq, savedAt: Date.now(), settings: { mode: settings.mode.id, speed: settings.speed, randomBoard: settings.randomBoard, tokens: settings.tokens } }));
      } catch (e) { /* 저장 못 해도 진행 */ }
    }
    if (this.onSeq) this.onSeq(this.seq);
    return View.play(sc, st.snap, false);
  };

  // 입력이 필요한 장면: 보여 주고, 허용된 행동이 들어올 때까지 기다림
  Director.prototype.ask = function (sc, actions) {
    var self = this;
    if (!sc.uid) sc.uid = 's' + (this.seq + 1);
    var waitFor = new Promise(function (resolve) {
      self.pending = { uid: sc.uid, actions: actions, team: sc.team, actor: sc.actor, resolve: resolve };
    });
    var queued = this.backlog.splice(0);
    queued.forEach(function (q) { self.input(q.action, q.value, q.intent); });
    return this.show(sc).then(function () { return waitFor; }).then(function (r) {
      if (r.action === '__stop') throw STOP;
      return r;
    });
  };

  // intent가 있으면 모둠 태블릿에서 온 입력
  Director.prototype.input = function (action, value, intent) {
    var p = this.pending;
    if (!p) {
      if (intent && this.backlog.length < 6) this.backlog.push({ action: action, value: value, intent: intent });
      return;
    }
    if (intent) {
      if (intent.uid !== p.uid) return;
      if (p.actor === 'host' || intent.team !== p.team) return;
    }
    if (p.actions.indexOf(action) < 0) return;
    this.pending = null;
    p.resolve({ action: action, value: value });
  };

  Director.prototype.stop = function () {
    if (this.done) return;
    this.stopped = true;
    if (this.pending) { var p = this.pending; this.pending = null; p.resolve({ action: '__stop' }); }
  };

  Director.prototype.run = async function () {
    var game = this.game;
    try {
      while (!game.over) await this.turn();
    } catch (e) {
      if (e !== STOP) throw e;
      game.stop();
    }
    this.done = true;
    await this.show({ kind: 'result', summary: game.summary() });
    if (this.role === 'host') clearHostSave();
  };

  Director.prototype.turn = async function () {
    var game = this.game;
    var idx = game.current, t = game.currentToken();
    var wasFinished = t.finished;
    var announce = true;
    if (t.reflect) {
      var r = await this.ask({ kind: 'reflect', team: idx, reason: t.reflect, announce: true }, ['yes', 'no']);
      game.resolveReflect(r.action === 'yes');
      announce = false;
    }
    await this.ask({ kind: 'turn', team: idx, announce: announce }, ['roll']);
    var value = game.rollDie();
    await this.show({ kind: 'roll', team: idx, value: value });
    var mv = game.moveBy(value);
    await this.show({ kind: 'move', team: idx, path: mv.path });
    await this.resolveTile(idx, { cards: 0 }, true);
    if (game.tokens[idx].finished && !wasFinished) await this.show({ kind: 'finish', team: idx });
    game.endTurn();
  };

  // 도착한 칸 처리. 업로드·다운로드 뒤 도착 칸의 카드도 나옴(한 차례에 카드는 최대 2장)
  Director.prototype.resolveTile = async function (idx, turnCtx, allowCard) {
    var game = this.game;
    var land = game.landing();
    if (land.kind === 'finish' || land.kind === 'none') return;
    if (land.kind !== 'jump' && !allowCard) return;
    await this.show({ kind: 'highlight', team: idx, tile: game.tokens[idx].pos });

    if (land.kind === 'jump') {
      var from = game.tokens[idx].pos;
      game.applyJump();
      await this.show({ kind: 'jump', team: idx, from: from, to: land.to });
      return this.resolveTile(idx, turnCtx, turnCtx.cards < 2);
    }

    if (land.kind === 'card') {
      turnCtx.cards++;
      var card = this.drawShared(idx, land.deck) || game.drawCard(land.deck);
      if (!card) return;
      var res = await this.cardFlow(idx, card);
      if (res.move && res.move.from !== res.move.to) {
        await this.show({ kind: 'announce', team: idx, move: { from: res.move.from, to: res.move.to } });
        await this.show({ kind: 'move', team: idx, path: res.move.path });
        await this.resolveTile(idx, turnCtx, false);
      }
      return;
    }

    if (land.kind === 'teacher') {
      turnCtx.cards++;
      await this.teacherFlow(idx);
    }
  };

  Director.prototype.cardFlow = async function (idx, card) {
    var game = this.game;
    var uid = 'c' + (this.seq + 1);
    if (card.type === 'chance') {
      await this.ask({ kind: 'card', team: idx, card: card, uid: uid }, ['ok']);
      return game.resolveCard(card, 0);
    }
    var items = card.type === 'quiz' ? card.options : card.choices;
    var selected = null;
    var others = this.othersFor(card, idx);
    for (;;) {
      var r = await this.ask({ kind: 'card', team: idx, card: card, uid: uid, selected: selected, others: others }, ['select', 'confirm']);
      if (r.action === 'select') {
        if (typeof r.value === 'number' && r.value >= 0 && r.value < items.length) selected = r.value;
        continue;
      }
      if (selected !== null) break;
    }
    this.recordChoice(card, idx, selected);
    var reasoned = false;
    if (card.type === 'dilemma' && game.reasonBonus()) {
      var r2 = await this.ask({ kind: 'reason', team: idx, card: card, selected: selected, uid: uid + 'r' }, ['yes', 'no']);
      reasoned = r2.action === 'yes';
    }
    var out = game.outcomeOf(card, selected);
    var tk = game.tokens[idx];
    var before = { trust: tk.trust, judgment: tk.judgment };
    var res = game.resolveCard(card, selected, { reasoned: reasoned });
    var tone = toneOf(card, out);
    await this.ask({
      kind: 'outcome', team: idx, card: card, selected: selected, uid: uid + 'o',
      outcome: { effect: out.effect, feedback: out.feedback, correct: out.correct },
      bonus: reasoned ? game.reasonBonus() : null,
      // 모든 화면이 같은 연출·코멘트를 보이도록 선생님 화면(또는 혼자 하기 기기)이 정해서 보냄
      before: before,
      after: { trust: tk.trust, judgment: tk.judgment },
      tone: tone,
      comment: this.pickComment(tone === 'great' || tone === 'good' ? 'good' : 'bad')
    }, ['ok']);
    return res;
  };

  // 학급 방: 딜레마 칸에서 가끔, 다른 모둠이 이미 푼 딜레마를 다시 냄 (선택 비율을 비교해 볼 수 있게)
  // 누가·어디서가 바뀌는 카드는 상황이 달라지므로 다시 내지 않음
  Director.prototype.drawShared = function (idx, deck) {
    var cc = classCfg();
    if (!this.shared || deck !== 'dilemma' || !cc.othersChoices || !(Math.random() < (cc.repeatDilemmaChance || 0))) return null;
    var self = this;
    var ids = Object.keys(this.shared).filter(function (id) {
      var st = self.shared[id];
      var raw = cardById(id);
      return raw && !raw.slots && !st.teams[idx] && Object.keys(st.teams).length < 4;
    });
    if (!ids.length) return null;
    var raw = cardById(ids[Math.floor(Math.random() * ids.length)]);
    return BG.instantiateCard(raw, meta, Math.random);
  };

  function cardById(id) {
    var list = pack.cards || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  Director.prototype.recordChoice = function (card, idx, selected) {
    if (!this.shared || card.type !== 'dilemma') return;
    var c = card.choices[selected];
    if (!c || typeof c.orig !== 'number') return;
    var st = this.shared[card.id] = this.shared[card.id] || { counts: [], teams: {} };
    st.counts[c.orig] = (st.counts[c.orig] || 0) + 1;
    st.teams[idx] = true;
  };

  // 지금 화면에 보이는 선택지 순서(A, B, C)에 맞춘 다른 모둠의 선택 비율(%) — 누가 골랐는지·점수는 보내지 않음
  Director.prototype.othersFor = function (card, idx) {
    if (!this.shared || card.type !== 'dilemma' || !classCfg().othersChoices) return null;
    var st = this.shared[card.id];
    if (!st) return null;
    var otherTeams = Object.keys(st.teams).filter(function (t) { return +t !== idx; }).length;
    if (!otherTeams) return null;
    var counts = card.choices.map(function (c) { return st.counts[c.orig] || 0; });
    var total = counts.reduce(function (a, b) { return a + b; }, 0);
    if (!total) return null;
    // 합이 100이 되도록 반올림 (가장 큰 나머지 방식)
    var raw = counts.map(function (n) { return n * 100 / total; });
    var pct = raw.map(Math.floor);
    var left = 100 - pct.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (v, i) { return { i: i, r: v - Math.floor(v) }; })
      .sort(function (a, b) { return b.r - a.r; })
      .slice(0, left)
      .forEach(function (x) { pct[x.i]++; });
    return { percents: pct, teams: otherTeams };
  };

  // 결과의 분위기: great(정답·아주 좋은 선택) / good / soso(점수 변화 없음) / bad(신뢰를 잃음)
  function toneOf(card, out) {
    if (card.type === 'quiz') return out.correct ? 'great' : 'bad';
    var e = out.effect || {};
    var gain = (e.trust || 0) + (e.judgment || 0);
    if ((e.trust || 0) < 0) return 'bad';
    if (gain >= 3) return 'great';
    if (gain > 0) return 'good';
    return 'soso';
  }

  // 코멘트는 바로 전에 나온 것과 겹치지 않게 무작위로
  Director.prototype.pickComment = function (kind) {
    var pool = (meta.comments && meta.comments[kind]) || [];
    if (!pool.length) return '';
    this.lastComment = this.lastComment || {};
    var pick;
    for (var i = 0; i < 5; i++) {
      pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick !== this.lastComment[kind] || pool.length === 1) break;
    }
    this.lastComment[kind] = pick;
    return pick;
  };

  Director.prototype.teacherFlow = async function (idx) {
    var prompts = (meta.teacher && meta.teacher.prompts) || [''];
    var k = Math.floor(Math.random() * prompts.length);
    var uid = 't' + (this.seq + 1);
    var level = 2, first = true;
    for (;;) {
      var r = await this.ask({ kind: 'teacher', team: idx, actor: 'host', prompt: prompts[k], uid: uid, sound: first }, ['level', 'next']);
      first = false;
      if (r.action === 'next') { k = (k + 1) % prompts.length; continue; }
      level = r.value;
      break;
    }
    this.game.resolveTeacher(level, prompts[k]);
  };

  /* ================= 선생님: 학급 방 ================= */

  var host = null;   // { conn, room, seq, presence, director, lobby }

  function createRoom() {
    $('#app').innerHTML = '<section class="screen center-screen"><div class="panel narrow"><h2>학급 방을 만드는 중...</h2><p id="room-msg">인터넷 중계 서버에 연결하고 있어요.</p></div></section>';
    BG.Net.createRoom(netConfig(), {
      local: useLocalNet(),
      onTry: function (i) { var m = $('#room-msg'); if (m && i > 0) m.textContent = '다른 중계 서버로 다시 연결하는 중이에요... (' + (i + 1) + '번째)'; }
    }).then(function (conn) {
      startHost(conn, conn.code, 0);
      showLobby();
    }, function (err) {
      $('#app').innerHTML = '<section class="screen center-screen"><div class="panel narrow error"><h2>학급 방을 만들지 못했어요</h2><p>' + esc(err.message) + '</p>' +
        '<p class="hint">학교 인터넷이 중계 서버를 막고 있을 수 있어요. "기기 하나로 시작"은 인터넷 없이도 할 수 있어요.</p>' +
        '<button class="btn big primary" id="back-btn">처음 화면</button></div></section>';
      $('#back-btn').addEventListener('click', showSetup);
    });
  }

  function startHost(conn, room, seq) {
    host = { conn: conn, room: room, seq: seq, presence: {}, director: null, choiceStats: {} };
    conn.on('status', function (s) {
      setNetStatus(s === 'connected' ? '' : s === 'reconnecting' ? '인터넷 다시 연결 중...' : '인터넷 연결 끊김', s === 'connected' ? '' : 'warn');
    });
    conn.on('intent', function (it) {
      if (!it || typeof it.team !== 'number') return;
      if (it.action === 'hello') {
        var isNew = !host.presence[it.team];
        host.presence[it.team] = Date.now();
        if (host.director) View.setPresence(onlineMap());
        else if (isNew || it.first) publishLobby();
        return;
      }
      if (host.director) host.director.input(it.action, it.value, it);
    });
    // 30초마다 연결 표시 새로 고침
    host.presenceTimer = setInterval(function () { if (host && host.director) View.setPresence(onlineMap()); }, 15000);
  }

  function onlineMap() {
    var m = {}, now = Date.now();
    Object.keys(host.presence).forEach(function (k) { if (now - host.presence[k] < 50000) m[k] = true; });
    return m;
  }

  function joinUrl(room) {
    var base = location.href.split('#')[0].split('?')[0];
    var extra = [];
    ['net', 'broker', 'pack'].forEach(function (k) { if (params.get(k)) extra.push(k + '=' + encodeURIComponent(params.get(k))); });
    return base + '?room=' + room + (extra.length ? '&' + extra.join('&') : '');
  }

  function publishLobby() {
    if (!host) return;
    host.seq++;
    var joined = Object.keys(onlineMap()).map(Number);
    host.conn.publishState({ v: 1, ts: Date.now(), seq: host.seq, room: host.room, game: null, scene: { kind: 'lobby', teams: settings.tokens, joined: joined } });
    renderLobbyTeams();
  }

  function showLobby() {
    View.closeModal();
    var url = joinUrl(host.room);
    $('#app').innerHTML =
      '<section class="screen lobby">' +
        '<div class="lobby-card">' +
          '<h1 class="wordmark small">' + View.wordmark(cfg.title) + '</h1>' +
          '<p class="lobby-lead">모둠 태블릿에서 아래 주소로 들어오거나 QR을 찍어 주세요.</p>' +
          '<div class="lobby-main">' +
            '<div class="qr" id="qr" aria-label="참여 QR 코드"></div>' +
            '<div class="lobby-info">' +
              '<p class="room-label">방 번호</p><p class="room-code">' + esc(host.room) + '</p>' +
              '<p class="join-url"><span id="join-url">' + esc(url) + '</span></p>' +
              '<button class="btn small" id="copy-url">주소 복사</button>' +
            '</div>' +
          '</div>' +
          '<h2>모둠 연결 <small>' + settings.tokens + '모둠 · ' + esc(settings.mode.label) + ' ' + settings.mode.size + '칸 · ' + (settings.randomBoard ? '매번 새 판' : '고정 판') + '</small></h2>' +
          '<div class="lobby-teams" id="lobby-teams"></div>' +
          '<div class="btn-row center">' +
            '<button class="btn big primary" id="host-start">게임 시작</button>' +
            '<button class="btn big ghost" id="host-close">방 닫기</button>' +
          '</div>' +
          '<p class="hint">연결되지 않은 모둠이 있어도 시작할 수 있어요. 늦게 들어온 태블릿도 바로 지금 화면을 받아요.<br>게임은 이 화면에서 계산되니, 게임이 끝날 때까지 이 창을 닫지 마세요.</p>' +
        '</div>' +
      '</section>';
    renderLobbyTeams();
    publishLobby();
    makeQr(url);
    $('#copy-url').addEventListener('click', function () {
      var btn = this;
      var done = function () { btn.textContent = '복사했어요'; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { selectText($('#join-url')); });
      else selectText($('#join-url'));
    });
    $('#host-start').addEventListener('click', function () { sound.unlock(); startHostGame(); });
    $('#host-close').addEventListener('click', closeRoom);
    host.lobbyTimer = setInterval(renderLobbyTeams, 5000);
  }

  function selectText(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }

  function renderLobbyTeams() {
    var el = $('#lobby-teams');
    if (!el || !host) return;
    var on = onlineMap();
    var html = '';
    for (var i = 0; i < settings.tokens; i++) {
      html += '<div class="lobby-team' + (on[i] ? ' on' : '') + '" style="--c:' + View.teamColor(i) + '">' +
        '<span class="dot big" style="--c:' + View.teamColor(i) + '"></span><b>' + (i + 1) + '모둠</b><small>' + (on[i] ? '연결됨' : '기다리는 중') + '</small></div>';
    }
    el.innerHTML = html;
  }

  function makeQr(text) {
    var box = $('#qr');
    var draw = function () {
      if (!box || !window.QRCode) return;
      box.innerHTML = '';
      try { new window.QRCode(box, { text: text, width: 220, height: 220, colorDark: '#1B1A2E', colorLight: '#FFFFFF', correctLevel: window.QRCode.CorrectLevel.M }); } catch (e) { box.textContent = ''; }
    };
    if (window.QRCode) return draw();
    var s = document.createElement('script');
    s.src = cfg.net.qrLib;
    s.onload = draw;
    s.onerror = function () { if (box) box.innerHTML = '<p class="hint">QR을 만들 수 없어요. 주소나 방 번호를 입력해 주세요.</p>'; };
    document.head.appendChild(s);
  }

  function startHostGame(restored) {
    clearInterval(host.lobbyTimer);
    var game = restored ? restored.game : newGame();
    var info = restored ? restored.info : gameInfo(game);
    var d = new Director({ game: game, info: info, role: 'host', conn: host.conn, room: host.room, seq: host.seq, shared: host.choiceStats });
    host.director = d;
    d.onSeq = function (s) { host.seq = s; };
    d.onMount = function () { View.setPresence(onlineMap()); };
    View.onAction(function (action, value) {
      if (action === 'stop') return d.stop();
      if (action === 'again') { host.director = null; return startHostGame(); }
      if (action === 'home') return closeRoom();
      d.input(action, value, null);
    });
    d.start();
  }

  function closeRoom() {
    if (host) {
      host.seq++;
      host.conn.publishState({ v: 1, ts: Date.now(), seq: host.seq, room: host.room, game: null, scene: { kind: 'closed' } });
      clearInterval(host.lobbyTimer);
      clearInterval(host.presenceTimer);
      var c = host.conn;
      setTimeout(function () { c.close(); }, 800);
      host = null;
    }
    clearHostSave();
    showSetup();
  }

  // 선생님 화면을 새로 고쳤을 때: 같은 방 번호로 다시 연결해 지금 차례부터 이어서
  function resumeRoom(saved) {
    $('#app').innerHTML = '<section class="screen center-screen"><div class="panel narrow"><h2>방 ' + esc(saved.room) + '에 다시 연결하는 중...</h2></div></section>';
    BG.Net.reopenRoom(netConfig(), saved.room).then(function (c) {
      var s = saved.settings || {};
      settings.mode = find(cfg.modes, s.mode) || settings.mode;
      settings.speed = s.speed || settings.speed;
      settings.randomBoard = !!s.randomBoard;
      settings.tokens = saved.game.tokens.length;
      startHost(c, saved.room, saved.seq || 0);
      var game = BG.Game.restore(pack, saved.game, { cardMemory: cardMemory() });
      startHostGame({ game: game, info: saved.info });
    }, function (err) {
      $('#app').innerHTML = '<section class="screen center-screen"><div class="panel narrow error"><h2>다시 연결하지 못했어요</h2><p>' + esc(err.message) + '</p>' +
        '<button class="btn big primary" id="back-btn">처음 화면</button></div></section>';
      $('#back-btn').addEventListener('click', showSetup);
    });
  }

  /* ================= 모둠 태블릿 ================= */

  var team = null;   // { conn, room, myTeam, lastSeq, gid, queue, running, cid, teams }

  function joinScreen(room) {
    View.closeModal();
    $('#app').innerHTML =
      '<section class="screen center-screen join">' +
        '<div class="panel narrow">' +
          '<h1 class="wordmark small">' + View.wordmark(cfg.title) + '</h1>' +
          '<h2>모둠 태블릿으로 참여하기</h2>' +
          '<label class="field-label" for="room-input">선생님 화면에 보이는 방 번호 5자리</label>' +
          '<input id="room-input" class="room-input" inputmode="numeric" autocomplete="off" maxlength="5" value="' + esc(room) + '" placeholder="12345">' +
          '<button class="btn big primary wide" id="join-btn">들어가기</button>' +
          '<p class="error-text" id="join-error"></p>' +
          '<button class="linklike" id="join-back">처음 화면으로</button>' +
        '</div>' +
      '</section>';
    $('#join-btn').addEventListener('click', function () { connectTeam($('#room-input').value); });
    $('#room-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') connectTeam(this.value); });
    $('#join-back').addEventListener('click', function () { history.replaceState(null, '', location.pathname); showSetup(); });
    if (room && room.length === 5) connectTeam(room);
  }

  function connectTeam(room) {
    room = String(room || '').replace(/\D/g, '');
    var btn = $('#join-btn'), err = $('#join-error');
    if (btn) { btn.disabled = true; btn.textContent = '연결하는 중...'; }
    if (err) err.textContent = '';
    BG.Net.joinRoom(netConfig(), room).then(function (conn) {
      var stored = null;
      try { stored = sessionStorage.getItem(TEAM_KEY + room); } catch (e) { /* 무시 */ }
      team = { conn: conn, room: room, myTeam: stored !== null ? +stored : null, lastSeq: 0, gid: null, queue: [], running: false, cid: BG.Net.clientId(), teams: 0, latest: null };
      sound.setDefaultMuted(true);
      conn.on('status', function (s) {
        setNetStatus(s === 'connected' ? '' : s === 'reconnecting' ? '다시 연결 중...' : '연결 끊김', s === 'connected' ? '' : 'warn');
        if (s === 'connected') hello(true);
      });
      conn.on('state', onTeamState);
      View.onAction(function (action, value, sc) {
        if (!team || team.myTeam === null) return;
        conn.sendIntent({ cid: team.cid, team: team.myTeam, uid: sc && sc.uid, action: action, value: value, ts: Date.now() });
      });
      team.helloTimer = setInterval(function () { hello(false); }, 20000);
      waitingScreen('선생님 화면에 연결하는 중이에요...');
      setTimeout(function () { if (team && !team.latest) waitingScreen('방을 찾지 못했어요. 방 번호를 확인하거나, 선생님이 방을 만들었는지 확인해 주세요.', true); }, 8000);
    }, function (e) {
      if (btn) { btn.disabled = false; btn.textContent = '들어가기'; }
      if (err) err.textContent = e.message;
    });
  }

  function hello(first) {
    if (!team || team.myTeam === null) return;
    team.conn.sendIntent({ cid: team.cid, team: team.myTeam, action: 'hello', first: !!first, ts: Date.now() });
  }

  function waitingScreen(text, retry) {
    $('#app').innerHTML = '<section class="screen center-screen"><div class="panel narrow"><h1 class="wordmark small">' + View.wordmark(cfg.title) + '</h1>' +
      '<p class="wait-text">' + esc(text) + '</p>' + (retry ? '<button class="btn big primary" id="retry-btn">방 번호 다시 입력</button>' : '') + '</div></section>';
    var r = $('#retry-btn');
    if (r) r.addEventListener('click', function () { leaveTeam(); joinScreen(''); });
  }

  function leaveTeam() {
    if (!team) return;
    clearInterval(team.helloTimer);
    team.conn.close();
    team = null;
  }

  function onTeamState(st) {
    if (!team || !st || !st.scene) return;
    team.latest = st;
    var kind = st.scene.kind;
    if (kind === 'closed') {
      team.gid = null;
      waitingScreen('선생님이 방을 닫았어요. 수고했어요!', true);
      return;
    }
    var n = kind === 'lobby' ? st.scene.teams : (st.game && st.game.teams);
    if (n) team.teams = n;
    if (team.myTeam === null || team.myTeam >= team.teams) { teamPicker(st); return; }
    if (kind === 'lobby') { team.gid = null; team.queue = []; lobbyWait(st); return; }
    if (st.game && st.game.gid === team.gid && st.seq <= team.lastSeq) return;
    team.queue.push(st);
    pump();
  }

  async function pump() {
    if (team.running) return;
    team.running = true;
    try {
      while (team && team.queue.length) {
        var st = team.queue.shift();
        if (!st.game) continue;
        var fresh = st.game.gid !== team.gid;
        if (fresh) {
          View.mount(st.game, st.snap, { role: 'team', myTeam: team.myTeam, room: team.room });
          team.gid = st.game.gid;
          team.lastSeq = st.seq - 1;
        }
        // 놓친 장면이 있거나 밀려 있으면 애니메이션 없이 따라잡기
        var fast = fresh || st.seq !== team.lastSeq + 1 || team.queue.length >= 3;
        if (fresh && st.scene.kind !== 'result') fast = true;
        await View.play(st.scene, st.snap, fast);
        team.lastSeq = st.seq;
      }
    } finally {
      if (team) team.running = false;
    }
  }

  function teamPicker(st) {
    var joined = (st.scene && st.scene.joined) || [];
    var html = '';
    for (var i = 0; i < team.teams; i++) {
      var on = joined.indexOf(i) >= 0;
      html += '<button class="team-pick' + (on ? ' taken' : '') + '" data-team="' + i + '" style="--c:' + View.teamColor(i) + '">' +
        '<span class="dot big" style="--c:' + View.teamColor(i) + '"></span><b>' + (i + 1) + '모둠</b>' + (on ? '<small>연결됨</small>' : '') + '</button>';
    }
    $('#app').innerHTML = '<section class="screen center-screen"><div class="panel narrow wide-panel"><h1 class="wordmark small">' + View.wordmark(cfg.title) + '</h1>' +
      '<h2>우리 모둠을 골라 주세요</h2><div class="team-picks" id="team-picks">' + html + '</div>' +
      '<p class="hint">방 ' + esc(team.room) + '</p></div></section>';
    $('#team-picks').addEventListener('click', function (e) {
      var b = e.target.closest('[data-team]');
      if (!b) return;
      sound.unlock();
      team.myTeam = +b.dataset.team;
      try { sessionStorage.setItem(TEAM_KEY + team.room, String(team.myTeam)); } catch (err) { /* 무시 */ }
      hello(true);
      team.gid = null;
      team.lastSeq = 0;
      if (team.latest) onTeamState(team.latest);
    });
  }

  function lobbyWait(st) {
    var me = team.myTeam;
    $('#app').innerHTML = '<section class="screen center-screen"><div class="panel narrow"><h1 class="wordmark small">' + View.wordmark(cfg.title) + '</h1>' +
      '<div class="my-team-badge" style="--c:' + View.teamColor(me) + '"><span class="dot big" style="--c:' + View.teamColor(me) + '"></span>' + (me + 1) + '모둠</div>' +
      '<p class="wait-text">참가했어요! 선생님이 게임을 시작하면 자동으로 열려요.</p>' +
      '<p class="hint">연결된 모둠 ' + ((st.scene.joined || []).length) + ' / ' + st.scene.teams + '</p>' +
      '<button class="linklike" id="change-team">다른 모둠 고르기</button></div></section>';
    $('#change-team').addEventListener('click', function () {
      team.myTeam = null;
      try { sessionStorage.removeItem(TEAM_KEY + team.room); } catch (e) { /* 무시 */ }
      teamPicker(st);
    });
  }

  // 점검용 (테스트에서 사용)
  App.debug = function () { return { host: host, team: team }; };
})();
