/*
 * 새 카드팩 틀 — 카드. 종류별 예시 한 장씩.
 * 필드 설명은 packs/media-literacy/cards.js 맨 위 주석을 참고하세요.
 */
BG.registerPack('template', 'cards', [
  {
    id: 'T-01', type: 'dilemma', topic: 'topicA',
    title: '카드 제목',
    situation: '상황 설명',
    choices: [
      { label: 'A', text: '선택지 A', effect: { trust: -2, move: -2 }, feedback: '결과 설명' },
      { label: 'B', text: '선택지 B', effect: { trust: 2, judgment: 1, move: 2 }, feedback: '결과 설명' }
    ]
  },
  {
    id: 'T-02', type: 'quiz', topic: 'topicB',
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
