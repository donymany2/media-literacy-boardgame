/*
 * 엔진 공통 모듈 — 카드팩 등록, 난수, 카드 더미, 판 만들기, 카드팩 검사.
 * DOM을 쓰지 않으므로 브라우저와 Node(테스트) 양쪽에서 동작합니다.
 */
(function (root) {
  'use strict';

  var BG = root.BG = root.BG || {};
  BG.packs = BG.packs || {};

  /* ---------- 카드팩 등록 ----------
   * 카드팩의 각 파일이 자기 부분을 등록합니다.
   *   BG.registerPack('media-literacy', 'meta',  {...});  // pack.js
   *   BG.registerPack('media-literacy', 'cards', [...]);  // cards.js
   *   BG.registerPack('media-literacy', 'board', {...});  // board.js
   */
  BG.PACK_FILES = ['pack.js', 'cards.js', 'board.js'];

  BG.registerPack = function (id, part, data) {
    var pack = BG.packs[id] = BG.packs[id] || { id: id };
    pack[part] = data;
    return pack;
  };

  /* ---------- 난수 ---------- */
  // 시드를 주면 같은 결과가 반복됨(테스트용). 없으면 Math.random.
  BG.makeRng = function (seed) {
    if (seed === undefined || seed === null) return Math.random;
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  BG.shuffle = function (list, rng) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  };

  /* ---------- 카드 더미 ----------
   * 카드 종류(type)별로 더미를 따로 섞어 두고, 다 쓰면 다시 섞습니다.
   * 한 판에서 같은 카드가 연달아 나오지 않습니다.
   */
  function DeckSet(cards, rng) {
    this.rng = rng;
    this.byType = {};
    this.piles = {};
    for (var i = 0; i < cards.length; i++) {
      var type = cards[i].type;
      (this.byType[type] = this.byType[type] || []).push(cards[i]);
    }
  }

  DeckSet.prototype.types = function () {
    return Object.keys(this.byType);
  };

  DeckSet.prototype.draw = function (type) {
    // 요청한 종류가 없으면 딜레마 → 아무 카드 순으로 대체
    if (!this.byType[type]) type = this.byType.dilemma ? 'dilemma' : this.types()[0];
    if (!type) return null;
    var pile = this.piles[type];
    if (!pile || pile.length === 0) {
      pile = this.piles[type] = BG.shuffle(this.byType[type], this.rng);
    }
    return pile.pop();
  };

  BG.DeckSet = DeckSet;

  /* ---------- 판 만들기 ----------
   * 카드팩 board.layouts[칸 수]가 있으면 그대로 쓰고,
   * 없으면 board.autoRules 비율로 자동 배치합니다.
   *
   * 결과: { size, tiles: [null, tile1, ..., tileN] }
   *   tile = { n, type, deck?, to?, art }
   *   type: start | finish | normal | event | teacher | up | down
   */
  BG.buildBoard = function (pack, size) {
    var boardDef = pack.board || {};
    var layout = (boardDef.layouts && boardDef.layouts[size]) || BG.generateLayout(size, boardDef.autoRules);
    var tiles = [null];
    var n;

    for (n = 1; n <= size; n++) tiles.push({ n: n, type: 'normal' });
    tiles[1].type = 'start';
    tiles[size].type = 'finish';

    var events = layout.events || {};
    Object.keys(events).forEach(function (key) {
      var t = tiles[+key];
      if (t) { t.type = 'event'; t.deck = events[key]; }
    });
    (layout.teacher || []).forEach(function (k) {
      if (tiles[k]) tiles[k].type = 'teacher';
    });
    (layout.jumps || []).forEach(function (j) {
      var t = tiles[j.from];
      if (t && j.to >= 1 && j.to <= size) {
        t.type = j.to > j.from ? 'up' : 'down';
        t.to = j.to;
        if (j.label) t.label = j.label;
      }
    });

    // 칸 그림: 보통 칸은 카드팩의 그림 목록을 차례로 돌려 씀 → 칸마다 다른 그림
    var art = (pack.meta && pack.meta.tileArt) || {};
    var pool = art.normal || [''];
    var k = 0;
    for (n = 1; n <= size; n++) {
      var tile = tiles[n];
      if (tile.type === 'normal') {
        tile.art = pool[k++ % pool.length];
      } else if (tile.type === 'event') {
        tile.art = (art.deck && art.deck[tile.deck]) || art.event || '';
      } else {
        tile.art = art[tile.type] || '';
      }
    }

    return { size: size, tiles: tiles, layout: layout };
  };

  // 칸 수만 주면 비율에 맞춰 사건 칸·선생님 칸·지름길/미끄럼틀을 자동 배치
  BG.generateLayout = function (size, rules) {
    rules = rules || {};
    var eventRatio = rules.eventRatio || 0.32;
    var deckPattern = rules.deckPattern || ['dilemma', 'quiz', 'dilemma', 'chance', 'dilemma'];
    var teacherCount = rules.teacherCount !== undefined ? rules.teacherCount : (size >= 30 ? 2 : 1);
    var jumpCount = rules.jumpCount !== undefined ? rules.jumpCount : (size >= 30 ? 6 : 4);

    var used = {};
    used[1] = used[size] = true;
    var events = {};
    var eventCount = Math.round(size * eventRatio);
    var inner = size - 2;
    for (var i = 0; i < eventCount; i++) {
      var pos = 2 + Math.floor((i + 0.5) * inner / eventCount);
      while (used[pos] && pos < size - 1) pos++;
      if (used[pos]) continue;
      used[pos] = true;
      events[pos] = deckPattern[i % deckPattern.length];
    }

    function freeNear(target) {
      for (var d = 0; d < size; d++) {
        var a = target + d, b = target - d;
        if (a > 1 && a < size && !used[a]) return a;
        if (b > 1 && b < size && !used[b]) return b;
      }
      return null;
    }

    var teacher = [];
    for (i = 0; i < teacherCount; i++) {
      var tp = freeNear(Math.round(size * (i + 1) / (teacherCount + 1)));
      if (tp) { used[tp] = true; teacher.push(tp); }
    }

    // 지름길과 미끄럼틀을 번갈아, 판 전체에 고르게
    var jumps = [];
    var span = Math.max(3, Math.round(size / 5));
    for (i = 0; i < jumpCount; i++) {
      var up = i % 2 === 0;
      var from = freeNear(Math.round(size * (i + 1) / (jumpCount + 1)));
      if (!from) break;
      used[from] = true;
      var to = freeNear(up ? Math.min(size - 2, from + span) : Math.max(2, from - span));
      if (!to || (up ? to <= from : to >= from)) { used[from] = false; continue; }
      used[to] = true;
      jumps.push({ from: from, to: to });
    }

    return { events: events, teacher: teacher, jumps: jumps, generated: true };
  };

  /* ---------- 카드팩 검사 ----------
   * 문제가 있으면 경고 문구 배열을 돌려줍니다(게임은 계속 진행).
   */
  BG.validatePack = function (pack, sizes) {
    var warnings = [];
    if (!pack) return ['카드팩을 찾을 수 없습니다.'];
    if (!pack.meta) warnings.push('pack.js(meta)가 등록되지 않았습니다.');
    if (!pack.cards || !pack.cards.length) warnings.push('cards.js에 카드가 없습니다.');
    if (!pack.board) warnings.push('board.js가 등록되지 않았습니다. 판을 자동 배치합니다.');

    var ids = {};
    (pack.cards || []).forEach(function (c, i) {
      var where = '카드 ' + (c.id || '#' + (i + 1));
      if (!c.id) warnings.push(where + ': id가 없습니다.');
      else if (ids[c.id]) warnings.push(where + ': id가 중복됩니다.');
      ids[c.id] = true;
      if (['dilemma', 'quiz', 'chance'].indexOf(c.type) < 0) warnings.push(where + ': type은 dilemma/quiz/chance 중 하나여야 합니다.');
      if (c.type === 'dilemma' && (!c.choices || c.choices.length < 2)) warnings.push(where + ': 딜레마 카드는 선택지가 2개 이상 필요합니다.');
      if (c.type === 'quiz') {
        if (!c.options || c.options.length < 2) warnings.push(where + ': 퀴즈 카드는 보기(options)가 2개 이상 필요합니다.');
        if (typeof c.answer !== 'number' || !c.options || !c.options[c.answer]) warnings.push(where + ': 퀴즈 정답(answer) 번호가 올바르지 않습니다.');
      }
      if (c.type === 'chance' && !c.effect) warnings.push(where + ': 기회/위기 카드는 effect가 필요합니다.');
      if (c.topic && pack.meta && pack.meta.topics && !pack.meta.topics[c.topic]) warnings.push(where + ': 알 수 없는 주제(topic) "' + c.topic + '"');
    });

    (sizes || []).forEach(function (size) {
      var board = BG.buildBoard(pack, size);
      var counts = {};
      for (var n = 1; n <= size; n++) counts[board.tiles[n].type] = (counts[board.tiles[n].type] || 0) + 1;
      var ratio = (counts.event || 0) / size;
      if (ratio < 0.3 || ratio > 0.35) {
        warnings.push(size + '칸 판: 사건 칸 비율 ' + Math.round(ratio * 100) + '% (권장 30~35%)');
      }
      (board.layout.jumps || []).forEach(function (j) {
        if (j.from <= 1 || j.from >= size) warnings.push(size + '칸 판: ' + j.from + '번 칸에는 지름길/미끄럼틀을 둘 수 없습니다.');
        var dest = board.tiles[j.to];
        if (dest && (dest.type === 'up' || dest.type === 'down')) warnings.push(size + '칸 판: ' + j.from + '→' + j.to + ' 도착 칸이 또 다른 지름길/미끄럼틀입니다.');
      });
    });
    return warnings;
  };

  /* ---------- 효과 문구 ---------- */
  // effect = { trust, judgment, move } → ['신뢰 +2', '판단력 +1', '2칸 전진']
  BG.describeEffect = function (effect, labels) {
    labels = labels || {};
    var out = [];
    effect = effect || {};
    function signed(v) { return (v > 0 ? '+' : '') + v; }
    if (effect.trust) out.push({ text: (labels.trust || '신뢰') + ' ' + signed(effect.trust), good: effect.trust > 0 });
    if (effect.judgment) out.push({ text: (labels.judgment || '판단력') + ' ' + signed(effect.judgment), good: effect.judgment > 0 });
    var move = effect.move || 0;
    if (move > 0) out.push({ text: (effect.shortcut ? '지름길! ' : '') + move + '칸 전진', good: true });
    else if (move < 0) out.push({ text: (-move) + '칸 미끄러짐', good: false });
    else if (effect.move === 0) out.push({ text: '제자리', good: null });
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);
