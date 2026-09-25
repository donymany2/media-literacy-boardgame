/*
 * 카드팩: 디지털 미디어 리터러시 — 딜레마 카드 추가분 (초안 v0.3, 47장)
 * 형식은 cards.js 맨 위 주석을 따릅니다.
 */
BG.registerPack('media-literacy', 'cards', [

  /* ================= 출처 확인 ================= */
  {
    id: 'SRC-07', type: 'dilemma', topic: 'source',
    title: '할머니의 건강 정보',
    situation: '가족 단톡방에 할머니가 "이 풀을 달여 먹으면 감기에 절대 안 걸린대"라는 글을 올리셨어요. 출처는 이름 모를 블로그예요.',
    choices: [
      { text: '단톡방에 "할머니, 그거 가짜예요"라고 쓴다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '틀린 정보를 바로잡으려는 마음은 좋아요. 하지만 여러 사람 앞에서 말하면 할머니가 민망하실 수 있어요.' },
      { text: '믿을 만한 건강 정보를 찾아 할머니께 따로 보내 드린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '근거를 들어 다정하게 알려 드렸어요. 시간은 걸리지만 할머니도 기분 좋게 받아들이실 거예요.' },
      { text: '어른들 일이니 모른 척한다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '가족이 잘못된 정보를 믿고 건강을 해칠 수도 있어요. 어른에게도 정보 확인을 도와드릴 수 있어요.' }
    ]
  },
  {
    id: 'SRC-08', type: 'dilemma', topic: 'source',
    title: '3년 전 뉴스',
    situation: '친구가 "내일부터 학교에서 스마트폰 금지래!"라는 뉴스 화면을 캡처해 보냈어요. 자세히 보니 날짜가 3년 전이에요.',
    choices: [
      { text: '날짜를 알려 주며 "옛날 뉴스 같아"라고 답한다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '날짜를 확인한 건 최고의 습관이에요. 오래된 뉴스가 새것처럼 돌아다니는 일이 많아요.' },
      { text: '반 단톡방에 "이거 진짜래"라고 올린다',
        effect: { trust: -2, judgment: 0, move: 1 },
        feedback: '확인하지 않은 캡처가 반 전체를 헷갈리게 만들었어요.' },
      { text: '선생님께 진짜인지 여쭤본다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '학교 일은 선생님께 여쭤보는 게 가장 정확해요.' }
    ]
  },
  {
    id: 'SRC-09', type: 'dilemma', topic: 'source',
    title: '유명 과학자의 명언?',
    situation: '"숙제는 뇌를 망친다 — 아인슈타인"이라는 명언 사진이 돌고 있어요. 숙제가 싫은 친구들은 다 좋아해요.',
    choices: [
      { text: '정말 그 과학자가 한 말인지 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '유명인 이름을 붙인 가짜 명언이 아주 많아요. 확인하는 습관이 멋져요.' },
      { text: '"가짜일 수도 있음"이라고 적어서 재미로 공유한다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '의심을 함께 적은 건 좋지만, 사진은 설명 없이 계속 퍼질 수 있어요.' },
      { text: '유명한 사람이 했다니 믿고 친구들에게 보여 준다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '유명한 이름이 붙었다고 진짜가 되는 건 아니에요.' }
    ]
  },
  {
    id: 'SRC-10', type: 'dilemma', topic: 'source',
    title: '틀린 게임 정보',
    situation: '누구나 고칠 수 있는 인터넷 백과사전에서 내가 좋아하는 게임 정보가 틀린 걸 발견했어요.',
    choices: [
      { text: '공식 자료를 찾아 출처와 함께 고친다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '정보를 함께 가꾸는 좋은 시민이에요. 출처를 달면 다른 사람도 믿을 수 있어요.' },
      { text: '틀린 걸 알았으니 나만 조심한다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '나는 속지 않았지만 다른 사람들은 계속 틀린 정보를 보게 돼요.' },
      { text: '누구나 고칠 수 있으니 이 사이트는 다 틀렸다고 생각한다',
        effect: { trust: 0, judgment: -1, move: 1 },
        feedback: '틀린 곳이 있을 수 있지만 전부 틀린 건 아니에요. 출처가 달린 내용인지 살펴봐요.' }
    ]
  },
  {
    id: 'SRC-11', type: 'dilemma', topic: 'source',
    title: '5초짜리 증거 영상',
    situation: '{who:이/가} {where}에 "학교 앞 문구점이 유통기한 지난 과자를 판다"는 5초짜리 영상을 올렸어요. 앞뒤 상황은 알 수 없어요.',
    slots: { who: ['friend', 'stranger', 'youtuber'], where: ['chat', 'comment'] },
    choices: [
      { text: '영상을 퍼 나르며 "여기 가지 마"라고 쓴다',
        effect: { trust: -2, judgment: 0, move: 1 },
        feedback: '짧은 영상만으로는 진실을 알 수 없어요. 사실이 아니라면 문구점 주인이 큰 피해를 봐요.' },
      { text: '앞뒤가 나온 영상이나 다른 증거가 있는지 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        by: {
          who: {
            youtuber: { effect: { trust: 1, judgment: 2, move: 1 }, feedback: '유튜버 영상은 조회수를 위해 짧게 잘라 편집될 때가 많아요. 원본을 찾아본 건 아주 좋은 판단이에요.' }
          }
        },
        feedback: '짧게 잘린 영상은 오해를 부르기 쉬워요. 전체 상황을 찾아보는 게 중요해요.' },
      { text: '억울한 사람이 생기지 않게 어른에게 먼저 알린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        by: {
          who: {
            friend: { effect: { trust: 2, judgment: 1, move: 1 }, feedback: '친구가 오해했을 수도 있으니, 어른과 함께 확인하고 친구에게도 영상 내리기를 권해 봐요.' }
          }
        },
        feedback: '사실인지 아닌지 판단하기 어려울 때는 어른과 함께 확인하는 게 안전해요.' }
    ]
  },
  {
    id: 'SRC-12', type: 'dilemma', topic: 'source',
    title: '주먹만 한 우박',
    situation: '"내일 주먹만 한 우박이 떨어진대! 학교 가면 큰일 나!"라는 메시지가 반 전체에 돌고 있어요.',
    choices: [
      { text: '기상청 날씨 예보를 확인한다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '날씨는 기상청 같은 공식 기관이 가장 정확해요.' },
      { text: '혹시 모르니 가족에게 우산만 챙기자고 말한다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '겁을 주지 않고 조심만 한 건 괜찮아요. 하지만 사실인지는 아직 모르는 상태예요.' },
      { text: '친구들에게 더 무섭게 부풀려서 전한다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '과장된 소문은 불안만 키워요. 전하는 사람도 소문을 만드는 사람이 돼요.' }
    ]
  },
  {
    id: 'SRC-13', type: 'dilemma', topic: 'source',
    title: '우리 반 90%',
    situation: '"우리 반 90%가 이 게임을 해요!"라는 그래프가 돌아요. 알고 보니 설문에 참여한 사람은 10명뿐이에요.',
    choices: [
      { text: '몇 명에게, 어떻게 물어본 건지 확인한다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '숫자와 그래프는 누구에게 몇 명에게 물었는지가 중요해요.' },
      { text: '90%나 한다니 나도 해야겠다고 생각한다',
        effect: { trust: -1, judgment: -1, move: 2 },
        feedback: '많은 사람이 한다는 숫자는 마음을 흔들기 쉬워요. 숫자의 뒷이야기를 살펴봐요.' },
      { text: '숫자는 맞으니 그대로 전한다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '숫자 자체는 맞아도, 10명 중 9명을 "우리 반 90%"라고 하면 오해를 부를 수 있어요.' }
    ]
  },
  {
    id: 'SRC-14', type: 'dilemma', topic: 'source',
    title: '기사보다 그럴듯한 댓글',
    situation: '뉴스 기사 아래 맨 위 댓글이 기사와 정반대 이야기를 해요. 좋아요도 댓글이 훨씬 많아요.',
    choices: [
      { text: '좋아요가 많은 댓글을 믿는다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '댓글의 좋아요는 인기이지 사실의 증거가 아니에요.' },
      { text: '기사와 댓글 모두 근거가 있는지 살펴본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '양쪽의 근거를 비교하는 것이 가장 좋은 판단 방법이에요.' },
      { text: '둘 다 못 믿겠으니 아무것도 믿지 않는다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '모든 걸 의심만 하면 판단할 수 없어요. 믿을 만한 근거를 찾는 게 중요해요.' }
    ]
  },

  /* ================= 딥페이크·AI ================= */
  {
    id: 'AI-06', type: 'dilemma', topic: 'deepfake',
    title: '선생님 목소리 장난',
    situation: '친구가 AI 앱으로 담임 선생님 목소리를 흉내 내 "내일 숙제 없음!"이라는 음성을 만들었어요. 반 단톡방에 올리자고 해요.',
    choices: [
      { text: '재밌으니 같이 올린다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '다른 사람의 목소리를 허락 없이 흉내 내 퍼뜨리면 속는 사람이 생기고, 선생님께도 큰 실례예요.' },
      { text: '"허락 없이 목소리를 쓰면 안 돼"라고 말린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '장난이 누군가에게 피해가 될 수 있다는 걸 알아챘어요.' },
      { text: '올리지는 않고 나만 듣고 지운다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '퍼뜨리지 않은 건 좋아요. 하지만 친구가 혼자 올릴 수도 있어요.' }
    ]
  },
  {
    id: 'AI-07', type: 'dilemma', topic: 'deepfake',
    title: '연예인과 찰칵?',
    situation: '{who:이/가} 나와 좋아하는 연예인이 함께 있는 것처럼 AI로 합성한 사진을 보내 줬어요. 진짜 같아서 신기해요.',
    slots: { who: ['friend', 'sibling', 'stranger'] },
    choices: [
      { text: 'SNS에 "진짜 만났다!"라고 자랑한다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '합성 사진을 진짜라고 하면 거짓말이 되고, 연예인의 얼굴도 허락 없이 쓰게 돼요.' },
      { text: '"AI 합성"이라고 밝히고 친구들에게만 보여 준다',
        effect: { trust: 1, judgment: 1, move: 1 },
        by: {
          who: {
            stranger: { effect: { trust: -1, judgment: 0, move: -1 }, feedback: '처음 보는 사람이 내 얼굴로 합성 사진을 만들었다면 즐길 일이 아니에요. 내 사진이 어떻게 쓰일지 몰라요.' }
          }
        },
        feedback: 'AI로 만들었다고 밝히면 오해가 생기지 않아요.' },
      { text: '저장하지 않고 고맙다고만 한다',
        effect: { trust: 1, judgment: 0, move: 0 },
        by: {
          who: {
            stranger: { effect: { trust: 1, judgment: 2, move: 1 }, feedback: '처음 보는 사람이 내 얼굴 사진을 가지고 있다는 게 더 큰 문제예요. 어른에게 꼭 알려요.' }
          }
        },
        feedback: '조용히 넘어갔어요. 합성 사진이 다른 곳에 퍼지지 않도록 부탁해 두면 더 좋아요.' }
    ]
  },
  {
    id: 'AI-08', type: 'dilemma', topic: 'deepfake', label: 'AI 활용',
    title: 'AI와 교과서의 답이 달라',
    situation: '수학 문제를 AI 챗봇에게 물었더니 자신 있게 답과 풀이를 알려 줬어요. 그런데 교과서 뒤의 답과 달라요.',
    choices: [
      { text: 'AI가 더 똑똑하니 AI 답을 쓴다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: 'AI도 자신 있게 틀린 답을 말할 수 있어요.' },
      { text: '직접 다시 풀어 보고 어느 쪽이 맞는지 확인한다',
        effect: { trust: 1, judgment: 2, move: -1 },
        feedback: '스스로 확인하는 힘이 가장 중요해요. 시간이 걸려 한 칸 늦어졌지만 실력은 늘었어요.' },
      { text: '선생님께 두 답을 보여 드리고 여쭤본다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '헷갈릴 때 도움을 요청하는 것도 좋은 방법이에요.' }
    ]
  },
  {
    id: 'AI-09', type: 'dilemma', topic: 'deepfake', label: 'AI 활용',
    title: 'AI 그림 대회',
    situation: '학교 그림 대회에 AI 그림도 낼 수 있대요. 단, "AI 사용"을 표시해야 해요. 내 손그림은 AI 그림보다 덜 멋져 보여요.',
    choices: [
      { text: '내 손그림을 낸다',
        effect: { trust: 2, judgment: 0, move: 0 },
        feedback: '내 손으로 만든 작품에는 나만의 이야기가 담겨요.' },
      { text: 'AI 그림을 "AI 사용"이라고 표시해서 낸다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '규칙을 지키며 새 도구를 쓴 거예요. 어떤 아이디어를 넣었는지 설명할 수 있으면 더 좋아요.' },
      { text: 'AI 그림을 표시 없이 낸다',
        effect: { trust: -2, judgment: -1, move: 2 },
        feedback: '규칙을 어기면 상을 받아도 믿음을 잃어요.' }
    ]
  },
  {
    id: 'AI-10', type: 'dilemma', topic: 'deepfake',
    title: '앵커가 추천하는 투자',
    situation: '유명 뉴스 앵커가 "이 코인에 투자하면 부자가 됩니다"라고 말하는 광고 영상이 나왔어요. 입 모양이 살짝 어색해요.',
    choices: [
      { text: '뉴스 앵커가 말하니 믿는다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: '유명인의 얼굴과 목소리를 AI로 흉내 낸 사기 광고가 많아요.' },
      { text: '방송사 공식 채널에 같은 영상이 있는지 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '공식 출처와 비교하는 게 딥페이크를 가려내는 좋은 방법이에요.' },
      { text: '부모님께 "딥페이크 광고 같아요"라고 알려 드린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '가족이 속지 않도록 도운 거예요. 어른들도 이런 광고에 속는 경우가 많아요.' }
    ]
  },
  {
    id: 'AI-11', type: 'dilemma', topic: 'deepfake', label: 'AI 활용',
    title: 'AI 친구가 더 편해',
    situation: 'AI 챗봇과 이야기하는 게 친구와 이야기하는 것보다 편해요. 오늘도 친구가 놀자고 했는데 거절하고 챗봇과 대화하고 싶어요.',
    choices: [
      { text: '챗봇과 이야기한다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '챗봇은 늘 맞춰 주지만, 서로 배려하며 자라는 관계는 친구와 만들 수 있어요.' },
      { text: '친구와 놀고, 챗봇은 잠깐만 쓴다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: 'AI는 도구이고 친구는 친구예요. 균형을 잘 잡았어요.' },
      { text: '챗봇에게 친구와 잘 지내는 방법을 물어본다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '물어보는 건 좋지만, 결국 관계는 직접 만나고 이야기하며 만들어져요.' }
    ]
  },
  {
    id: 'AI-12', type: 'dilemma', topic: 'deepfake',
    title: '모두 예쁘게 보정',
    situation: '반 단체 사진을 보정 앱으로 고쳐서 올리려고 해요. 버튼 하나면 친구들 얼굴까지 모두 바꿀 수 있어요.',
    choices: [
      { text: '내 얼굴만 보정한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '내 얼굴은 내가 정할 수 있어요. 다른 사람 얼굴은 건드리지 않은 좋은 선택이에요.' },
      { text: '모두 예쁘게 보정해서 올린다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '좋은 뜻이어도 다른 사람의 얼굴을 허락 없이 바꾸면 기분 나쁠 수 있어요.' },
      { text: '보정하지 않고 그대로 올린다',
        effect: { trust: 2, judgment: 0, move: 0 },
        feedback: '있는 그대로의 모습도 충분히 멋져요.' }
    ]
  },
  {
    id: 'AI-13', type: 'dilemma', topic: 'deepfake', label: 'AI 활용',
    title: '번역기 영어 일기',
    situation: '영어 일기 숙제가 있어요. 한국어로 쓰고 AI 번역기로 바꾸면 1분이면 끝나요.',
    choices: [
      { text: '번역 결과를 그대로 낸다',
        effect: { trust: -1, judgment: 0, move: 2 },
        feedback: '빨리 끝났지만 영어 실력은 늘지 않아요. 숙제의 목적을 생각해 봐요.' },
      { text: '직접 영어로 쓰고, 모르는 단어만 번역기로 찾는다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: 'AI를 사전처럼 똑똑하게 썼어요.' },
      { text: '번역 결과를 보며 따라 쓰고 문장을 익힌다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '번역기를 선생님처럼 활용했어요. 번역이 틀릴 수 있다는 점은 기억해요.' }
    ]
  },

  /* ================= 개인정보 ================= */
  {
    id: 'PRI-07', type: 'dilemma', topic: 'privacy',
    title: '학교 이름 체육복',
    situation: '운동회 사진을 SNS에 올리려는데, 체육복에 학교 이름이 크게 보여요.',
    choices: [
      { text: '학교 이름을 가리고 올린다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '추억은 나누고 정보는 지켰어요.' },
      { text: '친구들만 보니까 그대로 올린다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '친구만 본다고 생각해도 캡처되어 퍼질 수 있어요. 학교 이름은 나를 찾을 수 있는 정보예요.' },
      { text: '올리지 않고 가족 앨범에만 둔다',
        effect: { trust: 2, judgment: 0, move: 0 },
        feedback: '가장 안전한 방법이에요.' }
    ]
  },
  {
    id: 'PRI-08', type: 'dilemma', topic: 'privacy',
    title: '비밀번호 없는 와이파이',
    situation: '카페의 비밀번호 없는 공짜 와이파이에 연결했어요. 게임 계정에 로그인하고 싶어요.',
    choices: [
      { text: '그냥 로그인한다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: '누구나 쓰는 공짜 와이파이에서는 로그인 정보가 새어 나갈 위험이 있어요.' },
      { text: '로그인은 집에서 하고, 여기서는 검색만 한다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '장소에 따라 할 일을 나눈 똑똑한 판단이에요.' },
      { text: '와이파이를 끄고 휴대폰 데이터로 로그인한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '더 안전한 방법을 골랐어요. 데이터 요금은 가족과 약속한 만큼만 써요.' }
    ]
  },
  {
    id: 'PRI-09', type: 'dilemma', topic: 'privacy',
    title: '우리 반 조사 설문',
    situation: '{who:이/가} {where}에 "우리 반 친구들 생일이랑 사는 아파트 조사해요!"라는 설문 링크를 올렸어요.',
    slots: { who: ['friend', 'stranger'], where: ['chat', 'game'] },
    choices: [
      { text: '재밌을 것 같아 다 적는다',
        effect: { trust: -2, judgment: -1, move: -1 },
        by: {
          who: {
            friend: { effect: { trust: -1, judgment: 0, move: 0 }, feedback: '친구가 만든 설문이라도 모인 정보가 어디로 갈지 몰라요. 사는 곳은 적지 않는 게 좋아요.' }
          }
        },
        feedback: '모르는 사람에게 생일과 사는 곳을 알려 주면 위험해질 수 있어요.' },
      { text: '생일만 적고 사는 곳은 비워 둔다',
        effect: { trust: 0, judgment: 1, move: 1 },
        by: {
          who: {
            stranger: { effect: { trust: -1, judgment: 0, move: 0 }, feedback: '처음 보는 사람의 설문에는 아무것도 적지 않는 게 좋아요.' }
          }
        },
        feedback: '중요한 정보는 지켰어요. 생일도 다른 정보와 합쳐지면 나를 알아낼 수 있어요.' },
      { text: '참여하지 않고, 친구들에게도 개인정보는 적지 말자고 말한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        by: {
          who: {
            stranger: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '모르는 사람이 우리 반 정보를 모으는 건 위험한 신호예요. 선생님께도 알려요.' }
          }
        },
        feedback: '나와 친구들의 정보를 함께 지켰어요.' }
    ]
  },
  {
    id: 'PRI-10', type: 'dilemma', topic: 'privacy',
    title: '지금 여기 여행 중',
    situation: '가족 여행 사진을 올리려는데, 앱이 자동으로 "지금 있는 곳" 위치를 붙여요. 우리 집은 지금 비어 있어요.',
    choices: [
      { text: '위치 표시를 끄고 올린다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '위치 정보를 지키는 설정을 찾아냈어요.' },
      { text: '여행에서 돌아온 뒤에 올린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '집이 비어 있다는 걸 알리지 않는 좋은 방법이에요.' },
      { text: '위치가 붙은 채 지금 바로 올린다',
        effect: { trust: -1, judgment: -1, move: 2 },
        feedback: '실시간 위치는 "지금 집에 아무도 없다"는 정보가 될 수 있어요.' }
    ]
  },
  {
    id: 'PRI-11', type: 'dilemma', topic: 'privacy',
    title: '켜져 있는 자동 로그인',
    situation: '학교 컴퓨터실에서 내 계정 "자동 로그인"이 켜져 있는 걸 발견했어요. 수업이 곧 끝나요.',
    choices: [
      { text: '급하니 그냥 나간다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '다음 사람이 내 계정으로 들어갈 수 있어요.' },
      { text: '로그아웃하고 자동 로그인 설정도 끈다',
        effect: { trust: 1, judgment: 2, move: -1 },
        feedback: '가장 꼼꼼한 방법이에요. 쉬는 시간이 조금 줄었지만 계정은 안전해요.' },
      { text: '로그아웃만 하고 나간다',
        effect: { trust: 1, judgment: 1, move: 0 },
        feedback: '당장은 안전해요. 다음에 또 자동으로 로그인될 수 있으니 설정도 확인해요.' }
    ]
  },
  {
    id: 'PRI-12', type: 'dilemma', topic: 'privacy',
    title: '잠금 풀린 친구 휴대폰',
    situation: '친구가 화장실에 간 사이, 잠금이 풀린 휴대폰이 책상 위에 있어요. 다른 친구가 "메시지 몰래 보자"고 해요.',
    choices: [
      { text: '보지 말자고 하고 휴대폰을 엎어 둔다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '친구의 비밀을 지켜 준 믿음직한 행동이에요.' },
      { text: '나는 안 보고 자리를 피한다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '나는 지켰지만 다른 친구가 볼 수도 있어요.' },
      { text: '살짝 보기만 한다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '허락 없이 남의 메시지를 보는 건 사생활 침해예요.' }
    ]
  },
  {
    id: 'PRI-13', type: 'dilemma', topic: 'privacy',
    title: '외우기 쉬운 아이디',
    situation: '새 게임 아이디를 만들려는데, "이름+생일"이 제일 외우기 쉬워요.',
    choices: [
      { text: '이름+생일로 만든다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '아이디만 보고도 내 이름과 생일을 알 수 있게 돼요.' },
      { text: '나만 아는 별명과 숫자를 섞어 만든다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '개인정보가 드러나지 않는 좋은 아이디예요.' },
      { text: '부모님과 함께 정한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '어른과 함께 정하면 비밀번호 관리까지 챙길 수 있어요.' }
    ]
  },
  {
    id: 'PRI-14', type: 'dilemma', topic: 'privacy',
    title: '공개된 초대 링크',
    situation: '누군가 반 단톡방 초대 링크를 공개 게시판에 올려서, 모르는 사람들이 계속 들어오고 있어요.',
    choices: [
      { text: '모르는 사람들에게 나가 달라고 말한다',
        effect: { trust: 1, judgment: 0, move: 0 },
        feedback: '용기 있지만, 링크가 그대로면 계속 들어올 수 있어요.' },
      { text: '선생님이나 방장에게 알려 링크를 바꾸자고 한다',
        effect: { trust: 2, judgment: 2, move: -1 },
        feedback: '문제의 원인을 해결하는 방법이에요. 시간이 조금 걸렸어요.' },
      { text: '나만 단톡방을 나간다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '나는 안전해졌지만 친구들은 여전히 위험해요.' }
    ]
  },

  /* ================= 온라인 예절·갈등 ================= */
  {
    id: 'ETI-07', type: 'dilemma', topic: 'etiquette',
    title: '답 없는 모둠 친구',
    situation: '모둠 과제 단톡방에서 한 친구가 며칠째 답이 없어요. 다른 친구들이 "걔 빼고 하자"고 해요.',
    choices: [
      { text: '그 친구에게 따로 무슨 일이 있는지 물어본다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '답이 없는 데는 이유가 있을 수 있어요. 먼저 마음을 살폈어요.' },
      { text: '과제는 진행하되 선생님께 상황을 말씀드린다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '일도 챙기고 도움도 요청했어요.' },
      { text: '다수 의견대로 빼고 한다',
        effect: { trust: -1, judgment: 0, move: 2 },
        feedback: '빨리 끝나지만, 빠진 친구는 따돌림을 느낄 수 있어요.' }
    ]
  },
  {
    id: 'ETI-08', type: 'dilemma', topic: 'etiquette',
    title: '못생겼다ㅋㅋ',
    situation: '{where}에서 {who:이/가} 내가 올린 그림에 "못생겼다ㅋㅋ"라는 댓글을 달았어요.',
    slots: { who: ['friend', 'stranger'], where: ['comment', 'game', 'chat'] },
    choices: [
      { text: '똑같이 비꼬는 댓글을 단다',
        effect: { trust: -2, judgment: -1, move: -1 },
        feedback: '똑같이 받아치면 싸움만 커지고 나도 상처를 주는 사람이 돼요.' },
      { text: '댓글을 숨기고 신경 쓰지 않는다',
        effect: { trust: 1, judgment: 1, move: 1 },
        by: {
          who: {
            friend: { effect: { trust: 0, judgment: 1, move: 0 }, feedback: '친한 친구라면 그냥 숨기기보다 속상한 마음을 이야기하는 게 관계에 도움이 돼요.' }
          }
        },
        feedback: '나쁜 말에 휘둘리지 않는 것도 힘이에요.' },
      { text: '"그런 말은 속상해"라고 차분하게 답한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        by: {
          who: {
            stranger: { effect: { trust: 0, judgment: 0, move: 0 }, feedback: '모르는 사람과는 대화가 길어질수록 더 상처받을 수 있어요. 숨기기나 신고가 나을 수 있어요.' }
          }
        },
        feedback: '내 마음을 차분하게 전하는 건 어른스러운 방법이에요.' }
    ]
  },
  {
    id: 'ETI-09', type: 'dilemma', topic: 'etiquette',
    title: 'ㅇㅇ 오해',
    situation: '친구의 긴 부탁 메시지에 "ㅇㅇ"라고만 답했더니, 친구가 "나한테 화났어?"라고 물어요.',
    choices: [
      { text: '"아니, 바빠서 그랬어. 미안!"이라고 풀어 준다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '글자만으로는 마음이 잘 전해지지 않아요. 오해를 바로 풀었어요.' },
      { text: '귀여운 이모티콘을 여러 개 보낸다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '분위기는 풀렸지만, 말로 설명하면 더 확실해요.' },
      { text: '"화 안 났는데 왜 그래?"라고 답한다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '친구는 더 서운할 수 있어요. 짧은 답이 차갑게 느껴질 수 있다는 걸 기억해요.' }
    ]
  },
  {
    id: 'ETI-10', type: 'dilemma', topic: 'etiquette', label: '온라인 갈등',
    title: '실수하는 초보',
    situation: '온라인 게임에서 같은 편 초보가 계속 실수를 해요. 이번 판은 꼭 이기고 싶어요.',
    choices: [
      { text: '실수한 부분을 친절하게 알려 준다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '누구나 처음은 있어요. 함께 성장하는 팀이 돼요.' },
      { text: '말없이 내가 더 열심히 한다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '탓하지 않은 건 좋아요.' },
      { text: '"초보는 나가라"고 채팅한다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '화면 너머 사람도 상처받아요. 게임은 모두가 즐거워야 해요.' }
    ]
  },
  {
    id: 'ETI-11', type: 'dilemma', topic: 'etiquette',
    title: '밤 11시 알림 폭탄',
    situation: '모둠 단톡방에 밤 11시가 넘도록 계속 메시지를 보내는 친구가 있어요. 다들 잠을 못 자요.',
    choices: [
      { text: '"밤 10시 이후에는 연락하지 말자"는 규칙을 제안한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '모두를 위한 약속을 만드는 건 좋은 해결 방법이에요.' },
      { text: '알림을 끄고 나만 잔다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '나는 쉬었지만 다른 친구들은 여전히 불편해요.' },
      { text: '"밤에 왜 이렇게 시끄럽게 굴어?"라고 쓴다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '맞는 말이어도 말투 때문에 다툼이 생길 수 있어요.' }
    ]
  },
  {
    id: 'ETI-12', type: 'dilemma', topic: 'etiquette',
    title: '몰래 녹음',
    situation: '친구와 다툰 일이 자꾸 반복돼요. 몰래 녹음해 두면 나중에 증거가 될 것 같아요.',
    choices: [
      { text: '몰래 녹음한다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '몰래 녹음한 걸 알게 되면 친구 사이의 믿음이 무너지고, 퍼뜨리면 큰 문제가 돼요.' },
      { text: '녹음 대신 선생님께 도움을 요청한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '반복되는 갈등은 어른의 도움을 받아 푸는 게 좋아요.' },
      { text: '있었던 일을 날짜와 함께 메모해 둔다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '기록은 나중에 도움을 요청할 때 쓸모 있어요.' }
    ]
  },
  {
    id: 'ETI-13', type: 'dilemma', topic: 'etiquette',
    title: '좋아요 눌러 줘!',
    situation: '친구가 자기 영상에 좋아요와 구독을 해 달라고 반 친구 모두에게 계속 부탁해요. 솔직히 영상은 별로 재미없어요.',
    choices: [
      { text: '친구니까 좋아요를 누른다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '친구를 응원했어요. 하지만 진짜 마음이 아닌 좋아요는 친구에게 도움이 되지 않을 수도 있어요.' },
      { text: '재미있는 부분과 아쉬운 부분을 솔직하게 말해 준다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '정성 어린 의견은 좋아요 100개보다 친구를 성장시켜요. 말투는 부드럽게!' },
      { text: '부탁 메시지를 무시한다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '친구는 서운할 수 있어요. 거절도 부드럽게 말할 수 있어요.' }
    ]
  },
  {
    id: 'ETI-14', type: 'dilemma', topic: 'etiquette',
    title: '회장 선거 놀림 영상',
    situation: '학급 회장 선거에서 친구가 상대 후보의 웃긴 사진으로 놀리는 영상을 만들자고 해요.',
    choices: [
      { text: '거절하고 우리 후보의 공약을 소개하는 영상을 만들자고 한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '상대를 깎아내리지 않고 우리 생각을 알리는 게 좋은 선거예요.' },
      { text: '사진은 빼고 재미있게만 만든다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '상대의 얼굴을 쓰지 않은 건 잘했어요. 놀리는 내용이 없는지도 확인해요.' },
      { text: '선거는 재미있어야 하니 만든다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '놀림 영상은 사이버 폭력이 될 수 있고, 선거를 망쳐요.' }
    ]
  },

  /* ================= 알고리즘·추천 ================= */
  {
    id: 'ALG-06', type: 'dilemma', topic: 'algorithm',
    title: '알 수도 있는 친구',
    situation: 'SNS가 "알 수도 있는 친구"로 옆 학교의 모르는 형을 추천해요. 친구가 12명이나 겹쳐요.',
    choices: [
      { text: '겹치는 친구가 많으니 친구 신청을 보낸다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '겹치는 친구가 많아도 나는 모르는 사람이에요.' },
      { text: '모르는 사람이니 추천을 숨긴다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '추천은 추천일 뿐, 친구는 내가 정해요.' },
      { text: '어떻게 추천됐는지 설정을 살펴본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '연락처와 위치로 추천이 만들어지기도 해요. 설정을 확인하는 건 좋은 습관이에요.' }
    ]
  },
  {
    id: 'ALG-07', type: 'dilemma', topic: 'algorithm',
    title: '따라다니는 선물 광고',
    situation: '동생 생일 선물을 검색했더니 모든 앱에 그 선물 광고가 따라다녀요. 동생이 내 휴대폰을 보면 들킬 것 같아요.',
    choices: [
      { text: '검색 기록을 지우고 맞춤 광고를 끈다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '내가 검색한 기록이 광고로 따라다닌다는 걸 알아채고 설정을 바꿨어요.' },
      { text: '동생이 못 보게 휴대폰을 잠가 둔다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '당장은 괜찮아요. 광고가 왜 따라오는지도 알아 두면 좋아요.' },
      { text: '어쩔 수 없다고 생각한다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '맞춤 광고는 설정으로 줄일 수 있어요.' }
    ]
  },
  {
    id: 'ALG-08', type: 'dilemma', topic: 'algorithm',
    title: '인기 급상승 1위',
    situation: '"인기 급상승" 1위 영상이 친구를 골탕 먹이는 장난 영상이에요. 반 친구들이 다 봤대요.',
    choices: [
      { text: '인기 있으니 나도 본다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '내가 본 조회수가 이런 영상을 더 인기 있게 만들어요.' },
      { text: '보지 않고 "관심 없음"을 누른다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '내 클릭 하나가 추천을 바꿔요.' },
      { text: '이런 영상이 왜 인기가 되는지 친구들과 이야기한다',
        effect: { trust: 2, judgment: 2, move: -1 },
        feedback: '알고리즘을 함께 생각해 본 멋진 대화예요. 이야기하느라 시간이 조금 걸렸어요.' }
    ]
  },
  {
    id: 'ALG-09', type: 'dilemma', topic: 'algorithm',
    title: '숙제하러 들어갔는데',
    situation: '숙제 자료를 찾으러 들어간 사이트에서 벌써 30분째 다른 글을 보고 있어요.',
    choices: [
      { text: '창을 닫고 필요한 검색어만 다시 적는다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '목적을 다시 떠올리는 게 무한 스크롤을 이기는 방법이에요.' },
      { text: '10분만 더 보고 숙제한다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '"10분만"이 지켜질지는 나에게 달렸어요.' },
      { text: '숙제를 내일로 미룬다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: '추천 글에 시간을 빼앗기고 할 일도 밀렸어요.' }
    ]
  },
  {
    id: 'ALG-10', type: 'dilemma', topic: 'algorithm',
    title: '위험한 챌린지',
    situation: '{who:이/가} {where}에서 요즘 유행하는 "높은 곳에서 뛰어내리기 챌린지"를 해 보자고 해요. 추천 영상에도 계속 나와요.',
    slots: { who: ['friend', 'sibling', 'youtuber'], where: ['chat', 'comment'] },
    choices: [
      { text: '위험하다고 말하고 따라 하지 않는다',
        effect: { trust: 2, judgment: 1, move: 0 },
        by: {
          who: {
            youtuber: { effect: { trust: 1, judgment: 1, move: 0 }, feedback: '유튜버에게 직접 말하긴 어려워요. 위험한 영상은 신고하는 방법도 있어요.' }
          }
        },
        feedback: '조회수보다 안전이 먼저예요.' },
      { text: '안전하게 바꾼 챌린지를 제안한다',
        effect: { trust: 1, judgment: 2, move: 1 },
        by: {
          who: {
            sibling: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '동생이 위험한 걸 따라 하지 않게 재미있는 대안을 준 멋진 선택이에요.' }
          }
        },
        feedback: '재미도 지키고 안전도 지키는 창의적인 방법이에요.' },
      { text: '조회수가 많으니 해 본다',
        effect: { trust: -2, judgment: -1, move: -2 },
        feedback: '추천에 많이 뜬다고 안전한 건 아니에요. 다칠 수 있어요.' }
    ]
  },
  {
    id: 'ALG-11', type: 'dilemma', topic: 'algorithm',
    title: '점점 시끄러워지는 추천 음악',
    situation: '공부할 때 틀어 둔 음악 앱이 점점 신나고 시끄러운 노래만 이어서 틀어 줘요.',
    choices: [
      { text: '공부용 재생 목록을 직접 만든다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '추천에 맡기지 않고 내가 고른 목록이 공부에 더 도움이 돼요.' },
      { text: '그냥 틀어 둔다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '자동 추천은 내 공부보다 "오래 듣기"에 맞춰져 있을 수 있어요.' },
      { text: '음악을 끄고 공부한다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '집중이 필요할 땐 끄는 것도 좋은 선택이에요.' }
    ]
  },
  {
    id: 'ALG-12', type: 'dilemma', topic: 'algorithm',
    title: '하루 알림 100개',
    situation: '앱 알림이 하루에 100개가 넘어요. 그래도 친구 메시지는 놓치고 싶지 않아요.',
    choices: [
      { text: '친구 메시지만 남기고 다른 알림은 끈다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '꼭 필요한 알림만 남기는 똑똑한 설정이에요.' },
      { text: '모든 알림을 끈다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '조용해졌지만 중요한 연락을 놓칠 수 있어요.' },
      { text: '그대로 둔다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '알림이 올 때마다 집중이 끊겨요.' }
    ]
  },
  {
    id: 'ALG-13', type: 'dilemma', topic: 'algorithm',
    title: '동생에게 뜬 추천 영상',
    situation: '가족이 함께 쓰는 태블릿에서, 내가 본 공포 영상 때문에 동생에게도 무서운 추천 영상이 떠요.',
    choices: [
      { text: '내 프로필을 따로 만든다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '사람마다 추천을 따로 받게 하는 근본적인 방법이에요.' },
      { text: '시청 기록을 지운다',
        effect: { trust: 1, judgment: 1, move: 1 },
        feedback: '당장은 해결돼요. 다음에 또 보면 다시 추천될 수 있어요.' },
      { text: '동생이 알아서 안 보겠지 하고 넘어간다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: '어린 동생에게 맞지 않는 영상이 계속 추천될 수 있어요.' }
    ]
  },

  /* ================= 광고 구별 ================= */
  {
    id: 'AD-06', type: 'dilemma', topic: 'ad',
    title: '확률 1% 뽑기',
    situation: '게임에서 확률 1% 전설 아이템 뽑기를 해요. 한 번에 1,000원이에요. 친구들은 다 가지고 있대요.',
    choices: [
      { text: '부모님 몰래 몇 번만 뽑는다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: '1%는 100번에 1번꼴이에요. 몰래 결제하면 믿음도 잃어요.' },
      { text: '확률표를 보고 얼마나 써야 할지 계산해 본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '확률을 따져 보면 뽑기가 얼마나 어려운지 알 수 있어요.' },
      { text: '부모님과 한 달에 쓸 금액을 정한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '약속한 만큼만 쓰는 건 좋은 습관이에요.' }
    ]
  },
  {
    id: 'AD-07', type: 'dilemma', topic: 'ad',
    title: '똑같은 말투의 리뷰',
    situation: '쇼핑몰에 "인생템이에요!"라는 비슷한 말투의 5점 리뷰가 수십 개 있어요.',
    choices: [
      { text: '리뷰가 많으니 산다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: '돈을 받고 쓰거나 AI로 만든 가짜 리뷰일 수 있어요.' },
      { text: '사진 리뷰와 낮은 점수 리뷰도 찾아 읽는다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '여러 리뷰를 고르게 보는 게 좋은 소비 습관이에요.' },
      { text: '리뷰는 다 광고라며 아무것도 안 믿는다',
        effect: { trust: 0, judgment: 0, move: 1 },
        feedback: '진짜 리뷰도 많아요. 가려 보는 눈이 필요해요.' }
    ]
  },
  {
    id: 'AD-08', type: 'dilemma', topic: 'ad',
    title: '같이 사면 반값',
    situation: '{who:이/가} {where}에 "나랑 같이 사면 반값!"이라며 공동 구매 링크를 올렸어요.',
    slots: { who: ['friend', 'stranger', 'youtuber'], where: ['chat', 'comment'] },
    choices: [
      { text: '반값이니 바로 결제한다',
        effect: { trust: -2, judgment: -1, move: 1 },
        by: {
          who: {
            friend: { effect: { trust: -1, judgment: 0, move: 1 }, feedback: '친구라도 결제 전에는 판매처와 보호자 허락을 확인해요.' }
          }
        },
        feedback: '확인 없이 결제하면 돈을 잃거나 사기를 당할 수 있어요.' },
      { text: '판매처가 믿을 만한지 부모님과 확인한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '돈이 드는 일은 어른과 함께 확인하는 게 안전해요.' },
      { text: '링크는 누르지 않고 넘어간다',
        effect: { trust: 1, judgment: 0, move: 1 },
        by: {
          who: {
            stranger: { effect: { trust: 1, judgment: 1, move: 1 }, feedback: '모르는 사람의 결제 링크는 누르지 않는 게 가장 안전해요.' }
          }
        },
        feedback: '조심한 건 좋아요.' }
    ]
  },
  {
    id: 'AD-09', type: 'dilemma', topic: 'ad',
    title: '광고 없애기 버튼',
    situation: '무료 게임 중간에 광고가 너무 많아요. "광고 없애기" 버튼을 누르면 결제 창이 떠요.',
    choices: [
      { text: '광고를 참으며 한다',
        effect: { trust: 0, judgment: 1, move: 1 },
        feedback: '무료 게임은 광고로 돈을 번다는 걸 알고 있네요.' },
      { text: '부모님께 여쭤보고 정한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '결제는 가족과 함께 정해요.' },
      { text: '결제 버튼을 누른다',
        effect: { trust: -2, judgment: -1, move: 2 },
        feedback: '광고가 귀찮아서 한 결제가 쌓이면 큰돈이 돼요.' }
    ]
  },
  {
    id: 'AD-10', type: 'dilemma', topic: 'ad',
    title: '[협찬] 인생 과자',
    situation: '먹방 유튜버가 새 과자를 먹으며 "인생 과자!"라고 해요. 제목에 [협찬]이라고 적혀 있어요.',
    choices: [
      { text: '협찬인 걸 알고 다른 후기도 찾아본다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '광고임을 알고 다른 의견과 비교했어요.' },
      { text: '좋아하는 유튜버니까 믿고 산다',
        effect: { trust: -1, judgment: 0, move: 1 },
        feedback: '협찬 영상은 좋은 점 위주로 말할 가능성이 커요.' },
      { text: '"협찬은 다 거짓말!"이라고 댓글을 단다',
        effect: { trust: -1, judgment: 0, move: 0 },
        feedback: '협찬을 밝힌 건 규칙을 지킨 거예요. 무조건 거짓말이라고 할 수는 없어요.' }
    ]
  },
  {
    id: 'AD-11', type: 'dilemma', topic: 'ad',
    title: '보상 받기 버튼인 줄',
    situation: '게임 화면에 "보상 받기" 버튼처럼 생긴 광고가 있어서 자꾸 잘못 눌러요.',
    choices: [
      { text: '버튼 모양을 잘 살피고 광고 표시를 찾는다',
        effect: { trust: 1, judgment: 2, move: 0 },
        feedback: '광고는 진짜 버튼처럼 보이게 만들어지기도 해요. 꼼꼼히 보는 눈이 필요해요.' },
      { text: '보상이 나올 때까지 계속 눌러 본다',
        effect: { trust: -1, judgment: -1, move: 1 },
        feedback: '광고만 계속 보게 되고 이상한 사이트로 갈 수도 있어요.' },
      { text: '부모님께 알리고 앱에 신고한다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '헷갈리게 만든 광고는 신고할 수 있어요.' }
    ]
  },
  {
    id: 'AD-12', type: 'dilemma', topic: 'ad',
    title: '학교 앞 QR 전단지',
    situation: '학교 앞에서 모르는 어른이 "QR 찍으면 게임 아이템 무료!" 전단지를 나눠 줘요.',
    choices: [
      { text: 'QR을 찍어 본다',
        effect: { trust: -2, judgment: -1, move: 1 },
        feedback: 'QR 코드는 어디로 연결될지 몰라요. 개인정보를 빼 가는 사이트일 수 있어요.' },
      { text: '선생님께 전단지를 보여 드린다',
        effect: { trust: 2, judgment: 1, move: 0 },
        feedback: '학교 앞에서 아이들을 노리는 광고는 어른에게 알리는 게 좋아요.' },
      { text: '받기만 하고 버린다',
        effect: { trust: 1, judgment: 0, move: 1 },
        feedback: '찍지 않은 건 잘했어요.' }
    ]
  }
]);
