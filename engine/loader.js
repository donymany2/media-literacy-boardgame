/*
 * 시작 — 설정과 링크 값을 읽고, 카드팩 파일을 불러온 뒤 화면을 띄웁니다.
 * <script> 태그로 불러오므로 서버 없이 index.html을 바로 열어도 동작합니다.
 */
(function () {
  'use strict';

  var config = window.GAME_CONFIG;
  var params = new URLSearchParams(location.search);

  var packId = params.get('pack') || config.pack;
  if (!/^[a-z0-9-]+$/.test(packId)) packId = config.pack;   // 폴더 이름 외의 값은 무시

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error(src + ' 파일을 불러오지 못했습니다.')); };
      document.body.appendChild(s);
    });
  }

  BG.PACK_FILES.reduce(function (p, file) {
    return p.then(function () { return loadScript('packs/' + packId + '/' + file); });
  }, Promise.resolve())
    .then(function () {
      var pack = BG.packs[packId];
      var warnings = BG.validatePack(pack, config.modes.map(function (m) { return m.size; }));
      if (warnings.length) console.warn('[카드팩 검사]\n- ' + warnings.join('\n- '));
      BG.UI.start(config, pack, {
        mode: params.get('mode'),
        tokens: params.get('tokens')
      });
    })
    .catch(function (err) {
      document.getElementById('app').innerHTML =
        '<div class="panel error"><h2>카드팩을 불러오지 못했어요</h2><p>' + err.message + '</p></div>';
    });
})();
