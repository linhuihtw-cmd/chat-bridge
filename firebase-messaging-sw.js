importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC6iQ2z5_zLokTrcfn2JevoM94ijxq2jGA",
  authDomain: "chat-bridge-f89ed.firebaseapp.com",
  databaseURL: "https://chat-bridge-f89ed-default-rtdb.firebaseio.com",
  projectId: "chat-bridge-f89ed",
  storageBucket: "chat-bridge-f89ed.firebasestorage.app",
  messagingSenderId: "622910981254",
  appId: "1:622910981254:web:1d9d07862a765c31f6fd07"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "🌉 雙語聊天橋有新訊息";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);

  if ("setAppBadge" in navigator) {
    self.registration.getNotifications().then((notifications) => {
      navigator.setAppBadge(notifications.length + 1).catch(() => {});
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("chat-bridge") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/chat-bridge/");
      }
    })
  );
});
