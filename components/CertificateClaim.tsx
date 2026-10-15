"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import type { CertificateMissing } from "@/lib/certificate";

// Phase 5 — claim button for an eligible-but-unissued certificate.
// POSTs /api/certificate, then refreshes so the server-rendered page
// shows the issued certificate. 400 → shows what's still missing.
export default function CertificateClaim() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState<CertificateMissing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const claim = async () => {
    setLoading(true);
    setMissing(null);
    setError(null);
    try {
      const res = await fetch("/api/certificate", { method: "POST" });
      const data = (await res.json().catch(() => null)) as {
        certificate?: unknown;
        missing?: CertificateMissing[];
      } | null;
      if (res.ok && data?.certificate) {
        router.refresh();
        return;
      }
      if (data?.missing) setMissing(data.missing);
      else setError("সার্টিফিকেট নেওয়া যায়নি — একটু পরে আবার চেষ্টা করো।");
    } catch {
      setError("সার্টিফিকেট নেওয়া যায়নি — একটু পরে আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={claim}
        disabled={loading}
        className="font-bangla inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-navy/20 transition active:scale-95 disabled:opacity-60"
      >
        <Award className="h-5 w-5 text-sun" aria-hidden /> {loading ? "ইস্যু হচ্ছে…" : "Certificate নাও"}
      </button>
      {missing && missing.length > 0 && (
        <div className="font-bangla rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
          এখনো বাকি: {missing.map((m) => m.label).join(", ")}
        </div>
      )}
      {error && (
        <p className="font-bangla rounded-2xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-800">{error}</p>
      )}
    </div>
  );
}
