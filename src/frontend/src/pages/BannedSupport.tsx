import { ArrowLeft, MessageSquare, ShieldAlert, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function BannedSupport() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mb-6 animate-bounce">
        <ShieldAlert className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-display font-bold text-foreground mb-3">
        Account Restricted
      </h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        Your account has been automatically restricted due to multiple order cancellations (3 or more). To maintain platform fairness, please contact our support team to discuss your account status.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <a 
          href="mailto:support@nexgro.com"
          className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <MessageSquare className="w-5 h-5" />
          Contact Support
        </a>
        
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 w-full py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      <div className="mt-12 p-4 bg-card border border-border rounded-2xl text-left max-w-md">
        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          Platform Policy
        </h3>
        <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
          <li>Accounts with 3 or more cancellations are flagged for review.</li>
          <li>For COD orders, previous delivery fees may apply to your next successful order.</li>
          <li>Our support team is available 24/7 to help resolve disputes.</li>
        </ul>
      </div>
    </div>
  );
}
