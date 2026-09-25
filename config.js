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

  // 말 개수 (1 = 모둠 전체가 말 하나를 함께 움직임, 2 = 모둠을 두 짝으로 나눔)
  // 시뮬레이션(tests/simulate.js) 기준 40칸: 말 1개 약 10분, 2개 약 21분, 3개 약 31분
  defaultTokens: 2,
  maxTokens: 8,

  // 모든 말이 도착하면 끝('all') / 한 말이라도 도착하면 끝('first')
  endWhen: 'all',

  // 주사위 눈 개수 (6 = 보통 주사위, 4로 줄이면 칸을 더 촘촘히 밟아 카드가 더 자주 나옴)
  dieFaces: 6,

  // 딜레마 카드 토의 시간(초). 0이면 타이머 숨김. 시간이 지나도 강제로 넘어가지 않음
  discussionSeconds: 60,

  // 말이 한 칸 움직이는 시간(ms)
  stepMs: 230,

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
