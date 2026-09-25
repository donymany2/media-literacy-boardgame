/*
 * 카드팩: 디지털 미디어 리터러시 — 판 배치
 *
 * layouts[칸 수]
 *   teacher  [칸 번호]          선생님께 질문하기 칸
 *   jumps    [{ from, to }]     고정 업로드(지름길, to > from) / 다운로드(미끄럼틀, to < from)
 *   events   { 칸 번호: 종류 }   특정 칸의 카드 종류를 직접 정할 때 (선택)
 *   fill     [종류, ...]         나머지 모든 칸을 사건 칸으로 채움. 목록을 차례로 돌려 씀
 *            dilemma 딜레마 / quiz 돌발 퀴즈 / chance 돌발 상황
 * 1번은 출발, 마지막 칸은 도착으로 자동 지정됩니다.
 *
 * 여기에 없는 칸 수(예: 30)를 설정하면 autoRules로 자동 배치합니다.
 */
(function () {
  // 15칸마다 딜레마 7, 퀴즈 4, 돌발 4
  var FILL = ['dilemma', 'chance', 'quiz', 'dilemma', 'dilemma', 'quiz', 'chance', 'dilemma',
              'quiz', 'dilemma', 'chance', 'dilemma', 'quiz', 'chance', 'dilemma'];

  BG.registerPack('media-literacy', 'board', {
    layouts: {
      // 표준 40칸: 업로드 3 + 다운로드 3, 선생님 2, 나머지 30칸은 모두 사건 칸
      40: {
        teacher: [20, 33],
        jumps: [
          { from: 4,  to: 14 },
          { from: 16, to: 24 },
          { from: 27, to: 35 },
          { from: 18, to: 8 },
          { from: 29, to: 21 },
          { from: 37, to: 30 }
        ],
        fill: FILL
      },
      // 압축 25칸: 업로드 2 + 다운로드 2, 선생님 1, 나머지 18칸은 모두 사건 칸
      25: {
        teacher: [14],
        jumps: [
          { from: 4,  to: 10 },
          { from: 12, to: 18 },
          { from: 17, to: 9 },
          { from: 24, to: 20 }
        ],
        fill: FILL
      }
    },

    autoRules: {
      fill: true,
      deckPattern: FILL
    }
  });
})();
