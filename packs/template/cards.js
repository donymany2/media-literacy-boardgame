/*
 * 새 카드팩 틀 — 카드. 종류별 예시 한 장씩.
 * 필드 설명은 packs/media-literacy/cards.js 맨 위 주석을 참고하세요.
 */
BG.registerPack('template', 'cards', [
  {
    id: 'T-01', type: 'dilemma', topic: 'topicA',
    title: '카드 제목',
    situation: '상황 설명',
    // 선택지는 3개, 모두 일리가 있게. 순서는 게임에서 자동으로 섞임
    choices: [
      { text: '선택지 1', effect: { trust: 2, judgment: 0, move: 0 }, feedback: '결과 설명' },
      { text: '선택지 2', effect: { trust: 1, judgment: 2, move: 0 }, feedback: '결과 설명' },
      { text: '선택지 3', effect: { trust: -1, judgment: 0, move: 2 }, feedback: '결과 설명' }
    ]
  },
  {
    id: 'T-02', type: 'quiz', topic: 'topicB', shuffle: false,   // O/X는 순서 고정
    title: '퀴즈 제목',
    situation: '상황 설명',
    question: 'O/X 문제',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 0,
    correct: { trust: 2, judgment: 1, move: 1 },
    wrong: { trust: -1, move: 0 },
    explanation: '해설'
  },
  {
    id: 'T-03', type: 'chance', topic: 'topicA', label: '기회',
    title: '기회 카드 제목',
    situation: '상황 설명',
    effect: { trust: 1, move: 1 },
    feedback: '설명'
  }
]);
