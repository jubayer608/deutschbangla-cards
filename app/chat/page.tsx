import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Mascot from "@/components/Mascot";
import ChatRoom from "@/components/ChatRoom";
import { MessagesSquare } from "lucide-react";

export const metadata = {
  title: "Chat — Community Chat",
  description: "Ulluk Community Chat: shobai ekhane eksathe chat koro।",
};

// Global Community Chat — ONE shared room for every logged-in user.
// Auth required (redirects to sign-in when logged out, like other
// protected pages). The room itself is client-side (polling).
export default async function ChatPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/chat");
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-bangla text-sm font-semibold text-teal">Community · shobai eksathe</p>
          <h1 className="section-heading inline-flex items-center gap-2 text-3xl">
            <MessagesSquare className="h-7 w-7 text-teal" aria-hidden /> Community Chat
          </h1>
          <p className="font-bangla mt-1 text-sm text-mist">
            Shobai ekhane eksathe chat koro — proshno koro, help koro, adda dao।
          </p>
        </div>
        <Mascot mood="happy" size={64} animate className="shrink-0" />
      </div>
      <ChatRoom />
    </div>
  );
}
