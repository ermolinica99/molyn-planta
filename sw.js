// MOLYN · Planta — service worker
// Objetivo: que la app se pueda ABRIR aunque la tablet se quede sin red (la cola local ya
// guardaba el trabajo offline, pero si se recargaba la página sin conexión no llegaba a cargar).
//
// Estrategia "primero red": siempre se intenta descargar la versión más reciente; la copia
// guardada solo se usa si no hay conexión. Así las actualizaciones que se suben a GitHub se
// ven al momento, igual que sin service worker.
// Las llamadas a la base de datos (supabase.co) NO pasan por aquí: van directas a la red.

const CACHE = 'molyn-planta-v3';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './estandares/etiquetas.html',
  './estandares/turno-puesto.html',
  './estandares/consumo-nucleos.html',
  './estandares/recuento-stock.html',
  './molyn_icon_180.png',
  './molyn_icon_192.png',
  './molyn_icon_512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.min.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function guardable(req) {
  if (req.method !== 'GET') return false;
  const u = new URL(req.url);
  if (u.hostname.endsWith('supabase.co')) return false;   // datos: siempre en vivo
  return u.origin === self.location.origin ||
         u.hostname === 'cdn.jsdelivr.net' ||
         u.hostname === 'fonts.googleapis.com' ||
         u.hostname === 'fonts.gstatic.com';
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (!guardable(req)) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardada = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    const red = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {});
      return res;
    });
    if (!guardada) return red;
    red.catch(() => {}); // sin red: se sirve la copia guardada (abajo)
    // con red lenta (wifi de planta débil), no dejar la pantalla en blanco más de 6 s
    const espera = new Promise(r => setTimeout(() => r(null), 6000));
    try {
      const res = await Promise.race([red, espera]);
      return res || guardada;
    } catch (err) {
      return guardada;
    }
  })());
});
