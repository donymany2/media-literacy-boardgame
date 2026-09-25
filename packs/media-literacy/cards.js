/*
 * 카드팩: 디지털 미디어 리터러시 — 카드 데이터 (초안 v0.1)
 *
 * 카드 종류
 *   dilemma  딜레마: choices[] 중 모둠이 토의해서 하나를 고름
 *   quiz     퀴즈:   options[] 중 정답(answer, 0부터 셈)을 고름 → correct / wrong 효과
 *   chance   기회/위기: 선택 없이 effect 바로 적용
 *
 * 효과(effect)
 *   trust     신뢰 점수 변화 (T)
 *   judgment  판단력 점수 변화 (J)
 *   move      이동 칸 수 (+ 전진, - 미끄러짐, 0 제자리)
 *   shortcut  true면 '지름길!'로 표시
 *
 * feedback / explanation: 선택 뒤 보여주는 한두 문장 설명
 * label: 카드 위에 표시할 주제 이름(없으면 topic 이름 사용)
 * draft: 'added' — 선생님 초안 15장 외에 퀴즈·기회/위기 더미를 채우려고 추가한 카드 (검토 필요)
 */
BG.registerPack('media-literacy', 'cards', [

  /* ---------------- 딜레마 카드 ---------------- */
  {
    id: 'ML-01', type: 'dilemma', topic: 'source',
    title: '단톡방 급식 사진',
    situation: '단톡방에 급식에 이상한 게 들어있다는 사진과 글이 돌고 있어요. 다들 놀라서 퍼나르고 있습니다.',
    choices: [
      { label: 'A', text: '나도 바로 다른 단톡방에 공유한다',
        effect: { trust: -2, move: -2 },
        feedback: '확인하지 않은 소문은 순식간에 퍼져서 누군가를 불안하게 하거나 억울하게 만들 수 있어요.' },
      { label: 'B', text: '학교 홈페이지나 선생님께 먼저 확인해 본다',
        effect: { trust: 2, judgment: 1, move: 2 },
        feedback: '공식 출처에서 먼저 확인하는 것이 소문을 멈추는 가장 좋은 방법이에요.' }
    ]
  },
  {
    id: 'ML-02', type: 'dilemma', topic: 'deepfake',
    title: '어딘가 이상한 친구 영상',
    situation: '친한 친구가 나온 것 같은 영상이 돌아다니는데, 자세히 보니 표정이나 입모양이 조금 이상합니다.',
    choices: [
      { label: 'A', text: '진짜인지 신경 안 쓰고 친구들에게 보여준다',
        effect: { trust: -3, move: -3 },
        feedback: '딥페이크 영상을 퍼뜨리면 친구에게 큰 상처가 되고, 나도 가해자가 될 수 있어요.' },
      { label: 'B', text: '이상한 점을 메모하고 어른에게 먼저 보여준다',
        effect: { trust: 2, judgment: 2, move: 3, shortcut: true },
        feedback: '어색한 입모양, 깜빡임, 경계선 번짐은 딥페이크를 의심할 단서예요. 어른과 함께 대처해요.' }
    ]
  },
  {
    id: 'ML-03', type: 'dilemma', topic: 'privacy',
    title: '게임 친구의 질문',
    situation: '온라인 게임에서 친해진 사람이 진짜 이름과 학교, 사는 동네를 물어봅니다.',
    choices: [
      { label: 'A', text: '친해졌으니 알려준다',
        effect: { trust: -2, move: -1 },
        feedback: '온라인에서 만난 사람은 내가 생각하는 사람이 아닐 수 있어요. 이름·학교·동네는 나를 찾아낼 수 있는 정보예요.' },
      { label: 'B', text: '개인적인 정보는 알려주지 않는다고 말한다',
        effect: { trust: 2, move: 0 },
        feedback: '정중하게 거절하는 것도 나를 지키는 능력이에요. 계속 묻는다면 어른에게 알려요.' }
    ]
  },
  {
    id: 'ML-04', type: 'dilemma', topic: 'etiquette',
    title: '퍼지는 캡처',
    situation: '단톡방에서 한 친구가 실수로 이상한 말을 했는데, 몇 명이 계속 놀리며 캡처를 퍼뜨리고 있습니다.',
    choices: [
      { label: 'A', text: '재미있어서 나도 같이 놀린다',
        effect: { trust: -3, judgment: -1, move: -3 },
        feedback: '여럿이 함께 놀리는 것은 사이버 폭력이 될 수 있어요. 캡처는 지워지지 않고 계속 남아요.' },
      { label: 'B', text: '그만하자고 말하거나 그 자리를 나온다',
        effect: { trust: 2, judgment: 1, move: 2 },
        feedback: '한 사람이 "그만하자"고 말하면 분위기가 바뀔 수 있어요. 방관하지 않는 것도 용기예요.' }
    ]
  },
  {
    id: 'ML-05', type: 'dilemma', topic: 'algorithm',
    title: '끝나지 않는 숏폼',
    situation: '숏폼 영상 앱을 켜니 비슷한 영상만 계속 나와서 한 시간이 훌쩍 지났습니다.',
    choices: [
      { label: 'A', text: '계속 본다, 재밌으니까 상관없다',
        effect: { trust: -1, move: -1 },
        feedback: '추천 알고리즘은 내가 더 오래 보도록 만들어져 있어요. 멈추는 건 스스로 해야 해요.' },
      { label: 'B', text: '잠깐 멈추고 다른 걸 해야 할 시간이라는 걸 알아챈다',
        effect: { trust: 1, judgment: 2, move: 1 },
        feedback: '"알아채는 것"이 알고리즘을 이기는 첫걸음이에요.' }
    ]
  },
  {
    id: 'ML-06', type: 'dilemma', topic: 'ad',
    title: '키 크는 영양제',
    situation: '좋아하는 유튜버가 이 영양제를 먹고 키가 컸다고 소개하는 영상을 봤습니다.',
    choices: [
      { label: 'A', text: '진짜 효과가 있다고 믿고 부모님께 사달라고 조른다',
        effect: { trust: -2, move: -2 },
        feedback: '돈을 받고 만든 광고 영상일 수 있어요. 한 사람의 경험이 모두에게 맞는 것도 아니에요.' },
      { label: 'B', text: '광고인지 아닌지 영상 설명란을 확인해 본다',
        effect: { trust: 2, judgment: 1, move: 2 },
        feedback: '"유료 광고 포함", "협찬" 표시를 확인하는 습관을 들여요.' }
    ]
  },
  {
    id: 'ML-07', type: 'dilemma', topic: 'source',
    title: '기자 이름 없는 뉴스',
    situation: '뉴스라며 돌아다니는 글인데, 어느 방송사인지, 기자 이름도 나와 있지 않습니다.',
    choices: [
      { label: 'A', text: '내용이 충격적이라 그냥 믿고 친구에게 전달한다',
        effect: { trust: -2, move: -2 },
        feedback: '충격적인 내용일수록 가짜일 가능성도 커요. 출처가 없으면 일단 멈춰요.' },
      { label: 'B', text: '진짜 뉴스 사이트에서 검색해 본다',
        effect: { trust: 2, judgment: 2, move: 3, shortcut: true },
        feedback: '같은 내용을 믿을 만한 언론사 여러 곳에서 확인하는 것을 "교차 확인"이라고 해요.' }
    ]
  },
  {
    id: 'ML-08', type: 'dilemma', topic: 'etiquette', label: '사이버 예절',
    title: '허락받지 않은 사진',
    situation: '친구가 보낸 사진이 재미있어서 다른 단톡방에도 올리려고 합니다. 친구는 허락한 적이 없습니다.',
    choices: [
      { label: 'A', text: '재밌으니까 그냥 퍼뜨린다',
        effect: { trust: -2, move: -1 },
        feedback: '사진 속 사람에게는 초상권이 있어요. 나에게 보낸 사진이라도 다른 곳에 올리려면 허락이 필요해요.' },
      { label: 'B', text: '친구에게 먼저 물어본다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '"올려도 돼?" 한 마디가 친구 사이의 믿음을 지켜요.' }
    ]
  },
  {
    id: 'ML-09', type: 'dilemma', topic: 'deepfake', label: '딥페이크·AI',
    title: 'AI로 그린 미술 숙제',
    situation: '미술 숙제로 그림을 그려야 하는데, AI로 그린 그림을 내 그림이라고 내고 싶은 유혹이 듭니다.',
    choices: [
      { label: 'A', text: 'AI 그림을 그대로 낸다',
        effect: { trust: -2, judgment: -1, move: -2 },
        feedback: 'AI가 만든 것을 내 것이라고 하면 정직하지 않은 일이에요. 내 실력을 키울 기회도 놓쳐요.' },
      { label: 'B', text: 'AI 도움을 받았다고 솔직히 밝히거나 직접 그린다',
        effect: { trust: 2, move: 1 },
        feedback: 'AI를 썼다면 솔직하게 밝히는 것, 그것이 AI를 바르게 쓰는 방법이에요.' }
    ]
  },
  {
    id: 'ML-10', type: 'dilemma', topic: 'privacy',
    title: '주소까지 묻는 앱',
    situation: '인기 있는 앱에 가입하려는데, 전화번호와 집 주소까지 입력하라고 합니다.',
    choices: [
      { label: 'A', text: '가입하고 싶어서 다 입력한다',
        effect: { trust: -2, move: -1 },
        feedback: '꼭 필요하지 않은 정보까지 요구하는 앱은 조심해야 해요. 한 번 나간 정보는 되돌리기 어려워요.' },
      { label: 'B', text: '부모님이나 선생님께 먼저 여쭤본다',
        effect: { trust: 2, judgment: 1, move: 1 },
        feedback: '만 14세 미만은 가입할 때 보호자 동의가 필요한 경우가 많아요. 어른과 함께 확인해요.' }
    ]
  },
  {
    id: 'ML-12', type: 'dilemma', topic: 'etiquette', label: '온라인 갈등',
    title: '게임 속 욕설',
    situation: '온라인 게임에서 같은 편이 실수를 하자 여러 명이 심한 말로 욕을 하기 시작합니다.',
    choices: [
      { label: 'A', text: '같이 화내며 욕한다',
        effect: { trust: -3, judgment: -1, move: -3 },
        feedback: '화면 너머에도 마음이 있는 사람이 있어요. 욕설은 갈등을 더 크게 만들어요.' },
      { label: 'B', text: '그만하자고 하거나 신고 기능을 이용한다',
        effect: { trust: 2, judgment: 2, move: 3, shortcut: true },
        feedback: '신고·차단 기능은 나와 친구를 지키려고 있는 도구예요.' }
    ]
  },
  {
    id: 'ML-14', type: 'dilemma', topic: 'algorithm', label: '디지털 시간 관리',
    title: '잠잘 시간이 지났어요',
    situation: '숙제를 안 하고 계속 영상을 보다가 잠잘 시간이 훌쩍 지났습니다.',
    choices: [
      { label: 'A', text: '그래도 조금만 더 본다',
        effect: { trust: -1, move: -1 },
        feedback: '"조금만 더"가 반복되면 잠과 숙제 시간이 모두 줄어들어요.' },
      { label: 'B', text: '알람을 맞추고 시간을 정해서 본다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '시간을 미리 정하면 영상도 즐기고 할 일도 지킬 수 있어요.' }
    ]
  },

  /* ---------------- 퀴즈 카드 ---------------- */
  {
    id: 'ML-13', type: 'quiz', topic: 'source', label: '뉴스 구별',
    title: '진짜 같은 사진',
    situation: '어떤 글에 사진이 붙어 있는데, 사실은 몇 년 전 다른 사건 사진이라는 걸 나중에 알게 되는 경우가 많습니다.',
    question: '사진이 진짜처럼 보이면, 항상 그 순간에 찍힌 것이다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 1,
    correct: { trust: 2, judgment: 1, move: 1 },
    wrong: { trust: -1, move: 0 },
    explanation: '진짜 사진이라도 다른 때, 다른 곳에서 찍힌 사진을 가져다 쓸 수 있어요. 이미지 검색으로 처음 올라온 곳을 찾아볼 수 있어요.'
  },
  {
    id: 'ML-Q2', type: 'quiz', topic: 'ad', draft: 'added',
    title: '광고 표시',
    situation: '영상 화면이나 설명란에 "유료 광고 포함"이라는 글자가 보입니다.',
    question: '"유료 광고 포함" 표시가 있는 영상은 회사에서 돈이나 물건을 받고 만든 것일 수 있다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 0,
    correct: { trust: 2, judgment: 1, move: 1 },
    wrong: { trust: -1, move: 0 },
    explanation: '광고를 받고 만든 영상은 그 사실을 알리도록 되어 있어요. 표시를 보면 "광고"라는 생각을 하고 봐요.'
  },
  {
    id: 'ML-Q3', type: 'quiz', topic: 'privacy', draft: 'added',
    title: '비밀번호',
    situation: '가장 친한 친구가 게임 아이템을 대신 받아 주겠다며 비밀번호를 알려 달라고 합니다.',
    question: '비밀번호는 가장 친한 친구에게는 알려줘도 괜찮다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 1,
    correct: { trust: 2, judgment: 1, move: 1 },
    wrong: { trust: -1, move: 0 },
    explanation: '비밀번호는 보호자 말고는 누구에게도 알려주지 않아요. 사이가 멀어지거나 실수로 퍼질 수도 있어요.'
  },

  /* ---------------- 기회/위기 카드 ---------------- */
  {
    id: 'ML-11', type: 'chance', topic: 'algorithm', label: '기회 · 알고리즘',
    title: '새로운 추천',
    situation: '평소에 관심 없던 주제인데 자꾸 추천되길래 눌러봤더니 새로운 걸 알게 됐습니다.',
    effect: { trust: 1, move: 1 },
    feedback: '추천은 잘 쓰면 새로운 세상을 여는 창이 되기도 해요.'
  },
  {
    id: 'ML-C2', type: 'chance', topic: 'source', label: '기회 · 출처 확인', draft: 'added',
    title: '함께 확인하는 습관',
    situation: '모둠 친구가 가짜 뉴스 구별법을 알려줘서, 모두 함께 확인하는 습관이 생겼어요.',
    effect: { trust: 1, judgment: 1, move: 2 },
    feedback: '좋은 방법은 나누면 모두가 더 똑똑해져요.'
  },
  {
    id: 'ML-C3', type: 'chance', topic: 'privacy', label: '위기 · 개인정보', draft: 'added',
    title: '재미로 한 성격 테스트',
    situation: '재미로 한 성격 테스트에 이름과 생일, 전화번호를 입력했더니 이상한 광고 문자가 오기 시작했어요.',
    effect: { trust: -1, move: -1 },
    feedback: '재미있는 테스트가 개인정보를 모으는 수단일 수 있어요.'
  }
]);
