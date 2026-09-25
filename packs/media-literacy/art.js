/*
 * 카드팩: 디지털 미디어 리터러시 — 그림
 * 판의 칸과 카드에 들어가는 그림을 직접 그린 SVG입니다(외부 이미지·저작권 걱정 없음).
 * 모두 같은 화풍: 굵은 남색 테두리 + 평평한 색 + 얼굴이 있는 귀여운 디지털 친구들
 *
 * pack.js의 tileArt / cardArt에서 'svg:이름'으로 불러 씁니다.
 */
(function () {
  var K = '#1B1A2E', Y = '#FFCF33', R = '#FF4D3D', G = '#16A35A', P = '#7A3CE0', B = '#2F6BFF',
      O = '#FF9F1C', M = '#0E9F6E', PK = '#FF8FB1', L = '#FFF7E0', W = '#FFFFFF', SKY = '#9ED8FF';
  var S = ' stroke="' + K + '" stroke-width="4"';
  var S3 = ' stroke="' + K + '" stroke-width="3"';

  function svg(vb, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" stroke-linejoin="round" stroke-linecap="round">' + body + '</svg>';
  }

  // 얼굴: 눈 두 개(반짝이), 볼터치, 입. mood: smile | wow | wink | worry | sly
  function face(x, y, s, mood) {
    s = s || 1;
    var g = 8 * s, out = '';
    if (mood === 'wink') {
      out += '<path d="M' + (x - g - 3 * s) + ' ' + y + ' q' + 3 * s + ' ' + (-3 * s) + ' ' + 6 * s + ' 0" fill="none"' + S3 + '/>';
    } else {
      out += '<ellipse cx="' + (x - g) + '" cy="' + y + '" rx="' + 2.8 * s + '" ry="' + 3.6 * s + '" fill="' + K + '"/>';
      out += '<circle cx="' + (x - g + s) + '" cy="' + (y - 1.4 * s) + '" r="' + s + '" fill="#fff"/>';
    }
    out += '<ellipse cx="' + (x + g) + '" cy="' + y + '" rx="' + 2.8 * s + '" ry="' + 3.6 * s + '" fill="' + K + '"/>';
    out += '<circle cx="' + (x + g + s) + '" cy="' + (y - 1.4 * s) + '" r="' + s + '" fill="#fff"/>';
    out += '<ellipse cx="' + (x - g - 4 * s) + '" cy="' + (y + 6 * s) + '" rx="' + 3.2 * s + '" ry="' + 2 * s + '" fill="' + PK + '" opacity=".85"/>';
    out += '<ellipse cx="' + (x + g + 4 * s) + '" cy="' + (y + 6 * s) + '" rx="' + 3.2 * s + '" ry="' + 2 * s + '" fill="' + PK + '" opacity=".85"/>';
    if (mood === 'wow') out += '<ellipse cx="' + x + '" cy="' + (y + 7 * s) + '" rx="' + 2.6 * s + '" ry="' + 3.2 * s + '" fill="' + K + '"/>';
    else if (mood === 'worry') out += '<path d="M' + (x - 4 * s) + ' ' + (y + 9 * s) + ' q' + 4 * s + ' ' + (-4 * s) + ' ' + 8 * s + ' 0" fill="none"' + S3 + '/>';
    else if (mood === 'sly') out += '<path d="M' + (x - 5 * s) + ' ' + (y + 6 * s) + ' q' + 6 * s + ' ' + 4 * s + ' ' + 10 * s + ' ' + (-2 * s) + '" fill="none"' + S3 + '/>';
    else out += '<path d="M' + (x - 4.5 * s) + ' ' + (y + 5 * s) + ' q' + 4.5 * s + ' ' + 5 * s + ' ' + 9 * s + ' 0" fill="' + R + '"' + S3 + '/>';
    return out;
  }

  function sparkle(x, y, r, color) {
    return '<path d="M' + x + ' ' + (y - r) + ' Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) +
      ' Q' + x + ' ' + y + ' ' + (x - r) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y - r) + 'Z" fill="' + (color || Y) + '"' + S3 + '/>';
  }

  var T = '0 0 100 100';
  var art = {
    /* ---------- 칸 그림: 디지털 친구들 ---------- */
    phone: svg(T,
      '<rect x="28" y="10" width="44" height="80" rx="10" fill="' + B + '"' + S + '/>' +
      '<rect x="34" y="20" width="32" height="54" rx="4" fill="' + SKY + '"' + S3 + '/>' +
      face(50, 42, 0.9) +
      '<circle cx="50" cy="82" r="3.5" fill="' + L + '"' + S3 + '/>' +
      '<circle cx="72" cy="14" r="9" fill="' + R + '"' + S3 + '/><path d="M72 9v6M72 19v.5" stroke="#fff" stroke-width="3"/>'),
    laptop: svg(T,
      '<rect x="18" y="18" width="64" height="44" rx="6" fill="' + P + '"' + S + '/>' +
      '<rect x="25" y="25" width="50" height="31" rx="3" fill="' + L + '"' + S3 + '/>' +
      face(50, 38, 0.8, 'wink') +
      '<path d="M8 72 L18 62 H82 L92 72 Z" fill="' + SKY + '"' + S + '/><path d="M42 67h16" stroke="' + K + '" stroke-width="3"/>'),
    camera: svg(T,
      '<rect x="12" y="30" width="76" height="52" rx="12" fill="' + O + '"' + S + '/>' +
      '<path d="M32 30 l6 -10 h24 l6 10" fill="' + O + '"' + S + '/>' +
      '<circle cx="50" cy="56" r="19" fill="' + L + '"' + S + '/><circle cx="50" cy="56" r="11" fill="' + K + '"/>' +
      '<circle cx="45" cy="51" r="4" fill="#fff"/><rect x="70" y="36" width="10" height="7" rx="2" fill="' + Y + '"' + S3 + '/>'),
    robot: svg(T,
      '<path d="M50 8 V20" stroke="' + K + '" stroke-width="4"/><circle cx="50" cy="8" r="6" fill="' + R + '"' + S3 + '/>' +
      '<rect x="20" y="20" width="60" height="50" rx="14" fill="' + SKY + '"' + S + '/>' +
      '<rect x="12" y="36" width="8" height="18" rx="3" fill="' + O + '"' + S3 + '/><rect x="80" y="36" width="8" height="18" rx="3" fill="' + O + '"' + S3 + '/>' +
      '<rect x="28" y="30" width="44" height="30" rx="8" fill="' + L + '"' + S3 + '/>' + face(50, 42, 0.85) +
      '<rect x="32" y="74" width="36" height="18" rx="6" fill="' + P + '"' + S + '/>'),
    chat: svg(T,
      '<path d="M16 22 h68 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-38 l-16 14 v-14 h-14 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8z" fill="' + M + '"' + S + '/>' +
      '<path d="M50 60 C34 50 32 38 41 35 C46 33 50 38 50 40 C50 38 54 33 59 35 C68 38 66 50 50 60Z" fill="' + PK + '"' + S3 + '/>'),
    detective: svg(T,
      '<path d="M60 62 L84 88" stroke="' + K + '" stroke-width="12"/><path d="M60 62 L84 88" stroke="' + O + '" stroke-width="6"/>' +
      '<circle cx="42" cy="42" r="28" fill="' + SKY + '"' + S + '/><circle cx="42" cy="42" r="21" fill="' + L + '"' + S3 + '/>' +
      '<ellipse cx="42" cy="42" rx="12" ry="9" fill="#fff"' + S3 + '/><circle cx="44" cy="42" r="6" fill="' + K + '"/><circle cx="46" cy="40" r="2" fill="#fff"/>' +
      '<path d="M26 26 q6 -6 14 -4" fill="none" stroke="#fff" stroke-width="4"/>'),
    lock: svg(T,
      '<path d="M32 44 V32 a18 18 0 0 1 36 0 V44" fill="none" stroke="' + K + '" stroke-width="12"/>' +
      '<path d="M32 44 V32 a18 18 0 0 1 36 0 V44" fill="none" stroke="' + SKY + '" stroke-width="5"/>' +
      '<rect x="20" y="42" width="60" height="48" rx="10" fill="' + Y + '"' + S + '/>' + face(50, 60, 0.9) +
      '<path d="M50 74 v8" stroke="' + K + '" stroke-width="4"/>'),
    wifi: svg(T,
      '<path d="M18 46 a45 45 0 0 1 64 0" fill="none" stroke="' + K + '" stroke-width="12"/><path d="M18 46 a45 45 0 0 1 64 0" fill="none" stroke="' + B + '" stroke-width="6"/>' +
      '<path d="M30 58 a28 28 0 0 1 40 0" fill="none" stroke="' + K + '" stroke-width="12"/><path d="M30 58 a28 28 0 0 1 40 0" fill="none" stroke="' + M + '" stroke-width="6"/>' +
      '<circle cx="50" cy="76" r="15" fill="' + Y + '"' + S + '/>' + face(50, 74, 0.55) + sparkle(84, 20, 8)),
    gamepad: svg(T,
      '<path d="M22 34 h56 a16 16 0 0 1 14 22 l-6 18 a10 10 0 0 1 -17 3 l-7 -9 h-24 l-7 9 a10 10 0 0 1 -17 -3 l-6 -18 a16 16 0 0 1 14 -22z" fill="' + P + '"' + S + '/>' +
      '<path d="M26 50 h12 M32 44 v12" stroke="' + L + '" stroke-width="5"/>' +
      '<circle cx="68" cy="46" r="4" fill="' + Y + '"' + S3 + '/><circle cx="76" cy="54" r="4" fill="' + R + '"' + S3 + '/>' + face(50, 50, 0.6, 'wow')),
    mail: svg(T,
      '<rect x="12" y="24" width="76" height="54" rx="8" fill="' + L + '"' + S + '/>' +
      '<path d="M14 28 L50 56 L86 28" fill="none"' + S + '/>' + face(50, 66, 0.6) +
      '<path d="M78 14 C72 8 64 14 72 22 L78 28 L84 22 C92 14 84 8 78 14Z" fill="' + R + '"' + S3 + '/>'),
    tv: svg(T,
      '<path d="M36 12 L50 24 L64 12" fill="none"' + S + '/>' +
      '<rect x="12" y="24" width="76" height="56" rx="12" fill="' + R + '"' + S + '/>' +
      '<rect x="20" y="32" width="60" height="40" rx="6" fill="' + L + '"' + S3 + '/>' +
      '<path d="M44 40 L60 52 L44 64 Z" fill="' + R + '"' + S3 + '/><path d="M32 80 l-4 8 M68 80 l4 8" stroke="' + K + '" stroke-width="4"/>'),
    bell: svg(T,
      '<path d="M50 14 C30 14 26 34 26 48 C26 62 18 66 18 72 H82 C82 66 74 62 74 48 C74 34 70 14 50 14Z" fill="' + Y + '"' + S + '/>' +
      '<circle cx="50" cy="80" r="8" fill="' + O + '"' + S3 + '/>' + face(50, 46, 0.8, 'wow') +
      '<path d="M10 30 q-4 10 0 20 M90 30 q4 10 0 20" fill="none"' + S3 + '/>'),
    headphone: svg(T,
      '<path d="M18 60 V48 a32 32 0 0 1 64 0 V60" fill="none" stroke="' + K + '" stroke-width="12"/><path d="M18 60 V48 a32 32 0 0 1 64 0 V60" fill="none" stroke="' + M + '" stroke-width="6"/>' +
      '<rect x="10" y="54" width="20" height="30" rx="8" fill="' + O + '"' + S + '/><rect x="70" y="54" width="20" height="30" rx="8" fill="' + O + '"' + S + '/>' +
      '<path d="M46 72 V50 l14 -4 v20" fill="none"' + S3 + '/><circle cx="42" cy="72" r="5" fill="' + P + '"' + S3 + '/><circle cx="56" cy="67" r="5" fill="' + P + '"' + S3 + '/>'),
    heart: svg(T,
      '<path d="M50 86 C18 64 10 44 20 30 C30 16 46 22 50 32 C54 22 70 16 80 30 C90 44 82 64 50 86Z" fill="' + PK + '"' + S + '/>' +
      face(50, 48, 0.9) + sparkle(84, 16, 8) + sparkle(14, 20, 6, W)),
    star: svg(T,
      '<path d="M50 8 L61 34 L89 36 L67 54 L74 82 L50 67 L26 82 L33 54 L11 36 L39 34 Z" fill="' + Y + '"' + S + '/>' + face(50, 46, 0.8)),
    cloud: svg(T,
      '<path d="M26 70 a16 16 0 0 1 0 -32 a22 22 0 0 1 42 -6 a18 18 0 0 1 8 38 Z" fill="' + W + '"' + S + '/>' + face(50, 50, 0.8) +
      '<text x="30" y="92" font-family="monospace" font-size="14" font-weight="bold" fill="' + B + '">0 1 0</text>'),
    battery: svg(T,
      '<rect x="16" y="28" width="62" height="44" rx="10" fill="' + L + '"' + S + '/><rect x="78" y="42" width="8" height="16" rx="3" fill="' + K + '"/>' +
      '<rect x="22" y="34" width="36" height="32" rx="5" fill="' + G + '"/>' + face(46, 48, 0.75) +
      '<path d="M64 36 L56 52 H64 L58 66" fill="none" stroke="' + Y + '" stroke-width="5"/>'),
    book: svg(T,
      '<path d="M50 24 C40 16 22 16 12 20 V82 C22 78 40 78 50 86 C60 78 78 78 88 82 V20 C78 16 60 16 50 24Z" fill="' + L + '"' + S + '/>' +
      '<path d="M50 24 V86" stroke="' + K + '" stroke-width="4"/><path d="M20 34 h20 M20 44 h20 M60 34 h20 M60 44 h20" stroke="' + B + '" stroke-width="3"/>' +
      face(50, 60, 0.7)),

    /* ---------- 특별한 칸 ---------- */
    start: svg(T,
      '<path d="M18 50 L50 20 L82 50 V86 H18 Z" fill="' + L + '"' + S + '/><path d="M12 54 L50 16 L88 54" fill="none" stroke="' + R + '" stroke-width="8"/>' +
      '<rect x="40" y="62" width="20" height="24" rx="4" fill="' + O + '"' + S3 + '/>' + face(50, 46, 0.7) +
      '<path d="M76 30 V8 l14 6 l-14 6" fill="' + G + '"' + S3 + '/>'),
    finish: svg(T,
      '<path d="M30 14 H70 V38 a20 20 0 0 1 -40 0 Z" fill="' + Y + '"' + S + '/>' +
      '<path d="M30 20 H18 a10 12 0 0 0 12 20 M70 20 H82 a10 12 0 0 1 -12 20" fill="none"' + S + '/>' +
      '<path d="M44 58 h12 v12 h-12z" fill="' + O + '"' + S3 + '/><rect x="30" y="70" width="40" height="14" rx="4" fill="' + P + '"' + S + '/>' +
      face(50, 32, 0.7) + sparkle(14, 12, 7) + sparkle(88, 60, 6, W)),
    teacher: svg(T,
      '<circle cx="50" cy="22" r="12" fill="' + P + '"' + S + '/>' +
      '<circle cx="50" cy="48" r="26" fill="#FFD9B8"' + S + '/>' +
      '<path d="M24 44 C26 26 74 26 76 44 C66 36 34 36 24 44Z" fill="' + P + '"' + S3 + '/>' +
      '<circle cx="41" cy="50" r="7" fill="#fff"' + S3 + '/><circle cx="59" cy="50" r="7" fill="#fff"' + S3 + '/><path d="M48 50 h4" stroke="' + K + '" stroke-width="3"/>' +
      '<circle cx="41" cy="50" r="2.4" fill="' + K + '"/><circle cx="59" cy="50" r="2.4" fill="' + K + '"/>' +
      '<path d="M44 62 q6 5 12 0" fill="none"' + S3 + '/><path d="M36 76 L64 76 L70 94 H30 Z" fill="' + R + '"' + S + '/>' +
      '<path d="M76 92 L94 60" stroke="' + K + '" stroke-width="4"/><circle cx="94" cy="58" r="4" fill="' + Y + '"' + S3 + '/>'),
    rocket: svg(T,
      '<path d="M40 70 C30 76 28 88 26 94 C34 90 44 88 48 80" fill="' + O + '"' + S3 + '/>' +
      '<path d="M50 6 C70 18 74 44 64 70 H36 C26 44 30 18 50 6Z" fill="' + L + '"' + S + '/>' +
      '<circle cx="50" cy="36" r="9" fill="' + SKY + '"' + S3 + '/><circle cx="47" cy="33" r="3" fill="#fff"/>' +
      '<path d="M36 56 L22 70 L36 70 Z M64 56 L78 70 L64 70 Z" fill="' + G + '"' + S3 + '/>' +
      '<path d="M42 72 Q50 96 58 72" fill="' + Y + '"' + S3 + '/>'),
    snake: svg(T,
      '<path d="M22 86 C10 70 34 60 50 66 C68 72 90 62 78 46" fill="none" stroke="' + K + '" stroke-width="18"/>' +
      '<path d="M22 86 C10 70 34 60 50 66 C68 72 90 62 78 46" fill="none" stroke="' + P + '" stroke-width="11"/>' +
      '<path d="M22 86 C10 70 34 60 50 66 C68 72 90 62 78 46" fill="none" stroke="' + Y + '" stroke-width="4" stroke-dasharray="3 9"/>' +
      '<ellipse cx="64" cy="32" rx="26" ry="20" fill="' + P + '"' + S + '/>' +
      '<circle cx="56" cy="26" r="7" fill="#fff"' + S3 + '/><circle cx="74" cy="26" r="7" fill="#fff"' + S3 + '/>' +
      '<circle cx="57" cy="27" r="3" fill="' + K + '"/><circle cx="75" cy="27" r="3" fill="' + K + '"/>' +
      '<path d="M56 40 q9 6 18 0" fill="none"' + S3 + '/><path d="M65 43 v10 l-4 5 M65 53 l4 5" fill="none" stroke="' + R + '" stroke-width="3"/>'),

    /* ---------- 카드 그림 (주제별 장면) ---------- */
    'card-source': svg('0 0 160 120',
      '<rect x="18" y="22" width="84" height="80" rx="6" fill="' + L + '"' + S + ' transform="rotate(-6 60 62)"/>' +
      '<g transform="rotate(-6 60 62)"><rect x="28" y="32" width="64" height="12" rx="3" fill="' + B + '"/>' +
      '<path d="M28 54 h40 M28 64 h52 M28 74 h36 M28 84 h48" stroke="' + K + '" stroke-width="3"/>' +
      '<text x="74" y="84" font-family="sans-serif" font-size="26" font-weight="bold" fill="' + R + '">?</text></g>' +
      '<path d="M122 78 L148 106" stroke="' + K + '" stroke-width="14"/><path d="M122 78 L148 106" stroke="' + O + '" stroke-width="7"/>' +
      '<circle cx="106" cy="60" r="28" fill="' + SKY + '" fill-opacity=".55"' + S + '/>' +
      '<ellipse cx="106" cy="60" rx="13" ry="10" fill="#fff"' + S3 + '/><circle cx="108" cy="60" r="6" fill="' + K + '"/><circle cx="110" cy="58" r="2" fill="#fff"/>' +
      sparkle(140, 20, 9) + '<path d="M128 40 l6 6 l12 -14" fill="none" stroke="' + G + '" stroke-width="6"/>'),
    'card-deepfake': svg('0 0 160 120',
      '<circle cx="80" cy="60" r="44" fill="#FFD9B8"' + S + '/>' +
      '<path d="M80 16 A44 44 0 0 1 80 104 Z" fill="' + P + '"' + S + '/>' +
      '<g fill="' + SKY + '" opacity=".9"><rect x="86" y="30" width="10" height="10"/><rect x="100" y="44" width="10" height="10"/><rect x="88" y="70" width="10" height="10"/><rect x="104" y="80" width="8" height="8"/></g>' +
      '<ellipse cx="62" cy="52" rx="4" ry="5" fill="' + K + '"/><circle cx="63" cy="50" r="1.5" fill="#fff"/>' +
      '<rect x="92" y="48" width="14" height="8" fill="' + R + '"' + S3 + '/>' +
      '<path d="M58 76 q10 8 22 0" fill="none"' + S3 + '/><path d="M80 76 l14 -4" fill="none" stroke="' + Y + '" stroke-width="4"/>' +
      '<path d="M80 12 V108" stroke="' + K + '" stroke-width="4" stroke-dasharray="6 6"/>' +
      '<text x="14" y="30" font-family="sans-serif" font-size="22" font-weight="bold" fill="' + K + '">진짜?</text>' +
      '<text x="116" y="112" font-family="sans-serif" font-size="22" font-weight="bold" fill="' + P + '">AI?</text>'),
    'card-privacy': svg('0 0 160 120',
      '<path d="M80 8 L124 24 V56 C124 84 104 104 80 114 C56 104 36 84 36 56 V24 Z" fill="' + B + '"' + S + '/>' +
      '<path d="M80 18 L114 30 V56 C114 78 98 94 80 102 C62 94 46 78 46 56 V30 Z" fill="' + SKY + '"' + S3 + '/>' +
      '<path d="M68 58 V50 a12 12 0 0 1 24 0 V58" fill="none"' + S + '/>' +
      '<rect x="62" y="56" width="36" height="28" rx="6" fill="' + Y + '"' + S + '/>' + face(80, 68, 0.55) +
      '<rect x="6" y="64" width="34" height="24" rx="4" fill="' + L + '"' + S3 + ' transform="rotate(-12 23 76)"/>' +
      '<text x="10" y="82" font-family="sans-serif" font-size="12" font-weight="bold" fill="' + R + '" transform="rotate(-12 23 76)">***</text>' +
      sparkle(140, 26, 9) + sparkle(22, 30, 6, W)),
    'card-etiquette': svg('0 0 160 120',
      '<path d="M10 16 h72 a8 8 0 0 1 8 8 v30 a8 8 0 0 1 -8 8 h-44 l-14 12 v-12 h-14 a8 8 0 0 1 -8 -8 v-30 a8 8 0 0 1 8 -8z" fill="' + M + '"' + S + '/>' +
      '<path d="M46 52 C34 44 32 34 39 31 C43 29 46 33 46 35 C46 33 49 29 53 31 C60 34 58 44 46 52Z" fill="' + PK + '"' + S3 + '/>' +
      '<path d="M150 52 h-68 a8 8 0 0 0 -8 8 v30 a8 8 0 0 0 8 8 h40 l14 12 v-12 h14 a8 8 0 0 0 8 -8 v-30 a8 8 0 0 0 -8 -8z" fill="' + O + '"' + S + '/>' +
      face(114, 72, 0.8) +
      '<rect x="96" y="86" width="36" height="10" rx="5" fill="' + L + '"' + S3 + ' transform="rotate(-10 114 91)"/>' +
      sparkle(22, 96, 8) + sparkle(146, 22, 7)),
    'card-algorithm': svg('0 0 160 120',
      '<path d="M80 60 m-50 0 a50 50 0 1 0 100 0 a50 50 0 1 0 -100 0" fill="none" stroke="' + K + '" stroke-width="4" stroke-dasharray="4 10"/>' +
      '<rect x="56" y="18" width="48" height="86" rx="10" fill="' + K + '"/><rect x="61" y="26" width="38" height="68" rx="4" fill="' + L + '"/>' +
      '<path d="M80 60 m-4 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0" fill="none" stroke="' + P + '" stroke-width="3"/>' +
      '<rect x="10" y="14" width="30" height="22" rx="4" fill="' + R + '"' + S3 + '/><path d="M21 19 l9 6 l-9 6z" fill="#fff"/>' +
      '<rect x="120" y="20" width="30" height="22" rx="4" fill="' + B + '"' + S3 + '/><path d="M131 25 l9 6 l-9 6z" fill="#fff"/>' +
      '<rect x="8" y="80" width="30" height="22" rx="4" fill="' + M + '"' + S3 + '/><path d="M19 85 l9 6 l-9 6z" fill="#fff"/>' +
      '<rect x="122" y="80" width="30" height="22" rx="4" fill="' + O + '"' + S3 + '/><path d="M133 85 l9 6 l-9 6z" fill="#fff"/>'),
    'card-ad': svg('0 0 160 120',
      '<path d="M28 48 L96 18 V102 L28 72 Z" fill="' + R + '"' + S + '/>' +
      '<rect x="12" y="46" width="20" height="28" rx="5" fill="' + Y + '"' + S + '/>' +
      '<path d="M36 72 L44 100 H58 L52 78" fill="' + L + '"' + S3 + '/>' +
      '<path d="M108 40 q10 20 0 40 M120 30 q16 30 0 60" fill="none"' + S + '/>' +
      '<rect x="112" y="4" width="44" height="24" rx="6" fill="' + Y + '"' + S3 + ' transform="rotate(10 134 16)"/>' +
      '<text x="120" y="23" font-family="sans-serif" font-size="16" font-weight="bold" fill="' + K + '" transform="rotate(10 134 16)">광고</text>' +
      '<circle cx="136" cy="100" r="11" fill="' + Y + '"' + S3 + '/><text x="131" y="106" font-family="sans-serif" font-size="14" font-weight="bold" fill="' + K + '">₩</text>'),
    'card-quiz': svg('0 0 160 120',
      '<path d="M58 40 a22 22 0 1 1 30 20 c-8 4 -8 8 -8 16" fill="none" stroke="' + K + '" stroke-width="20"/>' +
      '<path d="M58 40 a22 22 0 1 1 30 20 c-8 4 -8 8 -8 16" fill="none" stroke="' + M + '" stroke-width="12"/>' +
      '<circle cx="80" cy="98" r="9" fill="' + M + '"' + S + '/>' + face(80, 34, 0.7) +
      '<circle cx="24" cy="70" r="18" fill="none" stroke="' + K + '" stroke-width="12"/><circle cx="24" cy="70" r="18" fill="none" stroke="' + B + '" stroke-width="6"/>' +
      '<path d="M122 54 l28 28 M150 54 l-28 28" stroke="' + K + '" stroke-width="13"/><path d="M122 54 l28 28 M150 54 l-28 28" stroke="' + R + '" stroke-width="6"/>'),
    'card-chance': svg('0 0 160 120',
      '<rect x="42" y="56" width="76" height="54" rx="6" fill="' + O + '"' + S + '/>' +
      '<rect x="36" y="44" width="88" height="16" rx="4" fill="' + Y + '"' + S + ' transform="rotate(-12 80 52)"/>' +
      '<path d="M80 58 V110" stroke="' + R + '" stroke-width="8"/>' + face(80, 84, 0.8, 'wow') +
      '<path d="M92 4 L78 30 H90 L80 50" fill="none" stroke="' + K + '" stroke-width="9"/><path d="M92 4 L78 30 H90 L80 50" fill="none" stroke="' + Y + '" stroke-width="4"/>' +
      sparkle(30, 26, 10) + sparkle(132, 22, 8, PK) + sparkle(140, 76, 6, W)),
    'card-reflect': svg('0 0 160 120',
      '<path d="M40 62 a40 40 0 1 1 12 28" fill="none" stroke="' + K + '" stroke-width="16"/><path d="M40 62 a40 40 0 1 1 12 28" fill="none" stroke="' + P + '" stroke-width="9"/>' +
      '<path d="M24 50 L40 72 L56 52" fill="' + P + '"' + S + '/>' +
      '<circle cx="80" cy="58" r="22" fill="' + Y + '"' + S + '/>' + face(80, 55, 0.7, 'worry') +
      '<path d="M112 14 q6 -8 14 -2 q6 8 -4 12 v6" fill="none" stroke="' + K + '" stroke-width="4"/><circle cx="122" cy="38" r="2.5" fill="' + K + '"/>'),
    'card-teacher': svg('0 0 160 120',
      '<rect x="66" y="10" width="86" height="58" rx="6" fill="' + M + '"' + S + '/>' +
      '<text x="84" y="48" font-family="sans-serif" font-size="30" font-weight="bold" fill="#fff">?!</text>' +
      '<circle cx="40" cy="44" r="22" fill="#FFD9B8"' + S + '/><path d="M18 40 C20 22 60 22 62 40 C52 32 28 32 18 40Z" fill="' + P + '"' + S3 + '/>' +
      '<circle cx="32" cy="46" r="6" fill="#fff"' + S3 + '/><circle cx="48" cy="46" r="6" fill="#fff"' + S3 + '/><circle cx="32" cy="46" r="2" fill="' + K + '"/><circle cx="48" cy="46" r="2" fill="' + K + '"/>' +
      '<path d="M34 56 q6 5 12 0" fill="none"' + S3 + '/><path d="M20 70 L60 70 L66 112 H14 Z" fill="' + R + '"' + S + '/>' +
      '<path d="M58 82 L96 50" stroke="' + K + '" stroke-width="4"/><circle cx="96" cy="50" r="4" fill="' + Y + '"' + S3 + '/>')
  };

  BG.registerPack('media-literacy', 'art', art);
})();
