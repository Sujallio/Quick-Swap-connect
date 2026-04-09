import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPage = () => (
  <div className="min-h-screen flex flex-col">
    <div className="px-4 py-4">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
    </div>
    <div className="flex-1 px-4 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4 text-sm leading-relaxed">
        <p><strong>Last updated:</strong> April 2026</p>

        <h2 className="text-base font-semibold text-foreground">1. Data We Collect</h2>
        <p>We collect the following information when you register: email address, phone number, name, and city. We may also collect GPS location data when you choose to share it while posting a request.</p>

        <h2 className="text-base font-semibold text-foreground">2. How We Use Your Data</h2>
        <p>Your email and phone are used for account authentication and facilitating connections. Your city and location help match you with nearby users. Phone numbers are kept hidden and only revealed when another user pays to unlock your contact.</p>

        <h2 className="text-base font-semibold text-foreground">3. Data Sharing</h2>
        <p>We do not sell or share your personal data with third parties. Your phone number is only revealed to users who pay the unlock fee for your specific request.</p>

        <h2 className="text-base font-semibold text-foreground">4. Data Security</h2>
        <p>We use industry-standard security measures including encrypted connections and row-level security policies to protect your data.</p>

        <h2 className="text-base font-semibold text-foreground">5. Data Retention</h2>
        <p>Your data is retained as long as your account is active. You can request deletion of your account by contacting support.</p>

        <h2 className="text-base font-semibold text-foreground">6. Contact</h2>
        <p>For privacy-related queries, reach us at <a href="mailto:support.quickswap24@gmail.com" className="text-primary hover:underline">support.quickswap24@gmail.com</a> or <a href="mailto:support@quickswapcash.in" className="text-primary hover:underline">support@quickswapcash.in</a></p>
      </div>
    </div>
    <Footer />
  </div>
);

export default PrivacyPage;
