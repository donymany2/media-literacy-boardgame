/*
 * 카드팩: 디지털 미디어 리터러시 — 기본 정보
 * 주제, 바꿔 끼우는 조각, 칸 그림, 점수 이름, 이유 말하기, 되돌아보기, 선생님 칸, 결과 칭호.
 * (카드 문구는 cards.js, 칸 배치는 board.js)
 */
BG.registerPack('media-literacy', 'meta', {
  name: '디지털 미디어 리터러시',
  description: '출처 확인, 딥페이크·AI, 개인정보, 온라인 예절, 알고리즘, 광고 구별',
  version: '0.2',

  // 주제 목록 — 카드의 topic 값과 이름·색을 연결
  topics: {
    source:    { name: '출처 확인',        color: '#2F6BFF' },
    deepfake:  { name: '딥페이크·AI',      color: '#9B3FE0' },
    privacy:   { name: '개인정보 보호',    color: '#E8412F' },
    etiquette: { name: '온라인 예절·갈등', color: '#E07A00' },
    algorithm: { name: '알고리즘·추천',    color: '#0E9F6E' },
    ad:        { name: '광고 구별',        color: '#D9336E' }
  },

  // 바꿔 끼우는 조각 — 카드 문장의 {who}, {where} 자리에 무작위로 들어감
  slotLabels: { who: '누가', where: '어디서' },
  slots: {
    who: {
      friend: '친한 친구',
      stranger: '처음 보는 사람',
      sibling: '동생',
      youtuber: '유명 유튜버'
    },
    where: {
      chat: '단톡방',
      game: '게임 채팅',
      comment: '영상 댓글'
    }
  },

  // 카드 종류 이름
  cardTypes: {
    dilemma: '딜레마',
    quiz: '돌발 퀴즈',
    chance: '돌발 상황'
  },

  // 점수 이름 (신뢰 = 주 점수, 판단력 = 보조 점수)
  scoreLabels: { trust: '신뢰', judgment: '판단력' },
  scoring: { trustStart: 10, judgmentStart: 0, min: 0 },

  // 이 카드팩을 이루는 파일 (pack.js 다음에 차례로 읽음)
  files: ['art.js', 'cards.js', 'cards-2.js', 'cards-3.js', 'board.js'],

  // 칸 그림 — 'svg:이름'은 art.js에 직접 그린 그림. 이모지나 이미지 경로도 쓸 수 있음
  tileArt: {
    start: 'svg:start',
    finish: 'svg:finish',
    teacher: 'svg:teacher',
    up: 'svg:rocket',
    down: 'svg:snake',
    // 사건 칸 — 차례로 돌려 써서 칸마다 다른 디지털 친구가 나옴
    normal: ['svg:phone', 'svg:laptop', 'svg:camera', 'svg:robot', 'svg:chat', 'svg:detective', 'svg:lock', 'svg:wifi',
             'svg:gamepad', 'svg:mail', 'svg:tv', 'svg:bell', 'svg:headphone', 'svg:heart', 'svg:star', 'svg:cloud',
             'svg:battery', 'svg:book']
  },

  // 카드 그림 — 딜레마·퀴즈는 주제별 장면, 돌발 상황·되돌아보기·선생님은 종류별 장면
  cardArt: {
    topics: {
      source: 'svg:card-source', deepfake: 'svg:card-deepfake', privacy: 'svg:card-privacy',
      etiquette: 'svg:card-etiquette', algorithm: 'svg:card-algorithm', ad: 'svg:card-ad'
    },
    types: { chance: 'svg:card-chance', reflect: 'svg:card-reflect', teacher: 'svg:card-teacher', quiz: 'svg:card-quiz' }
  },

  // 판 위 이름표 (지름길 = 업로드, 미끄럼틀 = 다운로드)
  tileLabels: {
    start: '출발', finish: '도착', teacher: '선생님 질문',
    up: '업로드', down: '다운로드', dilemma: '딜레마', quiz: '퀴즈', chance: '돌발'
  },

  // 이유 말하기 — 딜레마 카드에서 선택한 뒤 "왜 골랐는지" 말하면 보너스
  reason: {
    enabled: true,
    prompt: '왜 이 선택지를 골랐는지 모둠이 한 문장으로 말해 보세요.',
    hint: '"우리는 ~ 때문에 이것을 골랐다."',
    bonus: { judgment: 1 }
  },

  // 되돌아보기 — 신뢰를 잃고 미끄러진 뒤, 다음 차례 시작에 나옴
  reflect: {
    enabled: true,
    title: '되돌아보기',
    prompt: '방금 미끄러진 이유를 모둠끼리 한 문장으로 말해 보세요.',
    hint: '"우리는 ~ 했기 때문에 미끄러졌다. 다음에는 ~ 하겠다."',
    success: { trust: 1 },
    pass: {}
  },

  // 선생님께 질문하기 칸
  teacher: {
    title: '선생님께 질문하기',
    intro: '손을 들어 선생님을 불러 주세요. 선생님이 모둠에게 질문합니다.',
    prompts: [
      '지금까지 만난 카드 중 가장 의견이 갈렸던 카드는 무엇이었나요? 어떻게 결정했나요?',
      '가짜 정보인지 알아보는 방법을 두 가지 말해 보세요.',
      '같은 부탁이라도 친한 친구와 처음 보는 사람일 때 대답이 달라지는 이유는 무엇일까요?',
      '광고인지 아닌지 알 수 있는 표시는 어디에 있을까요?',
      '추천 영상만 계속 보게 될 때 스스로 멈추는 방법은 무엇일까요?',
      'AI를 숙제에 써도 되는 경우와 안 되는 경우를 하나씩 말해 보세요.'
    ],
    levels: [
      { label: '아주 잘했어요', effect: { trust: 2, judgment: 1 } },
      { label: '좋아요',        effect: { trust: 1 } },
      { label: '다음에 다시',   effect: {} }
    ]
  },

  // 결과 화면 칭호 — 조건(when)을 만족하는 칭호를 모두 보여줌
  // when의 값은 [최소, 최대]. null은 제한 없음
  results: {
    awards: [
      { title: '믿음직한 디지털 시민', when: { trust: [20, null] },    message: '신뢰 점수가 아주 높아요. 친구들이 믿고 정보를 나눌 수 있는 모둠이에요.' },
      { title: '성실한 디지털 시민',   when: { trust: [14, 19] },      message: '대부분의 상황에서 균형 있게 판단했어요.' },
      { title: '성장하는 디지털 시민', when: { trust: [null, 13] },    message: '미끄러진 경험도 배움이에요. 되돌아본 내용을 기억해 두세요.' },
      { title: '신중한 탐정',          when: { judgment: [12, null] }, message: '한 번 더 확인하고, 이유를 말하는 힘이 뛰어나요.' },
      { title: '빠른 업로더',          when: { finished: [1, 1], rolls: [null, 9] }, message: '적은 횟수로 도착했어요. 빠르게 나아가는 것도 하나의 힘이에요.' }
    ],
    debrief: [
      '모둠 안에서 의견이 가장 많이 갈렸던 카드는 무엇이었나요?',
      '같은 카드라도 상대가 누구인지에 따라 선택이 달라졌던 적이 있나요?',
      '앞으로 온라인에서 꼭 지키고 싶은 약속 한 가지를 정해 보세요.'
    ]
  }
});
