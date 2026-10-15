import BossBattle from "@/components/BossBattle";
import { Skull } from "lucide-react";

export const metadata = {
  title: "Boss Battle — কঠিন শব্দের বস",
  description: "কঠিন শব্দের বসের সাথে লড়ো — শুদ্ধ উত্তরে বসের HP কমে, ভুল উত্তরে তোমার HP।",
};

// Phase 5 — Boss-Word Battle. Guests can play (no XP); logged-in users
// fight their weakest reviewed words and earn XP on finish.
export default function BossPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-bangla text-sm font-semibold text-teal">Game Mode · একা খেলো</p>
        <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
          <Skull className="h-7 w-7 text-rose-500" aria-hidden /> Boss Battle
        </h1>
        <p className="font-bangla mt-1 text-sm text-mist">
          যেই শব্দগুলো বারবার ভুল হয়, সেই শব্দগুলোই বস হয়ে ফিরে আসে। হারিয়ে দাও!
        </p>
      </div>
      <BossBattle />
    </div>
  );
}
