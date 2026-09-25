/*
 * 엔진 점검 + 진행 시간 추정 시뮬레이션 (브라우저 없이 Node로 실행)
 *   node tests/simulate.js [카드팩 id] [판 수]
 *
 * 1) 카드팩 검사 경고 출력
 * 2) 무작위로 수백 판을 두어 규칙 위반(칸 범위, 점수 음수 등)이 없는지 확인
 * 3) 평균 주사위 횟수, 카드 수로 한 판에 걸리는 시간을 대략 추정
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var root = path.join(__dirname, '..');
var packId = process.argv[2] || 'media-literacy';
var games = +(process.argv[3] || 500);

// 추정용 시간(초): 주사위+이동 한 번, 카드 한 장(토의 포함), 선생님 칸, 되돌아보기
var SEC = { roll: 20, card: 75, teacher: 60, reflect: 30 };

function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}

load('engine/core.js');
load('engine/game.js');
BG.PACK_FILES.forEach(function (f) { load('packs/' + packId + '/' + f); });

var pack = BG.packs[packId];
var sizes = [40, 25];
var failures = 0;

function check(cond, msg) {
  if (!cond) { failures++; if (failures < 20) console.error('  실패: ' + msg); }
}

var warnings = BG.validatePack(pack, sizes);
console.log('카드팩: ' + (pack.meta && pack.meta.name) + ' (' + pack.cards.length + '장)');
console.log(warnings.length ? '경고:\n  - ' + warnings.join('\n  - ') : '카드팩 검사: 경고 없음');

sizes.forEach(function (size) {
  [[1, 6], [2, 6], [4, 6], [1, 4]].forEach(function (variant) {
    var tokenCount = variant[0], dieFaces = variant[1];
    var total = { rolls: 0, cards: 0, teacher: 0, reflect: 0, trust: 0, judgment: 0, sec: 0 };
    var maxSec = 0;
    for (var g = 0; g < games; g++) {
      var rng = BG.makeRng(g + 1);
      var game = new BG.Game({ pack: pack, size: size, tokens: tokenCount, dieFaces: dieFaces, rng: rng });
      var sec = 0, guard = 0;
      while (!game.over && guard++ < 1000) {
        var t = game.currentToken();
        if (t.reflect) { game.resolveReflect(rng() < 0.7); total.reflect++; sec += SEC.reflect; }
        game.moveBy(game.rollDie());
        sec += SEC.roll;
        var land = game.landing();
        if (land.kind === 'jump') {
          var before = t.pos;
          game.applyJump();
          check(land.dir === 'up' ? t.pos > before : t.pos < before, 'jump 방향 ' + before + '→' + t.pos);
        } else if (land.kind === 'card') {
          var card = game.drawCard(land.deck);
          check(!!card, size + '칸: ' + land.deck + ' 카드를 뽑지 못함');
          var n = card.type === 'dilemma' ? card.choices.length : card.type === 'quiz' ? card.options.length : 1;
          game.resolveCard(card, Math.floor(rng() * n));
          total.cards++; sec += SEC.card;
        } else if (land.kind === 'teacher') {
          game.resolveTeacher(Math.floor(rng() * 3));
          total.teacher++; sec += SEC.teacher;
        }
        check(t.pos >= 1 && t.pos <= size, '위치 범위 ' + t.pos);
        check(t.trust >= 0 && t.judgment >= 0, '점수 음수');
        check(!isNaN(t.trust) && !isNaN(t.judgment), '점수 NaN');
        game.endTurn();
      }
      check(game.over, size + '칸 게임이 끝나지 않음');
      game.tokens.forEach(function (tk) { total.rolls += tk.rolls; total.trust += tk.trust; total.judgment += tk.judgment; });
      total.sec += sec;
      maxSec = Math.max(maxSec, sec);
      check(game.summary().tokens.every(function (s) { return s.awards.length > 0; }), '칭호가 하나도 없는 말');
    }
    var per = function (v) { return (v / games).toFixed(1); };
    var perTok = function (v) { return (v / games / tokenCount).toFixed(1); };
    console.log('\n[' + size + '칸, 말 ' + tokenCount + '개, 주사위 1~' + dieFaces + '] ' + games + '판');
    console.log('  말당 주사위 ' + perTok(total.rolls) + '회, 판당 카드 ' + per(total.cards) + '장, 선생님 ' + per(total.teacher) + '회, 되돌아보기 ' + per(total.reflect) + '회');
    console.log('  최종 점수(말 평균) 신뢰 ' + perTok(total.trust) + ', 판단력 ' + perTok(total.judgment));
    console.log('  예상 시간 평균 ' + (total.sec / games / 60).toFixed(1) + '분, 최대 ' + (maxSec / 60).toFixed(1) + '분');
  });
});

// 자동 배치(카드팩에 없는 칸 수)도 동작하는지
[30, 50].forEach(function (size) {
  var b = BG.buildBoard(pack, size);
  var types = {};
  for (var n = 1; n <= size; n++) types[b.tiles[n].type] = (types[b.tiles[n].type] || 0) + 1;
  console.log('\n자동 배치 ' + size + '칸: ' + JSON.stringify(types));
  check(b.tiles[1].type === 'start' && b.tiles[size].type === 'finish', '자동 배치 출발/도착');
});

console.log(failures ? '\n실패 ' + failures + '건' : '\n모든 점검 통과');
process.exit(failures ? 1 : 0);
