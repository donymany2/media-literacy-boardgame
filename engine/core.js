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
  /* memory(선택): 이전 판에 나온 카드 번호를 기억하는 저장소
   *   load() → ['SRC-01', ...]  오래전에 나온 것부터 최근 순서
   *   save(ids)
   * 카드 더미를 만들 때 한 번도 안 나온 카드를 먼저, 그다음 오래전에 나온 카드 순으로 뽑음
   * → 같은 기기로 여러 번 해도 카드를 골고루 보게 됨 */
  function DeckSet(cards, rng, memory) {
    this.rng = rng;
    this.byType = {};
    this.piles = {};
    this.memory = memory || null;
    this.seenOrder = [];
    for (var i = 0; i < cards.length; i++) {
      var type = cards[i].type;
      (this.byType[type] = this.byType[type] || []).push(cards[i]);
    }
    if (this.memory) {
      var ids = {};
      cards.forEach(function (c) { ids[c.id] = true; });
      var loaded = [];
      try { loaded = this.memory.load() || []; } catch (e) { loaded = []; }
      this.seenOrder = loaded.filter(function (id) { return ids[id]; });
    }
  }

  DeckSet.prototype.types = function () {
    return Object.keys(this.byType);
  };

  DeckSet.prototype._buildPile = function (type) {
    var all = this.byType[type];
    var order = this.seenOrder;
    var unseen = all.filter(function (c) { return order.indexOf(c.id) < 0; });
    var seen = all.filter(function (c) { return order.indexOf(c.id) >= 0; });
    // pop()은 끝에서 꺼내므로: [최근에 나온 카드 ... 오래전에 나온 카드, 안 나온 카드(섞음)]
    seen.sort(function (a, b) { return order.indexOf(b.id) - order.indexOf(a.id); });
    return seen.concat(BG.shuffle(unseen, this.rng));
  };

  DeckSet.prototype.draw = function (type) {
    // 요청한 종류가 없으면 딜레마 → 아무 카드 순으로 대체
    if (!this.byType[type]) type = this.byType.dilemma ? 'dilemma' : this.types()[0];
    if (!type) return null;
    var pile = this.piles[type];
    if (!pile || pile.length === 0) pile = this.piles[type] = this._buildPile(type);
    var card = pile.pop();
    if (card && this.memory) {
      var i = this.seenOrder.indexOf(card.id);
      if (i >= 0) this.seenOrder.splice(i, 1);
      this.seenOrder.push(card.id);
      try { this.memory.save(this.seenOrder); } catch (e) { /* 저장 못 해도 게임은 계속 */ }
    }
    return card;
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
  BG.buildBoard = function (pack, size, layoutOverride) {
    var boardDef = pack.board || {};
    var layout = layoutOverride || (boardDef.layouts && boardDef.layouts[size]) || BG.generateLayout(size, boardDef.autoRules);
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

    // fill: 남은 모든 칸을 사건 칸으로 채움 (카드 종류는 fill 목록을 차례로 돌려 씀)
    if (layout.fill && layout.fill.length) {
      var f = 0;
      for (n = 2; n < size; n++) {
        if (tiles[n].type === 'normal') {
          tiles[n].type = 'event';
          tiles[n].deck = layout.fill[f++ % layout.fill.length];
        }
      }
    }

    // 칸 그림: 보통 칸과 사건 칸은 카드팩의 그림 목록을 차례로 돌려 씀 → 칸마다 다른 그림
    var art = (pack.meta && pack.meta.tileArt) || {};
    var pool = art.normal || [''];
    var k = 0;
    for (n = 1; n <= size; n++) {
      var tile = tiles[n];
      if (tile.type === 'normal' || tile.type === 'event') {
        tile.art = pool[k++ % pool.length];
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
    var eventCount = rules.fill ? 0 : Math.round(size * eventRatio);
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

    return { events: events, teacher: teacher, jumps: jumps, fill: rules.fill ? deckPattern : null, generated: true };
  };

  /* ---------- 매번 새 판 ----------
   * 게임을 시작할 때마다 업로드·다운로드 위치와 칸별 카드 종류를 새로 배치
   * 간격 규칙
   *   - 판을 업로드 개수만큼 구간으로 나눠, 구간마다 업로드 출발 칸을 하나씩 → 한쪽에 몰리지 않음
   *   - 다운로드도 같은 방식으로, 업로드와 반 구간 어긋나게
   *   - 출발 칸끼리는 minGap칸 이상 떨어짐, 한 칸을 두 번 쓰지 않음
   *   - 업로드는 도착 칸 바로 앞까지, 다운로드는 출발 직후 칸에는 두지 않음
   * rules = board.randomRules (packs/.../board.js)
   */
  BG.randomLayout = function (size, rules, rng) {
    rules = rules || {};
    var pick = function (table, dflt) {
      if (!table) return dflt;
      if (table[size] !== undefined) return table[size];
      return size >= 30 ? table.large : table.small;
    };
    var jc = pick(rules.jumps, size >= 30 ? { up: 3, down: 3 } : { up: 2, down: 2 });
    var teacherCount = pick(rules.teacher, size >= 30 ? 2 : 1);
    var minGap = rules.minGap || 3;
    var span = rules.span || [0.15, 0.3];
    var minLen = Math.max(3, Math.round(size * span[0]));
    var maxLen = Math.max(minLen + 1, Math.round(size * span[1]));
    var ri = function (a, b) { return a + Math.floor(rng() * (b - a + 1)); };

    for (var attempt = 0; attempt < 300; attempt++) {
      var used = {};
      used[1] = used[size] = true;
      var sources = [];
      var jumps = [];
      var ok = true;

      var place = function (count, up, offset) {
        var lo = up ? 3 : 6, hi = up ? size - 4 : size - 2;
        var seg = (hi - lo + 1) / count;
        for (var i = 0; i < count && ok; i++) {
          var a = Math.floor(lo + seg * (i + offset)), b = Math.min(hi, Math.floor(lo + seg * (i + offset + 1)) - 1);
          a = Math.min(a, hi);
          var done = false;
          for (var t = 0; t < 30 && !done; t++) {
            var from = ri(a, Math.max(a, b));
            var len = ri(minLen, maxLen);
            var to = up ? from + len : from - len;
            if (up && to > size - 1) to = size - 1;
            if (!up && to < 2) to = 2;
            if (Math.abs(to - from) < minLen - 1) continue;
            if (used[from] || used[to]) continue;
            if (sources.some(function (s) { return Math.abs(s - from) < minGap; })) continue;
            used[from] = used[to] = true;
            sources.push(from);
            jumps.push({ from: from, to: to });
            done = true;
          }
          if (!done) ok = false;
        }
      };
      place(jc.up, true, 0);
      place(jc.down, false, 0.5);
      if (!ok) continue;

      var teacher = [];
      for (var k = 0; k < teacherCount; k++) {
        var target = Math.round(size * (k + 1) / (teacherCount + 1)) + ri(-2, 2);
        for (var d = 0; d < size; d++) {
          var c1 = target + d, c2 = target - d;
          if (c1 > 1 && c1 < size && !used[c1]) { target = c1; break; }
          if (c2 > 1 && c2 < size && !used[c2]) { target = c2; break; }
        }
        used[target] = true;
        teacher.push(target);
      }

      // 나머지 칸의 카드 종류: 비율(fillWeights)대로 만들고 섞되, 같은 종류가 3칸 넘게 이어지지 않게
      var free = 0;
      for (var n = 2; n < size; n++) if (!used[n]) free++;
      var weights = rules.fillWeights || { dilemma: 7, quiz: 4, chance: 4 };
      var keys = Object.keys(weights), total = 0;
      keys.forEach(function (key) { total += weights[key]; });
      var fill = [];
      keys.forEach(function (key) {
        for (var q = 0; q < Math.round(free * weights[key] / total); q++) fill.push(key);
      });
      while (fill.length < free) fill.push(keys[0]);
      fill.length = free;
      for (var tries = 0; tries < 50; tries++) {
        fill = BG.shuffle(fill, rng);
        var run = 1, bad = false;
        for (var f = 1; f < fill.length; f++) {
          run = fill[f] === fill[f - 1] ? run + 1 : 1;
          if (run > 3 || (fill[f] === 'chance' && run > 2)) { bad = true; break; }
        }
        if (!bad) break;
      }

      return { teacher: teacher, jumps: jumps, fill: fill, random: true };
    }
    return null;   // 규칙에 맞는 배치를 못 찾으면 고정 판 사용
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
      var slotDefs = (pack.meta && pack.meta.slots) || {};
      Object.keys(c.slots || {}).forEach(function (slot) {
        if (!slotDefs[slot]) warnings.push(where + ': 알 수 없는 바꿔 끼우기 조각 "' + slot + '"');
        else c.slots[slot].forEach(function (v) {
          if (!slotDefs[slot][v]) warnings.push(where + ': 조각 ' + slot + '에 "' + v + '" 값이 없습니다.');
        });
      });
      if (c.topic && pack.meta && pack.meta.topics && !pack.meta.topics[c.topic]) warnings.push(where + ': 알 수 없는 주제(topic) "' + c.topic + '"');
    });

    (sizes || []).forEach(function (size) {
      var board = BG.buildBoard(pack, size);
      var counts = {};
      for (var n = 1; n <= size; n++) counts[board.tiles[n].type] = (counts[board.tiles[n].type] || 0) + 1;
      if (!counts.event) warnings.push(size + '칸 판: 사건 칸이 하나도 없습니다.');
      (board.layout.jumps || []).forEach(function (j) {
        if (j.from <= 1 || j.from >= size) warnings.push(size + '칸 판: ' + j.from + '번 칸에는 지름길/미끄럼틀을 둘 수 없습니다.');
        var dest = board.tiles[j.to];
        if (dest && (dest.type === 'up' || dest.type === 'down')) warnings.push(size + '칸 판: ' + j.from + '→' + j.to + ' 도착 칸이 또 다른 지름길/미끄럼틀입니다.');
      });
    });
    return warnings;
  };

  /* ---------- 바꿔 끼우는 카드(틀 카드) ----------
   * 문장 속 {who}, {where} 자리에 조각을 넣음. {who:이/가}처럼 쓰면 받침에 맞는 조사를 붙임.
   *   '{who:이/가} 물어봅니다' → '친한 친구가 물어봅니다' / '처음 보는 사람이 물어봅니다'
   */
  function hasBatchim(word) {
    var ch = String(word).trim().slice(-1).charCodeAt(0);
    if (ch < 0xAC00 || ch > 0xD7A3) return { yes: false, rieul: false };
    var jong = (ch - 0xAC00) % 28;
    return { yes: jong !== 0, rieul: jong === 8 };
  }

  BG.fillText = function (text, values) {
    if (!text || !values) return text;
    return String(text).replace(/\{(\w+)(?::([^}]+))?\}/g, function (all, slot, josa) {
      if (!(slot in values)) return all;
      var word = values[slot];
      if (!josa) return word;
      var pair = josa.split('/');
      var b = hasBatchim(word);
      if (pair[0] === '으로') return word + (b.yes && !b.rieul ? '으로' : '로');
      return word + (b.yes ? pair[0] : pair[1]);
    });
  };

  /* ---------- 카드 한 장 꺼내기 ----------
   * 원본 카드는 그대로 두고, 이번에 쓸 복사본을 만듦
   *  1) 바꿔 끼우는 조각(slots)을 무작위로 고르고 문장을 채움
   *  2) 조각에 따라 선택지 결과가 달라지면(by) 그 결과로 바꿈
   *  3) 선택지 순서를 섞고 A, B, C 이름을 다시 붙임 (shuffle: false면 섞지 않음)
   */
  BG.instantiateCard = function (card, meta, rng) {
    var slotDefs = (meta && meta.slots) || {};
    var picked = {}, values = {};
    Object.keys(card.slots || {}).forEach(function (slot) {
      var options = card.slots[slot];
      var key = options[Math.floor(rng() * options.length)];
      picked[slot] = key;
      values[slot] = (slotDefs[slot] && slotDefs[slot][key]) || key;
    });
    var fill = function (t) { return BG.fillText(t, values); };

    var inst = {};
    Object.keys(card).forEach(function (k) { inst[k] = card[k]; });
    inst.source = card;
    inst.picked = picked;
    inst.title = fill(card.title);
    inst.situation = fill(card.situation);
    if (card.question) inst.question = fill(card.question);
    if (card.feedback) inst.feedback = fill(card.feedback);
    if (card.explanation) inst.explanation = fill(card.explanation);

    function variant(c) {
      var out = { text: fill(c.text), effect: c.effect || {}, feedback: fill(c.feedback || '') };
      Object.keys(c.by || {}).forEach(function (slot) {
        var o = c.by[slot][picked[slot]];
        if (o) {
          if (o.effect) out.effect = o.effect;
          if (o.feedback) out.feedback = fill(o.feedback);
        }
      });
      return out;
    }

    var letters = 'ABCDEFG';
    if (card.type === 'dilemma') {
      var choices = card.choices.map(variant);
      if (card.shuffle !== false) choices = BG.shuffle(choices, rng);
      choices.forEach(function (c, i) { c.label = letters[i]; });
      inst.choices = choices;
    } else if (card.type === 'quiz') {
      var opts = card.options.map(function (o, i) {
        return { label: o.label, text: fill(o.text), correct: i === card.answer };
      });
      if (card.shuffle !== false) {
        opts = BG.shuffle(opts, rng);
        opts.forEach(function (o, i) { o.label = letters[i]; });
      }
      inst.options = opts;
      inst.answer = opts.map(function (o) { return o.correct; }).indexOf(true);
    }
    return inst;
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
