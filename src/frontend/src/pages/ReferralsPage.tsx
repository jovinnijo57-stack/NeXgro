import { useReferrals, useUserProfile } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Copy,
  Gift,
  Share2,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { data: user } = useUserProfile();
  const { data: referrals } = useReferrals();
  const [isCopying, setIsCopying] = useState(false);

  const referralCode = user?.referralCode || "NEXGRO50";
  const totalEarnings = user?.totalReferralEarnings || 0;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setIsCopying(true);
    toast.success("Referral code copied!");
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-6" data-ocid="referrals.page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          data-ocid="referrals.back_link"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-foreground text-xl">
            Refer & Earn 🎁
          </h1>
        </div>
      </div>

      {/* Hero Card */}
      <div
        className="rounded-2xl p-6 text-white overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, oklch(0.62 0.17 142) 0%, oklch(0.52 0.14 145) 100%)",
        }}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Give $10, Get $10</h2>
          <p className="text-white/80 text-sm mb-6 leading-relaxed">
            Invite your friends to NeXgro. They get $10 off their first order, and you get $10 in your wallet once they shop!
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-xs text-white/60 mb-2 uppercase tracking-wider font-semibold">Your Referral Code</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-mono font-bold tracking-widest">{referralCode}</span>
              <button
                onClick={copyCode}
                className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg"
              >
                {isCopying ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopying ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Share2 className="w-32 h-32" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total Referrals</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{referrals?.length || 0}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-medium">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-primary">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Referral History</h3>
        </div>
        
        {!referrals?.length ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground">No referrals yet. Start sharing!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {referrals.map((ref) => (
              <div key={ref.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    ref.status === "completed" ? "bg-primary/10" : "bg-muted"
                  )}>
                    {ref.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{ref.referredEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(ref.createdAt)).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    ref.status === "completed" ? "text-primary" : "text-muted-foreground"
                  )}>
                    {ref.status === "completed" ? `+$${ref.rewardAmount.toFixed(2)}` : "Pending"}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-tight">
                    {ref.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
        <h3 className="text-sm font-bold text-primary mb-4">How it works</h3>
        <div className="space-y-4">
          {[
            { step: 1, text: "Share your code with friends" },
            { step: 2, text: "They sign up and get $10 off first order" },
            { step: 3, text: "You get $10 in your wallet instantly" }
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                {s.step}
              </div>
              <p className="text-sm text-foreground/80">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
