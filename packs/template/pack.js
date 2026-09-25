/*
 * 새 카드팩 틀 — 이 폴더(packs/template)를 복사해서 이름을 바꿔 쓰세요.
 *   1) 폴더 이름 예: packs/environment
 *   2) 세 파일의 'template'을 새 폴더 이름으로 바꾸기
 *   3) config.js의 pack 값을 바꾸거나, 링크에 ?pack=environment 붙이기
 * 필드 설명은 packs/media-literacy/pack.js를 참고하세요.
 */
BG.registerPack('template', 'meta', {
  name: '새 카드팩',
  description: '주제 설명',
  version: '0.1',

  topics: {
    topicA: { name: '주제 A', color: '#1C7ED6' },
    topicB: { name: '주제 B', color: '#2B9348' }
  },
  cardTypes: { dilemma: '딜레마 카드', quiz: '퀴즈 카드', chance: '기회/위기 카드' },
  scoreLabels: { trust: '신뢰', judgment: '판단력' },
  scoring: { trustStart: 10, judgmentStart: 0, min: 0 },

  tileArt: {
    start: '🏠', finish: '🏁', teacher: '🙋', up: '⬆️', down: '⬇️', event: '❓',
    deck: { dilemma: '🤔', quiz: '❔', chance: '🎁' },
    normal: ['🌱', '🌳', '🌊', '☀️']
  },
  tileLabels: {
    start: '출발', finish: '도착', teacher: '선생님께 질문',
    up: '지름길', down: '미끄럼틀', dilemma: '딜레마', quiz: '퀴즈', chance: '기회/위기'
  },

  reflect: {
    enabled: true,
    title: '되돌아보기',
    prompt: '방금 미끄러진 이유를 모둠끼리 한 문장으로 말해 보세요.',
    success: { trust: 1 },
    pass: {}
  },

  teacher: {
    title: '선생님께 질문하기',
    intro: '손을 들어 선생님을 불러 주세요.',
    prompts: ['선생님 질문 1', '선생님 질문 2'],
    levels: [
      { label: '아주 잘했어요', effect: { trust: 2, judgment: 1 } },
      { label: '좋아요', effect: { trust: 1 } },
      { label: '다음에 다시', effect: {} }
    ]
  },

  results: {
    awards: [
      { title: '칭호 1', when: { trust: [15, null] }, message: '설명' },
      { title: '칭호 2', when: { trust: [null, 14] }, message: '설명' }
    ],
    debrief: ['마무리 질문 1', '마무리 질문 2']
  }
});
