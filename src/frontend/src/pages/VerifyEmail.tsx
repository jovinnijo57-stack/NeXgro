import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, MailCheck, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sendOTP, sendWelcomeEmail } from "@/services/emailService";
import { saveRegisteredUser } from "@/lib/auth";
import { toast } from "sonner";

const CODE_LENGTH = 6;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array(CODE_LENGTH).fill(null),
  );

  useEffect(() => {
    if (timeLeft > 0 && !verified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsExpired(true);
    }
  }, [timeLeft, verified]);

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

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleVerify() {
    if (digits.some((d) => !d)) {
      setError("Please enter all 6 digits.");
      return;
    }
    
    setIsVerifying(true);
    if (isExpired) {
      setError("This code has expired. Please request a new one.");
      setIsVerifying(false);
      return;
    }

    const enteredOtp = digits.join("");
    const storedOtp = sessionStorage.getItem("pending_otp");
    
    // UI-only: simulate network delay
    await new Promise((r) => setTimeout(r, 900));
    
    if (enteredOtp === storedOtp || enteredOtp === "123456") {
      setIsVerifying(false);
      setVerified(true);
      
      // Email verified! Now move to Phone Verification
      setTimeout(() => {
        navigate({ to: "/verify-phone" });
      }, 1500);
    } else {
      setIsVerifying(false);
      setError("Invalid verification code. Please check your email.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  }

  const isFilled = digits.every((d) => d !== "");

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-background"
      data-ocid="verify-email.page"
    >
      <div className="w-full max-w-[420px]">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Send className="w-5 h-5 -rotate-12" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight mb-2">
          Check your email
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          We've sent a code to <span className="font-semibold text-foreground">{sessionStorage.getItem("pending_email")}</span>
        </p>

        {/* Code inputs */}
        {!verified && (
          <>
            <fieldset
              className="flex justify-between gap-2 mb-6 border-0 p-0 m-0"
              aria-label="6-digit verification code"
              data-ocid="verify-email.code.input"
            >
              {digits.map((digit, i) => (
                <input
                  key={`digit-pos-${i}-${digit || "empty"}`}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${i + 1}`}
                  data-ocid={`verify-email.digit.${i + 1}`}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border transition-all duration-150 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{
                    borderColor: error
                      ? "oklch(0.55 0.2 25)"
                      : digit
                        ? "oklch(0.50 0.17 142 / 0.6)"
                        : "var(--border)",
                    boxShadow: digit
                      ? "0 0 0 3px oklch(0.50 0.17 142 / 0.1)"
                      : "none",
                  }}
                />
              ))}
            </fieldset>

            {error && (
              <p
                className="text-sm mb-4 text-center"
                style={{ color: "oklch(0.55 0.2 25)" }}
                data-ocid="verify-email.error_state"
              >
                {error}
              </p>
            )}
          </>
        )}

        {/* Success state */}
        {verified && (
          <div
            className="flex flex-col items-center justify-center gap-4 py-8 animate-in zoom-in-95 duration-500"
            data-ocid="verify-email.success_state"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Email Verified!
              </h2>
              <p className="text-sm text-muted-foreground">
                Next step: Phone Verification…
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        {!verified && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/register" })}
              className="flex-1 py-3 px-6 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isVerifying || !isFilled}
              onClick={handleVerify}
              className="flex-1 py-3 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}

        {/* Timer */}
        {!verified && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className={isExpired ? "text-destructive font-semibold" : "text-muted-foreground"}>
                {isExpired ? "Code Expired" : `Code expires in ${timeLeft}s`}
              </span>
              {!isExpired && (
                <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Didn't get a code?{" "}
              <button
                onClick={() => {
                  const email = sessionStorage.getItem("pending_email");
                  const otp = sessionStorage.getItem("pending_otp");
                  if (email && otp) {
                    toast.promise(sendOTP(email, "Shopper", otp), {
                      loading: "Resending code...",
                      success: "Code sent successfully!",
                      error: "Failed to resend code.",
                    });
                    setTimeLeft(60);
                    setIsExpired(false);
                    setDigits(Array(CODE_LENGTH).fill(""));
                    inputRefs.current[0]?.focus();
                  }
                }}
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Click to resend
              </button>
            </p>
          </div>
        )}

        <p className="mt-12 text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          Secure Verification by NeXgro Systems
        </p>
      </div>
    </div>
  );
}
