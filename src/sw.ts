/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: { url: string; revision: string | null }[];
};

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Accounts
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/accounts"),
  new NetworkFirst({
    cacheName: "accounts-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 })],
  })
);

// Expenses
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/expenses"),
  new NetworkFirst({
    cacheName: "expenses-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 86400 })],
  })
);

// Incomes
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/incomes"),
  new NetworkFirst({
    cacheName: "incomes-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 86400 })],
  })
);

// Google Fonts
registerRoute(
  ({ url }) => url.hostname === "fonts.googleapis.com",
  new StaleWhileRevalidate({ cacheName: "google-fonts-stylesheets" })
);
registerRoute(
  ({ url }) => url.hostname === "fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 86400 })],
  })
);

// ── Web Share Target ──────────────────────────────────────────────────────────
// Android share sheet POSTs to /share-target; we cache the image then redirect
// the app to /share-target so React can read it and call Gemini.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "POST" && url.pathname === "/share-target") {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get("receipt") as File | null;
  const title = (formData.get("title") as string | null) ?? "";
  const text = (formData.get("text") as string | null) ?? "";

  const cache = await caches.open("share-target-cache");

  if (file && file.size > 0) {
    await cache.put(
      "/share-target-receipt",
      new Response(file, {
        headers: {
          "Content-Type": file.type || "image/jpeg",
          "Content-Length": String(file.size),
        },
      })
    );
  } else {
    await cache.delete("/share-target-receipt");
  }

  await cache.put(
    "/share-target-meta",
    new Response(JSON.stringify({ hasImage: !!file && file.size > 0, title, text }), {
      headers: { "Content-Type": "application/json" },
    })
  );

  return Response.redirect("/share-target", 303);
}
