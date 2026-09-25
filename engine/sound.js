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

  // 주사위: 손 안에서 달그락 → 판 위에서 통통 튀다가 멈춤
  S.dice = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    for (var i = 0; i < 7; i++) knock(t + i * 0.045 + Math.random() * 0.02, 0.03, 2600 + Math.random() * 1400, 0.35);
    var gaps = [0.40, 0.55, 0.66, 0.74, 0.80, 0.85];
    gaps.forEach(function (g, k) {
      var v = 0.9 - k * 0.13;
      knock(t + g, 0.05, 1800 + Math.random() * 900, v);
      tone(t + g, 0.07, 190 - k * 12, 120, 'sine', 0.35 * v);
    });
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

  // 다운로드 떨어지는 중: 길게 내려가는 미끄럼 휘파람 + "으아아아~" 비명 + 바람 소리
  S.fall = function (dur) {
    if (!ready()) return;
    var t = ctx.currentTime;
    var o = tone(t, dur, 1300, 120, 'triangle', 0.2);
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 7; lg.gain.value = 35;
    lfo.connect(lg); lg.connect(o.frequency);
    lfo.start(t); lfo.stop(t + dur + 0.05);

    // 목소리 같은 비명: 톱니파를 모음 소리처럼 걸러서 흔들며 내림
    var v = ctx.createOscillator(), vf = ctx.createBiquadFilter(), vg = ctx.createGain();
    v.type = 'sawtooth';
    v.frequency.setValueAtTime(620, t);
    v.frequency.exponentialRampToValueAtTime(170, t + dur);
    vf.type = 'bandpass'; vf.frequency.value = 900; vf.Q.value = 4;
    vg.gain.setValueAtTime(0.0001, t);
    vg.gain.exponentialRampToValueAtTime(0.09, t + 0.2);
    vg.gain.setValueAtTime(0.09, t + dur * 0.7);
    vg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var vl = ctx.createOscillator(), vlg = ctx.createGain();
    vl.frequency.value = 6; vlg.gain.value = 22;
    vl.connect(vlg); vlg.connect(v.frequency);
    v.connect(vf); vf.connect(vg); vg.connect(master);
    v.start(t); v.stop(t + dur + 0.05);
    vl.start(t); vl.stop(t + dur + 0.05);

    // 바람: 잡음이 점점 커짐
    var src = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    nf.type = 'bandpass'; nf.Q.value = 0.8;
    nf.frequency.setValueAtTime(400, t);
    nf.frequency.linearRampToValueAtTime(1600, t + dur);
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.12, t + dur * 0.9);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(nf); nf.connect(ng); ng.connect(master);
    src.start(t); src.stop(t + dur + 0.05);

    // 바닥에 '쿵'
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

  // 좋은 결과: 올라가는 화음
  S.good = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    [523, 659, 784].forEach(function (f, i) { tone(t + i * 0.09, 0.28, f, f, 'triangle', 0.24); });
  };

  // 아쉬운 결과: 와와~
  S.bad = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    tone(t, 0.22, 392, 370, 'sawtooth', 0.09);
    tone(t + 0.22, 0.45, 330, 262, 'sawtooth', 0.09);
  };

  // 도착: 빵빠레 + 환호
  S.finish = function () {
    if (!ready()) return;
    S.fanfare();
    setTimeout(function () { S.cheer(2.4); }, 900);
  };
})();
