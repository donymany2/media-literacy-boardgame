/*
 * 게임 설정 — 제목, 색, 로고, 모드는 이 파일 한 곳에서만 바꿉니다.
 * (엔진 코드와 카드팩은 건드리지 않아도 됩니다.)
 *
 * 링크 뒤에 붙이는 값으로도 일부 설정을 바꿀 수 있습니다.
 *   index.html?mode=short          압축 모드로 시작 화면 열기
 *   index.html?pack=media-literacy 카드팩 지정
 *   index.html?tokens=2            말 개수 지정
 */
window.GAME_CONFIG = {
  // 제목·로고
  title: '업다운 로드',
  subtitle: '올라갈까, 미끄러질까? 선택이 길을 바꾸는 디지털 보드게임',
  logo: 'assets/logo.svg',          // 이미지 경로. 비우면('') 로고를 표시하지 않음
  credit: 'created by 윤준철',       // 첫 화면 오른쪽 아래에 작게 표시. 비우면 숨김

  // 사용할 카드팩 (packs/ 아래 폴더 이름)
  pack: 'media-literacy',

  // 판 크기 모드. size는 칸 수 — 카드팩에 해당 칸 수 배치가 없으면 자동 생성됨
  modes: [
    { id: 'standard', label: '표준', size: 40 },
    { id: 'short',    label: '압축', size: 25 }
  ],
  defaultMode: 'standard',

  // 모둠 수 = 한 화면에서 번갈아 움직이는 말 개수 (1모둠, 2모둠 ... 으로 표시)
  // 시뮬레이션(tests/simulate.js) 기준 40칸: 말 1개 약 10분, 2개 약 21분, 3개 약 31분
  defaultTokens: 2,
  maxTokens: 8,

  // 판 배치: true면 게임마다 업로드·다운로드 위치와 칸별 카드 종류를 새로 배치(시작 화면에서 바꿀 수 있음)
  randomBoard: true,

  // 이 기기에 나온 카드 번호만 기억해 두고, 다음 판에는 안 나온 카드부터 뽑음 (개인정보 저장 없음)
  rememberCards: true,

  // 모든 말이 도착하면 끝('all') / 한 말이라도 도착하면 끝('first')
  endWhen: 'all',

  // 주사위 눈 개수 (6 = 보통 주사위, 4로 줄이면 칸을 더 촘촘히 밟아 카드가 더 자주 나옴)
  dieFaces: 6,

  // 딜레마 카드 토의 시간(초). 0이면 타이머 숨김. 시간이 지나도 강제로 넘어가지 않음
  discussionSeconds: 60,

  // 말 속도 — 시작 화면에서 고름. stepMs 한 칸 이동, upMs 업로드 오르기, downMs 다운로드 떨어지기, diceMs 주사위 굴리기 (1000 = 1초)
  speeds: {
    fast:   { label: '빠르게', stepMs: 450,  upMs: 2500, downMs: 2300, diceMs: 900 },
    normal: { label: '보통',   stepMs: 840,  upMs: 4500, downMs: 4200, diceMs: 1100 },
    slow:   { label: '느리게', stepMs: 1680, upMs: 9000, downMs: 8400, diceMs: 2200 }
  },
  defaultSpeed: 'slow',

  // 학급 함께하기(여러 태블릿 + 선생님 화면) 통신 설정
  // 공개 MQTT 중계 서버를 차례로 시도해 처음 연결되는 곳을 씀. 방 번호 첫 자리가 서버 번호
  net: {
    mqttLib: 'engine/vendor/mqtt.min.js',     // MQTT.js 5.10.1 (MIT)
    qrLib: 'engine/vendor/qrcode.min.js',     // QRCode.js 1.0.0 (MIT)
    connectTimeoutMs: 7000,
    brokers: [
      { url: 'wss://broker.emqx.io:8084/mqtt' },
      { url: 'wss://broker.hivemq.com:8884/mqtt' },
      { url: 'wss://public.cloud.shiftr.io', username: 'public', password: 'public' }
    ]
  },

  // 색 (1980년대 뱀주사위놀이판 느낌: 노란 바탕 + 굵은 남색 테두리)
  theme: {
    bg:        '#FFCF33',   // 바탕 노랑
    paper:     '#FFF7E0',   // 칸·카드 바탕
    ink:       '#1B1A2E',   // 테두리·글자
    accent:    '#FF4D3D',   // 강조(토마토)
    up:        '#16A35A',   // 업로드(지름길)
    down:      '#7A3CE0',   // 다운로드(미끄럼틀)
    event:     '#2F6BFF',   // 딜레마 칸
    quiz:      '#0E9F6E',   // 돌발 퀴즈 칸
    chance:    '#FF9F1C',   // 돌발 상황 칸
    teacher:   '#FF4D3D',   // 선생님 칸
    good:      '#16A35A',
    bad:       '#E03131',
    tokenColors: ['#FF4D3D', '#2F6BFF', '#16A35A', '#9B3FE0', '#FF9F1C', '#12B5CB', '#E64980', '#6B4F2A']
  },

  // 글꼴 (index.html에서 Google Fonts로 불러옴. 오프라인이면 기본 글꼴로 대체)
  fontFamily: "'Jua', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
  displayFont: "'Black Han Sans', 'Jua', 'Apple SD Gothic Neo', sans-serif",
  numberFont: "'Do Hyeon', 'Jua', sans-serif"
};
