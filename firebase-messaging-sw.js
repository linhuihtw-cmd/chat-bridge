/* 聊天橋 推播 Service Worker（資料型訊息 + 未讀小圓點） */
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
const APP_LINK = "https://linhuihtw-cmd.github.io/chat-bridge/";

async function updateBadge() {
  try {
    const list = await self.registration.getNotifications();
    if (list.length > 0 && self.navigator.setAppBadge) await self.navigator.setAppBadge(list.length);
    else if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge();
  } catch (e) {}
}

messaging.onBackgroundMessage(async (payload) => {
  const n = payload.notification || null;
  const d = payload.data || {};
  if (!n) {
    await self.registration.showNotification(d.title || "🌉 雙語聊天橋", {
      body: d.body || "有新訊息",
      tag: "chat-bridge-msg-" + Date.now(),
      data: { link: d.link || APP_LINK }
    });
  }
  setTimeout(updateBadge, 300);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && (event.notification.data.link || (event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.notification && event.notification.data.FCM_MSG.notification.click_action))) || APP_LINK;
  event.waitUntil((async () => {
    const wins = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.indexOf("/chat-bridge/") !== -1 && "focus" in w) { await w.focus(); await updateBadge(); return; }
    }
    await clients.openWindow(link);
    await updateBadge();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "clearBadge") {
    event.waitUntil((async () => {
      const list = await self.registration.getNotifications();
      list.forEach((n) => n.close());
      try { if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch (e) {}
    })());
  }
});
