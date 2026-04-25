import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useNavigate } from "@tanstack/react-router";
import { Gift, ShieldCheck, Star, Truck, Zap, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { sendOTP } from "@/services/emailService";
import { getRegisteredUsers, findEmailByPhone, hashPassword } from "@/lib/auth";
import { cn } from "@/lib/utils";

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

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    referral: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const checkStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*]/.test(pass)) score++;
    setPasswordStrength(score);
  };

  function validate() {
    const errs: Partial<typeof form> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim() || !form.email.toLowerCase().endsWith("@gmail.com"))
      errs.email = "Please enter a valid @gmail.com address";
    if (!form.phone.trim() || form.phone.length < 7)
      errs.phone = "Enter a valid phone number";
    const pass = form.password;
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!pass || !strongRegex.test(pass))
      errs.password = "Password must be 8+ chars with uppercase, number & symbol";
    return errs;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password") checkStrength(value);
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const bannedEmails = JSON.parse(localStorage.getItem("nexgro_banned_users") || "[]");
    const isDeviceRestricted = localStorage.getItem("nexgro_device_restricted") === "true";
    
    if (bannedEmails.includes(form.email.toLowerCase().trim()) || isDeviceRestricted) {
      window.location.href = "/banned";
      return;
    }

    const registeredUsers = getRegisteredUsers();
    if (registeredUsers[form.email.toLowerCase().trim()]) {
      setErrors({ email: "This email is already registered. Please login instead." });
      return;
    }
    
    const existingEmailForPhone = findEmailByPhone(form.phone);
    if (existingEmailForPhone) {
      setErrors({ phone: "This phone number is already registered." });
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send OTP via Brevo
      await sendOTP(form.email, `${form.firstName} ${form.lastName}`, otp);
      
      // Store OTP and email for verification
      sessionStorage.setItem("pending_otp", otp);
      sessionStorage.setItem("pending_email", form.email);
      sessionStorage.setItem("pending_profile", JSON.stringify(form));
      
      const hashedPassword = await hashPassword(form.password);
      sessionStorage.setItem("pending_password", hashedPassword);
      
      setIsLoading(false);
      navigate({
        to: "/verify-email",
        state: { email: form.email },
      } as any);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ email: "Failed to send verification code. Please try again." });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" data-ocid="register.page">
      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, oklch(0.42 0.17 142) 0%, oklch(0.32 0.14 145) 60%, oklch(0.22 0.10 148) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
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

        <div className="relative z-10 space-y-5">
          <div>
            <p className="text-white/50 text-sm font-medium uppercase tracking-widest mb-3">
              Join NeXgro Today
            </p>
            <h2 className="font-display text-5xl font-bold text-white leading-[1.08] tracking-tight">
              Your neighbourhood
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #fff 30%, oklch(0.85 0.15 75))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                grocery store.
              </span>
            </h2>
            <p className="mt-4 text-white/65 text-lg leading-relaxed max-w-sm">
              Register in seconds, earn loyalty points from your very first
              order, and get groceries delivered fresh to your door.
            </p>
          </div>
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

        <div className="relative z-10">
          <p className="text-white/35 text-xs">
            © {new Date().getFullYear()} NeXgro.
          </p>
        </div>
      </div>

      {/* ── Right register panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-[420px] py-4" data-ocid="register.panel">
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

          <div className="space-y-1.5 mb-7">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground text-base">
              Join thousands of happy shoppers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Arjun"
                  data-ocid="register.first_name.input"
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-150 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{
                    borderColor: errors.firstName
                      ? "oklch(0.55 0.2 25)"
                      : "var(--border)",
                  }}
                />
                {errors.firstName && (
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.2 25)" }}
                    data-ocid="register.first_name.field_error"
                  >
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Sharma"
                  data-ocid="register.last_name.input"
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-150 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{
                    borderColor: errors.lastName
                      ? "oklch(0.55 0.2 25)"
                      : "var(--border)",
                  }}
                />
                {errors.lastName && (
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.2 25)" }}
                    data-ocid="register.last_name.field_error"
                  >
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="arjun@example.com"
                data-ocid="register.email.input"
                className="w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-150 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                style={{
                  borderColor: errors.email
                    ? "oklch(0.55 0.2 25)"
                    : "var(--border)",
                }}
              />
              {errors.email && (
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.2 25)" }}
                  data-ocid="register.email.field_error"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <div className="flex gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 rounded-xl border text-sm font-medium text-foreground bg-muted/50 shrink-0"
                  aria-label="Country code India +91"
                >
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  data-ocid="register.phone.input"
                  className="flex-1 px-4 py-3 rounded-xl border text-sm transition-colors duration-150 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{
                    borderColor: errors.phone
                      ? "oklch(0.55 0.2 25)"
                      : "var(--border)",
                  }}
                />
              </div>
              {errors.phone && (
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.2 25)" }}
                  data-ocid="register.phone.field_error"
                >
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  data-ocid="register.password.input"
                  className="w-full px-4 py-3 pr-10 rounded-xl border text-sm transition-colors duration-150 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{
                    borderColor: errors.password
                      ? "oklch(0.55 0.2 25)"
                      : "var(--border)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Strength Meter */}
              {form.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={cn(
                          "flex-1 rounded-full transition-all duration-500",
                          s <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-destructive"
                              : passwordStrength === 3
                              ? "bg-yellow-500"
                              : "bg-emerald-500"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                    <span>Security Level</span>
                    <span className={cn(
                      passwordStrength <= 2 ? "text-destructive" : passwordStrength === 3 ? "text-yellow-600" : "text-emerald-600"
                    )}>
                      {passwordStrength <= 2 ? "Weak" : passwordStrength === 3 ? "Moderate" : "Powerful"}
                    </span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.2 25)" }}
                  data-ocid="register.password.field_error"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Referral Code */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="referral"
              >
                Referral Code (Optional)
              </label>
              <input
                id="referral"
                name="referral"
                type="text"
                value={form.referral}
                onChange={handleChange}
                placeholder="FRIEND50"
                data-ocid="register.referral.input"
                className="w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-150 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                style={{
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              data-ocid="register.submit_button"
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: isLoading
                  ? "oklch(0.48 0.16 142)"
                  : "linear-gradient(135deg, oklch(0.50 0.17 142), oklch(0.44 0.15 144))",
                color: "oklch(0.98 0 0)",
                boxShadow: "0 4px 20px oklch(0.48 0.16 142 / 0.35)",
              }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner
                    size="sm"
                    className="border-white/30 border-t-white"
                  />
                  <span>Creating account…</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="text-primary font-semibold hover:underline"
              data-ocid="register.sign_in.link"
            >
              Sign in
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
    </div>
  );
}
