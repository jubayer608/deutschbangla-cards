"use client";

import { useState } from "react";
import { Award, Check, Copy, Printer } from "lucide-react";

// Phase 5 — the issued A1 certificate (navy/gold premium design).
// Print: window.print + a print stylesheet that hides the site chrome
// (header/nav/footer) so only the certificate prints. Copy: puts the
// public verification link on the clipboard.
export interface CertificateData {
  code: string;
  name: string;
  issuedAt: string;
  criteria: {
    lessonsDone?: number;
    knownWords?: number;
    xp?: number;
    level?: number;
  };
}

export default function CertificateCard({ cert }: { cert: CertificateData }) {
  const [copied, setCopied] = useState(false);
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/certificate/verify?code=${cert.code}`
      : `/certificate/verify?code=${cert.code}`;
  const issued = new Date(cert.issuedAt).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the link is still visible below */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <style>{`@media print { header, nav, footer { display: none !important; } body { background: white !important; } }`}</style>
      <div className="rounded-3xl bg-navy p-2 shadow-xl shadow-navy/20">
        <div className="rounded-[20px] border-2 border-sun/70 bg-cream px-6 py-8 text-center">
          <img src="/logo.svg" alt="Ulluk" className="mx-auto h-14 w-auto" />
          <p className="font-bangla mt-4 text-xs font-bold uppercase tracking-[0.3em] text-teal">
            Ulluk · বাংলায় জার্মান শেখো
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-navy">A1 Certificate</h2>
          <p className="font-bangla mt-1 text-sm text-mist">German A1 — Course Completion</p>

          <div className="mx-auto my-6 h-px w-32 bg-sun/70" aria-hidden />

          <p className="font-bangla text-sm text-mist">এই সার্টিফিকেট দেওয়া হলো</p>
          <p className="mt-1 text-2xl font-extrabold text-navy sm:text-3xl">{cert.name}</p>

          <p className="font-bangla mx-auto mt-4 max-w-md text-sm text-slate-600">
            {cert.criteria.lessonsDone ?? 0}-টি লেসন, {cert.criteria.knownWords ?? 0}-টি শব্দ আর কুইজ
            শেষ করে A1 কোর্স সম্পন্ন করেছে।
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            <span className="text-mist">
              ইস্যু: <b className="text-navy">{issued}</b>
            </span>
            <span className="text-mist">
              যাচাইকরণ কোড: <b className="text-navy">{cert.code}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="font-bangla inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-extrabold text-white shadow transition active:scale-95"
        >
          <Printer className="h-4 w-4" aria-hidden /> প্রিন্ট করো
        </button>
        <button
          type="button"
          onClick={copy}
          className="font-bangla inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-navy shadow ring-1 ring-slate-200 transition active:scale-95"
        >
          {copied ? <Check className="h-4 w-4 text-teal" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "কপি হয়েছে!" : "যাচাইকরণ লিংক কপি করো"}
        </button>
      </div>
      <p className="font-bangla break-all text-center text-xs text-mist print:hidden">
        যাচাইকরণ লিংক: {verifyUrl}
      </p>
      <p className="hidden items-center justify-center gap-1 text-center text-xs text-mist print:flex">
        <Award className="h-4 w-4" aria-hidden /> {verifyUrl}
      </p>
    </div>
  );
}
