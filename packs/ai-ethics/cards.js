/*
 * 카드팩: AI 디지털 윤리 — 카드 데이터 (1차분 v0.1)
 * 형식은 packs/media-literacy/cards.js 맨 위 주석과 같습니다.
 *
 *   dilemma  딜레마: choices[] 3개 중 모둠이 토의해서 하나를 고름 (정답 없음, 순서는 매번 섞임)
 *   quiz     돌발 퀴즈: options[] 중 정답(answer, 0부터 셈) → correct / wrong 효과
 *   chance   돌발 상황: 선택 없이 effect 바로 적용
 *   effect   trust 신뢰, judgment 판단력, move 이동(+전진, -뒤로)
 *
 * 수업안 1차시 「딜레마 카드 예시」 ①②③은 DF-01, HW-01, DF-02입니다.
 */
(function () {
  var OX = [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }];
  var RIGHT = { trust: 1, judgment: 1, move: 1 };
  var WRONG = { trust: 0, move: -1 };

  function ox(id, topic, title, situation, question, answerO, explanation) {
    return { id: id, type: 'quiz', topic: topic, shuffle: false, title: title, situation: situation,
      question: question, options: OX, answer: answerO ? 0 : 1, correct: RIGHT, wrong: WRONG, explanation: explanation };
  }
  function pick(id, topic, title, situation, question, options, answer, explanation) {
    return { id: id, type: 'quiz', topic: topic, title: title, situation: situation, question: question,
      options: options.map(function (t) { return { text: t }; }), answer: answer, correct: RIGHT, wrong: WRONG, explanation: explanation };
  }
  function chance(id, topic, title, situation, effect) {
    return { id: id, type: 'chance', topic: topic, title: title, situation: situation, effect: effect };
  }

  BG.registerPack('ai-ethics', 'cards', [

    /* ================= 딜레마 · 딥페이크·합성 ================= */
    {
      id: 'DF-01', type: 'dilemma', topic: 'deepfake',
      title: '친구 얼굴로 만든 합성 사진',
      situation: '{who:이/가} 생성형 AI로 다른 친구의 얼굴을 우스꽝스럽게 합성한 사진을 {where}에 올렸어요. 벌써 웃는 이모티콘이 여러 개 달렸어요.',
      slots: { who: ['friend', 'classmate', 'stranger'], where: ['chat', 'sns'] },
      choices: [
        { text: '재밌으니까 나도 다른 친구에게 공유한다',
          effect: { trust: -2, judgment: 0, move: 1 },
          feedback: '웃음거리가 된 친구는 전혀 재밌지 않을 수 있어요. 허락 없이 얼굴을 합성해 퍼뜨리면 초상권 침해가 될 수 있어요.' },
        { text: '당사자에게 먼저 괜찮은지 물어보고, 싫다면 지우자고 말한다',
          effect: { trust: 2, judgment: 1, move: 0 },
          by: {
            who: {
              stranger: { effect: { trust: 0, judgment: 1, move: 0 }, feedback: '마음은 좋아요. 하지만 처음 보는 사람과 직접 다투기보다 신고하고 어른의 도움을 받는 편이 안전해요.' }
            }
          },
          feedback: '기준은 사진 속 친구의 마음이에요. 다만 그사이 사진을 저장한 사람이 있을 수 있어요.' },
        { text: '댓글은 달지 않고 선생님께 조용히 알린다',
          effect: { trust: 1, judgment: 1, move: 1 },
          by: {
            who: {
              stranger: { effect: { trust: 2, judgment: 2, move: 1 }, feedback: '모르는 사람이 올린 합성 사진은 어른에게 알리고 신고하는 것이 가장 안전하고 빨라요.' }
            }
          },
          feedback: '어른의 도움을 빨리 받은 건 좋아요. 하지만 친구에게 "이건 아니야"라고 직접 말할 기회는 놓쳤어요.' }
      ]
    },
    {
      id: 'DF-02', type: 'dilemma', topic: 'deepfake',
      title: '진짜 같은 가짜 영상',
      situation: 'SNS에서 유명인이 이상한 말을 하는 영상을 봤어요. 그런데 입 모양이 목소리와 조금 어긋나 보여요. 댓글에는 "대박", "진짜임?"이 가득해요.',
      choices: [
        { text: '재밌어서 친구들에게 바로 보낸다',
          effect: { trust: -2, judgment: -1, move: 1 },
          feedback: '딥페이크라면 나도 모르게 거짓말을 퍼뜨린 셈이 돼요. 영상 속 사람은 하지도 않은 말 때문에 피해를 입어요.' },
        { text: '공식 계정이나 뉴스에 같은 내용이 있는지 확인한다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '출처와 진위를 확인하는 것이 가장 확실해요. 대신 확인하는 동안 영상은 계속 퍼지고 있어요.' },
        { text: '"딥페이크 같아요"라고 댓글을 달아 다른 사람에게 알린다',
          effect: { trust: 1, judgment: 1, move: 1 },
          feedback: '알리려는 마음은 좋아요. 하지만 확인 없이 단정하면 틀릴 수 있고, 댓글이 많을수록 영상이 더 널리 추천되기도 해요.' }
      ]
    },
    {
      id: 'DF-03', type: 'dilemma', topic: 'deepfake',
      title: '선생님 목소리 흉내',
      situation: '{who:이/가} AI 목소리 앱으로 담임 선생님 목소리를 흉내 내서 "내일 숙제 없음!"이라는 음성을 만들었어요. 진짜 같아서 깜짝 놀랐어요.',
      slots: { who: ['friend', 'classmate', 'sibling'] },
      choices: [
        { text: '웃기니까 반 단톡방에 올리자고 한다',
          effect: { trust: -2, judgment: 0, move: -1 },
          feedback: '친구들이 진짜로 믿고 숙제를 안 해 와서 큰 소동이 났어요. 선생님의 목소리를 허락 없이 쓴 것도 문제예요.' },
        { text: '목소리도 그 사람의 것이니 지우자고 말한다',
          effect: { trust: 2, judgment: 1, move: 0 },
          feedback: '목소리도 얼굴처럼 그 사람만의 것이에요. 친구가 잠깐 서운해할 수 있지만 옳은 말이에요.' },
        { text: '우리끼리만 듣고 밖으로는 보내지 않는다',
          effect: { trust: 0, judgment: 0, move: 1 },
          feedback: '퍼뜨리지 않은 건 다행이에요. 하지만 파일이 남아 있으면 언제든 누군가 보낼 수 있어요.' }
      ]
    },

    /* ================= 딜레마 · AI 정보 판단 ================= */
    {
      id: 'TR-01', type: 'dilemma', topic: 'truth',
      title: '자신만만한 AI의 대답',
      situation: '우리 지역 역사를 조사하는데, AI 챗봇이 "이 마을에는 조선 시대 왕이 태어난 궁궐이 있습니다"라고 자신 있게 답했어요. 처음 듣는 이야기예요.',
      choices: [
        { text: 'AI가 알려 준 대로 보고서에 쓴다',
          effect: { trust: -1, judgment: -1, move: 1 },
          feedback: 'AI는 모르는 것도 그럴듯하게 지어낼 때가 있어요. 이것을 "환각(할루시네이션)"이라고 해요.' },
        { text: '군청 누리집이나 백과사전에서 확인한다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '믿을 만한 곳에서 다시 확인하는 것이 가장 확실해요. 시간은 조금 더 걸려요.' },
        { text: 'AI에게 "정말이야? 출처 알려 줘"라고 다시 묻는다',
          style: 'check',
          effect: { trust: 1, judgment: 1, move: 1 },
          feedback: '좋은 질문이에요. 하지만 AI는 없는 출처도 만들어 낼 수 있어서, 출처를 직접 열어 봐야 해요.' }
      ]
    },
    {
      id: 'TR-02', type: 'dilemma', topic: 'truth',
      title: '공원에 나타난 곰?',
      situation: '"우리 동네 공원에 거대한 곰 등장!"이라는 사진이 {where}에 돌아요. 자세히 보니 곰 발가락이 여섯 개이고, 뒤쪽 간판 글씨가 뭉개져 있어요.',
      slots: { where: ['chat', 'sns', 'game'] },
      choices: [
        { text: '찾은 단서를 적어 "AI가 만든 사진 같아"라고 알린다',
          effect: { trust: 2, judgment: 1, move: 0 },
          feedback: '근거를 들어 알리면 잘못된 정보를 멈출 수 있어요. 다만 사진을 올린 친구가 무안해할 수 있으니 말투를 부드럽게 해요.' },
        { text: '혹시 모르니 가족에게 공원에 가지 말라고 전한다',
          effect: { trust: 0, judgment: 0, move: 1 },
          feedback: '가족을 걱정하는 마음은 좋아요. 하지만 확인하지 않은 정보를 한 번 더 전한 셈이에요.' },
        { text: '뉴스나 구청 안내에 같은 소식이 있는지 찾아본다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '공식 소식을 확인하는 좋은 습관이에요. 정말 곰이 나왔다면 구청이 먼저 알렸을 거예요.' }
      ]
    },
    {
      id: 'TR-03', type: 'dilemma', topic: 'truth',
      title: '세 줄 요약의 유혹',
      situation: '과학책 한 단원을 읽어 와야 하는데, AI가 세 줄로 요약해 줬어요. 요약만 읽으면 놀 시간이 30분 생겨요.',
      choices: [
        { text: '요약만 읽고 논다',
          effect: { trust: 0, judgment: -1, move: 2 },
          feedback: '빨라요. 하지만 요약에는 빠진 내용이나 틀린 내용이 있을 수 있고, 생각하는 힘도 덜 자라요.' },
        { text: '요약을 먼저 읽고, 책을 훑으며 빠진 내용을 찾는다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: 'AI를 "지도"처럼 쓰고 직접 길을 걸어 본 셈이에요. AI를 똑똑하게 쓰는 방법이에요.' },
        { text: '요약은 보지 않고 책만 꼼꼼히 읽는다',
          style: 'check',
          effect: { trust: 1, judgment: 1, move: 0 },
          feedback: '스스로 읽는 힘은 훌륭해요. AI를 확인용으로 잘 활용하는 방법도 함께 익혀 보면 좋아요.' }
      ]
    },

    /* ================= 딜레마 · 저작권·창작 ================= */
    {
      id: 'CR-01', type: 'dilemma', topic: 'creation',
      title: '그림 대회에 AI 그림?',
      situation: '학교 그림 대회에 AI로 만든 그림을 내 보자고 친구가 말해요. 대회 안내문에는 AI에 대한 말이 없어요.',
      choices: [
        { text: '규칙에 없으니 AI 그림을 그대로 낸다',
          effect: { trust: -1, judgment: 0, move: 2 },
          feedback: '규칙에 없다고 괜찮은 건 아니에요. 직접 그린 친구들과 공정하지 않을 수 있어요.' },
        { text: '선생님께 AI 그림을 내도 되는지 먼저 여쭤본다',
          effect: { trust: 2, judgment: 1, move: 0 },
          feedback: '애매할 때 먼저 묻는 것은 좋은 판단이에요. 이 질문 덕분에 대회 규칙이 더 분명해질 수 있어요.' },
        { text: 'AI 그림은 아이디어로만 보고, 직접 그린다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: 'AI를 영감의 도구로 쓴 좋은 방법이에요. 대신 시간이 훨씬 오래 걸려요.' }
      ]
    },
    {
      id: 'CR-02', type: 'dilemma', topic: 'creation',
      title: '좋아하는 작가 그림체',
      situation: '좋아하는 웹툰 작가의 그림체를 흉내 내 AI 그림을 만들어 주는 앱이 있어요. 만든 그림을 내 SNS 프로필 사진으로 쓰고 싶어요.',
      choices: [
        { text: '예쁘니까 그대로 프로필로 쓴다',
          effect: { trust: -1, judgment: 0, move: 1 },
          feedback: '작가가 오랫동안 만든 그림체를 허락 없이 따라 한 그림이에요. 작가의 노력이 존중받지 못할 수 있어요.' },
        { text: '작가가 이런 사용을 허락했는지 찾아보고 쓴다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '창작자의 권리를 먼저 생각한 좋은 판단이에요. 허락하지 않았다면 쓰지 않는 게 맞아요.' },
        { text: '내가 직접 그린 그림을 AI로 꾸며서 쓴다',
          effect: { trust: 1, judgment: 1, move: 1 },
          feedback: '내 창작물에 AI를 더한 방법이라 떳떳해요. 다만 AI가 다른 작가 그림체를 섞었을 수 있다는 점은 기억해요.' }
      ]
    },
    {
      id: 'CR-03', type: 'dilemma', topic: 'creation',
      title: '어디서 들어 본 AI 노래',
      situation: '{who:이/가} AI로 만든 노래를 들려줬는데, 유명 가수의 노래와 멜로디가 거의 같아요. 학예회 공연에 쓰자고 해요.',
      slots: { who: ['friend', 'classmate', 'sibling'] },
      choices: [
        { text: '멋지니까 그대로 공연에 쓴다',
          effect: { trust: -2, judgment: 0, move: -1 },
          feedback: '리허설에서 원곡과 똑같다는 말이 나와 공연 곡을 급히 바꿨어요. AI가 만들었어도 원곡과 거의 같다면 저작권을 침해할 수 있어요.' },
        { text: '비슷한 부분을 바꾸고, AI로 만들었다고 밝힌다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '고쳐 쓰고 솔직하게 밝혔어요. 얼마나 바꿔야 충분한지는 선생님과 함께 확인해 보면 더 좋아요.' },
        { text: '원곡을 쓸 수 있는 방법을 선생님과 찾아본다',
          effect: { trust: 2, judgment: 1, move: -1 },
          feedback: '저작권을 지키는 가장 확실한 길이에요. 대신 준비 시간이 길어졌어요.' }
      ]
    },

    /* ================= 딜레마 · AI와 과제 ================= */
    {
      id: 'HW-01', type: 'dilemma', topic: 'homework',
      title: 'AI가 써 준 것 같은 완벽한 글',
      situation: '모둠 발표문을 {who:이/가} 생성형 AI로 통째로 써 와서 이대로 내자고 해요. 글이 정말 매끄러워요.',
      slots: { who: ['friend', 'classmate'] },
      choices: [
        { text: '편하니까 그대로 제출한다',
          effect: { trust: -2, judgment: -1, move: 2 },
          feedback: '빠르지만 우리 생각이 하나도 없어요. 발표 때 질문을 받으면 대답하기 어려울 거예요.' },
        { text: '참고만 하고 우리 생각을 더해 다시 쓴다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: 'AI의 도움과 우리 생각을 합친 방법이에요. 시간이 더 걸리지만 진짜 "우리 과제"가 돼요.' },
        { text: 'AI를 썼다고 밝히고 그대로 낸다',
          effect: { trust: 1, judgment: 0, move: 1 },
          feedback: '정직하게 밝힌 건 좋아요. 하지만 우리 생각이 들어가지 않아 "우리 과제"라고 하기는 어려워요.' }
      ]
    },
    {
      id: 'HW-02', type: 'dilemma', topic: 'homework',
      title: '반만 읽은 책',
      situation: '내일까지 독서 감상문을 내야 하는데, 책을 반밖에 못 읽었어요. AI에게 줄거리를 물어보면 금방 쓸 수 있어요.',
      choices: [
        { text: 'AI가 알려 준 줄거리로 감상문을 쓴다',
          effect: { trust: -1, judgment: 0, move: 1 },
          feedback: '감상문은 내가 느낀 것을 쓰는 글이에요. 읽지 않은 부분의 감상은 내 것이 아니에요.' },
        { text: '선생님께 사정을 말하고 하루만 더 시간을 부탁한다',
          effect: { trust: 2, judgment: 1, move: -1 },
          feedback: '솔직하게 말하는 용기가 믿음을 쌓아요. 대신 하루 늦어졌어요.' },
        { text: '읽은 데까지만 솔직하게 감상을 쓴다',
          effect: { trust: 1, judgment: 1, move: 0 },
          feedback: '부족해도 내 생각이 담긴 글이에요. 남은 부분은 다 읽고 덧붙여 보면 좋아요.' }
      ]
    },
    {
      id: 'HW-03', type: 'dilemma', topic: 'homework',
      title: '사진만 찍으면 풀이가 척척',
      situation: '문제 사진만 찍으면 답과 풀이를 보여 주는 AI 앱이 있어요. 내일은 수학 단원평가 날이에요.',
      choices: [
        { text: '숙제 답을 모두 앱으로 채운다',
          effect: { trust: -1, judgment: -1, move: 2 },
          feedback: '숙제는 금방 끝나요. 하지만 내일 시험장에는 앱을 가져갈 수 없어요.' },
        { text: '먼저 풀어 보고, 막힌 문제만 풀이를 본다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: 'AI를 "선생님 대신"이 아니라 "힌트"로 쓴 좋은 방법이에요.' },
        { text: '앱을 쓰지 않고 혼자 끝까지 푼다',
          style: 'check',
          effect: { trust: 1, judgment: 1, move: -1 },
          feedback: '끈기는 훌륭해요. 하지만 너무 오래 막혀 있을 때는 도움을 받는 것도 배움이에요.' }
      ]
    },

    /* ================= 딜레마 · 사생활·개인정보 ================= */
    {
      id: 'PR-01', type: 'dilemma', topic: 'privacy',
      title: 'AI 챗봇에게 고민 상담',
      situation: '요즘 친구 관계로 고민이 많아요. AI 챗봇에게 이야기하면 들어 줄 것 같은데, 친구 이름과 학교 이름까지 말해야 할지 고민돼요.',
      choices: [
        { text: '이름과 학교까지 자세히 적는다',
          effect: { trust: -2, judgment: 0, move: 1 },
          feedback: '챗봇에 적은 내용은 회사 서버에 저장될 수 있어요. 친구의 개인정보까지 함께 알려진 셈이에요.' },
        { text: '이름은 빼고 상황만 적어 조언을 받는다',
          effect: { trust: 1, judgment: 2, move: 1 },
          feedback: '개인정보를 지키면서 도움을 받은 좋은 방법이에요. 다만 AI의 조언이 늘 맞는 것은 아니에요.' },
        { text: '챗봇 대신 부모님이나 상담 선생님께 이야기한다',
          effect: { trust: 2, judgment: 1, move: 0 },
          feedback: '나를 잘 아는 사람이 더 따뜻하고 정확하게 도와줄 수 있어요. 말을 꺼내기까지 용기가 필요했을 거예요.' }
      ]
    },
    {
      id: 'PR-02', type: 'dilemma', topic: 'privacy',
      title: '무료 AI 프로필 앱',
      situation: '"셀카 10장을 올리면 멋진 AI 프로필을 만들어 드려요!"라는 무료 앱이 인기예요. {who:이/가} 같이 해 보자고 해요.',
      slots: { who: ['friend', 'classmate', 'stranger'] },
      choices: [
        { text: '바로 셀카를 올려 본다',
          effect: { trust: -2, judgment: 0, move: 1 },
          by: {
            who: {
              stranger: { effect: { trust: -2, judgment: -1, move: -1 }, feedback: '처음 보는 사람이 권하는 앱에 얼굴 사진을 올리는 건 특히 위험해요. 사진이 어디에 쓰일지 알 수 없어요.' }
            }
          },
          feedback: '내 얼굴 사진이 어디에 저장되고 어디에 쓰일지 모른 채 올렸어요. 무료 앱은 사진이 대가일 수도 있어요.' },
        { text: '사진을 어디에 쓰는지 약관을 부모님과 함께 확인한다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '어른과 함께 약관을 확인하는 건 아주 좋은 습관이에요. 시간은 조금 걸려요.' },
        { text: '내 사진 대신 캐릭터 그림으로 만들어 본다',
          style: 'check',
          effect: { trust: 1, judgment: 1, move: 1 },
          feedback: '얼굴을 지키면서 즐긴 방법이에요. 앱이 다른 정보를 모으는지도 함께 살펴보면 더 좋아요.' }
      ]
    },
    {
      id: 'PR-03', type: 'dilemma', topic: 'privacy',
      title: '반 단체 사진 AI 편집',
      situation: '반 단체 사진의 배경을 AI로 우주로 바꿨더니 정말 멋져요. SNS에 올리고 싶은데, 친구들 얼굴과 학교 이름표가 다 보여요.',
      choices: [
        { text: '멋지게 편집했으니 바로 올린다',
          effect: { trust: -1, judgment: 0, move: 1 },
          feedback: '친구들의 얼굴과 학교가 허락 없이 공개됐어요. 누군가는 올라가는 걸 원하지 않았을 수 있어요.' },
        { text: '친구들에게 올려도 되는지 묻고, 이름표는 가린다',
          effect: { trust: 2, judgment: 1, move: 0 },
          feedback: '모두의 동의를 구하고 개인정보를 가린 가장 안전한 방법이에요. 한 명이라도 싫다면 올리지 않아요.' },
        { text: '내가 나온 부분만 잘라서 올린다',
          effect: { trust: 1, judgment: 1, move: 1 },
          feedback: '친구들은 지켰어요. 하지만 내 얼굴과 학교 정보도 소중한 개인정보라는 점을 기억해요.' }
      ]
    },

    /* ================= 딜레마 · 편향·공정 ================= */
    {
      id: 'FA-01', type: 'dilemma', topic: 'fairness',
      title: 'AI가 짠 모둠',
      situation: 'AI 프로그램으로 모둠을 짰더니, 우리 모둠에는 발표를 잘하는 친구만 모였고 다른 모둠에는 조용한 친구만 모였어요.',
      choices: [
        { text: '우리 모둠에 유리하니 그냥 둔다',
          effect: { trust: -1, judgment: 0, move: 1 },
          feedback: '우리에겐 좋지만 다른 모둠에게는 불공정해요. AI 결과도 한쪽으로 치우칠 수 있어요.' },
        { text: '결과가 한쪽으로 치우친 것 같다고 선생님께 말씀드린다',
          effect: { trust: 2, judgment: 1, move: 0 },
          feedback: 'AI의 결과를 그대로 받아들이지 않고 공정한지 따져 본 좋은 판단이에요.' },
        { text: '다른 모둠과 역할을 나눠 서로 돕자고 제안한다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '문제를 우리 힘으로 풀려는 멋진 생각이에요. 다만 모둠 구성 자체의 문제는 그대로 남아요.' }
      ]
    },
    {
      id: 'FA-02', type: 'dilemma', topic: 'fairness',
      title: '과학자는 모두 남자?',
      situation: 'AI에게 "과학자 그림"을 그려 달라고 했더니, 흰 가운을 입은 남자 어른 그림만 나와요. 우리 모둠 발표 자료에 쓸 거예요.',
      choices: [
        { text: '그림이 멋지니 그대로 쓴다',
          effect: { trust: -1, judgment: 0, move: 1 },
          feedback: '"과학자는 남자 어른"이라는 편견을 발표로 한 번 더 퍼뜨릴 수 있어요.' },
        { text: '"여러 성별과 나이의 과학자"라고 다시 요청한다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '질문을 바꾸면 AI의 결과도 바뀌어요. AI를 쓰는 사람의 판단이 중요해요.' },
        { text: 'AI 그림이 한쪽으로 치우친 점도 발표에서 함께 소개한다',
          effect: { trust: 2, judgment: 1, move: -1 },
          feedback: '편향을 발견하고 알린 멋진 발표예요. 대신 발표 준비가 길어졌어요.' }
      ]
    },
    {
      id: 'FA-03', type: 'dilemma', topic: 'fairness',
      title: '한쪽만 보여 주는 추천',
      situation: 'AI 추천 때문에 한쪽 의견만 담은 영상이 계속 떠요. 자꾸 보다 보니 이제 그 생각이 당연하게 느껴져요.',
      choices: [
        { text: '재밌으니까 추천 영상을 계속 본다',
          effect: { trust: 0, judgment: -1, move: 1 },
          feedback: '추천은 내가 좋아할 만한 것을 보여 줄 뿐, 공정하게 골라 주지는 않아요.' },
        { text: '반대 의견을 담은 자료를 일부러 찾아본다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '여러 관점을 스스로 찾는 힘이에요. 생각의 균형을 잡는 좋은 습관이에요.' },
        { text: '시청 기록을 지우고 추천을 새로 시작한다',
          style: 'check',
          effect: { trust: 1, judgment: 1, move: 1 },
          feedback: '추천의 틀을 깨는 방법이에요. 하지만 금세 비슷한 추천이 다시 쌓일 수 있어요.' }
      ]
    },

    /* ================= 딜레마 · 책임·공존 ================= */
    {
      id: 'TO-01', type: 'dilemma', topic: 'together',
      title: 'AI한테는 막말해도 될까?',
      situation: '{who:이/가} AI 스피커에게 일부러 나쁜 말을 시키며 웃고 있어요. "AI는 기분이 없으니까 괜찮아"라고 해요.',
      slots: { who: ['friend', 'classmate', 'sibling'] },
      choices: [
        { text: '같이 웃으며 따라 한다',
          effect: { trust: -1, judgment: 0, move: 1 },
          feedback: 'AI에게 쓰는 말버릇은 사람에게도 나오기 쉬워요. 옆에서 듣는 사람도 불편할 수 있어요.' },
        { text: '"말버릇이 사람한테도 나올 수 있어"라고 말한다',
          effect: { trust: 1, judgment: 2, move: 0 },
          by: {
            who: {
              sibling: { effect: { trust: 2, judgment: 2, move: 0 }, feedback: '동생은 형, 언니, 누나, 오빠의 말을 보고 배워요. 부드럽게 알려 준 멋진 선택이에요.' }
            }
          },
          feedback: 'AI를 대하는 태도가 곧 나의 태도라는 걸 짚었어요. 친구가 잔소리로 느끼지 않게 말투를 부드럽게 해요.' },
        { text: '괜히 다투기 싫어서 자리를 피한다',
          effect: { trust: 0, judgment: 1, move: 1 },
          feedback: '함께하지 않은 건 좋아요. 하지만 친구가 스스로 깨달을 기회는 생기지 않았어요.' }
      ]
    },
    {
      id: 'TO-02', type: 'dilemma', topic: 'together',
      title: 'AI 친구가 더 편해',
      situation: '밤마다 AI 캐릭터와 대화하는 게 재밌어요. 요즘은 친구들과 노는 시간보다 AI와 이야기하는 시간이 더 길어요.',
      choices: [
        { text: 'AI가 더 편하니 지금처럼 지낸다',
          effect: { trust: -1, judgment: 0, move: 1 },
          feedback: 'AI는 늘 내 편처럼 말해 주지만, 서로 다른 생각을 맞춰 가는 우정은 사람과 함께해야 배울 수 있어요.' },
        { text: 'AI와 이야기하는 시간을 정해 두고 친구와도 논다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: 'AI와 사람 사이의 균형을 스스로 정한 좋은 판단이에요.' },
        { text: 'AI 앱을 아예 지운다',
          effect: { trust: 1, judgment: 1, move: -1 },
          feedback: '과감한 결정이에요. 다만 무조건 끊기보다 잘 쓰는 방법을 익히는 것도 중요해요.' }
      ]
    },
    {
      id: 'TO-03', type: 'dilemma', topic: 'together',
      title: '다 AI 탓이야!',
      situation: 'AI가 알려 준 틀린 정보 때문에 모둠 발표를 망쳤어요. 친구가 "AI가 틀린 거니까 우리 잘못 아니야"라고 해요.',
      choices: [
        { text: '맞아, AI가 틀렸으니 우리 잘못은 없다',
          effect: { trust: -1, judgment: -1, move: -1 },
          feedback: 'AI는 도구예요. 도구의 결과를 확인하고 쓰는 책임은 쓰는 사람에게 있어요.' },
        { text: '확인하지 않은 우리 책임도 있다고 인정하고 고친다',
          effect: { trust: 2, judgment: 1, move: 0 },
          feedback: '실수를 인정하는 건 쉽지 않아요. 그래서 더 믿음이 가는 모둠이에요.' },
        { text: '"AI 답은 두 곳 이상에서 확인하기" 규칙을 만들자고 한다',
          effect: { trust: 1, judgment: 2, move: 0 },
          feedback: '같은 실수를 막을 방법을 찾았어요. 이런 규칙이 바로 "우리 반 AI 수칙"의 씨앗이에요.' }
      ]
    },

    /* ================= 돌발 퀴즈 ================= */
    ox('Q-01', 'deepfake', '목소리도 흉내', '딥페이크에 대해 배우고 있어요.',
      '딥페이크는 얼굴뿐 아니라 목소리도 흉내 낼 수 있다.', true,
      'AI는 몇 초 분량의 목소리만으로도 비슷한 목소리를 만들 수 있어요. 목소리도 소중한 개인정보예요.'),
    pick('Q-02', 'deepfake', 'AI 사진 찾기', 'AI가 만든 사진인지 살펴보고 있어요.',
      '다음 중 AI가 만든 사진을 알아보는 단서가 아닌 것은?',
      ['손가락 개수가 이상하다', '배경 글씨가 뭉개져 있다', '사진 파일 이름이 길다'], 2,
      '손, 글씨, 귀걸이 같은 작은 부분이 어색하면 AI가 만든 사진일 수 있어요. 파일 이름으로는 알 수 없어요.'),
    ox('Q-03', 'truth', 'AI의 환각', 'AI 챗봇에게 질문하고 있어요.',
      'AI 챗봇은 모르는 것도 아는 것처럼 그럴듯하게 대답할 때가 있다.', true,
      '이것을 "환각(할루시네이션)"이라고 해요. 그래서 AI의 답은 꼭 확인해야 해요.'),
    pick('Q-04', 'truth', 'AI 답 확인하기', 'AI가 알려 준 내용이 맞는지 궁금해요.',
      'AI의 답을 확인하는 방법으로 가장 알맞은 것은?',
      ['같은 질문을 AI에게 여러 번 한다', '믿을 만한 다른 자료와 비교한다', '답이 길고 자세하면 믿는다'], 1,
      '백과사전, 공공기관 누리집, 책처럼 믿을 만한 다른 자료와 비교해야 해요.'),
    ox('Q-05', 'creation', '인터넷 그림', '발표 자료에 넣을 그림을 찾고 있어요.',
      '인터넷에 공개된 그림은 누구나 마음대로 가져다 써도 된다.', false,
      '공개된 그림에도 저작권이 있어요. 쓸 수 있는 조건(허락 표시)을 확인해야 해요.'),
    pick('Q-06', 'creation', 'AI 그림 쓰기', 'AI로 만든 그림을 발표 자료에 넣었어요.',
      '가장 바른 태도는?',
      ['내가 그렸다고 말한다', 'AI로 만들었다고 밝힌다', '아무 말도 하지 않는다'], 1,
      'AI를 썼다고 밝히면 보는 사람이 오해하지 않아요. 정직한 창작의 첫걸음이에요.'),
    ox('Q-07', 'homework', 'AI 사용 밝히기', 'AI의 도움을 받아 과제를 했어요.',
      '과제에 AI를 썼다면, 어디에 어떻게 썼는지 밝히는 것이 좋다.', true,
      '어디에 AI를 썼는지 밝히면, 내 생각이 어디에 들어갔는지도 분명해져요.'),
    pick('Q-08', 'privacy', '챗봇에게 말해도 될까', 'AI 챗봇과 대화하고 있어요.',
      'AI 챗봇에게 알려 줘도 괜찮은 것은?',
      ['우리 집 주소', '좋아하는 동물', '비밀번호'], 1,
      '주소, 전화번호, 비밀번호, 학교와 반처럼 나를 알아볼 수 있는 정보는 알려 주지 않아요.'),
    ox('Q-09', 'privacy', '얼굴 사진', 'SNS에 얼굴 사진을 올리려고 해요.',
      '인터넷에 올린 얼굴 사진이 딥페이크 합성에 쓰일 수도 있다.', true,
      '공개된 사진은 누구나 저장할 수 있어요. 얼굴이 잘 보이는 사진은 올리기 전에 한 번 더 생각해요.'),
    ox('Q-10', 'fairness', 'AI도 편견을 배울까', 'AI가 공부하는 방법을 배우고 있어요.',
      'AI는 사람이 만든 자료로 배우기 때문에, 자료에 담긴 편견까지 배울 수 있다.', true,
      'AI는 배운 자료를 닮아요. 그래서 AI의 결과가 공정한지 사람이 살펴봐야 해요.'),
    pick('Q-11', 'together', '누구의 책임일까', 'AI가 알려 준 정보가 틀렸어요.',
      '가장 바른 태도는?',
      ['AI 탓만 한다', '확인하지 않은 내 책임도 돌아본다', '다시는 기계를 쓰지 않는다'], 1,
      'AI는 도구이고, 결과를 확인해서 쓰는 것은 사람의 몫이에요.'),

    /* ================= 돌발 상황 ================= */
    chance('C-01', 'deepfake', '빠른 신고', '친구 얼굴이 합성된 영상을 바로 신고했더니 금방 지워졌어요. 친구가 고맙다고 해요!',
      { trust: 1, move: 2 }),
    chance('C-02', 'truth', '틀린 곳 발견', 'AI의 답을 백과사전과 비교하다가 틀린 곳을 찾아냈어요!',
      { judgment: 1, move: 1 }),
    chance('C-03', 'privacy', '앗, 위치 정보', 'AI 사진 앱에 올린 사진에 집 위치 정보가 남아 있었어요. 급히 지우느라 뒤로!',
      { move: -2 }),
    chance('C-04', 'homework', '함께 고쳐 쓰기', '모둠 친구가 AI 글을 그대로 붙여 넣은 걸 발견해 함께 다시 썼어요. 시간은 걸렸지만 더 좋은 글이 됐어요.',
      { judgment: 1, move: -1 }),
    chance('C-05', 'creation', '출처 표시 칭찬', '발표 자료에 AI 사용과 출처를 꼼꼼히 적어서 칭찬을 받았어요!',
      { trust: 1, move: 1 }),
    chance('C-06', 'together', '와이파이가 끊겼다!', '인터넷이 끊겨 AI 없이 모둠끼리 머리를 맞댔어요. 오히려 좋은 생각이 나왔어요!',
      { judgment: 1 }),
    chance('C-07', 'fairness', '번역기의 실수', '외국 친구에게 보낸 AI 번역 메시지가 이상하게 바뀌어 오해가 생겼어요. 다시 설명하느라 한 칸 뒤로!',
      { move: -1 })
  ]);
})();
