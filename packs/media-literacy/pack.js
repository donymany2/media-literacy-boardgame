/*
 * 카드팩: 디지털 미디어 리터러시 — 기본 정보
 * 주제, 칸 그림, 점수 이름, 되돌아보기, 선생님 칸, 결과 칭호를 정의합니다.
 * (카드 문구는 cards.js, 칸 배치는 board.js)
 */
BG.registerPack('media-literacy', 'meta', {
  name: '디지털 미디어 리터러시',
  description: '출처 확인, 딥페이크, 개인정보, 온라인 예절, 알고리즘, 광고 구별',
  version: '0.1',

  // 주제 목록 — 카드의 topic 값과 이름·색을 연결
  topics: {
    source:    { name: '출처 확인',        color: '#1C7ED6' },
    deepfake:  { name: '딥페이크·AI',      color: '#AE3EC9' },
    privacy:   { name: '개인정보 보호',    color: '#E03E2D' },
    etiquette: { name: '온라인 예절·갈등', color: '#F08C00' },
    algorithm: { name: '알고리즘·추천',    color: '#0CA678' },
    ad:        { name: '광고 구별',        color: '#D6336C' }
  },

  // 카드 종류 이름
  cardTypes: {
    dilemma: '딜레마 카드',
    quiz: '퀴즈 카드',
    chance: '기회/위기 카드'
  },

  // 점수 이름 (신뢰 = 주 점수, 판단력 = 보조 점수)
  scoreLabels: { trust: '신뢰', judgment: '판단력' },
  scoring: { trustStart: 10, judgmentStart: 0, min: 0 },

  // 칸 그림. 이모지 대신 이미지 경로('packs/media-literacy/img/phone.png')도 사용 가능
  tileArt: {
    start: '🏠',
    finish: '🏁',
    teacher: '🙋',
    up: '📶',
    down: '🐛',
    event: '❓',
    deck: { dilemma: '🤔', quiz: '❔', chance: '🎁' },
    // 보통 칸 — 차례로 돌려 써서 칸마다 다른 그림이 나옴
    normal: ['📱', '💻', '🎧', '📷', '🛰️', '🎮', '⌨️', '🖱️', '📺', '💾', '🔍', '📰',
             '🎬', '🔒', '🌐', '✉️', '💬', '🔋', '📡', '🤖', '🎵', '🗺️', '⏰', '📚']
  },

  // 판 위 이름표
  tileLabels: {
    start: '출발', finish: '도착', teacher: '선생님께 질문',
    up: '지름길', down: '미끄럼틀', dilemma: '딜레마', quiz: '퀴즈', chance: '기회/위기'
  },

  // 되돌아보기 — 카드 선택 때문에 미끄러진 뒤, 다음 차례 시작에 나옴
  reflect: {
    enabled: true,
    title: '되돌아보기',
    prompt: '방금 미끄러진 이유를 모둠끼리 한 문장으로 말해 보세요.',
    hint: '"우리는 ~ 했기 때문에 미끄러졌다. 다음에는 ~ 하겠다."',
    success: { trust: 1 },   // 제대로 설명하면
    pass: {}                  // 통과해도 벌점 없음
  },

  // 선생님께 질문하기 칸 — 선생님이 즉석으로 묻고 평가 버튼을 누름
  teacher: {
    title: '선생님께 질문하기',
    intro: '손을 들어 선생님을 불러 주세요. 선생님이 모둠에게 질문합니다.',
    prompts: [
      '지금까지 만난 카드 중 가장 고민한 카드는 무엇이었나요? 왜 그렇게 골랐나요?',
      '가짜 정보인지 알아보는 방법을 두 가지 말해 보세요.',
      '온라인에서 알려 주면 안 되는 내 정보에는 무엇이 있을까요?',
      '광고인지 아닌지 알 수 있는 표시는 어디에 있을까요?',
      '추천 영상만 계속 보게 될 때 스스로 멈추는 방법은 무엇일까요?',
      '단톡방에서 친구가 놀림을 받을 때 우리가 할 수 있는 일은 무엇일까요?'
    ],
    levels: [
      { label: '아주 잘했어요', effect: { trust: 2, judgment: 1 } },
      { label: '좋아요',        effect: { trust: 1 } },
      { label: '다음에 다시',   effect: {} }
    ]
  },

  // 결과 화면 칭호 — 조건(when)을 만족하는 칭호를 모두 보여줌
  // when의 값은 [최소, 최대]. null은 제한 없음. '60%'는 판 크기의 60%
  results: {
    awards: [
      { title: '믿음직한 디지털 시민', when: { trust: [18, null] },    message: '신뢰 점수가 아주 높아요. 친구들이 믿고 정보를 나눌 수 있는 모둠이에요.' },
      { title: '성실한 디지털 시민',   when: { trust: [12, 17] },      message: '대부분의 상황에서 올바르게 판단했어요.' },
      { title: '성장하는 디지털 시민', when: { trust: [null, 11] },    message: '미끄러진 경험도 배움이에요. 되돌아본 내용을 기억해 두세요.' },
      { title: '신중한 탐정',          when: { judgment: [8, null] },  message: '한 번 더 확인하고 생각하는 힘이 뛰어나요.' },
      { title: '빠른 항해사',          when: { finished: [1, 1], rolls: [null, 9] }, message: '적은 횟수로 도착했어요. 빠르게 나아가는 것도 하나의 힘이에요.' }
    ],
    // 마무리 이야기 나누기 질문
    debrief: [
      '오늘 가장 기억에 남는 카드는 무엇인가요?',
      '실제로 비슷한 일을 겪은 적이 있나요? 그때 어떻게 했나요?',
      '앞으로 온라인에서 꼭 지키고 싶은 약속 한 가지를 정해 보세요.'
    ]
  }
});
