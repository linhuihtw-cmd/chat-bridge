/* 聊天橋 推播 Service Worker v2（不依賴 Firebase SDK，直接處理 push 事件，較穩定） */
const APP_LINK = "https://linhuihtw-cmd.github.io/chat-bridge/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

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

    await self.registration.showNotification(title, {
      body: body,
      tag: "chat-bridge-" + Date.now(),
      data: { link: link },
      vibrate: [200, 100, 200]
    });

    // 使用者正開著聊天橋畫面時，不要讓通知卡在那裡
    try {
      const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const visible = wins.some((w) => w.visibilityState === "visible" && w.url.indexOf("/chat-bridge/") !== -1);
      if (visible) {
        setTimeout(async () => {
          const list = await self.registration.getNotifications();
          list.forEach((x) => x.close());
          updateBadge();
        }, 1500);
        return;
      }
    } catch (e) {}
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
