import { ShieldAlert, MessageSquare, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function BannedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-destructive/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Icon */}
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-destructive/20 animate-pulse">
              <ShieldAlert className="w-12 h-12 text-destructive" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-background border-2 border-destructive rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-destructive">!</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h1 className="text-4xl font-display font-black text-foreground tracking-tight">
              Access Restricted
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              Your account has been suspended for violating our store policies. 
              You currently do not have access to shop at NeXgro.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="mailto:support@nexgro.com"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-5 h-5" />
              Contact Support
            </a>
            <button
              onClick={() => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("currentUserEmail");
                window.location.href = "/login";
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-muted text-foreground px-8 py-4 rounded-2xl font-bold hover:bg-muted/80 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </button>
          </div>

          {/* Footer Info */}
          <div className="pt-12 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Reference ID: <span className="font-mono text-foreground">{Math.random().toString(36).substring(7).toUpperCase()}</span>
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-bold">
              NeXgro Security Protocol 2.4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
