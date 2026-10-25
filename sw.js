const CACHE = "ghardaia-v4";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
const AUDIO = ["ciel.mp3", "food-0.mp3", "food-1.mp3", "food-2.mp3", "food-3.mp3", "food-4.mp3", "food-5.mp3", "food-6.mp3", "food-7.mp3", "food-8.mp3", "food-9.mp3", "intro.mp3", "j1-0-k.mp3", "j1-0.mp3", "j1-1-k.mp3", "j1-1.mp3", "j1-2.mp3", "j1-3.mp3", "j1-4-k.mp3", "j1-4.mp3", "j1-5-k.mp3", "j1-5.mp3", "j2-0-k.mp3", "j2-0.mp3", "j2-1-k.mp3", "j2-1.mp3", "j2-2.mp3", "j2-3.mp3", "j2-4-k.mp3", "j2-4.mp3", "j2-5-k.mp3", "j2-5.mp3", "j2-6.mp3", "j3-0.mp3", "j3-1.mp3", "j3-2.mp3", "j3-3.mp3", "j3-4.mp3", "must-0.mp3", "must-1.mp3", "must-2.mp3", "must-3.mp3", "must-4.mp3", "must-5.mp3", "must-6.mp3", "soc-0.mp3", "soc-1.mp3", "soc-2.mp3", "soc-3.mp3", "soc-4.mp3", "soc-5.mp3", "sv-0.mp3", "sv-1.mp3", "sv-2.mp3", "sv-3.mp3", "sv-4.mp3", "sv-5.mp3", "sv-6.mp3", "sv-7.mp3", "sv-8.mp3", "w-beniisguen-0.mp3", "w-beniisguen-1.mp3", "w-beniisguen-2.mp3", "w-beniisguen-3.mp3", "w-beniisguen-4.mp3", "w-ghardaia-0.mp3", "w-ghardaia-1.mp3", "w-ghardaia-2.mp3", "w-ghardaia-3.mp3", "w-ghardaia-4.mp3"];
const IMGS = ["https://commons.wikimedia.org/wiki/Special:FilePath/Ksar%20Ghardaia%20place%20march%C3%A9%201.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Vue%20Ghardaia%20Melika.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Ksar%20de%20Beni%20Isguen.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Rue%20Ksar%20Beni%20Isguen.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Remparts%20au%20crepuscole.JPG?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/March%C3%A9%20Lalla%20Achou%2001.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Place%20Lala%20Achou.%20March%C3%A9%20de%20Beni%20Isguen%20-%20Ghardaia%20-%20Alg%C3%A9rie.JPG?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Palmeraie%20Beni%20Isguen.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%A9ni%20Isguen%2C%20le%20barrage.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%A9ni%20Isguen%2C%20maison%20de%20la%20palmeraie.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Mausoleum%20of%20Cheikh%20Sidi%20Brahim%2001.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Ksar%20El%20Atteuf%2001.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/El-Atteuf%20Ghardaia%20Algeria.jpg?width=900", "https://commons.wikimedia.org/wiki/Special:FilePath/Commune%20de%20Sebseb%20%D8%A8%D9%84%D8%AF%D9%8A%D8%A9%20%D8%B3%D8%A8%D8%B3%D8%A8%20%D8%AA%D8%B4%D9%83%D8%B1%D9%83%D9%85%20-%20panoramio.jpg?width=900"];
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    // Audio et photos : un à un, sans bloquer l'installation si l'un échoue
    await Promise.all(AUDIO.map(a => c.add("./audio/" + a).catch(() => {})));
    await Promise.all(IMGS.map(u => fetch(u, {mode: "no-cors"}).then(r => c.put(u, r)).catch(() => {})));
    self.skipWaiting();
  })());
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
async function rangeResponse(req, full) {
  const range = req.headers.get("range");
  if (!range) return full;
  const buf = await full.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {status: 206, headers: {"Content-Type": "audio/mpeg", "Content-Range": `bytes ${start}-${end}/${buf.byteLength}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes"}});
}
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("./index.html", c)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.pathname.includes("/audio/")) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      let full = await c.match(url.pathname.replace(/^.*\/audio\//, "./audio/"), {ignoreSearch: true}) || await c.match(url.href);
      if (!full) { try { const r = await fetch(url.href); if (r.ok) { await c.put(url.href, r.clone()); full = r; } else return r; } catch (_) { return Response.error(); } }
      return rangeResponse(e.request, full.clone());
    })());
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => hit)));
});
