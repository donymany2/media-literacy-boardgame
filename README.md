# 디지털 뱀주사위놀이 (가제)

초등 5~6학년 디지털 미디어 리터러시 수업용 보드게임입니다.
전통 뱀사다리놀이에 딜레마·퀴즈·기회/위기 카드를 더해, 모둠이 토의해서 고른 선택에 따라 앞으로 가거나 미끄러집니다.

- 로그인 없음, 서버 없음, 저장 없음 — 링크만 열면 바로 시작
- 모둠당 기기 1대(태블릿 가로 / 휴대폰 세로)
- 표준 40칸(약 25분) / 압축 25칸(약 15분)
- 엔진과 카드팩을 분리해, 카드팩만 바꾸면 환경·인권·민주시민교육 등 다른 주제로 재사용

## 실행

- 가장 간단한 방법: `index.html`을 브라우저로 열기 (서버 없이도 동작)
- 수업용 링크: GitHub Pages 등 정적 호스팅에 폴더째 올리기
- 링크 옵션: `index.html?mode=short` (압축 모드), `?tokens=1` (말 개수), `?pack=폴더이름` (카드팩)

## 폴더 구조

```
index.html              진입 화면 (스크립트 순서: 설정 → 엔진 → 카드팩)
config.js               제목·색·로고·모드·말 개수 등 설정 (한 곳에서 변경)
assets/logo.svg         임시 로고

engine/                 게임 엔진 — 주제와 무관, 카드팩을 바꿔도 그대로
  core.js               카드팩 등록, 난수, 카드 더미, 판 만들기/자동 배치, 카드팩 검사
  game.js               규칙: 이동, 칸 판정, 카드 결과·점수 계산, 되돌아보기, 차례, 결과 요약 (DOM 없음)
  ui.js                 화면: 시작, 판 그리기, 주사위, 카드 창, 결과
  loader.js             설정과 링크 값을 읽어 카드팩 파일을 불러오고 시작
  style.css             디자인 (색은 config.js theme 값을 사용)

packs/                  카드팩 — 주제별 데이터만
  media-literacy/
    pack.js             주제 목록, 칸 그림, 점수 이름, 되돌아보기·선생님 칸 문구, 결과 칭호
    cards.js            카드 문구·선택지·결과
    board.js            칸 배치 (40칸, 25칸)
  template/             새 카드팩을 만들 때 복사할 틀

tests/simulate.js       엔진 점검 + 진행 시간 추정 (node tests/simulate.js)
```

## 게임 규칙 (엔진 기준)

| 요소 | 동작 |
|---|---|
| 주사위 | 1~6 (config.js `dieFaces`로 변경) |
| 사건 칸 (30~35%) | 딜레마 / 퀴즈 / 기회·위기 카드. 선택 결과로 신뢰·판단력 점수와 이동이 바뀜 |
| 지름길 / 미끄럼틀 | 고정 위치, 점수 변화 없는 순수한 운 요소 |
| 되돌아보기 | 카드 선택 때문에 미끄러지면 다음 차례 시작에 등장. 이유를 설명하면 신뢰 +1, 통과해도 벌점 없음 |
| 선생님께 질문하기 | 선생님이 질문하고 평가 버튼(아주 잘했어요 / 좋아요 / 다음에 다시)을 누름 |
| 점수 | 신뢰(주 점수), 판단력(보조 점수). 0 아래로 내려가지 않음 (탈락 없음) |
| 끝 | 모든 말이 도착하면 끝(`endWhen: 'all'`). 선생님은 언제든 '끝내기'로 결과 화면 이동 |
| 결과 | 말별 점수·칭호, 만난 주제, 고른 선택 목록, 마무리 질문 |

카드 선택 결과로 이동한 칸에서는 다시 카드가 나오지 않습니다(연쇄 없음).

## 새 카드팩 만들기

1. `packs/template` 폴더를 복사해 이름을 바꿉니다. (예: `packs/environment`)
2. 세 파일 안의 `'template'`을 새 폴더 이름으로 바꿉니다.
3. `cards.js`에 카드를, `board.js`에 칸 배치를 채웁니다. 배치를 비워 두면 비율에 맞춰 자동 배치됩니다.
4. `config.js`의 `pack` 값을 바꾸거나 링크에 `?pack=environment`를 붙입니다.
5. `node tests/simulate.js environment`로 카드 형식 오류와 예상 진행 시간을 확인합니다.

### 카드 형식

```js
// 딜레마
{ id: 'ML-01', type: 'dilemma', topic: 'source', title: '...', situation: '...',
  choices: [
    { label: 'A', text: '...', effect: { trust: -2, move: -2 }, feedback: '...' },
    { label: 'B', text: '...', effect: { trust: 2, judgment: 1, move: 3, shortcut: true }, feedback: '...' }
  ] }

// 퀴즈 (answer는 0부터)
{ id: 'ML-13', type: 'quiz', topic: 'source', title: '...', situation: '...', question: '...',
  options: [{ label: 'O', text: '맞다' }, { label: 'X', text: '아니다' }], answer: 1,
  correct: { trust: 2, judgment: 1, move: 1 }, wrong: { trust: -1, move: 0 }, explanation: '...' }

// 기회/위기
{ id: 'ML-11', type: 'chance', topic: 'algorithm', title: '...', situation: '...',
  effect: { trust: 1, move: 1 }, feedback: '...' }
```

`effect`: `trust` 신뢰 변화, `judgment` 판단력 변화, `move` 이동(+전진 / -미끄러짐 / 0 제자리), `shortcut` 지름길 표시.

## 진행 시간 추정 (tests/simulate.js, 500판 평균)

주사위 20초, 카드 75초(토의 포함), 선생님 칸 60초, 되돌아보기 30초로 가정한 값입니다.

| 판 | 말 1개 | 말 2개 | 말 4개 |
|---|---|---|---|
| 40칸 | 카드 약 4장 · 9분 | 카드 약 7장 · 19분 | 카드 약 15장 · 38분 |
| 25칸 | 카드 약 2장 · 6분 | 카드 약 5장 · 12분 | 카드 약 9장 · 24분 |

그래서 기본 말 개수는 2개로 두었습니다. 수업 시간에 맞춰 `config.js`의 `defaultTokens`, `dieFaces`를 조정하세요.

## 다음 단계

- 게임 이름 확정 → `config.js`의 `title`, `logo`
- 딜레마 카드 문구 다듬기 (`draft: 'added'` 표시 카드 4장은 퀴즈·기회/위기 더미를 채우려고 임시로 추가한 것)
- 판 전체 칸 배치도 확정 → `packs/media-literacy/board.js`
- 칸 그림: 지금은 이모지. 이미지 파일 경로로 바꿀 수 있음 (`pack.js`의 `tileArt`)
