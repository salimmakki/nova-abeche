export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => {
          console.log('NOVA PWA: Service Worker enregistré', reg.scope);
          reg.onupdatefound = () => {
            const worker = reg.installing;
            worker.onstatechange = () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('NOVA PWA: Nouvelle version disponible');
              }
            };
          };
        })
        .catch(err => console.log('NOVA PWA: Erreur SW:', err));
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => reg.unregister());
  }
}
