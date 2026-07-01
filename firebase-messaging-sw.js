importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC6iQ2z5_zLokTrcfn2JevoM94ijxq2jGA",
  authDomain: "chat-bridge-f89ed.firebaseapp.com",
  databaseURL: "https://chat-bridge-f89ed-default-rtdb.firebaseio.com",
  projectId: "chat-bridge-f89ed",
  storageBucket: "chat-bridge-f89ed.appspot.com",
  messagingSenderId: "622910981254",
  appId: "1:622910981254:web:your-app-id"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/chat-bridge/icon.png',
    badge: '/chat-bridge/icon.png',
    data: { url: 'https://linhuihtw-cmd.github.io/chat-bridge/' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
