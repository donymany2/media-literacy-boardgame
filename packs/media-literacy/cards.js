/*
 * 카드팩: 디지털 미디어 리터러시 — 카드 데이터 (초안 v0.2)
 *
 * 카드 종류
 *   dilemma  딜레마: choices[] 3개 중 모둠이 토의해서 하나를 고름
 *            나올 때마다 선택지 순서가 섞이고 A, B, C 이름이 다시 붙음
 *   quiz     돌발 퀴즈: options[] 중 정답(answer, 0부터 셈) → correct / wrong 효과
 *            O/X 문제는 shuffle: false로 순서를 고정
 *   chance   돌발 상황: 선택 없이 effect 바로 적용 (운이라서 되돌아보기 없음)
 *
 * 효과(effect)
 *   trust 신뢰(T), judgment 판단력(J), move 이동(+전진, -뒤로, 0 제자리)
 *
 * 딜레마 설계 원칙
 *   - 정답 하나가 아니라, 세 선택지 모두 일리가 있고 결과가 조금씩 다름
 *   - 신뢰(주 점수), 판단력(보조 점수), 이동(빠르기)을 서로 맞바꾸는 구조
 *     예) 신중한 선택: 판단력↑ 대신 제자리 / 빠른 선택: 전진 대신 신뢰↓
 *
 * 바꿔 끼우는 카드(틀 카드)
 *   slots: { who: [...], where: [...] }  나올 때마다 조각을 무작위로 골라 문장을 채움
 *   문장 속 {who:이/가}는 받침에 맞게 '친구가 / 사람이'처럼 바뀜
 *   choices[].by: { who: { stranger: { effect, feedback } } }
 *     → 조각에 따라 결과가 달라짐. 같은 카드라도 상대가 누구냐에 따라 좋은 선택이 바뀜
 *   조각 이름은 pack.js의 slots에 있음
 */
BG.registerPack('media-literacy', 'cards', [

  /* ================= 딜레마 · 출처 확인 ================= */
  {
    id: 'SRC-01', type: 'dilemma', topic: 'source',
    title: '급식 벌레 사진',
    situation: '단톡방에 "오늘 급식에서 벌레 나옴"이라는 사진이 돌아요. 반 친구 몇 명이 "나도 봤어!"라고 맞장구를 칩니다. 그런데 사진 속 식판은 우리 학교 식판과 색이 조금 달라요.',
    choices: [
      { text: '단톡방에 "이 사진 누가 찍은 거야?"라고 물어본다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '출처를 묻는 건 좋은 시작이에요. 다만 대답이 오기 전까지 소문은 계속 퍼질 수 있어요.' },
      { text: '아무 말 없이 담임 선생님께 사진을 보여 드린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '가장 확실하게 확인하는 방법이에요. 대신 단톡방의 소문은 그동안 그대로 남아요.' },
      { text: '"식판 색이 달라. 확인 안 된 사진은 퍼뜨리지 말자"라고 쓴다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '근거를 들어 말한 점이 훌륭해요. 하지만 친구들이 "잘난 척한다"고 느끼면 분위기가 나빠질 수도 있어요.' }
    ]
  },
  {
    id: 'SRC-02', type: 'dilemma', topic: 'source',
    title: '출처가 잘린 속보',
    situation: '{where}에 "유명 가수 ○○, 교통사고로 병원 이송"이라는 뉴스 캡처가 올라왔어요. 그런데 언론사 이름 부분이 잘려 있어요. 나는 그 가수의 팬이에요.',
    slots: { where: ['chat', 'game', 'comment'] },
    choices: [
      { text: '포털 뉴스에서 같은 소식이 있는지 검색해 본다',
        effect: { trust: 1, judgment: 2, move: 1 },
        feedback: '믿을 만한 언론사 여러 곳에 같은 소식이 있는지 보는 것을 "교차 확인"이라고 해요.' },
      { text: '팬 친구에게 캡처를 보내 "이거 진짜야?"라고 물어본다',
        effect: { trust: -1, judgment: 1, move: 1 },
        feedback: '물어보는 것도 결국 캡처를 한 번 더 퍼뜨리는 일이 돼요. 확인하기 전에는 보내지 않는 게 좋아요.' },
      { text: '확실한 소식이 나올 때까지 아무것도 하지 않고 기다린다',
        effect: { trust: 1, judgment: 0, move: 0 },
        feedback: '퍼뜨리지 않은 것은 좋아요. 하지만 스스로 확인해 보는 힘을 기를 기회는 놓쳤어요.' }
    ]
  },
  {
    id: 'SRC-03', type: 'dilemma', topic: 'source',
    title: '내일 휴교래!',
    situation: '밤 9시, {who:이/가} {where}에서 "내일 태풍 때문에 휴교래!"라는 메시지를 보냈어요. 아직 학교에서 온 알림은 없어요.',
    slots: { who: ['friend', 'sibling', 'stranger', 'youtuber'], where: ['chat', 'game'] },
    choices: [
      { text: '반 단톡방에 바로 알려 준다',
        effect: { trust: -2, judgment: 0, move: 1 },
        by: {
          who: {
            stranger: { effect: { trust: -2, judgment: -1, move: -1 }, feedback: '처음 보는 사람은 우리 학교 사정을 알 수 없어요. 확인 없이 전하면 반 전체가 헷갈려요.' },
            youtuber: { effect: { trust: -2, judgment: -1, move: -1 }, feedback: '유튜버가 말하는 휴교는 다른 지역 이야기일 수 있어요. 우리 학교 공지가 기준이에요.' }
          }
        },
        feedback: '빨리 알려 주고 싶은 마음은 좋지만, 틀린 정보라면 반 친구들이 다음 날 준비를 못 할 수 있어요.' },
      { text: '학교 알림 앱이나 홈페이지를 확인한다',
        effect: { trust: 1, judgment: 2, move: 1 },
        feedback: '학교 소식은 학교가 가장 정확해요. 공식 출처를 먼저 보는 습관이에요.' },
      { text: '부모님께 여쭤보고 연락이 올 때까지 기다린다',
        effect: { trust: 1, judgment: 1, move: 0 },
        by: {
          who: {
            sibling: { effect: { trust: 2, judgment: 1, move: 1 }, feedback: '동생이 들은 이야기라면 같은 집 어른에게 확인하는 게 가장 빠르고 정확해요.' }
          }
        },
        feedback: '안전한 방법이에요. 다만 부모님도 모르실 수 있으니 공식 알림도 함께 확인해요.' }
    ]
  },
  {
    id: 'SRC-04', type: 'dilemma', topic: 'source',
    title: '옛날 홍수 사진',
    situation: '"지금 우리 동네 물난리"라는 사진이 돌아요. 그런데 자세히 보니 사진 속 간판의 가게는 우리 동네에 없어요.',
    choices: [
      { text: '이상한 점을 찾았다고 단톡방에 알려 준다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '발견한 단서를 나누면 잘못된 정보가 퍼지는 걸 막을 수 있어요. 다만 확실한 증거가 있으면 더 설득력 있어요.' },
      { text: '이미지 검색으로 사진이 처음 올라온 곳을 찾아본다',
        effect: { trust: 1, judgment: 2, move: 1 },
        feedback: '이미지 검색을 하면 몇 년 전 다른 곳의 사진인지 확인할 수 있어요.' },
      { text: '혹시 모르니 가족에게만 조심하라고 전한다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '가족을 걱정하는 마음은 좋아요. 하지만 확인하지 않은 정보를 전한 것은 같아요.' }
    ]
  },
  {
    id: 'SRC-05', type: 'dilemma', topic: 'source',
    title: '쉬운 블로그, 어려운 자료',
    situation: '과학 숙제 자료를 찾는데, 개인 블로그 글은 쉽고 재미있고, 공공기관 자료는 어려운 말투성이에요. 숙제는 내일까지예요.',
    choices: [
      { text: '쉬운 블로그 글을 쓰되 출처를 꼭 적는다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '출처를 밝힌 건 좋아요. 하지만 블로그 글에는 틀린 내용이 섞여 있을 수 있어요.' },
      { text: '어려워도 공공기관 자료만 쓴다',
        effect: { trust: 1, judgment: 1, move: 0 },
        feedback: '믿을 만한 자료예요. 이해하지 못한 채 옮겨 적으면 내 것이 되지 않는다는 점은 조심해요.' },
      { text: '블로그로 이해하고, 공공기관 자료로 사실을 확인한다',
        effect: { trust: 2, judgment: 2, move: -1 },
        feedback: '두 자료를 비교하는 게 가장 정확해요. 대신 시간이 오래 걸려 한 칸 늦어졌어요.' }
    ]
  },
  {
    id: 'SRC-06', type: 'dilemma', topic: 'source',
    title: '좋아요 1만 개',
    situation: '"탄산음료를 마시면 키가 안 큰다"는 글에 좋아요가 1만 개, 댓글이 수천 개 달렸어요. 댓글은 대부분 "맞아요!"예요.',
    choices: [
      { text: '이렇게 많은 사람이 동의하니 믿을 만하다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: '좋아요 수는 인기일 뿐 사실의 증거가 아니에요.' },
      { text: '의사나 보건 선생님 같은 전문가 의견을 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '건강 정보는 전문가 의견을 확인하는 것이 가장 좋아요.' },
      { text: '댓글 중 반대 의견도 찾아 읽어 본다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '양쪽 의견을 보는 건 좋은 습관이에요. 다만 반대 댓글도 근거가 없을 수 있어요.' }
    ]
  },

  /* ================= 딜레마 · 딥페이크·AI ================= */
  {
    id: 'AI-01', type: 'dilemma', topic: 'deepfake',
    title: '웃고 있는 친구',
    situation: '친구 얼굴을 합성한 우스꽝스러운 영상이 돌아요. 그 친구도 "ㅋㅋ 나 웃기지?"라고 댓글을 달았어요.',
    choices: [
      { text: '친구도 웃으니까 나도 공유한다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '친구가 분위기 때문에 겉으로만 웃고 있을 수도 있어요. 합성 영상은 한번 퍼지면 되돌리기 어려워요.' },
      { text: '친구에게 따로 정말 괜찮은지 물어본다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '겉으로 보이는 반응 뒤의 마음을 살핀 거예요. 시간은 걸리지만 친구에게 큰 힘이 돼요.' },
      { text: '공유하지 않고 그냥 넘어간다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '퍼뜨리지 않은 건 좋아요. 하지만 친구가 사실 힘들어하고 있다면 알아채지 못할 수 있어요.' }
    ]
  },
  {
    id: 'AI-02', type: 'dilemma', topic: 'deepfake', label: 'AI 활용',
    title: 'AI가 더 잘 그린 그림',
    situation: '미술 숙제 아이디어를 얻으려고 AI 그림 도구를 써 봤어요. 그런데 AI 그림이 내 그림보다 훨씬 멋져요.',
    choices: [
      { text: 'AI 그림을 참고해서 직접 다시 그린다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '아이디어는 얻고 그리기는 내가 했어요. 참고했다는 사실도 밝히면 더 좋아요.' },
      { text: 'AI 그림을 내되 "AI로 만들었어요"라고 밝힌다',
        effect: { trust: 1, judgment: 0, move: 2 },
        feedback: '정직하게 밝힌 점은 좋아요. 하지만 숙제 목적이 "직접 그리기"라면 규칙에 맞지 않을 수 있어요.' },
      { text: 'AI를 써도 되는지 선생님께 먼저 여쭤본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '규칙을 먼저 확인하는 신중한 선택이에요. 대신 시작이 조금 늦어졌어요.' }
    ]
  },
  {
    id: 'AI-03', type: 'dilemma', topic: 'deepfake', label: 'AI 활용',
    title: '5분 독후감',
    situation: '친구가 "AI한테 독후감 써 달라고 하면 5분이면 끝나"라고 해요. 오늘은 학원 숙제도 많아요.',
    choices: [
      { text: 'AI 글을 받아서 내 말투로 고쳐 낸다',
        effect: { trust: -1, judgment: 0, move: 2 },
        feedback: '빨리 끝났지만, 내 생각이 아닌 글을 내 것처럼 내면 정직하지 않아요.' },
      { text: '책은 내가 읽고, AI에게는 질문만 해서 생각을 넓힌다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: 'AI를 "대신 써 주는 도구"가 아니라 "생각을 돕는 도구"로 쓴 거예요.' },
      { text: 'AI는 쓰지 않고 혼자 힘으로 쓴다',
        effect: { trust: 2, judgment: 0, move: 0 },
        feedback: '온전히 내 글이에요. 다만 AI를 잘 쓰는 방법을 배울 기회는 다음으로 미뤘어요.' }
    ]
  },
  {
    id: 'AI-04', type: 'dilemma', topic: 'deepfake',
    title: '세상에서 제일 작은 코끼리',
    situation: '"세상에서 제일 작은 코끼리 발견!" 사진에 반 친구들이 난리예요. 사진 구석에 아주 작은 글씨가 있어요.',
    choices: [
      { text: '귀여우니까 진짜든 아니든 그냥 즐긴다',
        effect: { trust: 0, judgment: -1, move: 1 },
        feedback: '재미로 보는 건 괜찮지만, 진짜라고 믿게 되면 잘못된 지식이 쌓여요.' },
      { text: '작은 글씨를 확대해서 어떤 도구로 만든 건지 확인한다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: 'AI 사진에는 만든 도구의 표시(워터마크)가 남아 있는 경우가 있어요. 좋은 탐정 습관이에요.' },
      { text: '친구들에게 "AI 사진일 수도 있어"라고 말한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '의심을 나눈 건 좋아요. 근거를 함께 말하면 친구들이 더 잘 받아들여요.' }
    ]
  },
  {
    id: 'AI-05', type: 'dilemma', topic: 'deepfake',
    title: '똑같은 목소리',
    situation: '{who:이/가} 보낸 것 같은 음성 메시지가 {where}에 왔어요. "급해! 엄마 휴대폰 번호 좀 알려 줘." 목소리가 진짜 똑같아요.',
    slots: { who: ['friend', 'sibling'], where: ['chat', 'game'] },
    choices: [
      { text: '급하다니까 번호를 먼저 알려 주고 나중에 확인한다',
        effect: { trust: -2, judgment: -1, move: -2 },
        feedback: 'AI로 목소리를 똑같이 흉내 낼 수 있어요. "급하다"는 말은 생각할 시간을 빼앗는 속임수일 때가 많아요.' },
      { text: '직접 전화를 걸어 진짜인지 확인한다',
        effect: { trust: 1, judgment: 2, move: 1 },
        by: {
          who: {
            sibling: { effect: { trust: 2, judgment: 2, move: 2 }, feedback: '가족이라면 전화 한 통이 가장 빠르고 확실해요.' }
          }
        },
        feedback: '메시지가 아닌 다른 방법으로 확인하는 게 가장 확실해요.' },
      { text: '답장하지 않고 부모님께 바로 알린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '안전한 선택이에요. 어른과 함께 확인하면 속을 일이 없어요.' }
    ]
  },

  /* ================= 딜레마 · 개인정보 ================= */
  {
    id: 'PRI-01', type: 'dilemma', topic: 'privacy',
    title: '1년 된 게임 친구',
    situation: '1년 동안 매일 같이 게임한 친구가 "우리 진짜로 만나 보자! 어느 동네 살아?"라고 물어요. 목소리도 들어 봤고 착한 친구 같아요.',
    choices: [
      { text: '동네 이름만 알려 준다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '동네 이름만으로도 나를 찾을 수 있어요. 오래 알았어도 온라인에서 만난 사람은 확인할 방법이 없어요.' },
      { text: '부모님과 함께라면 만날 수 있다고 말한다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '관계도 지키고 안전도 지키는 방법이에요. 진짜 친구라면 이해해 줄 거예요.' },
      { text: '온라인 친구로만 지내자고 말한다',
        effect: { trust: 2, judgment: 0, move: 0 },
        feedback: '가장 안전해요. 다만 친구가 서운해할 수 있으니 이유를 부드럽게 설명해요.' }
    ]
  },
  {
    id: 'PRI-02', type: 'dilemma', topic: 'privacy',
    title: '친구 위치 보기 앱',
    situation: '반 친구들이 모두 "친구 위치 보기" 앱을 써요. 나만 안 쓰면 따돌림당할 것 같아요.',
    choices: [
      { text: '앱을 쓰되 "가까운 친구만 보기"로 설정한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '설정을 바꿔 위험을 줄였어요. 하지만 내 위치가 계속 저장된다는 점은 남아요.' },
      { text: '쓰지 않고, 이유를 친구들에게 설명한다',
        effect: { trust: 2, judgment: 0, move: 0 },
        feedback: '내 정보를 지키는 용기 있는 선택이에요. 친구들이 이해하도록 차분히 이야기해요.' },
      { text: '부모님과 함께 설정을 확인하고 쓴다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '어른과 함께 정하면 놓치기 쉬운 설정까지 챙길 수 있어요.' }
    ]
  },
  {
    id: 'PRI-03', type: 'dilemma', topic: 'privacy',
    title: '운명 테스트',
    situation: '"내 이름으로 보는 운명 테스트"를 하려면 이름, 생일, 학교를 넣으라고 해요. 반 친구들 결과가 단톡방에 줄줄이 올라와요.',
    choices: [
      { text: '이름 대신 별명을 넣고 해 본다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '진짜 이름은 지켰어요. 하지만 생일과 학교만으로도 나를 알아낼 수 있어요.' },
      { text: '하지 않는다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '내 정보를 지켰어요. 대화에서 조금 소외될 수 있지만 괜찮아요.' },
      { text: '친구들에게 이런 테스트가 정보를 모으는 수단일 수 있다고 알려 준다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '친구들까지 지키는 선택이에요. 재미를 깨는 사람처럼 보이지 않게 말하는 방법도 생각해 봐요.' }
    ]
  },
  {
    id: 'PRI-04', type: 'dilemma', topic: 'privacy',
    title: '생일 파티 사진',
    situation: '생일 파티 사진을 SNS에 올리려는데, 사진 뒤쪽에 우리 집 현관 호수가 살짝 보여요. 사진에는 친구 네 명도 나와요.',
    choices: [
      { text: '호수 부분만 잘라 내고 올린다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '집 주소를 지켰어요. 그런데 사진 속 친구들에게 허락은 받았나요?' },
      { text: '"친한 친구만 보기"로 설정하고 그대로 올린다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '볼 수 있는 사람을 줄였지만, 친한 친구가 캡처해서 다시 퍼뜨릴 수 있어요.' },
      { text: '사진 속 친구들에게 먼저 허락을 받는다',
        effect: { trust: 1, judgment: 0, move: 0 },
        feedback: '친구들의 초상권을 지켰어요. 하지만 현관 호수 문제는 아직 그대로예요!' }
    ]
  },
  {
    id: 'PRI-05', type: 'dilemma', topic: 'privacy',
    title: '얼굴 사진 보내 줘',
    situation: '{who:이/가} {where}에서 "얼굴 잘 나온 사진 보내 줘! 예쁘게 꾸며서 돌려줄게"라고 해요.',
    slots: { who: ['friend', 'sibling', 'stranger', 'youtuber'], where: ['chat', 'game', 'comment'] },
    choices: [
      { text: '얼굴이 잘 나온 사진을 보낸다',
        effect: { trust: 0, judgment: 0, move: 1 },
        by: {
          who: {
            friend: { effect: { trust: 0, judgment: 0, move: 1 }, feedback: '친한 친구라면 괜찮을 수 있어요. 다른 곳에 올리지 말아 달라고 말해 두면 더 좋아요.' },
            sibling: { effect: { trust: 1, judgment: 0, move: 1 }, feedback: '가족끼리라면 괜찮아요. 꾸민 사진을 어디에 올릴지는 함께 정해요.' },
            stranger: { effect: { trust: -2, judgment: -1, move: -2 }, feedback: '처음 보는 사람에게 보낸 얼굴 사진은 합성이나 나쁜 일에 쓰일 수 있어요.' },
            youtuber: { effect: { trust: -2, judgment: -1, move: -2 }, feedback: '유명인을 흉내 낸 가짜 계정일 수 있어요. 공식 계정인지 확인할 수 없으면 보내지 않아요.' }
          }
        },
        feedback: '' },
      { text: '얼굴이 잘 안 보이는 사진이나 캐릭터 그림을 대신 보낸다',
        effect: { trust: 1, judgment: 1, move: 1 },
        by: {
          who: {
            stranger: { effect: { trust: 0, judgment: 1, move: 0 }, feedback: '위험은 줄였지만 대화를 계속 이어 가게 돼요. 처음 보는 사람이라면 대화를 멈추는 게 더 안전해요.' }
          }
        },
        feedback: '재미는 지키고 얼굴 정보는 지킨 똑똑한 방법이에요.' },
      { text: '어른에게 먼저 보여 주고 함께 정한다',
        effect: { trust: 1, judgment: 1, move: 0 },
        by: {
          who: {
            stranger: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '처음 보는 사람의 부탁은 어른과 함께 판단하는 게 가장 안전해요.' },
            youtuber: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '진짜 이벤트인지 가짜 계정인지 어른과 함께 확인하는 게 가장 좋아요.' }
          }
        },
        feedback: '안전한 방법이에요. 다만 친구나 가족 사이의 가벼운 일에는 조금 지나칠 수도 있어요.' }
    ]
  },
  {
    id: 'PRI-06', type: 'dilemma', topic: 'privacy',
    title: '비밀번호 알려 줘',
    situation: '{who:이/가} 게임 이벤트 아이템을 대신 받아 주겠다며 내 계정 비밀번호를 알려 달라고 해요. 이벤트는 오늘 밤 12시에 끝나요.',
    slots: { who: ['friend', 'sibling', 'stranger', 'youtuber'] },
    choices: [
      { text: '알려 주고, 끝나면 바로 비밀번호를 바꾼다',
        effect: { trust: -1, judgment: 1, move: 1 },
        by: {
          who: {
            sibling: { effect: { trust: 0, judgment: 1, move: 1 }, feedback: '가족이라도 비밀번호는 보호자와만 나누는 게 원칙이에요. 바로 바꾸면 위험은 줄어요.' },
            stranger: { effect: { trust: -2, judgment: -1, move: -2 }, feedback: '비밀번호를 바꾸기 전에 계정을 빼앗길 수 있어요. 처음 보는 사람에게는 절대 알려 주지 않아요.' },
            youtuber: { effect: { trust: -2, judgment: -1, move: -2 }, feedback: '진짜 유튜버는 비밀번호를 묻지 않아요. 계정을 훔치려는 사칭일 가능성이 커요.' }
          }
        },
        feedback: '빨리 바꾸면 괜찮을 것 같지만, 그 사이에 무슨 일이 생길지 몰라요.' },
      { text: '거절하고 아이템은 포기한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '아이템보다 계정이 소중해요. 아쉽지만 가장 안전한 선택이에요.' },
      { text: '내가 직접 받는 방법을 알려 달라고 한다',
        effect: { trust: 1, judgment: 2, move: 1 },
        by: {
          who: {
            stranger: { effect: { trust: 0, judgment: 0, move: 0 }, feedback: '모르는 사람이 알려 주는 방법을 따라 하다 가짜 사이트로 갈 수 있어요.' },
            youtuber: { effect: { trust: 0, judgment: 0, move: 0 }, feedback: '사칭 계정이 알려 주는 링크는 위험해요. 공식 게임 공지를 직접 찾아봐요.' }
          }
        },
        feedback: '비밀번호는 지키고 아이템도 받을 수 있는 방법을 찾았어요.' }
    ]
  },

  /* ================= 딜레마 · 온라인 예절·갈등 ================= */
  {
    id: 'ETI-01', type: 'dilemma', topic: 'etiquette',
    title: '돌고 있는 캡처',
    situation: '{where}에서 {who:이/가} 실수로 한 말이 캡처되어 돌고 있어요. 몇 명이 계속 놀리는 말을 올려요.',
    slots: { who: ['friend', 'sibling', 'stranger'], where: ['chat', 'game', 'comment'] },
    choices: [
      { text: '모두가 보는 곳에 "그만하자"고 쓴다',
        effect: { trust: 2, judgment: 0, move: 0 },
        by: {
          where: {
            comment: { effect: { trust: 1, judgment: 0, move: -1 }, feedback: '용기 있는 행동이지만, 공개 댓글에서는 오히려 말싸움이 커질 수 있어요. 신고 기능이 더 효과적일 때도 있어요.' }
          }
        },
        feedback: '한 사람의 "그만하자"가 분위기를 바꿀 수 있어요. 대신 분위기가 잠깐 어색해졌어요.' },
      { text: '놀림받는 사람에게 따로 괜찮은지 연락한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        by: {
          who: {
            stranger: { effect: { trust: 0, judgment: 0, move: 0 }, feedback: '모르는 사람에게 갑자기 따로 연락하면 오히려 부담이 될 수 있어요.' }
          }
        },
        feedback: '놀림받는 사람에게 "혼자가 아니야"라는 큰 힘이 돼요. 하지만 놀림 자체는 계속되고 있어요.' },
      { text: '화면을 캡처해 두고 신고하거나 어른에게 알린다',
        effect: { trust: 1, judgment: 2, move: 0 },
        by: {
          where: {
            comment: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '공개 댓글에서는 신고 기능이 가장 빠르고 안전한 방법이에요.' }
          }
        },
        feedback: '증거를 남기고 도움을 요청하는 확실한 방법이에요. 해결까지 시간은 조금 걸려요.' }
    ]
  },
  {
    id: 'ETI-02', type: 'dilemma', topic: 'etiquette', label: '온라인 갈등',
    title: '너 때문에 졌잖아',
    situation: '{where}에서 {who:이/가} 내 실수 때문에 졌다며 "너 때문에 졌잖아, 진짜 못한다"라고 심한 말을 해요.',
    slots: { who: ['friend', 'stranger'], where: ['game', 'chat'] },
    choices: [
      { text: '나도 기분이 나빴다고 분명하게 말한다',
        effect: { trust: 1, judgment: 1, move: 0 },
        by: {
          who: {
            stranger: { effect: { trust: 0, judgment: 0, move: -1 }, feedback: '모르는 사람과는 말이 길어질수록 싸움이 커지기 쉬워요.' }
          }
        },
        feedback: '내 마음을 차분하게 표현하는 건 중요해요. 친구라면 오해를 풀 기회가 돼요.' },
      { text: '대답하지 않고 차단한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        by: {
          who: {
            friend: { effect: { trust: 0, judgment: 1, move: 0 }, feedback: '친한 친구를 바로 차단하면 오해를 풀 기회가 사라져요. 나중에 얼굴을 보고 이야기해 봐요.' }
          }
        },
        feedback: '나를 지키는 빠른 방법이에요.' },
      { text: '대화를 캡처해서 어른에게 보여 준다',
        effect: { trust: 1, judgment: 2, move: 0 },
        by: {
          who: {
            stranger: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '모르는 사람의 심한 말은 증거를 남기고 신고하는 게 가장 좋아요.' }
          }
        },
        feedback: '도움을 요청하는 건 약한 게 아니에요. 다만 친구 사이라면 먼저 직접 이야기해 보는 것도 방법이에요.' }
    ]
  },
  {
    id: 'ETI-03', type: 'dilemma', topic: 'etiquette', label: '초상권',
    title: '엽기 셀카 축하 영상',
    situation: '친구 ㄱ이 나에게만 보낸 엽기 표정 셀카가 너무 웃겨요. 내일 친구 ㄴ의 생일인데, 이 사진으로 축하 영상을 만들면 대박일 것 같아요.',
    choices: [
      { text: 'ㄱ에게 먼저 써도 되는지 물어본다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '사진 주인의 허락이 먼저예요. 깜짝 효과는 줄어도 믿음은 지켜요.' },
      { text: '얼굴에 귀여운 스티커를 붙여서 쓴다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '가렸지만 친구들은 누구인지 알 수 있어요. ㄱ이 싫어할 수도 있어요.' },
      { text: '친한 사이니까 쓰고, 나중에 말한다',
        effect: { trust: -1, judgment: 0, move: 2 },
        feedback: '빠르게 만들었지만, 나에게만 보낸 사진을 여러 사람에게 보이면 ㄱ은 배신감을 느낄 수 있어요.' }
    ]
  },
  {
    id: 'ETI-04', type: 'dilemma', topic: 'etiquette',
    title: '한 명 빼고 새 단톡방',
    situation: '반 친구들이 한 친구만 빼고 새 단톡방을 만들자고 해요. 그 친구가 요즘 말을 좀 심하게 하긴 했어요.',
    choices: [
      { text: '새 단톡방에 들어가지 않는다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '따돌림에 함께하지 않았어요. 하지만 문제는 그대로 남아 있어요.' },
      { text: '빼는 대신 그 친구에게 서운한 점을 직접 말하자고 제안한다',
        effect: { trust: 2, judgment: 2, move: -1 },
        feedback: '갈등을 푸는 가장 좋은 방법이지만, 친구들을 설득하는 데 시간이 걸렸어요.' },
      { text: '들어가되 그 친구 험담은 하지 않는다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '험담을 하지 않아도, 한 명을 빼는 단톡방에 있는 것만으로 따돌림에 힘을 보태게 돼요.' }
    ]
  },
  {
    id: 'ETI-05', type: 'dilemma', topic: 'etiquette',
    title: '밤 11시 고민 상담',
    situation: '친구가 밤 11시에 긴 고민 메시지를 보냈어요. 나는 너무 졸리고 내일은 시험이에요.',
    choices: [
      { text: '지금 짧게라도 답한다',
        effect: { trust: 2, judgment: 0, move: -1 },
        feedback: '친구는 큰 위로를 받았어요. 대신 늦게 자서 다음 날이 힘들었어요.' },
      { text: '"내일 아침에 꼭 이야기하자"고 보내고 잔다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '내 몸도 챙기고 친구에게 기다려 달라고 알렸어요.' },
      { text: '읽고 답은 내일 한다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '"읽었는데 답이 없다"는 건 친구에게 무시당한 느낌을 줄 수 있어요.' }
    ]
  },
  {
    id: 'ETI-06', type: 'dilemma', topic: 'etiquette',
    title: '악플에 몰려간 팬들',
    situation: '좋아하는 가수 영상에 누군가 악플을 달았어요. 팬들이 몰려가 그 사람에게 욕을 퍼붓고 있어요.',
    choices: [
      { text: '악플에 "신고"만 누른다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '조용하지만 효과적인 방법이에요.' },
      { text: '예의 바르게 반박 댓글을 단다',
        effect: { trust: 1, judgment: 0, move: 0 },
        feedback: '예의를 지켰지만, 댓글 싸움에 한 명이 더 끼게 될 수 있어요.' },
      { text: '팬들에게 "욕은 그만하자"고 댓글을 단다',
        effect: { trust: 2, judgment: 1, move: -1 },
        feedback: '같은 편에게 쓴소리하는 건 가장 어려운 용기예요. 하지만 팬들의 반발을 받아 시간이 걸렸어요.' }
    ]
  },

  /* ================= 딜레마 · 알고리즘·추천 ================= */
  {
    id: 'ALG-01', type: 'dilemma', topic: 'algorithm',
    title: '안 보면 대화에 못 껴',
    situation: '숏폼 앱을 켜면 한 시간이 금방 가요. 그런데 친구들은 다 보고 있어서, 안 보면 대화에 못 껴요.',
    choices: [
      { text: '하루 30분만 보기로 알람을 맞춘다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '스스로 규칙을 정했어요. 알람이 울렸을 때 정말 멈추는 게 관건이에요.' },
      { text: '앱을 지우고, 친구들에게 재밌는 영상 이야기를 들어 본다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '과감한 선택이에요. 친구들과 이야기하는 시간이 오히려 늘 수도 있어요.' },
      { text: '친구들이 이야기하는 영상만 찾아본다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '목적을 가지고 본 건 좋아요. 하지만 찾아보는 사이 추천 영상에 다시 빠지기 쉬워요.' }
    ]
  },
  {
    id: 'ALG-02', type: 'dilemma', topic: 'algorithm',
    title: '추천받은 채널',
    situation: '{who:이/가} "이 채널 완전 웃겨!"라며 추천했어요. 그런데 보다 보니 다른 사람을 흉내 내며 비웃는 내용이 많아요. 알고리즘이 비슷한 영상을 계속 보여 줘요.',
    slots: { who: ['friend', 'sibling', 'youtuber'] },
    choices: [
      { text: '재밌으니까 보되, 따라 하지는 않는다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '따라 하지 않아도, 자주 보다 보면 비웃는 게 괜찮다고 느끼게 될 수 있어요.' },
      { text: '"관심 없음"을 눌러 추천을 줄인다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '알고리즘은 내가 누르는 대로 배워요. 내 추천 목록은 내가 가꿀 수 있어요.' },
      { text: '{who}에게 이 영상이 왜 불편한지 이야기한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        by: {
          who: {
            sibling: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '동생이 따라 할 수 있으니 함께 이야기해 보는 건 아주 좋은 선택이에요.' },
            youtuber: { effect: { trust: 0, judgment: 0, move: 0 }, feedback: '유튜버에게 직접 말하기는 어렵고, 공개 댓글은 싸움이 될 수 있어요. 신고 기능이 더 나을 수 있어요.' }
          }
        },
        feedback: '생각을 솔직하게 나누었어요. 친구가 기분 나쁘지 않게 말하는 게 중요해요.' }
    ]
  },
  {
    id: 'ALG-03', type: 'dilemma', topic: 'algorithm',
    title: '우리 팀 뉴스만 보여',
    situation: '내가 좋아하는 야구팀 뉴스만 계속 추천돼요. 다른 팀 팬 친구와 이야기하면 자꾸 말이 안 통하고 다퉈요.',
    choices: [
      { text: '일부러 다른 팀 뉴스도 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '추천 밖의 정보를 찾아보는 건 "필터 버블"에서 빠져나오는 방법이에요.' },
      { text: '친구와 서로 본 뉴스를 바꿔 보자고 한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '서로의 시선을 나누는 멋진 방법이에요.' },
      { text: '그 친구와는 야구 이야기를 안 한다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '다툼은 피했지만, 서로 다른 생각을 이해할 기회도 사라졌어요.' }
    ]
  },
  {
    id: 'ALG-04', type: 'dilemma', topic: 'algorithm',
    title: '지금 접속하면 보상 2배',
    situation: '게임 앱이 매일 저녁 "지금 접속하면 보상 2배!" 알림을 보내요. 숙제를 하다가도 자꾸 신경이 쓰여요.',
    choices: [
      { text: '게임 알림을 끈다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '알림을 끄면 내가 원할 때 게임을 켤 수 있어요.' },
      { text: '보상만 받고 바로 나온다',
        effect: { trust: -1, judgment: 0, move: 2 },
        feedback: '보상은 챙겼지만, 게임은 "조금만 더" 하게 만들도록 설계되어 있어요. 바로 나오기가 생각보다 어려워요.' },
      { text: '가족과 게임 시간을 약속으로 정한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '함께 정한 약속은 혼자 한 결심보다 지키기 쉬워요.' }
    ]
  },
  {
    id: 'ALG-05', type: 'dilemma', topic: 'algorithm',
    title: '자동재생의 유혹',
    situation: '공부 영상을 다 봤더니 다음 영상이 자동으로 재생되려고 해요. 제목은 "충격! 선생님이 절대 말 안 해 주는 비밀"이에요.',
    choices: [
      { text: '자동재생 기능을 끈다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '알고리즘의 흐름을 내가 멈춘 거예요.' },
      { text: '궁금하니까 딱 하나만 본다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '"딱 하나만"이 몇 개가 될지 모르는 게 자동재생의 힘이에요.' },
      { text: '제목이 자극적인 영상은 거르는 나만의 기준을 정한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '"충격", "절대", "비밀" 같은 말은 클릭을 부르는 낚시 제목일 때가 많아요.' }
    ]
  },

  /* ================= 딜레마 · 광고 구별 ================= */
  {
    id: 'AD-01', type: 'dilemma', topic: 'ad',
    title: '키 크는 영양제',
    situation: '좋아하는 유튜버가 영양제를 먹고 키가 컸다고 해요. 영상 끝에 작게 "유료 광고 포함"이라고 적혀 있어요.',
    choices: [
      { text: '광고니까 전부 거짓말이라고 생각한다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '광고라고 모두 거짓은 아니에요. 광고인지 알고, 따져 보는 게 중요해요.' },
      { text: '효과가 정말 있는지 다른 자료에서 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '광고 밖의 정보로 확인하는 좋은 습관이에요.' },
      { text: '부모님께 영상을 보여 드리고 함께 판단한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '건강과 관련된 물건은 어른과 함께 정하는 게 좋아요.' }
    ]
  },
  {
    id: 'AD-02', type: 'dilemma', topic: 'ad',
    title: '아이템 공짜 링크',
    situation: '{who:이/가} {where}에 "이 링크로 가입하면 게임 아이템 공짜!"라는 글을 올렸어요.',
    slots: { who: ['friend', 'stranger', 'youtuber'], where: ['chat', 'game', 'comment'] },
    choices: [
      { text: '공짜니까 링크를 눌러 본다',
        effect: { trust: -1, judgment: -1, move: 1 },
        by: {
          who: {
            friend: { effect: { trust: -1, judgment: 0, move: 1 }, feedback: '친구 계정이 해킹되어 이런 링크가 퍼지는 경우가 많아요.' },
            stranger: { effect: { trust: -2, judgment: -1, move: -2 }, feedback: '모르는 사람의 공짜 링크는 개인정보를 훔치는 가짜 사이트일 가능성이 커요.' },
            youtuber: { effect: { trust: -1, judgment: 0, move: 1 }, feedback: '광고일 수 있어요. 광고 표시와 공식 계정인지부터 확인해요.' }
          }
        },
        feedback: '' },
      { text: '공식 게임 홈페이지에서 같은 이벤트가 있는지 찾아본다',
        effect: { trust: 1, judgment: 2, move: 1 },
        feedback: '공식 출처에서 확인하는 게 가장 안전해요.' },
      { text: '{who}에게 "이거 진짜 네가 올린 거야?"라고 따로 물어본다',
        effect: { trust: 1, judgment: 1, move: 0 },
        by: {
          who: {
            friend: { effect: { trust: 2, judgment: 1, move: 1 }, feedback: '친구 계정이 해킹됐는지 가장 빨리 알 수 있는 방법이에요.' },
            stranger: { effect: { trust: -1, judgment: 0, move: 0 }, feedback: '모르는 사람과 대화를 이어 가면 더 위험한 부탁을 받을 수 있어요.' }
          }
        },
        feedback: '올린 사람에게 직접 확인하는 방법이에요.' }
    ]
  },
  {
    id: 'AD-03', type: 'dilemma', topic: 'ad',
    title: '검색 1등 글',
    situation: '숙제 때문에 검색했더니 맨 위에 나온 글 옆에 작게 "광고"라고 적혀 있어요. 그런데 내용은 제일 자세해요.',
    choices: [
      { text: '광고라도 자세하니 참고한다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '광고인 걸 알고 본 건 좋아요. 광고 글은 자기 제품에 유리한 내용만 쓸 수 있어요.' },
      { text: '광고가 아닌 다른 자료를 찾는다',
        effect: { trust: 1, judgment: 1, move: 0 },
        feedback: '광고를 걸러 낸 좋은 판단이에요.' },
      { text: '광고 글과 다른 자료를 비교해 본다',
        effect: { trust: 1, judgment: 2, move: -1 },
        feedback: '가장 꼼꼼한 방법이에요. 대신 시간이 걸려 한 칸 늦어졌어요.' }
    ]
  },
  {
    id: 'AD-04', type: 'dilemma', topic: 'ad',
    title: '별점 5점 쿠폰',
    situation: '문구점 앱이 "별점 5점 리뷰를 쓰면 쿠폰!" 이벤트를 해요. 그런데 산 펜은 솔직히 별로였어요.',
    choices: [
      { text: '쿠폰을 받으려고 5점을 준다',
        effect: { trust: -2, judgment: 0, move: 2 },
        feedback: '쿠폰은 받았지만, 다른 사람들은 내 리뷰를 믿고 별로인 펜을 사게 돼요.' },
      { text: '솔직하게 3점을 준다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '솔직한 리뷰는 다른 사람에게 도움이 돼요. 이런 이벤트가 리뷰를 믿기 어렵게 만든다는 것도 알 수 있어요.' },
      { text: '리뷰를 쓰지 않는다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '거짓말은 안 했어요. 하지만 좋은 리뷰가 많은 이유를 생각해 보면 리뷰를 볼 때도 조심해야겠죠?' }
    ]
  },
  {
    id: 'AD-05', type: 'dilemma', topic: 'ad',
    title: '표시 없는 칭찬',
    situation: '좋아하는 게임 유튜버가 새 게임을 영상마다 칭찬해요. 그런데 광고 표시는 어디에도 없어요.',
    choices: [
      { text: '댓글로 "광고인가요?"라고 물어본다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '궁금한 점을 물어보는 건 좋아요. 예의 바르게 묻는 게 중요해요.' },
      { text: '다른 사람들의 게임 리뷰를 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '여러 사람의 의견을 비교하는 게 가장 믿을 만해요.' },
      { text: '좋아하는 유튜버니까 믿고 게임을 받아 본다',
        effect: { trust: -1, judgment: 0, move: 2 },
        feedback: '광고 표시 없이 돈을 받고 칭찬하는 "뒷광고"일 수도 있어요.' }
    ]
  },

  /* ================= 돌발 퀴즈 ================= */
  {
    id: 'Q-01', type: 'quiz', topic: 'source', label: '뉴스 구별', shuffle: false,
    title: '진짜 같은 사진',
    situation: '어떤 글에 사진이 붙어 있는데, 사실은 몇 년 전 다른 사건 사진인 경우가 많아요.',
    question: '사진이 진짜처럼 보이면, 항상 그 순간에 찍힌 것이다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 1,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '진짜 사진이라도 다른 때, 다른 곳에서 찍힌 사진을 가져다 쓸 수 있어요.'
  },
  {
    id: 'Q-02', type: 'quiz', topic: 'ad', shuffle: false,
    title: '유료 광고 포함',
    situation: '영상 화면 구석에 "유료 광고 포함"이라는 글자가 보여요.',
    question: '이 영상은 회사에서 돈이나 물건을 받고 만든 것일 수 있다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 0,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '광고를 받고 만든 영상은 그 사실을 알리도록 되어 있어요.'
  },
  {
    id: 'Q-03', type: 'quiz', topic: 'privacy', shuffle: false,
    title: '비밀번호',
    situation: '친한 친구가 비밀번호를 물어봐요.',
    question: '비밀번호는 가장 친한 친구에게는 알려 줘도 괜찮다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 1,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '비밀번호는 보호자 말고는 누구에게도 알려 주지 않아요.'
  },
  {
    id: 'Q-04', type: 'quiz', topic: 'deepfake',
    title: '딥페이크 단서',
    situation: '친구 얼굴이 나온 영상이 어딘가 이상해요.',
    question: '딥페이크를 의심할 단서가 아닌 것은?',
    options: [{ text: '눈 깜빡임이 어색하다' }, { text: '입 모양과 소리가 맞지 않는다' }, { text: '화질이 아주 선명하다' }],
    answer: 2,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '요즘 딥페이크는 화질이 선명해서 화질만으로는 알 수 없어요. 어색한 움직임을 살펴봐요.'
  },
  {
    id: 'Q-05', type: 'quiz', topic: 'privacy',
    title: '개인정보 찾기',
    situation: '회원 가입 화면에 여러 칸이 있어요.',
    question: '다음 중 개인정보가 아닌 것은?',
    options: [{ text: '집 주소' }, { text: '학교 이름과 학년' }, { text: '좋아하는 색깔' }],
    answer: 2,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '주소, 학교, 학년처럼 나를 찾아낼 수 있는 정보가 개인정보예요.'
  },
  {
    id: 'Q-06', type: 'quiz', topic: 'privacy', label: '디지털 발자국', shuffle: false,
    title: '지우면 끝?',
    situation: '예전에 올린 글이 부끄러워서 지웠어요.',
    question: '인터넷에 올린 글을 지우면 완전히 사라진다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 1,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '누군가 캡처했거나 다른 곳에 저장됐다면 계속 남아요. 올리기 전에 한 번 더 생각해요.'
  },
  {
    id: 'Q-07', type: 'quiz', topic: 'source',
    title: '믿을 만한 뉴스',
    situation: '같은 사건을 다룬 글이 여러 개예요.',
    question: '뉴스를 믿을 수 있는지 확인할 때 가장 도움이 되는 것은?',
    options: [{ text: '좋아요 수' }, { text: '언론사와 기자 이름, 날짜' }, { text: '댓글 반응' }],
    answer: 1,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '누가, 언제 썼는지 밝힌 글이 책임 있는 글이에요.'
  },
  {
    id: 'Q-08', type: 'quiz', topic: 'algorithm', shuffle: false,
    title: '추천의 비밀',
    situation: '고양이 영상을 하나 봤더니 고양이 영상이 계속 나와요.',
    question: '추천 알고리즘은 내가 오래 본 영상과 비슷한 영상을 더 보여 준다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 0,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '알고리즘은 내가 무엇을 얼마나 오래 봤는지 기억해서 비슷한 것을 보여 줘요.'
  },
  {
    id: 'Q-09', type: 'quiz', topic: 'etiquette', label: '저작권',
    title: '발표 자료 그림',
    situation: '발표 자료에 인터넷에서 찾은 멋진 그림을 넣고 싶어요.',
    question: '바른 방법은?',
    options: [{ text: '쓸 수 있는 자료인지 확인하고 출처를 밝힌다' }, { text: '색만 조금 바꿔서 쓴다' }, { text: '작게 넣으면 괜찮다' }],
    answer: 0,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '다른 사람이 만든 그림에는 저작권이 있어요. 사용 허락 여부와 출처를 확인해요.'
  },
  {
    id: 'Q-10', type: 'quiz', topic: 'privacy', shuffle: false,
    title: '보호자 동의',
    situation: '새 앱에 가입하려고 해요.',
    question: '만 14세 미만은 가입할 때 보호자 동의가 필요한 경우가 많다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 0,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '어린이의 개인정보를 지키기 위해 보호자 동의를 받도록 되어 있어요.'
  },
  {
    id: 'Q-11', type: 'quiz', topic: 'etiquette',
    title: '사이버 폭력 증거',
    situation: '단톡방에서 친구가 계속 심한 말을 듣고 있어요.',
    question: '도움을 요청할 때 가장 좋은 방법은?',
    options: [{ text: '화면을 캡처해서 어른에게 보여 준다' }, { text: '캡처를 다른 단톡방에 올려 알린다' }, { text: '가해자에게 똑같이 따진다' }],
    answer: 0,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '증거는 남기되 퍼뜨리지 않고, 믿을 만한 어른에게 보여 줘요.'
  },
  {
    id: 'Q-12', type: 'quiz', topic: 'source', label: '낚시 제목',
    title: '낚시 제목',
    situation: '"경악! 이것 먹으면 큰일 난다?!"라는 제목이 보여요.',
    question: '낚시 제목의 특징이 아닌 것은?',
    options: [{ text: '"충격", "경악" 같은 센 말을 쓴다' }, { text: '물음표로 궁금하게 만든다' }, { text: '글쓴이와 날짜를 밝힌다' }],
    answer: 2,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: '낚시 제목은 클릭을 부르려고 과장해요. 글쓴이와 날짜를 밝히는 건 믿을 만한 글의 특징이에요.'
  },
  {
    id: 'Q-13', type: 'quiz', topic: 'deepfake', label: 'AI 활용', shuffle: false,
    title: 'AI의 대답',
    situation: 'AI 챗봇에게 역사 숙제를 물어봤어요.',
    question: 'AI 챗봇의 대답은 항상 정확하다.',
    options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }],
    answer: 1,
    correct: { trust: 1, judgment: 1, move: 1 },
    wrong: { trust: 0, move: -1 },
    explanation: 'AI도 그럴듯하게 틀린 말을 할 수 있어요. 중요한 내용은 다른 자료로 확인해요.'
  },

  /* ================= 돌발 상황 (운) ================= */
  { id: 'C-01', type: 'chance', topic: 'algorithm', title: '새로운 추천',
    situation: '관심 없던 과학 영상이 추천되길래 눌러 봤더니 새로운 걸 알게 됐어요!',
    effect: { trust: 1, move: 1 } },
  { id: 'C-02', type: 'chance', topic: 'source', title: '팩트 체크 친구',
    situation: '모둠 친구가 가짜 뉴스 구별법을 알려 줬어요. 모두 함께 두 칸 앞으로!',
    effect: { judgment: 1, move: 2 } },
  { id: 'C-03', type: 'chance', topic: 'privacy', title: '스팸 문자 폭탄',
    situation: '재미로 한 성격 테스트에 전화번호를 넣었더니 이상한 광고 문자가 쏟아져요.',
    effect: { trust: -1, move: -1 } },
  { id: 'C-04', type: 'chance', title: '와이파이 끊김',
    situation: '와이파이가 끊겼어요! 연결될 때까지 한 칸 뒤로.',
    effect: { move: -1 } },
  { id: 'C-05', type: 'chance', topic: 'etiquette', label: '저작권', title: '저작권 걱정 없는 음악',
    situation: '모둠 영상에 무료 음원을 찾아 넣어서 선생님께 칭찬받았어요.',
    effect: { trust: 1, move: 2 } },
  { id: 'C-06', type: 'chance', title: '배터리 1%',
    situation: '배터리가 1%! 충전하는 동안 두 칸 뒤로.',
    effect: { move: -2 } },
  { id: 'C-07', type: 'chance', topic: 'privacy', title: '보안 업데이트 완료',
    situation: '귀찮은 보안 업데이트를 미루지 않고 했어요. 든든해요!',
    effect: { judgment: 1, move: 1 } },
  { id: 'C-08', type: 'chance', title: '알림 300개',
    situation: '단톡방 알림이 300개! 다 읽느라 시간이 걸렸어요.',
    effect: { move: -2 } },
  { id: 'C-09', type: 'chance', topic: 'etiquette', title: '진심 댓글',
    situation: '친구 그림에 "좋아요" 대신 진심 어린 칭찬 댓글을 남겼어요.',
    effect: { trust: 1, move: 1 } },
  { id: 'C-10', type: 'chance', topic: 'privacy', title: '택배 문자',
    situation: '"택배가 도착했어요" 문자 속 수상한 링크를 누르지 않고 지웠어요.',
    effect: { judgment: 1, move: 2 } },
  { id: 'C-11', type: 'chance', topic: 'privacy', title: '로그아웃 깜빡',
    situation: '학교 컴퓨터에서 로그아웃하는 걸 깜빡했어요! 다시 돌아가서 로그아웃.',
    effect: { trust: -1, move: -2 } },
  { id: 'C-12', type: 'chance', title: '모둠 하이파이브',
    situation: '모둠 모두 하이파이브! 두 칸 앞으로 슝!',
    effect: { move: 2 } },
  { id: 'C-13', type: 'chance', topic: 'etiquette', title: '버그 제보',
    situation: '게임 버그를 발견해서 몰래 쓰지 않고 개발사에 제보했어요.',
    effect: { trust: 1, judgment: 1, move: 1 } }
]);
