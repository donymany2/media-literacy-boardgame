/*
 * 학급 함께하기 — 기기끼리 실시간으로 게임 화면을 맞추는 통신
 *
 * 구조
 *   선생님 화면(전자칠판) = 방장. 게임 규칙을 계산하고 "지금 화면 상태"를 방에 올림
 *   모둠 태블릿           = 방에 올라온 상태를 받아 같은 화면을 보여 주고,
 *                           자기 모둠 차례에만 버튼(주사위, 선택지)을 눌러 선생님 화면에 전달
 *
 * 통신 방식
 *   mqtt  : 공개 MQTT 중계 서버(무료, 로그인 없음)를 거쳐 인터넷으로 연결 — 수업용 기본값
 *   local : 같은 브라우저의 여러 탭끼리만 연결(BroadcastChannel) — 한 컴퓨터에서 시험할 때
 *
 * 방 번호 5자리: 첫 자리는 중계 서버 번호(1~8), 9는 local. 나머지 4자리는 무작위
 * 주고받는 내용: 모둠 번호, 말 위치, 점수, 카드 번호와 선택 — 이름 등 개인정보 없음
 */
(function () {
  'use strict';

  var BG = window.BG;
  var Net = BG.Net = {};
  var PREFIX = 'updownroad/v1/';
  var LOCAL_DIGIT = '9';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[data-src="' + src + '"]')) return resolve();
      var s = document.createElement('script');
      s.src = src;
      s.setAttribute('data-src', src);
      s.onload = resolve;
      s.onerror = function () { reject(new Error('통신 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.')); };
      document.head.appendChild(s);
    });
  }

  function randomDigits(n) {
    var out = '';
    for (var i = 0; i < n; i++) out += Math.floor(Math.random() * 10);
    return out.charAt(0) === '0' ? '1' + out.slice(1) : out;
  }

  Net.clientId = function () {
    return 'c' + Math.random().toString(36).slice(2, 10);
  };

  /* ---------------- local (BroadcastChannel) ---------------- */
  function LocalConn(code, role) {
    var self = this;
    this.code = code;
    this.role = role;
    this.handlers = { state: [], intent: [], status: [] };
    this.last = null;
    this.ch = new BroadcastChannel('updownroad-' + code);
    this.ch.onmessage = function (e) {
      var m = e.data || {};
      if (m.type === 'state' && role !== 'host') self.emit('state', m.data);
      if (m.type === 'intent' && role === 'host') self.emit('intent', m.data);
      if (m.type === 'need-state' && role === 'host' && self.last) self.ch.postMessage({ type: 'state', data: self.last });
    };
    setTimeout(function () {
      self.emit('status', 'connected');
      if (role !== 'host') self.ch.postMessage({ type: 'need-state' });
    }, 0);
  }
  LocalConn.prototype.on = function (ev, fn) { this.handlers[ev].push(fn); };
  LocalConn.prototype.emit = function (ev, data) { this.handlers[ev].forEach(function (fn) { fn(data); }); };
  LocalConn.prototype.publishState = function (state) { this.last = state; this.ch.postMessage({ type: 'state', data: state }); };
  LocalConn.prototype.sendIntent = function (intent) { this.ch.postMessage({ type: 'intent', data: intent }); };
  LocalConn.prototype.clearRoom = function () { this.last = null; };
  LocalConn.prototype.close = function () { this.ch.close(); };

  /* ---------------- mqtt ---------------- */
  function MqttConn(client, code, role) {
    var self = this;
    this.client = client;
    this.code = code;
    this.role = role;
    this.handlers = { state: [], intent: [], status: [] };
    this.stateTopic = PREFIX + code + '/state';
    this.intentTopic = PREFIX + code + '/intent';
    client.on('message', function (topic, payload) {
      var text = payload && payload.toString();
      if (!text) return;
      var data;
      try { data = JSON.parse(text); } catch (e) { return; }
      if (topic === self.stateTopic && role !== 'host') self.emit('state', data);
      if (topic === self.intentTopic && role === 'host') self.emit('intent', data);
    });
    client.on('connect', function () { self.subscribe(); self.emit('status', 'connected'); });
    client.on('reconnect', function () { self.emit('status', 'reconnecting'); });
    client.on('offline', function () { self.emit('status', 'offline'); });
    this.subscribe();
    setTimeout(function () { if (client.connected) self.emit('status', 'connected'); }, 0);
  }
  MqttConn.prototype.subscribe = function () {
    this.client.subscribe(this.role === 'host' ? this.intentTopic : this.stateTopic, { qos: 1 });
  };
  MqttConn.prototype.on = LocalConn.prototype.on;
  MqttConn.prototype.emit = LocalConn.prototype.emit;
  // 방 상태는 '보관(retain)'해 두어 나중에 들어온 태블릿도 바로 지금 화면을 받음
  MqttConn.prototype.publishState = function (state) {
    this.client.publish(this.stateTopic, JSON.stringify(state), { qos: 1, retain: true });
  };
  MqttConn.prototype.sendIntent = function (intent) {
    this.client.publish(this.intentTopic, JSON.stringify(intent), { qos: 1 });
  };
  // 방을 닫을 때 보관된 상태를 지움
  MqttConn.prototype.clearRoom = function () {
    this.client.publish(this.stateTopic, '', { qos: 1, retain: true });
  };
  MqttConn.prototype.close = function () { try { this.client.end(true); } catch (e) { /* 무시 */ } };

  function connectBroker(cfg, broker, timeoutMs) {
    return loadScript(cfg.mqttLib).then(function () {
      return new Promise(function (resolve, reject) {
        var opts = {
          clientId: 'udr_' + Math.random().toString(36).slice(2, 12),
          clean: true,
          connectTimeout: timeoutMs,
          reconnectPeriod: 2000,
          keepalive: 30
        };
        if (broker.username) { opts.username = broker.username; opts.password = broker.password || ''; }
        var client = window.mqtt.connect(broker.url, opts);
        var done = false;
        var timer = setTimeout(function () {
          if (done) return;
          done = true;
          client.end(true);
          reject(new Error('timeout'));
        }, timeoutMs + 500);
        client.once('connect', function () {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(client);
        });
        client.on('error', function () { /* 재연결은 mqtt.js가 알아서 시도 */ });
      });
    });
  }

  // 방 번호가 이미 쓰이는지(최근 3시간 안에 올라온 상태가 있는지) 확인
  function roomBusy(client, code) {
    return new Promise(function (resolve) {
      var topic = PREFIX + code + '/state';
      var busy = false;
      function onMsg(t, payload) {
        if (t !== topic) return;
        try {
          var d = JSON.parse(payload.toString());
          busy = !!d && Date.now() - (d.ts || 0) < 3 * 3600 * 1000;
        } catch (e) { busy = false; }
      }
      client.on('message', onMsg);
      client.subscribe(topic, { qos: 0 });
      setTimeout(function () {
        client.unsubscribe(topic);
        client.removeListener('message', onMsg);
        resolve(busy);
      }, 900);
    });
  }

  /* ---------------- 공개 함수 ---------------- */

  // 선생님: 새 방 만들기. 중계 서버를 차례로 시도해 처음 연결되는 곳을 씀
  Net.createRoom = function (cfg, opts) {
    opts = opts || {};
    if (opts.local) {
      var code = LOCAL_DIGIT + randomDigits(4);
      return Promise.resolve(new LocalConn(code, 'host'));
    }
    var brokers = cfg.brokers || [];
    var i = 0;
    function next() {
      if (i >= brokers.length) return Promise.reject(new Error('중계 서버에 연결하지 못했어요. 학교 인터넷에서 막혀 있을 수 있어요.'));
      var idx = i++;
      if (opts.onTry) opts.onTry(idx, brokers[idx]);
      return connectBroker(cfg, brokers[idx], cfg.connectTimeoutMs || 7000).then(function (client) {
        function pick(tries) {
          var code = String(idx + 1) + randomDigits(4);
          return roomBusy(client, code).then(function (busy) {
            if (busy && tries < 5) return pick(tries + 1);
            return new MqttConn(client, code, 'host');
          });
        }
        return pick(0);
      }, next);
    }
    return next();
  };

  // 선생님: 이어하기(같은 방 번호로 다시 연결)
  Net.reopenRoom = function (cfg, code) {
    return Net.connect(cfg, code, 'host');
  };

  // 모둠 태블릿: 방 번호로 참가
  Net.joinRoom = function (cfg, code) {
    return Net.connect(cfg, code, 'team');
  };

  Net.connect = function (cfg, code, role) {
    code = String(code || '').replace(/\D/g, '');
    if (code.length !== 5) return Promise.reject(new Error('방 번호는 숫자 5자리예요.'));
    if (code.charAt(0) === LOCAL_DIGIT) return Promise.resolve(new LocalConn(code, role));
    var broker = (cfg.brokers || [])[+code.charAt(0) - 1];
    if (!broker) return Promise.reject(new Error('방 번호를 다시 확인해 주세요.'));
    return connectBroker(cfg, broker, cfg.connectTimeoutMs || 7000).then(function (client) {
      return new MqttConn(client, code, role);
    }, function () {
      throw new Error('방에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.');
    });
  };
})();
