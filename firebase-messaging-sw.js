/* 聊天橋 推播 Service Worker v4.1（不依賴 Firebase SDK，直接處理 push 事件，較穩定） */
const APP_LINK = "https://linhuihtw-cmd.github.io/chat-bridge/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil((async () => { await self.clients.claim(); await pushLog("SW v4.1 已啟用"); })()));

const LOG_KEY = "/chat-bridge/__push_log";
async function pushLog(text) {
  try {
    const cache = await caches.open("cb-debug");
    const old = await cache.match(LOG_KEY);
    let arr = [];
    if (old) { try { arr = await old.json(); } catch (e) { arr = []; } }
    arr.unshift(new Date().toLocaleTimeString("zh-TW", { hour12: false }) + " " + text);
    await cache.put(LOG_KEY, new Response(JSON.stringify(arr.slice(0, 8)), { headers: { "Content-Type": "application/json" } }));
  } catch (e) {}
}

async function updateBadge() {
  try {
    const list = await self.registration.getNotifications();
    if (list.length > 0 && self.navigator.setAppBadge) await self.navigator.setAppBadge(list.length);
    else if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge();
  } catch (e) {}
}

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let payload = {};
    try { payload = event.data ? event.data.json() : {}; } catch (e) { payload = {}; }
    const n = payload.notification || {};
    const d = payload.data || {};
    const title = d.title || n.title || "🌉 雙語聊天橋";
    const body = d.body || n.body || "有新訊息";
    const link = d.link || APP_LINK;

    await pushLog("收到推播：" + title + "／" + String(body).slice(0, 20));
    try {
      await self.registration.showNotification(title, {
        body: body,
        tag: "chat-bridge-" + Date.now(),
        data: { link: link },
        vibrate: [200, 100, 200]
      });
      const shown = await self.registration.getNotifications();
      await pushLog("已顯示通知（目前通知數 " + shown.length + "）");
    } catch (e) {
      await pushLog("顯示通知失敗：" + (e && e.message));
    }

    await updateBadge();
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || APP_LINK;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.indexOf("/chat-bridge/") !== -1 && "focus" in w) { await w.focus(); await updateBadge(); return; }
    }
    await self.clients.openWindow(link);
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
