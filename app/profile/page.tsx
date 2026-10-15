import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import UsernameField from "@/components/UsernameField";
import Mascot from "@/components/Mascot";

export const metadata = {
  title: "আমার প্রোফাইল",
  description: "তোমার Ulluk প্রোফাইল — লেভেল, XP, স্ট্রিক আর ব্যাজ।",
};

// Phase 1 — /profile entry point:
// - signed out → Google sign-in
// - signed in + has username → /profile/[username]
// - signed in + no username → username setup form
export default async function ProfileIndexPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/profile");
  }
  const prisma = getPrisma();
  if (!prisma) {
    return (
      <div className="card flex flex-col items-center gap-3 rounded-3xl bg-white p-8 text-center">
        <Mascot mood="sleepy" size={72} />
        <p className="font-bangla font-bold text-navy">প্রোফাইল এখনো সেটআপ হয়নি।</p>
        <p className="font-bangla text-sm text-mist">Database সংযোগ বাকি — SETUP.md দেখো।</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true },
  });
  if (user?.username) {
    redirect(`/profile/${user.username}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="section-heading text-3xl">তোমার প্রোফাইল বানাও</h1>
        <p className="font-bangla mt-1 text-sm text-mist">
          একটি username বেছে নাও — এটাই হবে তোমার শেয়ার করার মতো প্রোফাইল লিংক।
        </p>
      </div>
      <div className="card rounded-3xl bg-white p-5">
        <UsernameField mode="setup" />
      </div>
    </div>
  );
}
