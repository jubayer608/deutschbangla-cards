import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import UsernameField from "@/components/UsernameField";
import SettingsForm from "@/components/SettingsForm";
import EmailPreferencesForm from "@/components/EmailPreferencesForm";
import Mascot from "@/components/Mascot";
import { Snowflake } from "lucide-react";

export const metadata = {
  title: "সেটিংস",
  description: "Username, দৈনিক লক্ষ্য, কাঠিন্য আর প্রোফাইল গোপনীয়তা।",
};

// Phase 1 — own settings (auth required).
export default async function SettingsPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/profile/settings");
  }
  const prisma = getPrisma();
  if (!prisma) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="sleepy" size={72} />
        <p className="font-bangla font-bold text-navy">সেটিংস এখনো সেটআপ হয়নি।</p>
        <p className="font-bangla text-sm text-mist">Database সংযোগ বাকি — SETUP.md দেখো।</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true, emailPreference: true, progress: true },
  });
  if (!user) redirect("/api/auth/signin?callbackUrl=/profile/settings");

  const settings = user.settings ?? {
    dailyGoalXp: 50,
    reminderTime: null,
    difficulty: "mixed",
    privacy: "public",
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="section-heading text-3xl">সেটিংস</h1>
        <p className="font-bangla mt-1 text-sm text-mist">তোমার প্রোফাইল আর শেখার পছন্দ।</p>
      </div>

      <section className="card rounded-3xl bg-white p-5">
        <h2 className="font-bangla mb-3 text-base font-extrabold text-navy">Username</h2>
        <UsernameField mode="settings" initial={user.username ?? ""} />
      </section>

      <section className="card rounded-3xl bg-white p-5">
        <h2 className="font-bangla mb-4 text-base font-extrabold text-navy">শেখার সেটিংস</h2>
        <SettingsForm
          initial={{
            dailyGoalXp: settings.dailyGoalXp,
            reminderTime: settings.reminderTime,
            difficulty: settings.difficulty,
            privacy: settings.privacy,
          }}
        />
      </section>
      {/* Phase 5 — Streak Freeze balance (read-only; earned/spent automatically). */}
      <section className="card rounded-3xl bg-white p-5">
        <h2 className="font-bangla mb-3 flex items-center gap-2 text-base font-extrabold text-navy">
          <Snowflake className="h-5 w-5 text-sky-500" aria-hidden /> Streak Freeze
        </h2>
        <p className="font-bangla text-sm text-slate-600">
          তোমার কাছে <b>{user.progress?.streakFreezes ?? 0}-টি Freeze</b> আছে। Freeze থাকলে ১ দিন
          মিস হলেও স্ট্রিক বাঁচবে (ফ্রিজটা নিজে থেকে খরচ হবে)। স্ট্রিক প্রতি ৭ দিনে (৭, ১৪, ২১…)
          ১-টি করে Freeze পাবে — সর্বোচ্চ ৩-টি জমা থাকে। ২ বা তার বেশি দিন মিস হলে Freeze-ও স্ট্রিক
          বাঁচাতে পারবে না।
        </p>
      </section>
      <section className="card rounded-3xl bg-white p-5">
        <h2 className="font-bangla mb-4 text-base font-extrabold text-navy">
          ইমেইল নোটিফিকেশন
        </h2>
        <EmailPreferencesForm
          initial={{
            weeklyReport: user.emailPreference?.weeklyReport ?? true,
            streakNudge: user.emailPreference?.streakNudge ?? true,
            wordOfDay: user.emailPreference?.wordOfDay ?? false,
          }}
        />
      </section>
    </div>
  );
}
