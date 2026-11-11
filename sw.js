// きょうのチェック：オフラインでも ひらけるようにする（同期の通信は さわらない）
var V = 'kyou-check-v2';
var ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(V).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== V; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if(req.mode === 'navigate' || /\.html$|\/$/.test(new URL(req.url).pathname)){
    // ページは ネット優先（あたらしい版を すぐ つかう）。つながらない時は 保存した版。
    e.respondWith(fetch(req).then(function(r){
      var copy = r.clone(); caches.open(V).then(function(c){ c.put('./index.html', copy); });
      return r;
    }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(m){ return m || fetch(req); }));
});
