import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

const INTRO_DURATION_MS = 7000;

const FLOATING_ITEMS = [
  { emoji: "🥦", id: "broccoli", x: 8, y: 15, size: 2.4, delay: 0 },
  { emoji: "🍎", id: "apple", x: 82, y: 10, size: 2.8, delay: 0.4 },
  { emoji: "🥕", id: "carrot", x: 12, y: 70, size: 2.2, delay: 0.8 },
  { emoji: "🍊", id: "orange", x: 88, y: 65, size: 2.6, delay: 0.2 },
  { emoji: "🥑", id: "avocado", x: 20, y: 42, size: 2.0, delay: 1.0 },
  { emoji: "🍓", id: "strawberry", x: 75, y: 38, size: 2.2, delay: 0.6 },
  { emoji: "🫐", id: "blueberry", x: 50, y: 8, size: 2.0, delay: 1.2 },
  { emoji: "🧅", id: "onion", x: 92, y: 28, size: 1.8, delay: 0.9 },
  { emoji: "🌽", id: "corn", x: 5, y: 52, size: 2.4, delay: 1.4 },
  { emoji: "🍋", id: "lemon", x: 60, y: 85, size: 2.0, delay: 0.3 },
  { emoji: "🍇", id: "grapes", x: 35, y: 88, size: 2.2, delay: 0.7 },
  { emoji: "🥝", id: "kiwi", x: 78, y: 80, size: 1.8, delay: 1.1 },
];

export default function IntroVideo() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "logo" | "tagline">("loading");
  const skippedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate({ to: "/home" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const goToLogin = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    navigate({ to: "/login" });
  }, [navigate]);

  useEffect(() => {
    // Phase transitions
    const t1 = setTimeout(() => setPhase("logo"), 300);
    const t2 = setTimeout(() => setPhase("tagline"), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(100, (elapsed / INTRO_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        goToLogin();
      }
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goToLogin]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#000" }}
      data-ocid="intro.page"
    >
      {/* Radial gradient glow behind logo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.48 0.16 142 / 0.18) 0%, transparent 70%)",
        }}
      />

      {/* Animated particle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.48 0.16 142 / 0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      {/* Skip button */}
      <button
        type="button"
        onClick={goToLogin}
        className="absolute top-6 right-6 z-20 px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-300"
        style={{
          color: "rgba(255,255,255,0.65)",
          borderColor: "rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.05)",
        }}
        data-ocid="intro.skip_button"
      >
        Skip →
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Logo mark with animated glow */}
        <div
          className="relative flex items-center justify-center"
          style={{
            opacity: phase === "loading" ? 0 : 1,
            transform:
              phase === "loading"
                ? "scale(0.85) translateY(20px)"
                : "scale(1) translateY(0)",
            transition:
              "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Outer glow rings */}
          <div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              background: "oklch(0.48 0.16 142 / 0.08)",
              animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 130,
              height: 130,
              background: "oklch(0.48 0.16 142 / 0.12)",
              animation: "ping 2.5s cubic-bezier(0,0,0.2,1) infinite 0.4s",
            }}
          />

          {/* Logo box */}
          <div
            className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.52 0.18 142), oklch(0.40 0.15 145))",
              boxShadow:
                "0 0 60px oklch(0.48 0.16 142 / 0.5), 0 0 20px oklch(0.48 0.16 142 / 0.3)",
            }}
          >
            {/* Leaf SVG */}
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="w-14 h-14"
              aria-hidden="true"
            >
              <path
                d="M24 7C13 7 7 18 7 28C7 35 11.5 41 18.5 43C20.5 43.8 22.2 44 24 44C25.8 44 27.5 43.8 29.5 43C36.5 41 41 35 41 28C41 18 35 7 24 7Z"
                fill="white"
                fillOpacity="0.92"
              />
              <path
                d="M24 7C24 7 28.5 17 28.5 26C28.5 35 24 44 24 44"
                stroke="oklch(0.38 0.14 142)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M24 22C24 22 17 24.5 12.5 30.5"
                stroke="oklch(0.38 0.14 142)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M24 30C24 30 31 32 35 38"
                stroke="oklch(0.38 0.14 142)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <div
          style={{
            opacity: phase === "loading" ? 0 : 1,
            transform:
              phase === "loading" ? "translateY(16px)" : "translateY(0)",
            transition:
              "opacity 0.6s ease 0.2s, transform 0.6s cubic-bezier(0.4,0,0.2,1) 0.2s",
          }}
        >
          <h1
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: "clamp(2.8rem, 8vw, 5rem)",
              color: "#fff",
              letterSpacing: "-2px",
            }}
          >
            Ne<span style={{ color: "oklch(0.62 0.18 142)" }}>X</span>gro
          </h1>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: phase === "tagline" ? 1 : 0,
            transform:
              phase === "tagline" ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p
            className="font-medium tracking-widest uppercase text-sm"
            style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.25em" }}
          >
            Fresh Groceries · Delivered Fast
          </p>
          <p
            className="mt-3 text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            1,000+ products · 10 categories · Flash deals every day
          </p>
        </div>

        {/* Trust badges */}
        <div
          className="flex items-center gap-4"
          style={{
            opacity: phase === "tagline" ? 1 : 0,
            transition: "opacity 0.7s ease 0.3s",
          }}
        >
          {[
            "🚀 30-min delivery",
            "🎁 Loyalty rewards",
            "🔒 Secure & private",
          ].map((badge) => (
            <span
              key={badge}
              className="text-[11px] font-medium px-3 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div
          className="rounded-full overflow-hidden"
          style={{
            width: 200,
            height: 2,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, oklch(0.48 0.16 142), oklch(0.62 0.18 142))",
            }}
          />
        </div>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Loading your store…
        </p>
      </div>

      {/* Floating grocery emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_ITEMS.map(({ emoji, id, x, y, size, delay }) => (
          <div
            key={id}
            className="absolute select-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              fontSize: `${size}rem`,
              opacity: 0.08,
              animation: `floatGrocery ${3 + delay}s ease-in-out infinite alternate`,
              animationDelay: `${delay}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes floatGrocery {
          0% { transform: translateY(0px) rotate(-5deg); }
          100% { transform: translateY(-18px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
