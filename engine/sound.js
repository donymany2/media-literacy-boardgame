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

  // 업로드(지름길): 올라가는 '슈웅' + 반짝 화음
  S.up = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    tone(t, 0.45, 260, 1400, 'sawtooth', 0.08);
    [523, 659, 784, 1047].forEach(function (f, i) { tone(t + 0.08 + i * 0.07, 0.22, f, f, 'triangle', 0.22); });
  };

  // 다운로드(미끄럼틀): 내려가는 미끄럼 휘파람
  S.down = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    var o = tone(t, 0.7, 1100, 180, 'triangle', 0.25);
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 9; lg.gain.value = 40;
    lfo.connect(lg); lg.connect(o.frequency);
    lfo.start(t); lfo.stop(t + 0.72);
    tone(t + 0.68, 0.12, 140, 90, 'sine', 0.35);
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

  // 도착: 빰빠밤
  S.finish = function () {
    if (!ready()) return;
    var t = ctx.currentTime;
    [523, 659, 784].forEach(function (f, i) { tone(t + i * 0.12, 0.14, f, f, 'square', 0.12); });
    [523, 659, 784, 1047].forEach(function (f) { tone(t + 0.4, 0.8, f, f, 'triangle', 0.14); });
  };
})();
