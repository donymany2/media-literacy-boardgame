/*
 * 카드팩: 디지털 미디어 리터러시 — 판 배치
 *
 * layouts[칸 수]
 *   events   { 칸 번호: 카드 종류 }  사건 칸 (dilemma / quiz / chance)
 *   teacher  [칸 번호]               선생님께 질문하기 칸
 *   jumps    [{ from, to }]          고정 지름길(to > from) / 미끄럼틀(to < from)
 * 1번은 출발, 마지막 칸은 도착으로 자동 지정됩니다.
 *
 * 여기에 없는 칸 수(예: 30)를 설정하면 autoRules 비율로 자동 배치합니다.
 * ※ 임시 배치입니다. 판 전체 배치도는 다음 단계에서 확정합니다.
 */
BG.registerPack('media-literacy', 'board', {
  layouts: {
    // 표준 40칸(약 25분): 사건 13칸(32.5%), 선생님 2칸, 지름길 3 + 미끄럼틀 3
    40: {
      events: {
        3: 'dilemma', 6: 'quiz', 9: 'dilemma', 12: 'dilemma', 15: 'chance',
        19: 'dilemma', 22: 'dilemma', 25: 'quiz', 28: 'dilemma', 31: 'chance',
        34: 'dilemma', 36: 'dilemma', 38: 'quiz'
      },
      teacher: [20, 33],
      jumps: [
        { from: 4,  to: 14 },
        { from: 16, to: 24 },
        { from: 27, to: 35 },
        { from: 18, to: 8 },
        { from: 29, to: 21 },
        { from: 37, to: 30 }
      ]
    },
    // 압축 25칸(약 15분): 사건 8칸(32%), 선생님 1칸, 지름길 2 + 미끄럼틀 2
    25: {
      events: {
        3: 'dilemma', 6: 'dilemma', 8: 'quiz', 11: 'dilemma',
        16: 'chance', 19: 'dilemma', 21: 'quiz', 23: 'dilemma'
      },
      teacher: [14],
      jumps: [
        { from: 4,  to: 10 },
        { from: 12, to: 18 },
        { from: 17, to: 9 },
        { from: 24, to: 20 }
      ]
    }
  },

  autoRules: {
    eventRatio: 0.32,
    deckPattern: ['dilemma', 'quiz', 'dilemma', 'chance', 'dilemma'],
    // teacherCount, jumpCount를 생략하면 30칸 이상 2개/6개, 그 밑은 1개/4개
  }
});
