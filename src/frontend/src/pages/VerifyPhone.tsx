import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Smartphone, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveRegisteredUser } from "@/lib/auth";
import { sendWelcomeEmail } from "@/services/emailService";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;

export default function VerifyPhone() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaVerifierRef = useRef<any>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(CODE_LENGTH).fill(null));

  const phone = sessionStorage.getItem("pending_phone") || "";

  useEffect(() => {
    if (timeLeft > 0 && !verified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsExpired(true);
    }
  }, [timeLeft, verified]);

  // Auto-send OTP on mount
  useEffect(() => {
    if (!confirmationResult && phone) {
      handleSendOtp();
    }
  }, [phone]);

  async function handleSendOtp() {
    if (!auth || !phone) return;
    
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }

      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g, '')}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      toast.success("Phone verification code sent!");
      setTimeLeft(60);
      setIsExpired(false);
    } catch (err: any) {
      console.error("Phone OTP send error:", err);
      toast.error("Failed to send SMS. Please try again.");
    }
  }

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError("");

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (digits.some((d) => !d)) {
      setError("Please enter all 6 digits.");
      return;
    }
    
    if (!confirmationResult) {
      toast.error("No verification session found. Please resend code.");
      return;
    }

    setIsVerifying(true);
    const enteredOtp = digits.join("");
    
    try {
      await confirmationResult.confirm(enteredOtp);
      setVerified(true);
      
      // Final Registration Save
      const email = sessionStorage.getItem("pending_email");
      const pwd = sessionStorage.getItem("pending_password");
      const profileStr = sessionStorage.getItem("pending_profile");
      
      if (email && pwd && profileStr) {
        const profile = JSON.parse(profileStr);
        saveRegisteredUser(email, pwd, profile);
        
        sendWelcomeEmail(email, `${profile.firstName} ${profile.lastName}`).catch(console.error);
        
        sessionStorage.clear(); // Clear all pending data
        toast.success("Account verified and created successfully!");
      }
      
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      console.error("Phone verification error:", err);
      setError("Invalid OTP. Please try again.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-[420px]">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2">
          Verify Phone Number
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          One more step! Enter the code sent to <span className="font-semibold text-foreground">{phone}</span>
        </p>

        {!verified && (
          <>
            <fieldset className="flex justify-between gap-2 mb-6 border-0 p-0 m-0">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-150 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ borderColor: error ? "oklch(0.55 0.2 25)" : digit ? "oklch(0.50 0.17 142 / 0.6)" : "var(--border)" }}
                />
              ))}
            </fieldset>

            {error && <p className="text-sm mb-4 text-center text-destructive">{error}</p>}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate({ to: "/register" })}
                className="flex-1 py-3 px-6 rounded-xl border border-border text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifying || digits.some(d => !d)}
                onClick={handleVerify}
                className="flex-1 py-3 px-6 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Finish"}
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className={isExpired ? "text-destructive font-semibold" : "text-muted-foreground"}>
                  {isExpired ? "Code Expired" : `Code expires in ${timeLeft}s`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Didn't get a code?{" "}
                <button onClick={handleSendOtp} className="font-semibold text-emerald-500 hover:underline">
                  Resend SMS
                </button>
              </p>
            </div>
          </>
        )}

        {verified && (
          <div className="flex flex-col items-center justify-center gap-4 py-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-1">Identity Verified!</h2>
              <p className="text-sm text-muted-foreground">Redirecting you to login...</p>
            </div>
          </div>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
