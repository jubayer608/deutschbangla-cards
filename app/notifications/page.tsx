import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { getNotificationCenter } from "@/lib/notifications";
import NotificationsList from "@/components/NotificationsList";
import PushToggle from "@/components/PushToggle";
import Mascot from "@/components/Mascot";

export const metadata = {
  title: "নোটিফিকেশন",
  description: "নতুন ফলোয়ার, ব্যাজ আর সাপ্তাহিক সারাংশ।",
};

// Phase 3 — notification center (auth required).
export default async function NotificationsPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/notifications");
  }
  const prisma = getPrisma();
  if (!prisma) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="sleepy" size={72} />
        <p className="font-bangla font-bold text-navy">
          নোটিফিকেশন এখনো সেটআপ হয়নি।
        </p>
        <p className="font-bangla text-sm text-mist">
          Database সংযোগ বাকি — SETUP.md দেখো।
        </p>
      </div>
    );
  }

  const { notifications } = await getNotificationCenter(
    prisma,
    session.user.id,
    50,
  );
  const hasReal = notifications.some((n) => !n.synthetic);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="section-heading text-3xl">নোটিফিকেশন</h1>
        <p className="font-bangla mt-1 text-sm text-mist">
          নতুন ফলোয়ার, ব্যাজ আর সাপ্তাহিক সারাংশ।
        </p>
      </div>

      <section className="card rounded-3xl bg-white p-5">
        <PushToggle />
      </section>

      {/* The weekly summary (synthetic) always shows; the empty-state
          card appears below it only when there are no real notifications. */}
      <NotificationsList initial={notifications} />

      {!hasReal && (
        <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
          <Mascot mood="sleepy" size={72} />
          <p className="font-bangla font-bold text-navy">
            এখনো কোনো নোটিফিকেশন নেই।
          </p>
          <p className="font-bangla text-sm text-mist">
            কেউ তোমাকে ফলো করলে বা নতুন ব্যাজ আনলক করলে এখানে দেখাবে।
          </p>
        </div>
      )}
    </div>
  );
}
