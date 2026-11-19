// Service worker: guarda el juego en el dispositivo para que abra como app y funcione sin conexión
// (contra la máquina y modo clásico; el modo amigo sí necesita internet).
// Sube el número de versión cada vez que cambies archivos para forzar la actualización.
const CACHE = 'duelo-v11';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './fonts/rubik.woff2',
  './icons/logo.png',
  './icons/icon-192-v2.png',
  './icons/icon-512-v2.png',
  './icons/icon-maskable-512-v2.png',
  './icons/apple-touch-icon-v2.png'
];

self.addEventListener('install', e => {
  // Cada archivo se guarda por separado: si uno falla, los demás se guardan igual (antes, un fallo dejaba el juego sin modo offline)
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pide a internet con un límite de tiempo: con mala cobertura no se queda esperando para siempre
function fetchFast(req, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(req).then(res => { clearTimeout(t); resolve(res); }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // La página: primero internet (para tener siempre la última versión); si no hay o tarda, la guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetchFast(req, 3000)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
          return res;
        })
        .catch(() => caches.match('./index.html', { ignoreSearch: true }).then(hit => hit || caches.match('./')).then(hit => hit || fetch(req)))
    );
    return;
  }

  // Resto de archivos propios: primero la copia guardada (rápido), y se refresca en segundo plano.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
