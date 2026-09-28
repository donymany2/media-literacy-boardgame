/*
 * 카드팩: AI 디지털 윤리 — 기본 정보
 * 2026 디지털윤리 창작콘텐츠 공모전 수업안 「업다운로드, AI 시대의 윤리 판단 게임」(초 5~6학년, 도덕·실과)
 *   1차시 AI 윤리 딜레마, 나라면 어떤 선택을 할까 — 이 게임으로 모둠 토의
 *   2차시 우리 반 AI 디지털윤리 수칙 만들기 — 결과 화면의 마무리 질문으로 연결
 * 주제, 바꿔 끼우는 조각, 칸 그림, 점수 이름, 이유 말하기, 되돌아보기, 선생님 칸, 결과 칭호.
 * (카드 문구는 cards.js, 칸 배치는 board.js, 그림은 art.js)
 */
BG.registerPack('ai-ethics', 'meta', {
  name: 'AI 디지털 윤리',
  description: '딥페이크·합성, AI 정보 판단, 저작권·창작, AI와 과제, 사생활, 편향·공정, 책임·공존',
  version: '0.2',

  // 주제 목록 — 카드의 topic 값과 이름·색을 연결
  topics: {
    deepfake:   { name: '딥페이크·합성',  color: '#9B3FE0' },
    truth:      { name: 'AI 정보 판단',   color: '#2F6BFF' },
    creation:   { name: '저작권·창작',    color: '#D9336E' },
    homework:   { name: 'AI와 과제',      color: '#E07A00' },
    privacy:    { name: '사생활·개인정보', color: '#E8412F' },
    fairness:   { name: '편향·공정',      color: '#0E9F6E' },
    together:   { name: '책임·공존',      color: '#12B5CB' }
  },

  // 바꿔 끼우는 조각 — 카드 문장의 {who}, {where} 자리에 무작위로 들어감
  slotLabels: { who: '누가', where: '어디서' },
  slots: {
    who: {
      friend: '친한 친구',
      classmate: '같은 반 친구',
      sibling: '동생',
      stranger: '처음 보는 사람'
    },
    where: {
      chat: '반 단톡방',
      sns: 'SNS',
      game: '게임 채팅'
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

  // 칸 그림 — 'svg:이름'은 art.js에 직접 그린 그림
  tileArt: {
    start: 'svg:start',
    finish: 'svg:finish',
    teacher: 'svg:teacher',
    up: 'svg:rocket',
    down: 'svg:snake',
    normal: ['svg:robot', 'svg:phone', 'svg:camera', 'svg:laptop', 'svg:chat', 'svg:detective', 'svg:lock', 'svg:book',
             'svg:robot', 'svg:heart', 'svg:tv', 'svg:cloud', 'svg:gamepad', 'svg:mail', 'svg:star', 'svg:wifi',
             'svg:headphone', 'svg:bell']
  },

  // 카드 그림 — 딜레마·퀴즈는 주제별 장면, 돌발 상황·되돌아보기·선생님은 종류별 장면
  cardArt: {
    topics: {
      deepfake: 'svg:card-deepfake', truth: 'svg:card-aitruth', creation: 'svg:card-creation',
      homework: 'svg:card-homework', privacy: 'svg:card-privacy', fairness: 'svg:card-fairness',
      together: 'svg:card-together'
    },
    types: { chance: 'svg:card-chance', reflect: 'svg:card-reflect', teacher: 'svg:card-teacher', quiz: 'svg:card-quiz' }
  },

  // 판 위 이름표 (지름길 = 업로드, 미끄럼틀 = 다운로드)
  tileLabels: {
    start: '출발', finish: '도착', teacher: '선생님 질문',
    up: '업로드', down: '다운로드', dilemma: '딜레마', quiz: '퀴즈', chance: '돌발'
  },

  // 이유 말하기 — 딜레마 카드에서 선택한 뒤 "왜 골랐는지" 말하면 보너스 (수업안 평가: 근거를 들어 판단 설명)
  reason: {
    enabled: true,
    prompt: '왜 이 선택지를 골랐는지 모둠이 근거를 들어 한 문장으로 말해 보세요.',
    hint: '"우리는 ~ 때문에 이것을 골랐다."',
    bonus: { judgment: 1 }
  },

  // 결과 카드 한 줄 코멘트 — 매번 무작위로 하나. 아쉬운 결과에도 놀리지 않고 격려하는 말투
  comments: {
    good: [
      '훌륭한 판단이었어요!',
      'AI보다 똑똑한 선택!',
      '윤리 탐정 등장!',
      '모둠 토의가 빛났어요!',
      '이런 선택이 믿음을 쌓아요!'
    ],
    bad: [
      '괜찮아요, 다음엔 더 잘할 수 있어요!',
      '실수에서 배우는 게 진짜 실력이에요.',
      '한 번 더 생각해 보면 길이 보여요!',
      '아쉽지만, 이제 다음엔 알 수 있죠?',
      '미끄러져도 다시 올라가면 돼요!'
    ]
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

  // 선생님께 질문하기 칸 — 수업안 전개 단계의 순회 발문
  teacher: {
    title: '선생님께 질문하기',
    intro: '손을 들어 선생님을 불러 주세요. 선생님이 모둠에게 질문합니다.',
    prompts: [
      '방금 고른 선택을 한 까닭은 무엇인가요? 다른 선택을 했다면 어떤 결과가 있었을까요?',
      '지금까지 만난 카드 중 모둠 의견이 가장 많이 갈렸던 카드는 무엇이었나요? 어떻게 결정했나요?',
      'AI로 만든 사진이나 영상인지 알아보는 방법을 두 가지 말해 보세요.',
      '친구 얼굴을 AI로 합성할 때 꼭 먼저 해야 할 일은 무엇일까요?',
      '과제에서 AI의 "도움"과 "대신 써 주기"는 어떻게 다를까요?',
      'AI 챗봇에게 절대 알려 주면 안 되는 정보를 세 가지 말해 보세요.',
      'AI가 틀린 답을 알려 줘서 문제가 생겼다면, 누구의 책임일까요?'
    ],
    levels: [
      { label: '아주 잘했어요', effect: { trust: 2, judgment: 1 } },
      { label: '좋아요',        effect: { trust: 1 } },
      { label: '다음에 다시',   effect: {} }
    ]
  },

  // 선택 경향 — 결과 화면에 모둠별로 "주로 어떤 기준으로 골랐는지" 보여 줌 (2차시 도입 활동용)
  // 선택지마다 효과로 자동 분류(엔진 BG.choiceStyle). 선택지에 style: 'care'처럼 적으면 직접 지정
  stylesTitle: '우리 모둠의 선택 기준',
  styles: {
    care:  { name: '사람 먼저', color: '#E8412F', hint: '상대의 마음·약속·정직',
             desc: '다른 사람의 마음과 믿음을 먼저 생각하는 선택을 많이 했어요.' },
    check: { name: '확인 먼저', color: '#2F6BFF', hint: '사실 확인·규칙 따지기',
             desc: '진짜인지, 규칙에 맞는지 먼저 따져 보는 선택을 많이 했어요.' },
    quick: { name: '편리·재미 먼저', color: '#FF9F1C', hint: '빠르고 쉬운 길',
             desc: '빠르고 편하거나 재미있는 선택을 많이 했어요. 그 선택이 누군가에게 어떤 영향을 줬을지 이야기해 봐요.' }
  },
  stylesMixed: { name: '골고루', color: '#0E9F6E', desc: '여러 기준을 비슷하게 골랐어요. 어떤 때 기준이 바뀌었는지 이야기해 봐요.' },

  // 결과 화면 칭호 — 조건(when)을 만족하는 칭호를 모두 보여줌
  // when의 값은 [최소, 최대]. null은 제한 없음
  results: {
    awards: [
      { title: '믿음직한 AI 시민',   when: { trust: [20, null] },    message: '신뢰 점수가 아주 높아요. AI를 쓰면서도 다른 사람을 지킬 줄 아는 모둠이에요.' },
      { title: '성실한 AI 시민',     when: { trust: [14, 19] },      message: '대부분의 상황에서 균형 있게 판단했어요.' },
      { title: '성장하는 AI 시민',   when: { trust: [null, 13] },    message: '미끄러진 경험도 배움이에요. 되돌아본 내용을 수칙 만들기에 살려 보세요.' },
      { title: '근거 찾는 탐정',     when: { judgment: [12, null] }, message: '한 번 더 확인하고, 근거를 들어 말하는 힘이 뛰어나요.' },
      { title: '빠른 업로더',        when: { finished: [1, 1], rolls: [null, 9] }, message: '적은 횟수로 도착했어요. 빠르게 나아가는 것도 하나의 힘이에요.' }
    ],
    // 2차시 도입·전개로 이어지는 마무리 질문
    debrief: [
      '오늘 가장 판단하기 어려웠던 카드는 무엇이었나요? 그 까닭은?',
      '우리 모둠은 주로 어떤 기준으로 선택했나요? (재미, 편리함, 친구의 마음, 사실 확인 …)',
      '오늘 게임을 떠올리며 "우리 반 AI 디지털윤리 수칙"에 꼭 넣고 싶은 한 가지를 정해 보세요.'
    ]
  }
});
