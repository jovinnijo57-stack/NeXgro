import {
  type WalletTransaction,
  useTopUpWallet,
  useWalletBalance,
  useWalletTransactions,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CreditCard,
  Gift,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

const TX_TYPE_CONFIG: Record<
  WalletTransaction["type"],
  {
    label: string;
    color: string;
    bg: string;
    icon: React.FC<{ className?: string }>;
  }
> = {
  TopUp: {
    label: "Top Up",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: ArrowDownLeft,
  },
  Bonus: {
    label: "Bonus",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    icon: Gift,
  },
  Redemption: {
    label: "Redemption",
    color: "text-accent",
    bg: "bg-accent/10",
    icon: ArrowUpRight,
  },
  Refund: {
    label: "Refund",
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    icon: RefreshCw,
  },
  AdminAdjust: {
    label: "Admin Adj.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    icon: CreditCard,
  },
};

const QUICK_AMOUNTS = [100, 200, 500, 1000];

// Sample transactions removed for real data

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({
  tx,
  index,
}: {
  tx: WalletTransaction;
  index: number;
}) {
  const cfg = TX_TYPE_CONFIG[tx.type];
  const Icon = cfg.icon;
  const isPositive = tx.amount >= 0;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors"
      data-ocid={`wallet.transaction.item.${index + 1}`}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          cfg.bg,
        )}
      >
        <Icon className={cn("w-4 h-4", cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {tx.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
              cfg.bg,
              cfg.color,
            )}
          >
            {cfg.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      <span
        className={cn(
          "font-bold text-sm tabular-nums shrink-0",
          isPositive ? "text-primary" : "text-destructive",
        )}
      >
        {isPositive ? "+" : ""}₹{Math.abs(tx.amount).toFixed(2)}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const { data: walletBalance } = useWalletBalance();
  const { data: transactions } = useWalletTransactions();
  const topUp = useTopUpWallet();

  const [customAmount, setCustomAmount] = useState("");
  const [selectedQuick, setSelectedQuick] = useState<number | null>(50);

  const displayBalance = (walletBalance ?? 0) / 100;
  const displayTx = transactions ?? [];

  const activeAmount = customAmount
    ? Number(customAmount)
    : (selectedQuick ?? 0);
  const bonusPercent = 5;
  const bonusAmount = activeAmount * (bonusPercent / 100);
  const totalAfterBonus = activeAmount + bonusAmount;

  async function handleTopUp() {
    if (!activeAmount || activeAmount < 1) {
      toast.error("Please enter a valid amount (minimum ₹1)");
      return;
    }
    await topUp.mutateAsync(activeAmount);
    toast.success(`₹${activeAmount.toFixed(2)} added to your wallet!`);
    setCustomAmount("");
    setSelectedQuick(50);
  }

  return (
    <div
      className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-5"
      data-ocid="wallet.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Back to profile"
          data-ocid="wallet.back_link"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-foreground text-xl">
            My Wallet 💳
          </h1>
        </div>
      </div>

      {/* Balance Card */}
      <div
        className="rounded-2xl p-6 shadow-elevated"
        style={{
          background:
            "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)",
        }}
        data-ocid="wallet.balance_card"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium mb-1">
              Available Balance
            </p>
            <p className="font-display text-5xl font-bold text-primary-foreground tabular-nums">
              ₹{displayBalance.toFixed(2)}
            </p>
            <p className="text-primary-foreground/60 text-xs mt-2">
              Wallet credit · Used at checkout automatically
            </p>
          </div>
          <Wallet className="w-14 h-14 text-primary-foreground/10 shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-primary-foreground/10 rounded-xl p-3 text-center">
            <p className="text-xs text-primary-foreground/70">Total Added</p>
            <p className="font-bold text-primary-foreground text-base">
              ₹0.00
            </p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-3 text-center">
            <p className="text-xs text-primary-foreground/70">Bonus Earned</p>
            <p className="font-bold text-primary-foreground text-base">₹0.00</p>
          </div>
        </div>
      </div>

      {/* Top Up Card */}
      <div
        className="bg-card border border-border rounded-2xl p-5 shadow-card"
        data-ocid="wallet.topup_section"
      >
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <ArrowDownLeft className="w-4 h-4 text-primary" />
          Add Money
        </h2>

        {/* Quick select */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setSelectedQuick(amt);
                setCustomAmount("");
              }}
              className={cn(
                "py-2.5 rounded-xl text-sm font-semibold border transition-colors",
                selectedQuick === amt && !customAmount
                  ? "bg-primary text-primary-foreground border-primary shadow-card"
                  : "bg-background border-border text-foreground hover:border-primary hover:text-primary",
              )}
              data-ocid={`wallet.quick_amount_${amt}`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="mb-4">
          <label
            htmlFor="wallet-custom"
            className="text-xs font-medium text-muted-foreground mb-1.5 block"
          >
            Or enter custom amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
              ₹
            </span>
            <input
              id="wallet-custom"
              type="number"
              min="1"
              step="1"
              value={customAmount}
              placeholder="0.00"
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedQuick(null);
              }}
              className="w-full pl-7 pr-4 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              data-ocid="wallet.custom_amount_input"
            />
          </div>
        </div>

        {/* Bonus preview */}
        {activeAmount >= 1 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Bonus Credit Preview
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Add ₹{activeAmount.toFixed(2)}, get{" "}
                <span className="text-primary font-semibold">
                  +₹{bonusAmount.toFixed(2)} ({bonusPercent}% bonus)
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary/10">
              <span className="text-xs text-muted-foreground font-medium">
                Total credited to wallet:
              </span>
              <span className="text-sm font-bold text-primary">
                ₹{totalAfterBonus.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleTopUp}
          disabled={topUp.isPending || activeAmount < 1}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 text-sm shadow-card"
          data-ocid="wallet.add_money_button"
        >
          {topUp.isPending
            ? "Processing…"
            : `Add ₹${activeAmount >= 1 ? activeAmount.toFixed(2) : "0.00"}`}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Wallet credit never expires · Works on all NeXgro orders · No fees
        </p>
      </div>

      {/* Transaction History */}
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
        data-ocid="wallet.transactions_section"
      >
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            Transaction History
          </h2>
          <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-full">
            {displayTx.length} transactions
          </span>
        </div>

        {displayTx.length === 0 ? (
          <div
            className="p-10 text-center"
            data-ocid="wallet.transactions.empty_state"
          >
            <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-semibold text-foreground">No transactions yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Add money to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayTx.map((tx, i) => (
              <TransactionRow key={tx.id} tx={tx} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
