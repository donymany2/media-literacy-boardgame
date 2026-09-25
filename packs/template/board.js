/*
 * 새 카드팩 틀 — 판 배치.
 * layouts를 비워 두면 autoRules 비율로 자동 배치됩니다.
 * 직접 배치하는 방법은 packs/media-literacy/board.js를 참고하세요.
 */
BG.registerPack('template', 'board', {
  layouts: {},
  autoRules: {
    eventRatio: 0.32,
    deckPattern: ['dilemma', 'quiz', 'dilemma', 'chance', 'dilemma']
  }
});
