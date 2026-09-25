/*
 * 효과음 — 소리 파일 없이 Web Audio로 직접 만듦 (저작권 걱정 없음, 오프라인 동작)
 * 브라우저 정책상 첫 버튼을 누른 뒤부터 소리가 납니다.
 * 켜기/끄기 상태만 이 기기 브라우저에 기억합니다(개인정보 아님).
 */
(function () {
  'use strict';

  var BG = window.BG;
  var S = BG.Sound = {};
  var ctx = null, master = null, noiseBuf = null;
  var muted = false;
  var KEY = 'updown-road-muted';

  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* 저장소를 못 쓰면 켠 상태로 */ }

  function ac() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  S.unlock = function () { ac(); };

  // 저장된 선택이 없을 때만 기본값을 정함 (모둠 태블릿은 기본으로 소리 끔)
  S.setDefaultMuted = function (v) {
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* 무시 */ }
    if (stored === null) muted = !!v;
  };
  S.isMuted = function () { return muted; };
  S.setMuted = function (v) {
    muted = !!v;
    try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) { /* 무시 */ }
  };

  function ready() { return !muted && ac(); }

  // 음 하나: 주파수(from → to)로 미끄러지며 짧게 울리고 사라짐
  function tone(t, dur, from, to, type, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(from, t);
    if (to && to !== from) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  }

  // 짧은 잡음(주사위가 부딪히는 '딱' 소리)
  function knock(t, dur, freq, vol) {
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.4;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
  }

  // 주사위: 손 안에서 짧게 달그락 → 판 위를 "데굴데굴" 구르며 점점 느려짐 → 톡 멈춤
  S.dice = function (dur) {
    if (!ready()) return;
    dur = dur || 1;
    var t = ctx.currentTime;
    // 손 안에서 달그락 (전체 시간의 20%)
    var shake = dur * 0.2, n = Math.max(4, Math.round(shake / 0.05));
    for (var i = 0; i < n; i++) knock(t + i * shake / n + Math.random() * 0.015, 0.025, 2600 + Math.random() * 1200, 0.22);
    // 데굴데굴: 나무판 위를 모서리로 구르는 낮은 "또각" 소리, 간격이 점점 벌어짐
    var at = t + shake, gap = 0.055, k = 0;
    var end = t + dur * 0.9;
    while (at < end) {
      var v = 0.55 - (at - t) / dur * 0.35;
      knock(at, 0.04, 700 + Math.random() * 600, v);
      tone(at, 0.05, k % 2 ? 210 : 170, 120, 'sine', 0.22 * v);
      at += gap;
      gap *= 1.09;
      k++;
    }
    // 마지막 두 번 톡, 톡
    knock(t + dur * 0.93, 0.05, 1500, 0.45);
    knock(t + dur * 0.99, 0.06, 1200, 0.35);
    tone(t + dur * 0.99, 0.09, 150, 100, 'sine', 0.3);
  };

  // 뒤로 미끄러지기: "쭈르륵~" 내려가는 짧은 미끄럼 소리
  S.slip = function (dur) {
    if (!ready()) return;
    dur = Math.max(0.3, dur || 0.6);
    var t = ctx.currentTime;
    tone(t, dur, 700, 180, 'triangle', 0.18);
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    f.type = 'bandpass'; f.Q.value = 1.5;
    f.frequency.setValueAtTime(1800, t);
    f.frequency.exponentialRampToValueAtTime(400, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.05);
  };

  // 점수 숫자가 하나씩 바뀔 때 "틱" (올라갈 때 높게, 내려갈 때 낮게)
  S.tick = function (up, i) {
    if (!ready()) return;
    var f = up ? 880 + (i || 0) * 90 : 440 - (i || 0) * 40;
    tone(ctx.currentTime, 0.07, f, f * (up ? 1.2 : 0.85), 'triangle', 0.14);
  };

  // 한 칸 이동: 칸마다 조금씩 높아지는 '뿅'
  S.step = function (i) {
    if (!ready()) return;
    var t = ctx.currentTime, f = 520 + (i % 8) * 45;
    tone(t, 0.09, f, f * 1.5, 'triangle', 0.22);
  };

  // 뒤로 한 칸: 칸마다 조금씩 낮아지는 '뽁'
  S.stepBack = function (i) {
    if (!ready()) return;
    var t = ctx.currentTime, f = 480 - (i % 8) * 35;
    tone(t, 0.1, f, f * 0.7, 'triangle', 0.2);
  };

  // 말이 칸에 내려앉는 '톡'
  S.land = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    knock(t, 0.04, 900, 0.3);
    tone(t, 0.08, 160, 110, 'sine', 0.25);
  };

  // 업로드 오르는 중: "끙-차" 하고 사다리를 한 칸씩 밟는 소리가 점점 높아지고,
  // 바람 소리가 올라가다가 꼭대기 직전에 북소리가 빨라짐
  S.climb = function (dur) {
    if (!ready()) return;
    var t = ctx.currentTime, steps = Math.max(8, Math.round(dur / 0.3));
    for (var i = 0; i < steps; i++) {
      var at = t + i * dur / steps;
      var f = 220 * Math.pow(2, i / steps * 1.8);
      tone(at, 0.12, f, f * 1.05, 'square', 0.06);
      tone(at + 0.13, 0.1, f * 1.5, f * 1.6, 'triangle', 0.08);
    }
    var o = tone(t, dur, 180, 1100, 'sine', 0.05);
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5; lg.gain.value = 18;
    lfo.connect(lg); lg.connect(o.frequency);
    lfo.start(t); lfo.stop(t + dur);
    // 마지막 1/3: 북소리가 점점 빨라짐
    var start = t + dur * 0.62, gap = 0.16;
    for (var at2 = start; at2 < t + dur - 0.02; at2 += gap) {
      knock(at2, 0.06, 220, 0.35);
      tone(at2, 0.08, 120, 80, 'sine', 0.2);
      gap = Math.max(0.045, gap * 0.86);
    }
  };

  // 환호: 박수 소리 + 여러 목소리의 "와아~"
  S.cheer = function (dur) {
    if (!ready()) return;
    dur = dur || 1.6;
    var t = ctx.currentTime, i;
    for (i = 0; i < dur * 38; i++) {
      var at = t + Math.random() * dur;
      var v = 0.12 + Math.random() * 0.18;
      knock(at, 0.025, 1200 + Math.random() * 2200, v * (1 - (at - t) / (dur * 1.2)));
    }
    for (i = 0; i < 6; i++) {
      var base = 260 + Math.random() * 180;
      var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(base, t);
      o.frequency.linearRampToValueAtTime(base * 1.6, t + 0.35);
      o.frequency.linearRampToValueAtTime(base * 1.3, t + dur);
      f.type = 'bandpass'; f.frequency.value = 900 + i * 140; f.Q.value = 2.5;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(master);
      o.start(t + Math.random() * 0.08); o.stop(t + dur + 0.05);
    }
  };

  // 뱀 소리 "쉬이이익~": 높은 잡음을 흔들며 길게
  S.hiss = function (dur, vol) {
    if (!ready()) return;
    dur = dur || 1.2;
    var t = ctx.currentTime;
    var src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    hp.type = 'highpass'; hp.frequency.value = 3200;
    bp.type = 'peaking'; bp.frequency.value = 6500; bp.gain.value = 10; bp.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.32, t + 0.08);
    g.gain.setValueAtTime(vol || 0.32, t + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 11; lg.gain.value = 0.12;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.05);
    lfo.start(t); lfo.stop(t + dur + 0.05);
  };

  // 뱀 꼬리 딸랑이 "따르르르"
  function rattle(t, dur) {
    for (var at = t; at < t + dur; at += 0.035) knock(at, 0.02, 4200 + Math.random() * 800, 0.14);
  }

  // 다운로드(뱀) 떨어지는 중: 뱀이 "쉬익!" → 미끄러져 내려가는 휘파람 + 계속 쉬이이 + 딸랑이 → 바닥에 쿵
  S.fall = function (dur) {
    if (!ready()) return;
    var t = ctx.currentTime;
    S.hiss(0.9, 0.38);
    rattle(t + 0.1, 0.7);
    var o = tone(t + 0.6, dur - 0.6, 1100, 110, 'triangle', 0.2);
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 6; lg.gain.value = 45;
    lfo.connect(lg); lg.connect(o.frequency);
    lfo.start(t + 0.6); lfo.stop(t + dur + 0.05);
    // 내려가는 동안 뱀이 몇 번 더 쉬익
    [0.35, 0.6, 0.82].forEach(function (k) {
      setTimeout(function () { S.hiss(0.5, 0.2); }, dur * k * 1000);
    });
    knock(t + dur - 0.02, 0.2, 150, 0.9);
    tone(t + dur - 0.02, 0.35, 110, 45, 'sine', 0.5);
  };

  // 좌절: 트롬본 "빠밤빠밤~ 뿌우우"
  S.sad = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    [[311, 0], [294, 0.32], [277, 0.64]].forEach(function (n) { brass(t + n[1], 0.3, n[0], n[0] * 0.98, 0.16); });
    brass(t + 0.96, 1.1, 262, 247, 0.18, true);
  };

  // 금관 소리 흉내 (톱니파 + 저역 통과 필터)
  function brass(t, dur, from, to, vol, wobble) {
    var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(from, t);
    o.frequency.linearRampToValueAtTime(to, t + dur);
    f.type = 'lowpass'; f.frequency.setValueAtTime(700, t); f.frequency.linearRampToValueAtTime(2200, t + 0.06); f.frequency.linearRampToValueAtTime(1100, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    g.gain.setValueAtTime(vol, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(master);
    if (wobble) {
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 6; lg.gain.value = 8;
      lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(t + 0.2); lfo.stop(t + dur);
    }
    o.start(t); o.stop(t + dur + 0.05);
  }

  // 빵빠레: 빰 빰 빰 빠바밤~
  S.fanfare = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    var notes = [[392, 0, 0.14], [392, 0.16, 0.14], [392, 0.32, 0.14], [523, 0.5, 0.5], [466, 1.02, 0.14], [523, 1.18, 0.14], [659, 1.34, 0.9]];
    notes.forEach(function (n) { brass(t + n[1], n[2], n[0], n[0], 0.14); });
    [523, 659, 784].forEach(function (f) { brass(t + 1.34, 0.9, f, f, 0.07); });
    knock(t + 1.34, 0.3, 5000, 0.25);   // 심벌
  };

  // 차례 알림: 띠-링!
  S.turn = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    tone(t, 0.18, 784, 784, 'triangle', 0.22);
    tone(t + 0.12, 0.4, 1175, 1175, 'triangle', 0.22);
    tone(t + 0.12, 0.4, 1568, 1568, 'sine', 0.08);
  };

  // 카드 등장: 딩동
  S.card = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    tone(t, 0.25, 988, 988, 'triangle', 0.22);
    tone(t + 0.1, 0.35, 1319, 1319, 'triangle', 0.2);
  };

  // 선택지 누름: 딸깍
  S.tap = function () {
    if (!ready()) return;
    tone(ctx.currentTime, 0.05, 1200, 900, 'square', 0.06);
  };

  // 좋은 결과: 밝은 "딩-동-댕!" 화음과 반짝이
  S.good = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    [659, 831, 988].forEach(function (f, i) { tone(t + i * 0.1, 0.3, f, f, 'triangle', 0.24); });
    tone(t + 0.3, 0.5, 1319, 1319, 'sine', 0.12);
    [2637, 3136, 3520].forEach(function (f, i) { tone(t + 0.34 + i * 0.05, 0.12, f, f, 'sine', 0.05); });
  };

  // 아주 좋은 결과(정답 등): 밝은 화음 + 짧은 박수
  S.great = function () {
    if (!ready()) return;
    S.good();
    var t = ctx.currentTime;
    [523, 659, 784, 1047].forEach(function (f) { tone(t + 0.45, 0.6, f, f, 'triangle', 0.07); });
    for (var i = 0; i < 26; i++) knock(t + 0.4 + Math.random() * 0.8, 0.02, 1500 + Math.random() * 2000, 0.12);
  };

  // 아쉬운 결과: 부드럽게 내려가는 "띠로롱~" (놀리는 느낌이 아니도록 부드러운 소리)
  S.bad = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    tone(t, 0.25, 587, 587, 'triangle', 0.16);
    tone(t + 0.18, 0.25, 523, 523, 'triangle', 0.16);
    tone(t + 0.36, 0.55, 440, 415, 'triangle', 0.16);
  };

  // 도착: 빵빠레 + 환호
  S.finish = function () {
    if (!ready()) return;
    S.fanfare();
    setTimeout(function () { S.cheer(2.4); }, 900);
  };
})();
