"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useInView,
  animate,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FileSignature,
  FileText,
  Footprints,
  GraduationCap,
  HandHeart,
  HeartPulse,
  IdCard,
  Info,
  Landmark,
  MessagesSquare,
  Plane,
  Play,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wallet,
} from "lucide-react";

/* ---------------- reveal presets ---------------- */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
  },
};

/* ---------------- animated counter ---------------- */
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

function SectionHeading({
  kicker,
  title,
  sub,
  Icon,
}: {
  kicker: string;
  title: string;
  sub: string;
  Icon: typeof Briefcase;
}) {
  return (
    <motion.div variants={item} className="mx-auto mb-8 max-w-2xl text-center">
      <span className="badge font-bangla inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-xs text-teal">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {kicker}
      </span>
      <h2 className="font-bangla mt-3 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
        {title}
      </h2>
      <p className="font-bangla mt-2 text-sm leading-relaxed text-slate-500">
        {sub}
      </p>
    </motion.div>
  );
}

/* ============================ HERO ============================ */
function Hero() {
  return (
    <section className="bg-cream relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 pb-14 pt-12 sm:pt-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          <motion.span
            variants={item}
            className="font-bangla inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold text-teal shadow-sm ring-1 ring-teal/30 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-navy" aria-hidden />
            Opportunities with German
          </motion.span>
          <motion.h1
            variants={item}
            className="font-bangla mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl"
          >
            <span className="text-teal">জার্মান শিখলেই</span>
            <br />
            <span className="text-navy">দরজা খুলে যায়</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="font-bangla mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600"
          >
            জার্মান শিখে বাংলাদেশ থেকে জার্মানিতে পড়া, ট্রেনিং আর কাজ — কোন
            পথে কী লাগে, কত খরচ, কত সময়: সবকিছু এক পাতায়, সহজ বাংলায়।
          </motion.p>
          <motion.div
            variants={item}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#roadmap"
              className="btn btn-primary font-bangla inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm"
            >
              রোডম্যাপ দেখো <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/lektionen"
              className="font-bangla inline-flex items-center gap-2 rounded-full border border-teal/30 bg-white/80 px-6 py-3 text-sm font-bold text-navy shadow-sm backdrop-blur transition hover:border-teal/40 hover:bg-white active:scale-95"
            >
              A1 থেকে শুরু করো <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>

          {/* stat cards */}
          <motion.div
            variants={container}
            className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              {
                Icon: Wallet,
                value: (
                  <AnimatedNumber value={724} prefix="~€" suffix="/মাস" />
                ),
                label: "ন্যূনতম ট্রেনিং বেতন (প্রথম বছর)",
              },
              {
                Icon: Clock,
                value: <span>২–৩.৫ বছর</span>,
                label: "Ausbildung-এর সময়কাল",
              },
              {
                Icon: Rocket,
                value: <span>১৮–৩০ মাস</span>,
                label: "শূন্য থেকে জার্মানি পৌঁছানো",
              },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={item}
                whileHover={{ y: -5, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="card card-hover rounded-3xl p-4 text-center"
              >
                <s.Icon
                  className="mx-auto h-5 w-5 text-teal"
                  aria-hidden
                />
                <p className="mt-2 text-2xl font-black tracking-tight text-navy">
                  {s.value}
                </p>
                <p className="font-bangla mt-1 text-xs font-semibold text-slate-500">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <motion.p
            variants={item}
            className="font-bangla mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-mist"
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
            সব অংক আনুমানিক — শেষ যাচাই: অক্টোবর ২০২৬
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ AUSBILDUNG ============================ */
const requirements = [
  {
    Icon: BadgeCheck,
    title: "জার্মান B1 সার্টিফিকেট",
    text: "Goethe / telc / ÖSD — নার্সিং ও স্বাস্থ্যসেবায় B2 লাগে",
  },
  {
    Icon: FileText,
    title: "HSC / ক্লাস ১২ সার্টিফিকেট",
    text: "বোর্ড সার্টিফিকেটের সার্টিফাইড জার্মান অনুবাদ",
  },
  {
    Icon: FileSignature,
    title: "Ausbildungsvertrag (ট্রেনিং চুক্তি)",
    text: "সার্টিফাইড কোম্পানির কাছ থেকে স্বাক্ষরিত চুক্তি",
  },
  {
    Icon: ShieldCheck,
    title: "স্বাস্থ্য বীমা + ভিসা",
    text: "জার্মান স্বাস্থ্য বীমা ও §16a AufenthG ভিসা",
  },
];

function Ausbildung() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionHeading
          kicker="সবচেয়ে জনপ্রিয় পথ"
          title="Ausbildung কী?"
          sub="জার্মানির ডুয়াল ভোকেশনাল ট্রেনিং — বাংলাদেশিদের জন্য সবচেয়ে বাস্তবসম্মত পথ।"
          Icon={Briefcase}
        />

        {/* what */}
        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative overflow-hidden rounded-[2rem] bg-navy p-6 text-white shadow-xl shadow-navy/10 sm:p-8"
        >
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Building2 className="h-7 w-7 text-white" aria-hidden />
            </span>
            <div>
              <h3 className="font-bangla text-xl font-extrabold">
                কোম্পানিতে চাকরি + স্কুল — একসাথে
              </h3>
              <p className="font-bangla mt-2 text-sm leading-relaxed text-cream">
                Ausbildung-এ তুমি একই সাথে একটা কোম্পানিতে ট্রেনি হিসেবে কাজ
                করবে আর ভোকেশনাল স্কুলে পড়বে। সময়কাল{" "}
                <strong className="font-extrabold">২ থেকে ৩.৫ বছর</strong> —
                টিউশন ফি নেই, বরং কোম্পানি তোমাকে{" "}
                <strong className="font-extrabold">
                  প্রতি মাসে বেতন দেবে
                </strong>
                । পড়াশোনা শেষে সেই কোম্পানিতেই চাকরি পাওয়ার সুযোগ সবচেয়ে
                বেশি।
              </p>
            </div>
          </div>
        </motion.div>

        {/* requirements */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {requirements.map((r) => (
            <motion.div
              key={r.title}
              variants={item}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="card card-hover rounded-3xl p-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cream ring-1 ring-teal/20">
                <r.Icon className="h-5 w-5 text-teal" aria-hidden />
              </span>
              <h4 className="font-bangla mt-3 text-sm font-extrabold text-navy">
                {r.title}
              </h4>
              <p className="font-bangla mt-1 text-xs leading-relaxed text-slate-500">
                {r.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* money + after */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <motion.div
            variants={item}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="overflow-hidden rounded-3xl border border-sun/40 bg-gradient-to-br from-sun/15 to-white p-6"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-navy" aria-hidden />
              <h3 className="font-bangla text-lg font-extrabold text-navy">
                টাকার হিসাব (আনুমানিক)
              </h3>
            </div>
            <ul className="font-bangla mt-3 space-y-2.5 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                  aria-hidden
                />
                আইনগত ন্যূনতম ট্রেনিং বেতন প্রথম বছরে{" "}
                <strong>~€724/মাস</strong> থেকে শুরু, প্রতি বছর বাড়ে
                (~চতুর্থ বছরে <strong>€1,014</strong>)
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                  aria-hidden
                />
                অনেক কোম্পানি <strong>€800–1,200+</strong> দেয়
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                  aria-hidden
                />
                বেতন দিয়ে থাকা-খাওয়া চললে{" "}
                <strong>Sperrkonto (ব্লকড অ্যাকাউন্ট) সাধারণত লাগে না</strong> —
                ঘাটতিটুকু দেখালেই হয়
              </li>
            </ul>
            <p className="font-bangla mt-3 text-[11px] font-semibold text-mist">
              শেষ যাচাই: অক্টোবর ২০২৬
            </p>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="overflow-hidden rounded-3xl border border-teal/30 bg-gradient-to-br from-cream to-white p-6"
          >
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-teal" aria-hidden />
              <h3 className="font-bangla text-lg font-extrabold text-navy">
                ট্রেনিং শেষে কী হবে?
              </h3>
            </div>
            <ul className="font-bangla mt-3 space-y-2.5 text-sm leading-relaxed text-slate-600">
              <li className="flex gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                  aria-hidden
                />
                গ্র্যাজুয়েশনের পর <strong>১৮ মাসের</strong> জব-সার্চ
                রেসিডেন্স পারমিট
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                  aria-hidden
                />
                যোগ্যতাসম্পন্ন কাজের <strong>~২ বছর</strong> পর স্থায়ী
                বসবাসের (PR) সুযোগ
              </li>
              <li className="flex gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                  aria-hidden
                />
                জার্মান ডিগ্রি + অভিজ্ঞতা = ইউরোপজুড়ে ক্যারিয়ারের দরজা
              </li>
            </ul>
            <p className="font-bangla mt-3 text-[11px] font-semibold text-mist">
              নিয়ম বদলাতে পারে — দূতাবাসের তথ্যই চূড়ান্ত
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================ ROADMAP ============================ */
const steps = [
  {
    Icon: Footprints,
    level: "A1",
    title: "ভিত্তি",
    text: "বর্ণমালা, পরিচয়, সংখ্যা, দৈনন্দিন বাক্য — শুরুটা এখানেই। এই সাইটের A1 পাঠ দিয়ে শুরু করো।",
    time: "~২–৩ মাস",
  },
  {
    Icon: MessagesSquare,
    level: "A2",
    title: "বেসিক কথোপকথন",
    text: "সাধারণ বিষয়ে কথা বলা, ছোট ইমেইল লেখা, কেনাকাটা-ভ্রমণের পরিস্থিতি সামলানো।",
    time: "~২–৩ মাস",
  },
  {
    Icon: BadgeCheck,
    level: "B1",
    title: "পরীক্ষা: Goethe / telc",
    text: "Ausbildung-এর চাবিকাঠি — অফিসিয়াল B1 সার্টিফিকেট ছাড়া আবেদন আটকে থাকে।",
    time: "~৩–৪ মাস",
  },
  {
    Icon: HeartPulse,
    level: "B2",
    title: "ঐচ্ছিক — নার্সিং ও স্বাস্থ্যসেবার জন্য",
    text: "Pflege (নার্সিং) রুটে যেতে চাইলে B2 লাগবে। অন্য পেশায় B1-ই যথেষ্ট।",
    time: "ঐচ্ছিক",
  },
  {
    Icon: Send,
    level: "আবেদন",
    title: "কোম্পানিতে আবেদন",
    text: "Ausbildung পোর্টাল ও কোম্পানির ওয়েবসাইটে জার্মান CV + মোটিভেশন লেটার পাঠাও।",
    time: "~২–৪ মাস",
  },
  {
    Icon: FileSignature,
    level: "চুক্তি",
    title: "Ausbildungsvertrag স্বাক্ষর",
    text: "কোম্পানি তোমাকে ট্রেনি হিসেবে নিয়োগ দিল — অভিনন্দন, সবচেয়ে কঠিন ধাপ পেরিয়ে গেলে!",
    time: "মাইলফলক",
  },
  {
    Icon: Landmark,
    level: "ভিসা",
    title: "ভিসা আবেদন — জার্মান দূতাবাস, ঢাকা",
    text: "চুক্তি, সার্টিফিকেট, বীমা, পাসপোর্ট নিয়ে §16a ভিসার আবেদন।",
    time: "~২–৩ মাস",
  },
  {
    Icon: Plane,
    level: "যাত্রা",
    title: "জার্মানিতে পৌঁছানো",
    text: "Anmeldung (ঠিকানা নিবন্ধন), ব্যাংক অ্যাকাউন্ট খোলা, বাসা গোছানো।",
    time: "প্রথম সপ্তাহ",
  },
  {
    Icon: Play,
    level: "শুরু",
    title: "ট্রেনিং শুরু",
    text: "কোম্পানি + ভোকেশনাল স্কুল — তোমার নতুন জীবন শুরু। শুভ যাত্রা!",
    time: "দিন ১",
  },
];

function Roadmap() {
  const tlRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: tlRef,
    offset: ["start 0.75", "end 0.6"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
  });

  return (
    <section id="roadmap" className="relative overflow-hidden bg-gradient-to-b from-white via-cream to-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SectionHeading
            kicker="শূন্য থেকে জার্মানি"
            title="Zero-to-Hero রোডম্যাপ"
            sub="A1 থেকে প্লেনে ওঠা পর্যন্ত — প্রতিটি ধাপ, আনুমানিক সময়সহ।"
            Icon={Rocket}
          />
        </motion.div>

        <div ref={tlRef} className="relative mt-4">
          {/* track */}
          <div className="absolute bottom-4 left-6 top-4 w-1 rounded-full bg-cream lg:left-1/2 lg:-translate-x-1/2" />
          {/* scroll progress fill */}
          <motion.div
            className="absolute bottom-4 left-6 top-4 w-1 origin-top rounded-full bg-gradient-to-b from-teal via-teal to-sun lg:left-1/2 lg:-translate-x-1/2"
            style={{ scaleY: progress }}
          />

          <div className="space-y-8">
            {steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 26,
                    delay: 0.04 * (i % 3),
                  }}
                  className={`relative flex lg:items-center ${
                    left ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* node */}
                  <motion.span
                    whileInView={{ scale: [0.6, 1.15, 1] }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ type: "spring", stiffness: 320, damping: 16 }}
                    className="absolute left-6 top-1 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-navy to-teal shadow-lg shadow-navy/10 lg:left-1/2"
                  >
                    <s.Icon className="h-5 w-5 text-white" aria-hidden />
                  </motion.span>

                  {/* card */}
                  <motion.div
                    whileHover={{ y: -5, scale: 1.015 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 20,
                    }}
                    className={`card card-hover ml-16 w-full rounded-3xl p-5 lg:ml-0 lg:w-[calc(50%-3rem)] ${
                      left ? "lg:mr-auto" : "lg:ml-auto"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge rounded-full bg-navy px-3 py-1 text-[11px] text-white">
                        {s.level}
                      </span>
                      <span className="font-bangla inline-flex items-center gap-1 rounded-full bg-sun/25 px-2.5 py-1 text-[11px] font-bold text-navy">
                        <Clock className="h-3 w-3" aria-hidden />
                        {s.time}
                      </span>
                    </div>
                    <h3 className="font-bangla mt-2.5 text-base font-extrabold text-navy">
                      {s.title}
                    </h3>
                    <p className="font-bangla mt-1 text-sm leading-relaxed text-slate-500">
                      {s.text}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="font-bangla mx-auto mt-10 max-w-2xl rounded-3xl border border-teal/30 bg-cream p-5 text-center text-sm leading-relaxed text-navy"
        >
          <strong className="font-extrabold">বাস্তবসম্মত মোট সময়:</strong>{" "}
          শূন্য থেকে জার্মানিতে পৌঁছাতে <strong>১৮–৩০ মাস</strong> লাগে।
          ধৈর্য আর নিয়মিত পড়াশোনাই এখানে জয়ের মন্ত্র।
        </motion.p>
      </div>
    </section>
  );
}

/* ============================ CHECKLIST ============================ */
const checklist = [
  {
    title: "জার্মান-ফরম্যাট CV",
    text: "tabellarischer Lebenslauf — ছবিসহ, টেবিল আকারে সাজানো",
  },
  {
    title: "Motivationsschreiben",
    text: "জার্মান ভাষায় মোটিভেশন লেটার — কেন এই পেশা, কেন এই কোম্পানি",
  },
  {
    title: "ভাষা সার্টিফিকেট",
    text: "Goethe / telc B1+ (নার্সিং-এ B2)",
  },
  {
    title: "স্কুল সার্টিফিকেট",
    text: "HSC/বোর্ড সার্টিফিকেট + সার্টিফাইড জার্মান অনুবাদ (অ্যাটেস্টেশন)",
  },
  {
    title: "আর্থিক প্রমাণ",
    text: "বেতন কম হলে কেবল Sperrkonto — নাহলে ট্রেনিং চুক্তিই প্রমাণ",
  },
  {
    title: "স্বাস্থ্য বীমা",
    text: "জার্মান স্বাস্থ্য বীমার প্রমাণপত্র",
  },
  {
    title: "পাসপোর্ট + ছবি",
    text: "বৈধ পাসপোর্ট ও বায়োমেট্রিক ছবি",
  },
  {
    title: "ভিসা ফি ও ফর্ম",
    text: "ভিসা ফি ~€75 + VIDEX ফর্ম",
  },
  {
    title: "পুলিশ ক্লিয়ারেন্স",
    text: "যেখানে চাওয়া হয় সেখানে",
  },
];

function Checklist() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <SectionHeading
          kicker="প্রস্তুতির তালিকা"
          title="আবেদনের চেকলিস্ট"
          sub="বাংলাদেশ থেকে আবেদন করতে যা যা লাগবে — একটাও যেন বাদ না পড়ে।"
          Icon={CheckCircle2}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {checklist.map((c, i) => (
            <motion.div
              key={c.title}
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="card card-hover flex gap-3 rounded-3xl p-4"
            >
              <motion.span
                whileInView={{ rotate: [0, -12, 0], scale: [1, 1.25, 1] }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.05 * i, duration: 0.45 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream"
              >
                <CheckCircle2
                  className="h-5 w-5 text-teal"
                  aria-hidden
                />
              </motion.span>
              <div>
                <h4 className="font-bangla text-sm font-extrabold text-navy">
                  {c.title}
                </h4>
                <p className="font-bangla mt-0.5 text-xs leading-relaxed text-slate-500">
                  {c.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ============================ OTHER PATHS ============================ */
const paths = [
  {
    Icon: HandHeart,
    name: "FSJ / BFD",
    bangla: "স্বেচ্ছাসেবী সেবা",
    points: [
      "৬–১৮ মাসের ভলান্টারি সার্ভিস",
      "পকেট মানি + সাধারণত ফ্রি থাকা/খাওয়া",
      "Sperrkonto সাধারণত লাগে না",
      "জার্মান উন্নতি + জার্মানিতে পা রাখার সুযোগ",
    ],
    accent: "from-teal to-teal",
    ink: "text-white",
    chip: "bg-cream text-teal",
  },
  {
    Icon: GraduationCap,
    name: "University",
    bangla: "বিশ্ববিদ্যালয়ে পড়াশোনা",
    points: [
      "সরকারি বিশ্ববিদ্যালয় বেশিরভাগ টিউশন-মুক্ত",
      "Sperrkonto: ~€11,904/বছর (~€992/মাস, ২০২৬)",
      "জার্মান-মাধ্যম প্রোগ্রামে B2/C1",
      "ইংরেজি-মাধ্যম প্রোগ্রামে IELTS",
    ],
    accent: "from-teal to-navy",
    ink: "text-white",
    chip: "bg-cream text-teal",
  },
  {
    Icon: IdCard,
    name: "Chancenkarte",
    bangla: "অপরচুনিটি কার্ড",
    points: [
      "পয়েন্টভিত্তিক জব-সিকার ভিসা (জুন ২০২৪ থেকে)",
      "৬ পয়েন্ট লাগে — জার্মান A2=১, B1=২, B2+=৩; ৩৫-এর নিচে=২; অভিজ্ঞতা ২–৫ বছর=২–৩; ঘাটতি পেশা=১",
      "চাকরি খুঁজতে ১২ মাস, সপ্তাহে ২০ ঘণ্টা পার্ট-টাইম",
      "আর্থিক প্রমাণ ~€1,091/মাস (২০২৬)",
    ],
    accent: "from-sun to-sun",
    ink: "text-navy",
    chip: "bg-sun/25 text-navy",
  },
  {
    Icon: Stethoscope,
    name: "Nursing",
    bangla: "নার্সিং ও কেয়ারগিভিং",
    points: [
      "ব্যাপক চাহিদা — জার্মানিতে স্বাস্থ্যকর্মীর ঘাটতি",
      "B2 জার্মান + যোগ্যতার স্বীকৃতি (Anerkennung) লাগে",
      "Pflege Ausbildung বাংলাদেশিদের জন্য শীর্ষ রুট",
      "স্থিতিশীল বেতন ও PR-এর শক্ত পথ",
    ],
    accent: "from-navy to-teal",
    ink: "text-white",
    chip: "bg-cream text-teal",
  },
];

function OtherPaths() {
  return (
    <section className="bg-gradient-to-b from-white via-cream to-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SectionHeading
            kicker="আরও রাস্তা আছে"
            title="অন্যান্য পথ"
            sub="Ausbildung ছাড়াও জার্মান জানলে যেসব দরজা খোলে।"
            Icon={Sparkles}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {paths.map((p) => (
              <motion.div
                key={p.name}
                variants={item}
                whileHover={{ y: -7, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="card card-hover overflow-hidden rounded-[1.75rem]"
              >
                <div className={`bg-gradient-to-r ${p.accent} px-6 py-4`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                      <p.Icon className={`h-6 w-6 ${p.ink}`} aria-hidden />
                    </span>
                    <div>
                      <h3 className={`text-base font-black tracking-tight ${p.ink}`}>
                        {p.name}
                      </h3>
                      <p className={`font-bangla text-xs font-bold ${p.ink} opacity-85`}>
                        {p.bangla}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 px-6 py-5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                        aria-hidden
                      />
                      <span className="font-bangla text-sm leading-relaxed text-slate-600">
                        {pt}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <motion.p
            variants={item}
            className="font-bangla mt-5 text-center text-[11px] font-semibold text-mist"
          >
            অংকগুলো আনুমানিক — শেষ যাচাই: অক্টোবর ২০২৬
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ CTA ============================ */
function Cta() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="bg-cream relative overflow-hidden rounded-[2rem] p-8 text-center shadow-xl shadow-navy/5 sm:p-12"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-navy shadow-lg shadow-navy/20"
        >
          <Rocket className="h-8 w-8 text-white" aria-hidden />
        </motion.div>
        <h2 className="font-bangla mt-5 text-2xl font-black tracking-tight text-navy sm:text-3xl">
          যাত্রা শুরু হয় <span className="text-teal">A1</span>{" "}
          থেকে
        </h2>
        <p className="font-bangla mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          রোডম্যাপের প্রথম ধাপটা আজই নাও — ফ্রি A1 পাঠ, ফ্ল্যাশকার্ড আর কুইজ
          নিয়ে আমরা আছি তোমার পাশে।
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/lektionen"
              className="btn btn-primary font-bangla inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm"
            >
              A1 থেকে শুরু করো
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/wortschatz"
              className="font-bangla inline-flex items-center gap-2 rounded-full border border-teal/30 bg-white/80 px-7 py-3 text-sm font-bold text-navy shadow-sm backdrop-blur"
            >
              শব্দ শেখো
            </Link>
          </motion.div>
        </div>
        <p className="font-bangla mx-auto mt-8 max-w-2xl rounded-2xl bg-white/70 px-4 py-3 text-[11px] leading-relaxed text-slate-500 ring-1 ring-slate-200 backdrop-blur">
          তথ্যগুলো অক্টোবর ২০২৬-এ যাচাই করা; ভিসা নিয়ম বদলাতে পারে — জার্মান
          দূতাবাসের অফিসিয়াল তথ্যই চূড়ান্ত।
        </p>
      </motion.div>
    </section>
  );
}

/* ============================ PAGE ============================ */
export default function OpportunitiesClient() {
  return (
    <main className="font-bangla">
      <Hero />
      <Ausbildung />
      <Roadmap />
      <Checklist />
      <OtherPaths />
      <Cta />
    </main>
  );
}
