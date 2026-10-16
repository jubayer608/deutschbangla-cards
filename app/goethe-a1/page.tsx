"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BookMarked,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Headphones,
  Info,
  Lightbulb,
  Mic,
  PenLine,
  ShieldCheck,
} from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26 },
  },
};

const modules = [
  {
    Icon: Headphones,
    name: "Hören",
    bangla: "শোনা",
    time: "প্রায় ২০ মিনিট",
    tasks: "দৈনন্দিন ছোট কথোপকথন, ঘোষণা (announcement) আর ফোন মেসেজ শুনে প্রশ্নের উত্তর।",
  },
  {
    Icon: BookOpen,
    name: "Lesen",
    bangla: "পড়া",
    time: "২৫ মিনিট",
    tasks: "ছোট নোটিশ, বিজ্ঞাপন, ব্যক্তিগত মেসেজ, সাইনবোর্ড / টাইমটেবিল পড়ে তথ্য খুঁজে বের করা।",
  },
  {
    Icon: PenLine,
    name: "Schreiben",
    bangla: "লেখা",
    time: "২০ মিনিট",
    tasks: "নিজের তথ্য দিয়ে একটা ফর্ম পূরণ করা + একটা ছোট ব্যক্তিগত মেসেজ লেখা।",
  },
  {
    Icon: Mic,
    name: "Sprechen",
    bangla: "বলা",
    time: "১৫ মিনিট",
    tasks: "গ্রুপ পরীক্ষা (সর্বোচ্চ ৪ জন), প্রস্তুতির সময় নেই। নিজের পরিচয়, প্রশ্ন করা/উত্তর দেওয়া, অনুরোধ করা আর উত্তর দেওয়া।",
  },
];

const grades = [
  { range: "৯০–১০০", label: "very good" },
  { range: "৮০–৮৯", label: "good" },
  { range: "৭০–৭৯", label: "satisfactory" },
  { range: "৬০–৬৯", label: "pass" },
  { range: "০–৫৯", label: "fail" },
];

const books = [
  {
    title: "Menschen A1",
    publisher: "Hueber",
    url: "https://shop.hueber.de/en/reihen-und-lehrwerke/menschen/menschen-sechsbandige-ausgabe/menschen-a1-1.html",
    note: "সবচেয়ে জনপ্রিয় কোর্সবুক — গল্প আর ছবি দিয়ে A1। ক্লাস আর নিজে পড়া, দুইটার জন্যই ভালো।",
    tag: "কোর্সবুক",
  },
  {
    title: "Schritte Plus Neu A1",
    publisher: "Hueber",
    url: "https://shop.hueber.de/en/schritte-plus-neu-1-2-kb-978-3-19-101081-2.html",
    note: "ইন্টিগ্রেশন কোর্সের স্ট্যান্ডার্ড বই — ধাপে ধাপে, অনেক এক্সারসাইজ। দৈনন্দিন জীবন আর কাজের ভাষা বেশি।",
    tag: "কোর্সবুক",
  },
  {
    title: "Netzwerk Neu A1",
    publisher: "Klett",
    url: "https://www.klett-sprachen.de/netzwerk-neu-a1/t-8/9783126071574",
    note: "তরুণদের জন্য আধুনিক বই — ভিডিও, অনলাইন এক্সারসাইজ, বাস্তব জীবনের ডায়ালগ।",
    tag: "কোর্সবুক",
  },
  {
    title: "Studio 21 A1",
    publisher: "Cornelsen",
    url: "https://www.cornelsen.de/reihen/studio-21-120002290000/grundstufe-120002290001/kaufen",
    note: "কোর্সবুক + অনুশীলন এক বইয়ে। শক্ত গ্রামার বেস বানাতে চাইলে ভালো পছন্দ।",
    tag: "কোর্সবুক",
  },
  {
    title: "Fit fürs Goethe-Zertifikat A1",
    publisher: "Hueber",
    url: "https://shop.hueber.de/en/fit-f-goethe-z-a1-lb-978-3-19-101872-6.html",
    note: "শুধু পরীক্ষার জন্য — চার মডিউলের ধাপে ধাপে ট্রেনিং + একটা মডেল টেস্ট।",
    tag: "পরীক্ষার প্রস্তুতি",
  },
  {
    title: "Mit Erfolg zum Goethe-Zertifikat A1",
    publisher: "Klett",
    url: "https://www.klett-sprachen.de/mit-erfolg-zum-goethe-zertifikat/r-1/174",
    note: "পরীক্ষার ফরম্যাটের বিস্তারিত ট্রেনিং + ব্যাখ্যাসহ মডেল টেস্ট। নিজে নিজে পড়ার জন্য ভালো।",
    tag: "পরীক্ষার প্রস্তুতি",
  },
  {
    title: "Prüfungstraining DaF A1",
    publisher: "Cornelsen",
    url: "https://www.cornelsen.de/produkte/pruefungstraining-daf-goethe-zertifikat-a1-fit-in-deutsch-1-uebungsbuch-mit-loesungen-und-audios-als-download-a1-9783061212605",
    note: "Cornelsen-এর A1 পরীক্ষা-প্রস্তুতির বইটা youth ভার্সন (Fit in Deutsch 1)-এর জন্য — বড়দের Start Deutsch 1-এর ফরম্যাটের সাথে মিলিয়ে দেখে নিও।",
    tag: "পরীক্ষার প্রস্তুতি",
  },
];

const plan = [
  {
    week: "সপ্তাহ ১",
    text: "Ulluk-এ Lektion ১–৪ শেষ করো + প্রতিটার Exam-এ পাস করো। প্রতিদিন ৩০ মিনিট — শব্দ + ফ্ল্যাশকার্ড।",
  },
  {
    week: "সপ্তাহ ২",
    text: "Lektion ৫–৮ শেষ করো + Exam। Hören-এর জন্য Nicos Weg / Easy German দিয়ে কান পাকাও।",
  },
  {
    week: "সপ্তাহ ৩",
    text: "Lektion ৯–১২ শেষ করো + Exam। Schreiben: প্রতিদিন একটা ছোট মেসেজ লেখো। Sprechen: জোরে জোরে নিজের পরিচয় বলো।",
  },
  {
    week: "সপ্তাহ ৪",
    text: "Goethe-এর অফিসিয়াল মডেল টেস্ট টাইম ধরে দাও (লিখিত ৬৫ মিনিট)। ভুলগুলো রিভিউ করো। পরীক্ষার আগের দিন হালকা রিভিশন + ভালো ঘুম।",
  },
];

export default function GoetheA1Page() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <p className="font-bangla inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
          Goethe-Zertifikat A1: Start Deutsch 1 <Globe className="h-4 w-4" aria-hidden />
        </p>
        <h1 className="section-heading text-3xl">Goethe A1 পরীক্ষা</h1>
        <p className="font-bangla mt-2 text-sm leading-relaxed text-slate-500">
          বড়দের জন্য অফিসিয়াল জার্মান A1 পরীক্ষা। এই সার্টিফিকেট দিয়ে তুমি
          প্রমাণ করতে পারো তোমার একদম বেসিক জার্মান আছে — যেমন au pair-এর
          আবেদন, পরিবার নিয়ে যাওয়ার (spouse) ভিসা, বা শুধু A1 শেষ করার
          অফিসিয়াল প্রমাণ হিসেবে।
        </p>
      </motion.div>

      {/* Exam format */}
      <motion.section variants={item} className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-teal" aria-hidden /> পরীক্ষার ফরম্যাট — ৪টা মডিউল
        </h2>
        <div className="flex flex-col gap-3">
          {modules.map((m) => (
            <div key={m.name} className="card rounded-3xl p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream ring-1 ring-teal/20">
                  <m.Icon className="h-6 w-6 text-teal" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-extrabold text-navy">{m.name}</span>
                    <span className="font-bangla text-sm font-bold text-slate-500">({m.bangla})</span>
                    <span className="badge inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-bold text-teal">
                      <Clock className="h-3 w-3" aria-hidden /> {m.time}
                    </span>
                  </p>
                  <p className="font-bangla mt-1.5 text-sm leading-relaxed text-slate-500">{m.tasks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="font-bangla rounded-3xl bg-sun/15 p-4 text-sm leading-relaxed text-navy ring-1 ring-sun/30">
          লিখিত পরীক্ষা (Hören + Lesen + Schreiben) একসাথে, মাঝে বিরতি ছাড়া{" "}
          <strong>মোট ৬৫ মিনিট</strong>। Sprechen আলাদা দিনেও হতে পারে — সেটা
          তোমার পরীক্ষা-কেন্দ্র জানাবে।
        </p>
      </motion.section>

      {/* Points & pass */}
      <motion.section variants={item} className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-teal" aria-hidden /> নম্বর আর পাস মার্ক
        </h2>
        <div className="card rounded-3xl p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-teal/20">
                <p className="text-2xl font-extrabold text-navy">১০০</p>
                <p className="font-bangla text-xs font-bold text-slate-500">মোট পয়েন্ট</p>
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-teal/20">
                <p className="text-2xl font-extrabold text-navy">৭৫</p>
                <p className="font-bangla text-xs font-bold text-slate-500">লিখিত পরীক্ষা</p>
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-teal/20">
                <p className="text-2xl font-extrabold text-navy">২৫</p>
                <p className="font-bangla text-xs font-bold text-slate-500">মৌখিক (Sprechen)</p>
              </div>
              <div className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-teal/20">
                <p className="text-2xl font-extrabold text-teal">৬০+</p>
                <p className="font-bangla text-xs font-bold text-slate-500">পাস করতে লাগবে</p>
              </div>
            </div>
            <p className="font-bangla text-sm leading-relaxed text-slate-600">
              পাস করতে হলে <strong>সবগুলো মডিউল দিতে হবে</strong> আর মোট{" "}
              <strong>কমপক্ষে ৬০ পয়েন্ট (৬০%)</strong> পেতে হবে। একটা মডিউল
              না দিলে বাকিগুলো ভালো হলেও পাস হবে না।
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-56 text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="font-bangla py-2 pr-3 font-bold text-navy">পয়েন্ট</th>
                    <th className="font-bangla py-2 font-bold text-navy">রেটিং</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.range} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 font-bold text-navy">{g.range}</td>
                      <td className="font-bangla py-2 text-slate-600">{g.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Exam day */}
      <motion.section variants={item} className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <CalendarCheck className="h-5 w-5 text-teal" aria-hidden /> পরীক্ষার দিন — কী নিবে, কী মনে রাখবে
        </h2>
        <div className="card rounded-3xl p-5">
          <ul className="font-bangla flex flex-col gap-2.5 text-sm leading-relaxed text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>
                <strong className="text-navy">আসল ছবিযুক্ত আইডি</strong> (পাসপোর্ট / NID) সাথে নাও —
                সাধারণত ফটোকপি চলে না।
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>
                <strong className="text-navy">আগে আগে পৌঁছাও</strong> — দেরি হলে পরীক্ষায় বসতে
                দেওয়া নাও হতে পারে।
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>
                <strong className="text-navy">ফোন / ইলেকট্রনিক ডিভাইস</strong> সাধারণত পরীক্ষার
                রুমে নেওয়া যায় না — কেন্দ্রের নিয়ম মেনে জমা দাও।
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>
                <strong className="text-navy">কলম / খাতা</strong> সাধারণত কেন্দ্র থেকেই দেওয়া
                হয় — নিজে নিয়ে যাওয়ার দরকার আছে কি না, কেন্দ্রের চিঠিতে দেখো।
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>
                <strong className="text-navy">রেজাল্টের সময়</strong> আর সার্টিফিকেট সংগ্রহের
                নিয়ম কেন্দ্র জানাবে।
              </span>
            </li>
          </ul>
          <p className="font-bangla mt-4 flex items-start gap-2 rounded-2xl bg-cream p-3 text-sm leading-relaxed text-navy ring-1 ring-teal/20">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            <span>
              প্রতিটা কেন্দ্রের নিয়ম একটু আলাদা হতে পারে — রেজিস্ট্রেশনের পর
              কেন্দ্র থেকে যে নির্দেশনা আসবে, <strong>সেটাই ফাইনাল</strong>।
              সন্দেহ হলে সরাসরি কেন্দ্রে জিজ্ঞেস করো।
            </span>
          </p>
        </div>
      </motion.section>

      {/* Prep plan */}
      <motion.section variants={item} className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-teal" aria-hidden /> প্রস্তুতি — এই সাইট দিয়ে ৪ সপ্তাহের প্ল্যান
        </h2>
        <div className="flex flex-col gap-3">
          {plan.map((p) => (
            <div key={p.week} className="card rounded-3xl p-5">
              <p className="font-bangla font-extrabold text-navy">{p.week}</p>
              <p className="font-bangla mt-1 text-sm leading-relaxed text-slate-600">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="card rounded-3xl p-5">
          <p className="font-bangla font-extrabold text-navy">পরীক্ষার হলে কাজে লাগবে এমন টিপস</p>
          <ul className="font-bangla mt-2 flex flex-col gap-2 text-sm leading-relaxed text-slate-600">
            <li>• <strong className="text-navy">Hören:</strong> অডিও শুরুর আগে প্রশ্নগুলো পড়ে নাও, keyword-এ কান দাও। কিছু অডিও একবারই বাজতে পারে — প্রথমবারই মন দিয়ে শোনো।</li>
            <li>• <strong className="text-navy">Lesen:</strong> আগে প্রশ্ন, পরে টেক্সট। সব শব্দ বুঝতে হবে না — উত্তর খুঁজে বের করাই কাজ।</li>
            <li>• <strong className="text-navy">Schreiben:</strong> ছোট, পরিষ্কার বাক্য লেখো। সব Noun-এর প্রথম অক্ষর বড় হাতের — এটাই সবচেয়ে কমন ভুল।</li>
            <li>• <strong className="text-navy">Sprechen:</strong> ধীরে, জোরে, পরিষ্কার করে বলো। না বুঝলে “Wie bitte?” বলতে লজ্জা নেই — এটাও জার্মান!</li>
          </ul>
        </div>
      </motion.section>

      {/* Books */}
      <motion.section variants={item} className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <BookMarked className="h-5 w-5 text-teal" aria-hidden /> বই — কোনটা কার জন্য
        </h2>
        <div className="flex flex-col gap-3">
          {books.map((b) => (
            <a
              key={b.title}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card card-hover group flex items-start gap-4 rounded-3xl p-5 transition active:scale-[0.99]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream ring-1 ring-teal/20">
                <BookOpen className="h-6 w-6 text-teal" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold text-navy">{b.title}</span>
                  <span className="badge rounded-full bg-teal/10 px-2 py-0.5 text-[11px] font-bold text-teal">
                    {b.publisher}
                  </span>
                  <span className="badge rounded-full bg-sun/30 px-2 py-0.5 text-[11px] font-bold text-navy">
                    {b.tag}
                  </span>
                </span>
                <span className="font-bangla mt-1.5 block text-sm leading-relaxed text-slate-500">
                  {b.note}
                </span>
                <span className="font-bangla mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal transition group-hover:gap-2">
                  প্রকাশকের পেজে দেখো <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </span>
            </a>
          ))}
        </div>
        <p className="font-bangla flex items-start gap-2 rounded-3xl bg-sun/15 p-4 text-sm leading-relaxed text-navy ring-1 ring-sun/30">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden />
          <span>
            <strong>একটা কথা:</strong> এই বইগুলোর ফ্রি PDF খুঁজো না — পাইরেটেড PDF
            বেআইনি, আর প্রায়ই ভুল / পুরোনো ভার্সন হয়। প্রকাশকের পেজ থেকে কিনো,
            বা লাইব্রেরিতে দেখো। নিচের ফ্রি জিনিসগুলোই অফিসিয়াল আর বৈধ।
          </span>
        </p>
      </motion.section>

      {/* Free legal practice */}
      <motion.section variants={item} className="flex flex-col gap-3">
        <h2 className="section-heading font-bangla inline-flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-teal" aria-hidden /> ফ্রি + বৈধ প্র্যাকটিস
        </h2>
        <div className="flex flex-col gap-3">
          <a
            href="https://www.goethe.de/ins/sg/en/m/kur/prf/gzsd1/ueb.html"
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover group flex items-start gap-4 rounded-3xl p-5 transition active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream ring-1 ring-teal/20">
              <FileText className="h-6 w-6 text-teal" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-base font-extrabold text-navy">Goethe-Institut — অফিসিয়াল মডেল টেস্ট</span>
              <span className="font-bangla mt-1 block text-sm leading-relaxed text-slate-500">
                Goethe নিজে ফ্রিতে দেয়: মডেল প্রশ্নপত্র + প্র্যাকটিস সেট, Hören-এর অডিও আর Sprechen-এর
                নমুনা ভিডিওসহ। আসল পরীক্ষার সবচেয়ে কাছের প্র্যাকটিস এটাই।
              </span>
              <span className="font-bangla mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal transition group-hover:gap-2">
                খুলে দেখো <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </span>
          </a>
          <a
            href="https://www.dw.com/en/learn-german/s-2469"
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover group flex items-start gap-4 rounded-3xl p-5 transition active:scale-[0.99]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream ring-1 ring-teal/20">
              <Headphones className="h-6 w-6 text-teal" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-base font-extrabold text-navy">DW Learn German — Nicos Weg (ফ্রি)</span>
              <span className="font-bangla mt-1 block text-sm leading-relaxed text-slate-500">
                Deutsche Welle-এর ফ্রি A1–B1 ভিডিও কোর্স। সাইটে গিয়ে Nicos Weg সিলেক্ট করো —
                গল্প দেখে দেখে Hören + শব্দভাণ্ডার পাকা হবে।
              </span>
              <span className="font-bangla mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal transition group-hover:gap-2">
                খুলে দেখো <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </span>
          </a>
        </div>
      </motion.section>

      {/* Sources */}
      <motion.section variants={item} className="card rounded-3xl p-5">
        <p className="font-bangla flex items-start gap-2 text-sm leading-relaxed text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
          <span>
            <strong className="text-navy">তথ্যসূত্র (অক্টোবর ২০২৬-এ যাচাই করা):</strong>{" "}
            পরীক্ষার সময় আর ফরম্যাট Goethe-Institut-এর অফিসিয়াল{" "}
            <a
              href="https://www.goethe.de/resources/files/pdf325/durchfuehrungsbestimmungen_a1_start_deutsch_1.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal underline underline-offset-2"
            >
              Durchführungsbestimmungen (PDF)
            </a>{" "}
            থেকে; নম্বর আর পাসের নিয়ম{" "}
            <a
              href="https://www.goethe.de/en/spr/prf/pes/pas1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal underline underline-offset-2"
            >
              Goethe-এর রেজাল্ট তথ্য পেজ
            </a>{" "}
            থেকে; পরীক্ষা সম্পর্কে সাধারণ তথ্য{" "}
            <a
              href="https://www.goethe.de/ins/be/en/m/spr/prf/gzsd1.cfm"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-teal underline underline-offset-2"
            >
              Goethe-Institut-এর পরীক্ষার পেজ
            </a>{" "}
            থেকে। নিয়ম বদলাতে পারে — পরীক্ষার আগে অফিসিয়াল পেজে আবার দেখে নিও।
          </span>
        </p>
      </motion.section>
    </motion.div>
  );
}
