/* Research with Mufti Hassan — Firebase Cloud Messaging service worker.
   AT LAUNCH: paste the SAME Firebase web config here (public identifiers only —
   real security comes from firestore.rules), exactly like the reference app.
   Until then this file stays inert on purpose: it never guesses a config. */
importScripts('assets/vendor/firebase-app-compat.js');
importScripts('assets/vendor/firebase-messaging-compat.js');

var FCM_CONFIG = { apiKey: "AIzaSyD2K-i91XTZbbjqgMrUDTgs6rhDWGm_MSY", authDomain: "research-with-mufti-hassan.firebaseapp.com", projectId: "research-with-mufti-hassan", storageBucket: "research-with-mufti-hassan.firebasestorage.app", messagingSenderId: "563333368797", appId: "1:563333368797:web:16ce8078466d719b80c434" }; // LIVE config (set 2026-10-23)

if (FCM_CONFIG) {
  firebase.initializeApp(FCM_CONFIG);
  var messaging = firebase.messaging();
  messaging.onBackgroundMessage(function (payload) {
    var n = (payload && payload.notification) || {};
    var d = (payload && payload.data) || {};
    var title = n.title || d.title || 'Research with Mufti Hassan — new update';
    var options = {
      body: n.body || d.body || '',
      icon: 'https://research-with-mufti-hassan.web.app/assets/icon-192.png',
      dir: 'ltr',
      lang: 'en'
    };
    return self.registration.showNotification(title, options);
  });
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) { if ('focus' in list[i]) return list[i].focus(); }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
