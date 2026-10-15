import CommunityBoard from "@/components/CommunityBoard";
import { Users } from "lucide-react";

export const metadata = {
  title: "Community — Shobdo/idea pathao",
  description: "Ulluk community: notun shobdo, phrase ba lesson idea pathao — approved hole shobai dekhte pabe।",
};

// Phase 5 — Community Submissions. The board is client-side (tabs +
// form + fetches); the approved list is public, "Amar submissions"
// needs sign-in.
export default function CommunityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-bangla text-sm font-semibold text-teal">Community · shobai mile shikhi</p>
        <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
          <Users className="h-7 w-7 text-teal" aria-hidden /> Community
        </h1>
        <p className="font-bangla mt-1 text-sm text-mist">
          Notun shobdo, phrase ba lesson idea pathao — moderator approved korle shobai dekhte pabe।
        </p>
      </div>
      <CommunityBoard />
    </div>
  );
}
