/*
 * 게임 규칙 — 이동, 칸 판정, 카드 결과 적용, 점수 계산, 차례 넘기기.
 * 화면(DOM)과 분리되어 있어 Node 시뮬레이션(tests/simulate.js)으로 검사할 수 있습니다.
 *
 * 한 차례의 흐름 (화면 쪽 ui.js가 이 순서로 호출)
 *   1. current().reflect 가 있으면 resolveReflect(설명했는지)
 *   2. rollDie() → moveBy(눈)
 *   3. landing() 결과에 따라
 *        jump    → applyJump()
 *        card    → drawCard(deck) → resolveCard(card, 선택 번호)
 *        teacher → resolveTeacher(평가 번호)
 *   4. endTurn()
 */
(function (root) {
  'use strict';

  var BG = root.BG;

  function Game(opts) {
    var pack = opts.pack;
    var scoring = (pack.meta && pack.meta.scoring) || {};

    this.pack = pack;
    this.size = opts.size;
    this.endWhen = opts.endWhen || 'all';
    this.dieFaces = opts.dieFaces || 6;
    this.rng = opts.rng || Math.random;
    this.board = BG.buildBoard(pack, opts.size);
    this.decks = new BG.DeckSet(pack.cards || [], this.rng);
    this.scoring = {
      trustStart: scoring.trustStart !== undefined ? scoring.trustStart : 10,
      judgmentStart: scoring.judgmentStart !== undefined ? scoring.judgmentStart : 0,
      min: scoring.min !== undefined ? scoring.min : 0   // 완전 탈락 없음: 점수는 이 값 아래로 내려가지 않음
    };

    this.tokens = [];
    for (var i = 0; i < (opts.tokens || 1); i++) {
      this.tokens.push({
        id: i,
        pos: 1,
        trust: this.scoring.trustStart,
        judgment: this.scoring.judgmentStart,
        rolls: 0,
        finished: false,
        finishOrder: null,
        reflect: null          // 카드 때문에 미끄러지면 다음 차례에 되돌아보기
      });
    }
    this.current = 0;
    this.finishCount = 0;
    this.over = false;
    this.log = [];             // 결과 화면의 '우리가 만난 카드' 목록
  }

  Game.prototype.currentToken = function () {
    return this.tokens[this.current];
  };

  Game.prototype.tile = function (n) {
    return this.board.tiles[n];
  };

  Game.prototype.rollDie = function () {
    var v = 1 + Math.floor(this.rng() * this.dieFaces);
    this.currentToken().rolls++;
    return v;
  };

  // steps만큼 이동(음수면 뒤로). 판 밖으로 나가지 않음. 지나간 칸 목록(path)을 돌려줌.
  Game.prototype.moveBy = function (steps, token) {
    token = token || this.currentToken();
    var from = token.pos;
    var to = Math.max(1, Math.min(this.size, from + steps));
    var path = [];
    var dir = to > from ? 1 : -1;
    for (var p = from; p !== to; ) { p += dir; path.push(p); }
    token.pos = to;
    this._checkFinish(token);
    return { from: from, to: to, path: path };
  };

  // 순간 이동(지름길/미끄럼틀 — 칸을 하나씩 지나지 않음)
  Game.prototype.jumpTo = function (to, token) {
    token = token || this.currentToken();
    var from = token.pos;
    token.pos = to;
    this._checkFinish(token);
    return { from: from, to: to, path: [to], jump: true };
  };

  Game.prototype._checkFinish = function (token) {
    if (!token.finished && token.pos >= this.size) {
      token.finished = true;
      token.finishOrder = ++this.finishCount;
    }
  };

  // 현재 말이 선 칸에서 무엇을 해야 하는지
  Game.prototype.landing = function () {
    var token = this.currentToken();
    var tile = this.tile(token.pos);
    if (token.finished) return { kind: 'finish', tile: tile };
    switch (tile.type) {
      case 'up':
      case 'down': return { kind: 'jump', tile: tile, dir: tile.type, to: tile.to };
      case 'event': return { kind: 'card', tile: tile, deck: tile.deck };
      case 'teacher': return { kind: 'teacher', tile: tile };
      default: return { kind: 'none', tile: tile };
    }
  };

  Game.prototype.applyJump = function () {
    var tile = this.tile(this.currentToken().pos);
    var move = this.jumpTo(tile.to);
    this._record({ kind: 'jump', dir: tile.type, from: move.from, to: move.to });
    return move;
  };

  // 카드를 뽑아 이번 판에 쓸 복사본으로 만듦(조각 바꿔 끼우기, 선택지 섞기)
  Game.prototype.drawCard = function (deck) {
    var card = this.decks.draw(deck);
    return card ? BG.instantiateCard(card, this.pack.meta, this.rng) : null;
  };

  // 카드의 선택 결과를 구함(아직 적용 전). 화면에서 결과를 보여줄 때 사용.
  Game.prototype.outcomeOf = function (card, choiceIndex) {
    if (card.type === 'dilemma') {
      var c = card.choices[choiceIndex];
      return { effect: c.effect || {}, feedback: c.feedback || '', choice: c };
    }
    if (card.type === 'quiz') {
      var correct = choiceIndex === card.answer;
      return {
        effect: (correct ? card.correct : card.wrong) || {},
        feedback: card.explanation || '',
        correct: correct,
        choice: card.options[choiceIndex]
      };
    }
    return { effect: card.effect || {}, feedback: card.feedback || '' };
  };

  // 이유 말하기 보너스 (딜레마 카드에서 고른 이유를 말하면)
  Game.prototype.reasonBonus = function () {
    var def = this.pack.meta.reason;
    return def && def.enabled !== false ? (def.bonus || { judgment: 1 }) : null;
  };

  // 카드 결과를 점수와 위치에 적용. opts.reasoned: 고른 이유를 말했는지
  Game.prototype.resolveCard = function (card, choiceIndex, opts) {
    opts = opts || {};
    var outcome = this.outcomeOf(card, choiceIndex);
    var bonus = opts.reasoned && card.type === 'dilemma' ? this.reasonBonus() : null;
    if (bonus) this._applyEffect(bonus);
    var move = this._applyEffect(outcome.effect, {
      type: card.type,
      title: card.title,
      choice: outcome.choice ? outcome.choice.text : ''
    });
    this._record({
      kind: 'card',
      cardId: card.id,
      cardType: card.type,
      topic: card.topic,
      title: card.title,
      choice: outcome.choice ? outcome.choice.text : null,
      correct: outcome.correct,
      reasoned: !!bonus,
      effect: outcome.effect
    });
    outcome.move = move;
    return outcome;
  };

  // 되돌아보기: 설명했으면 점수 일부 회복, 통과해도 벌점 없음
  Game.prototype.resolveReflect = function (explained) {
    var token = this.currentToken();
    var def = this.pack.meta.reflect || {};
    var effect = explained ? (def.success || { trust: 1 }) : (def.pass || {});
    var reason = token.reflect;
    token.reflect = null;
    this._applyEffect(effect);
    this._record({ kind: 'reflect', explained: !!explained, reason: reason && reason.title, effect: effect });
    return { effect: effect };
  };

  // 선생님 칸: 선생님이 고른 평가 단계의 효과를 적용
  Game.prototype.resolveTeacher = function (levelIndex, prompt) {
    var levels = (this.pack.meta.teacher && this.pack.meta.teacher.levels) || [];
    var level = levels[levelIndex] || { effect: {} };
    var move = this._applyEffect(level.effect || {}, { title: '선생님 질문' });
    this._record({ kind: 'teacher', prompt: prompt, level: level.label, effect: level.effect });
    return { effect: level.effect || {}, move: move };
  };

  Game.prototype._applyEffect = function (effect, source) {
    var token = this.currentToken();
    var min = this.scoring.min;
    token.trust = Math.max(min, token.trust + (effect.trust || 0));
    token.judgment = Math.max(min, token.judgment + (effect.judgment || 0));
    var move = null;
    if (effect.move) {
      move = this.moveBy(effect.move, token);
      // 카드 선택으로 미끄러졌으면 다음 차례 시작에 되돌아보기
      var reflectOn = !this.pack.meta.reflect || this.pack.meta.reflect.enabled !== false;
      // 신뢰를 잃고 미끄러진 선택만 되돌아보기 (신중하느라 늦어진 경우, 돌발 상황의 운은 제외)
      var mistake = effect.move < 0 && (effect.trust || 0) < 0;
      if (mistake && reflectOn && source && source.type !== 'chance' && move.to !== move.from) {
        token.reflect = { title: source.title, choice: source.choice, slid: move.from - move.to };
      }
    }
    return move;
  };

  Game.prototype._record = function (entry) {
    entry.token = this.current;
    this.log.push(entry);
  };

  // 다음 차례로. 끝났으면 over = true
  Game.prototype.endTurn = function () {
    var done = this.tokens.filter(function (t) { return t.finished; }).length;
    if (done === this.tokens.length || (this.endWhen === 'first' && done > 0)) {
      this.over = true;
      return null;
    }
    var n = this.tokens.length;
    for (var i = 1; i <= n; i++) {
      var next = (this.current + i) % n;
      if (!this.tokens[next].finished) { this.current = next; break; }
    }
    return this.currentToken();
  };

  // 선생님이 '게임 끝내기'를 눌렀을 때
  Game.prototype.stop = function () {
    this.over = true;
  };

  // 결과 화면용 요약
  Game.prototype.summary = function () {
    var awards = (this.pack.meta.results && this.pack.meta.results.awards) || [];
    var self = this;
    var tokens = this.tokens.map(function (t) {
      var stats = { trust: t.trust, judgment: t.judgment, rolls: t.rolls, finished: t.finished ? 1 : 0, pos: t.pos, size: self.size };
      return {
        id: t.id,
        trust: t.trust,
        judgment: t.judgment,
        rolls: t.rolls,
        pos: t.pos,
        finished: t.finished,
        awards: awards.filter(function (a) { return matches(a.when, stats); })
      };
    });
    return { tokens: tokens, log: this.log, size: this.size };
  };

  // when = { trust: [최소, 최대], rolls: [null, 최대], ... } 조건을 모두 만족하면 true
  // 값에 'size' 비율을 쓰고 싶으면 { pos: ['60%'] } 처럼 퍼센트 문자열 사용
  function matches(when, stats) {
    if (!when) return true;
    return Object.keys(when).every(function (key) {
      var range = when[key];
      var v = stats[key];
      var lo = resolve(range[0], stats), hi = resolve(range[1], stats);
      return (lo === null || v >= lo) && (hi === null || v <= hi);
    });
  }

  function resolve(v, stats) {
    if (v === undefined || v === null) return null;
    if (typeof v === 'string' && v.charAt(v.length - 1) === '%') return Math.ceil(stats.size * parseFloat(v) / 100);
    return v;
  }

  BG.Game = Game;
})(typeof window !== 'undefined' ? window : globalThis);
