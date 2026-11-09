/* 나의 말씀노트 서비스워커 (이 앱 캐시 mynote- 만 지워요)
   CORE: 앱 화면·아이콘 (새 버전마다 새로 받음)
   STATIC: 성경·글꼴 (내용이 바뀌지 않으면 다시 받지 않음 · 글꼴은 파일 이름에 내용 표시가 붙어 있음) */
const CORE='mynote-core-v32-dd8f8296',STATIC='mynote-static-1f5f3545';
const COREF=["./", "index.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "maskable-512.png"],STATICF=["NotoSerifKR-500.f7bd1622.woff2", "NotoSerifKR-700.08911847.woff2", "pret-Regular.89f1d362.woff2", "pret-SemiBold.7a08d4b0.woff2"];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(CORE);await c.addAll(COREF.map(f=>new Request(f,{cache:'reload'})));
  const st=await caches.open(STATIC);
  await Promise.all(STATICF.map(async f=>{if(await st.match(f))return;const old=await caches.match(f,{ignoreSearch:true});if(old){await st.put(f,old);return}const r=await fetch(f,{cache:'reload'});if(r.ok)await st.put(f,r)}));
  await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>k.indexOf('mynote-')===0&&k!==CORE&&k!==STATIC).map(k=>caches.delete(k)));
  const st=await caches.open(STATIC);const want=new Set(STATICF.map(f=>new URL(f,self.registration.scope).href));for(const r of await st.keys())if(!want.has(r.url))await st.delete(r);
  await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(/version\.json$/.test(new URL(r.url).pathname))return;
  if(r.mode==='navigate'){e.respondWith(new Promise(res=>{let done=false;const fb=()=>{if(done)return;done=true;caches.match('index.html').then(m=>res(m||fetch(r)))};const t=setTimeout(fb,3000);
    fetch(r,{cache:'no-store'}).then(n=>{if(done)return;clearTimeout(t);
      /* 서버가 멈추거나(중지 안내·오류·다른 곳으로 넘김) 하면, 받아 둔 앱으로 열어요 */
      if(n&&n.ok&&n.type==='basic'&&!n.redirected){done=true;const c=n.clone();caches.open(CORE).then(ca=>ca.put('index.html',c));res(n)}else{caches.match('index.html').then(m=>{done=true;res(m||n)})}}).catch(()=>{clearTimeout(t);fb()})}));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).catch(()=>Response.error())))});
