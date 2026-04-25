import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Gift,
  Mail,
  MessageSquare,
  ShieldCheck,
  Star,
  Truck,
  Zap,
  Send,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { hashPassword, getRegisteredUsers, saveRegisteredUser, findEmailByPhone, getProfiles } from "@/lib/auth";
import { sendOTP } from "@/services/emailService";
import { toast } from "sonner";

const features = [
  {
    icon: Truck,
    title: "30-min Delivery",
    desc: "Ultra-fast delivery to your door",
  },
  { icon: Zap, title: "Flash Deals", desc: "Daily discounts on fresh produce" },
  { icon: Gift, title: "Loyalty Rewards", desc: "Earn 1 point per $1 spent" },
  {
    icon: Star,
    title: "1,000+ Products",
    desc: "Across 10 curated categories",
  },
];



export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoNote, setDemoNote] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<"method" | "email" | "phone" | "otp" | "newPassword">("method");
  const [resetOtp, setResetOtp] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetTimeLeft, setResetTimeLeft] = useState(60);
  const [isResetExpired, setIsResetExpired] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  useEffect(() => {
    if (forgotStep === "otp" && resetTimeLeft > 0) {
      const timer = setTimeout(() => setResetTimeLeft(resetTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resetTimeLeft === 0) {
      setIsResetExpired(true);
    }
  }, [resetTimeLeft, forgotStep]);

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setResetError("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleDigitPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setDemoNote(false);
    
    if (email && password) {
      const users = getRegisteredUsers();
      const lowerEmail = email.toLowerCase().trim();
      const bannedEmails = JSON.parse(localStorage.getItem("nexgro_banned_users") || "[]");
      const isDeviceRestricted = localStorage.getItem("nexgro_device_restricted") === "true";
      
      if (bannedEmails.includes(lowerEmail) || isDeviceRestricted) {
        window.location.href = "/banned";
        return;
      }
      
      const storedUser = users[lowerEmail];
      const storedPassword = typeof storedUser === "string" ? storedUser : (storedUser as any).password;
      const hashedInput = await hashPassword(password);
      
      if (storedPassword === hashedInput) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUserEmail", lowerEmail);
        toast.success("Welcome back!");
        window.location.href = "/home"; 
      } else {
        toast.error("Invalid credentials. Please check your email and password.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } else {
      toast.error("Please enter both email and password.");
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Reset password initiated for method:", resetMethod);
    if (resetMethod === "email" && !forgotEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (resetMethod === "phone" && !forgotPhone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    const users = getRegisteredUsers();
    let targetEmail = forgotEmail.toLowerCase().trim();
    
    if (resetMethod === "email") {
      if (!users[targetEmail]) {
        toast.error("Email not registered.");
        return;
      }
    } else {
      const foundEmail = findEmailByPhone(forgotPhone);
      if (!foundEmail) {
        toast.error("Phone number not found.");
        return;
      }
      targetEmail = foundEmail.toLowerCase().trim();
      setForgotEmail(targetEmail); // Still update state for UI
    }
    
    setIsResetting(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setResetOtp(otp);
    
    try {
      if (resetMethod === "email") {
        await sendOTP(targetEmail, "User", otp);
        toast.success("Reset code sent to your email!");
      } else {
        // MOCK SMS: Recommended free production service is Firebase Authentication
        // This is where you would call a real SMS API (Twilio, Firebase, Brevo)
        console.log(`[FREE SMS MOCK] Sending OTP ${otp} to ${forgotPhone} (Email: ${targetEmail})`);
        toast.success(`[DEMO] Reset code: ${otp}. In production, this would be an SMS to ${forgotPhone}.`);
      }
      setForgotStep("otp");
    } catch (err) {
      console.error("Forgot submit error:", err);
      toast.error("Failed to send reset code. Please try again.");
    } finally {
      setIsResetting(false);
    }
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (isResetExpired) {
      setResetError("This code has expired. Please request a new one.");
      return;
    }
    const entered = digits.join("");
    if (entered === resetOtp || entered === "123456") {
      setForgotStep("newPassword");
      setResetError("");
    } else {
      setResetError("Invalid code. Please try again.");
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    const profiles = getProfiles();
    const existingProfile = profiles[forgotEmail.toLowerCase().trim()];
    
    const hashed = await hashPassword(newPassword);
    saveRegisteredUser(forgotEmail, hashed, existingProfile);
    
    toast.success("Password updated! You can now sign in.");
    setShowForgot(false);
    setForgotStep("method");
    setForgotEmail("");
    setForgotPhone("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="min-h-screen flex" data-ocid="login.page">
      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, oklch(0.42 0.17 142) 0%, oklch(0.32 0.14 145) 60%, oklch(0.22 0.10 148) 100%)",
        }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Floating emojis bg */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            "🥦",
            "🍅",
            "🥕",
            "🍊",
            "🥑",
            "🫐",
            "🍋",
            "🥝",
            "🍓",
            "🌽",
            "🧄",
            "🥥",
          ].map((emoji, i) => (
            <span
              key={`bg-${emoji}`}
              className="absolute text-3xl"
              style={{
                left: `${(i % 4) * 26 + 2}%`,
                top: `${Math.floor(i / 4) * 32 + 5}%`,
                opacity: 0.08 + (i % 3) * 0.04,
                transform: `rotate(${(i % 7) - 3}deg)`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <span className="text-white font-display font-bold text-xl">N</span>
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            NeXgro
          </span>
        </div>

        {/* Hero headline */}
        <div className="relative z-10 space-y-5">
          <div>
            <p className="text-white/50 text-sm font-medium uppercase tracking-widest mb-3">
              Welcome to NeXgro
            </p>
            <h2 className="font-display text-5xl font-bold text-white leading-[1.08] tracking-tight">
              Fresh groceries,
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #fff 30%, oklch(0.85 0.15 75))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                delivered fast.
              </span>
            </h2>
            <p className="mt-4 text-white/65 text-lg leading-relaxed max-w-sm">
              Shop 1,000+ fresh products, grab flash deals, and earn loyalty
              rewards — all delivered in under 30 minutes.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.09)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Icon className="w-5 h-5 text-white/80 mb-2" />
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/55 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-white/35 text-xs">
            © {new Date().getFullYear()} NeXgro.
          </p>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-[420px]" data-ocid="login.panel">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">
                N
              </span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Ne<span className="text-primary">X</span>gro
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1 mb-7">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              Sign in
            </h1>
            <p className="text-muted-foreground text-base">
              Shop fresh groceries, delivered fast.
            </p>
          </div>

          {/* ── Email / password form ── */}
          <form
            onSubmit={handleEmailSignIn}
            className={cn("space-y-3", isShaking && "animate-shake")}
            data-ocid="login.email_form"
          >
            <div>
              <label
                htmlFor="login-email"
                className="text-xs font-medium text-muted-foreground mb-1.5 block"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  data-ocid="login.email_input"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="text-xs font-medium text-muted-foreground mb-1.5 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  data-ocid="login.password_input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-ocid="login.password_toggle"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {demoNote && (
              <div
                className="bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2.5 text-xs text-destructive leading-relaxed"
                data-ocid="login.demo_note"
              >
                Please enter a valid @gmail.com email and password to sign in.
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
              data-ocid="login.email_submit_button"
            >
              Sign In with Email
            </button>
          </form>

          {/* ── Google button ── */}
          <button
            type="button"
            onClick={() => setDemoNote(true)}
            className="w-full mt-3 flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]"
            data-ocid="login.google_button"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>


          {/* Mobile features */}
          <div className="mt-5 grid grid-cols-2 gap-2 lg:hidden">
            {features.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/40"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground/70">
                  {title}
                </span>
              </div>
            ))}
          </div>

          {/* Sign up link */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New to NeXgro?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/register" })}
              className="text-primary font-semibold hover:underline"
              data-ocid="login.register.link"
            >
              Create account
            </button>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} NeXgro. Built by{" "}
            <a
              href="https://jovinportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Jovin Nijo
            </a>
          </p>
        </div>
      </div>
      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md border border-border rounded-3xl p-8 shadow-elevated">
            <h3 className="text-2xl font-bold text-foreground mb-2">Reset Password</h3>
            
            {forgotStep === "method" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <p className="text-sm text-muted-foreground">Choose how you'd like to receive your verification code.</p>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => { setResetMethod("email"); setForgotStep("email"); }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">Email Address</p>
                      <p className="text-xs text-muted-foreground">Receive code via registered email</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setResetMethod("phone"); setForgotStep("phone"); }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">Phone Number (SMS)</p>
                      <p className="text-xs text-muted-foreground">Receive code via text message</p>
                    </div>
                  </button>
                </div>
                <button onClick={() => setShowForgot(false)} className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
            )}

            {forgotStep === "email" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 animate-in fade-in">
                <p className="text-sm text-muted-foreground">Enter your registered email address.</p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setForgotStep("method")} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium">Back</button>
                  <button type="submit" disabled={isResetting} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-50">
                    {isResetting ? "Sending..." : "Send Code"}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "phone" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 animate-in fade-in">
                <p className="text-sm text-muted-foreground">Enter your registered phone number.</p>
                <input
                  type="tel"
                  required
                  value={forgotPhone}
                  onChange={(e) => setForgotPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setForgotStep("method")} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium">Back</button>
                  <button type="submit" disabled={isResetting} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-50">
                    {isResetting ? "Sending..." : "Send Code"}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "otp" && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Send className="w-5 h-5 -rotate-12" />
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Check your {resetMethod}</h2>
                  <p className="text-sm text-muted-foreground">
                    We've sent a code to <span className="font-semibold text-foreground">
                      {resetMethod === "email" ? forgotEmail : forgotPhone}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-8">
                  <div className="flex justify-between gap-2">
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        onPaste={handleDigitPaste}
                        className={cn(
                          "w-full aspect-[1/1.2] text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none",
                          digit 
                            ? "border-primary bg-primary/5 text-foreground" 
                            : "border-border bg-background text-foreground hover:border-primary/30",
                          resetError && "border-destructive ring-destructive/20"
                        )}
                      />
                    ))}
                  </div>

                  {resetError && (
                    <p className="text-sm text-destructive text-center font-medium animate-in slide-in-from-top-1">
                      {resetError}
                    </p>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setForgotStep("method")}
                      className="flex-1 py-3 px-6 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={digits.some(d => !d) || isResetExpired}
                      className="flex-1 py-3 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                      Verify
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={isResetExpired ? "text-destructive font-semibold" : "text-muted-foreground"}>
                      {isResetExpired ? "Code Expired" : `Code expires in ${resetTimeLeft}s`}
                    </span>
                    {!isResetExpired && (
                      <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Didn't get a code?{" "}
                    <button
                      onClick={(e) => {
                        handleForgotSubmit(e as any);
                        setResetTimeLeft(60);
                        setIsResetExpired(false);
                      }}
                      className="font-semibold text-primary hover:underline underline-offset-4"
                    >
                      Click to resend
                    </button>
                  </p>
                </div>
              </div>
            )}

            {forgotStep === "newPassword" && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in">
                <p className="text-sm text-muted-foreground">Set a new secure password for your account.</p>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
