import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsPage = () => (
  <div className="min-h-screen flex flex-col">
    <div className="px-4 py-4">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
    </div>
    <div className="flex-1 px-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Terms & Conditions</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4 text-sm leading-relaxed">
        <p><strong>Last updated:</strong> April 2026</p>

        <h2 className="text-base font-semibold text-foreground">1. Platform Purpose</h2>
        <p>QuickSwap Cash is a peer-to-peer matching platform that connects users seeking to exchange cash for digital payments (UPI) and vice versa. The platform only facilitates connections — it does not handle, store, or process any exchange funds.</p>

        <h2 className="text-base font-semibold text-foreground">2. No Liability</h2>
        <p>All transactions are conducted offline between users at their own risk. QuickSwap Cash bears no responsibility for any disputes, fraud, loss, or damages arising from exchanges between users.</p>

        <h2 className="text-base font-semibold text-foreground">3. User Responsibilities</h2>
        <p>Users must provide accurate information during registration. Users must meet in safe, public locations for exchanges. Users must verify transaction details before completing any exchange.</p>

        <h2 className="text-base font-semibold text-foreground">4. Fees</h2>
        <p>The platform charges a non-refundable posting fee (₹5–₹30 based on amount) and a contact unlock fee (₹5). These fees are for platform services and are not related to the exchange amount.</p>

        <h2 className="text-base font-semibold text-foreground">5. Account Termination</h2>
        <p>We reserve the right to block or terminate accounts that violate these terms, engage in fraudulent activity, or are reported by other users.</p>

        <h2 className="text-base font-semibold text-foreground">6. Modifications</h2>
        <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default TermsPage;
