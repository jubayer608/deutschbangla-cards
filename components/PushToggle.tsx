"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

// Phase 3 — Web Push opt-in toggle (on the /notifications page).
// - Registers /sw.js only when the user opts in (no auto-registration).
// - Subscribes with the public VAPID key, sends the subscription to
//   POST /api/push/subscribe; unsubscribe removes the browser
//   subscription AND deletes the server row.
// - Returns null when VAPID is not configured (no dead UI).

type Status =
  | "loading"
  | "unsupported"
  | "denied"
  | "subscribed"
  | "unsubscribed"
  | "error";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export default function PushToggle() {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "subscribed" : "unsubscribed");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function subscribe() {
    setBusy(true);
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        setMessage("ব্রাউজার থেকে নোটিফিকেশন অনুমতি দেওয়া হয়নি।");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        await sub.unsubscribe().catch(() => {});
        setMessage("সাবস্ক্রাইব করা যায়নি। আবার চেষ্টা করো।");
        setStatus("error");
        return;
      }
      setStatus("subscribed");
      setMessage("পুশ নোটিফিকেশন চালু হয়েছে!");
    } catch {
      setMessage("সাবস্ক্রাইব করা যায়নি। আবার চেষ্টা করো।");
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setMessage("");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      const endpoint = sub?.endpoint ?? "";
      if (sub) await sub.unsubscribe();
      if (endpoint) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setStatus("unsubscribed");
      setMessage("পুশ নোটিফিকেশন বন্ধ হয়েছে।");
    } catch {
      setMessage("আনসাবস্ক্রাইব করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setBusy(false);
    }
  }

  // No VAPID key → push isn't configured; render nothing, not a dead toggle.
  if (!vapidKey) return null;
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-mist">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span className="font-bangla">পুশ স্ট্যাটাস দেখা হচ্ছে…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {status === "subscribed" ? (
            <Bell className="h-5 w-5 shrink-0 text-teal" aria-hidden />
          ) : (
            <BellOff className="h-5 w-5 shrink-0 text-mist" aria-hidden />
          )}
          <div>
            <p className="font-bangla text-sm font-extrabold text-navy">
              পুশ নোটিফিকেশন
            </p>
            <p className="font-bangla text-xs text-mist">
              {status === "subscribed" &&
                "চালু আছে — নতুন ফলোয়ার আর ব্যাজের খবর ব্রাউজারে আসবে।"}
              {status === "unsubscribed" &&
                "বন্ধ আছে — চালু করলে ব্রাউজারে নোটিফিকেশন আসবে।"}
              {status === "denied" &&
                "ব্রাউজার অনুমতি দেয়নি — ব্রাউজার সেটিংস থেকে অনুমতি দিতে হবে।"}
              {status === "unsupported" &&
                "এই ব্রাউজার পুশ নোটিফিকেশন সাপোর্ট করে না।"}
              {status === "error" && "স্ট্যাটাস জানা যায়নি।"}
            </p>
          </div>
        </div>
        {(status === "subscribed" || status === "unsubscribed") && (
          <button
            type="button"
            onClick={status === "subscribed" ? unsubscribe : subscribe}
            disabled={busy}
            aria-pressed={status === "subscribed"}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${
              status === "subscribed"
                ? "bg-teal text-white hover:bg-teal/90"
                : "bg-navy text-white hover:bg-navy/90"
            }`}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : status === "subscribed" ? (
              "বন্ধ করো"
            ) : (
              "চালু করো"
            )}
          </button>
        )}
      </div>
      {message && (
        <p className="font-bangla text-xs font-bold text-teal">{message}</p>
      )}
    </div>
  );
}
