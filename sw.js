// 뚝딱카드 서비스워커 — 버전은 build_pwa.py가 넣음
const CACHE='ttukttak-card-1.2.1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
// 설치 시 브라우저 HTTP 캐시를 건너뜀 (깃허브 max-age=600 때문에 옛 파일이 저장되는 것 방지)
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ttukttak-card-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
const put=(req,res)=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c))};
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(url.pathname.endsWith('/version.json'))return;  // 항상 인터넷
  if(/\.(png|webmanifest)$/.test(url.pathname)){  // 아이콘·manifest는 인터넷 먼저
    e.respondWith(fetch(req,{cache:'no-cache'}).then(res=>{if(res.ok)put(req,res);return res}).catch(()=>caches.match(req,{ignoreSearch:true})));return}
  if(req.mode==='navigate'){  // 화면: 인터넷 먼저, 3초·오류·넘김이면 저장본
    e.respondWith(new Promise(ok=>{let done=false;const fb=()=>{if(done)return;done=true;caches.match('./index.html').then(r=>ok(r||fetch(req)))};const t=setTimeout(fb,3000);
      fetch(req,{cache:'no-cache'}).then(res=>{clearTimeout(t);if(done)return;if(res.ok&&!res.redirected&&res.type==='basic'){done=true;caches.open(CACHE).then(x=>x.put('./index.html',res.clone()));ok(res)}else fb()}).catch(()=>{clearTimeout(t);fb()})}));return}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok&&res.type==='basic')put(req,res);return res})))});
