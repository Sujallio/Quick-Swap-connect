import { Link } from "react-router-dom";
import { Shield, Send, Search, Unlock, Handshake, ArrowRight, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const steps = [
  { icon: Send, title: "Post Request", desc: "Tell us how much you need and whether you want cash or UPI." },
  { icon: Search, title: "Get Matched", desc: "Others in your city see your request and can help." },
  { icon: Unlock, title: "Unlock Contact", desc: "Pay a small fee to reveal the helper's phone number." },
  { icon: Handshake, title: "Meet & Exchange", desc: "Meet in a safe public place and complete the swap." },
];

const LandingPage = () => (
  <div className="min-h-screen flex flex-col">
    {/* Hero */}
    <header className="px-4 py-4 flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Shield className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">QuickSwap Cash</span>
    </header>

    <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 space-y-6">
      <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Now live in your city
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-foreground max-w-md">
        Exchange Cash & UPI <br className="hidden sm:block" />
        <span className="text-primary">Instantly, Nearby</span>
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
        Need cash but only have UPI? Or the other way around? QuickSwap connects you with people nearby for a quick, safe swap.
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg" className="h-12 px-6 font-semibold">
          <Link to="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-6">
          <Link to="/about">Learn More</Link>
        </Button>
      </div>
    </section>

    {/* How it Works */}
    <section className="px-4 py-12 bg-muted/50">
      <h2 className="text-xl font-bold text-center text-foreground mb-8">How It Works</h2>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {steps.map((step, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <step.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
            <p className="text-sm font-bold text-foreground">{step.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Trust section */}
    <section className="px-6 py-12 text-center space-y-4">
      <h2 className="text-xl font-bold text-foreground">Built for Trust</h2>
      <div className="max-w-sm mx-auto space-y-3 text-sm text-muted-foreground">
        <p>✅ Phone numbers hidden until you pay to unlock</p>
        <p>✅ Rate users after every exchange</p>
        <p>✅ Report suspicious activity instantly</p>
        <p>✅ GPS-verified locations for nearby matches</p>
      </div>
      <Button asChild className="mt-4 h-12 px-8 font-semibold">
        <Link to="/login">Start Swapping <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </section>

    {/* Follow Us Section */}
    <section className="px-4 py-12 border-t">
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">Follow us on social media</p>
        <div className="flex justify-center gap-6">
          <a
            href="https://www.instagram.com/quickswap.connect"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            title="Follow us on Instagram"
          >
            <Instagram className="h-5 w-5 text-pink-600" />
            <span className="text-sm font-medium">Instagram</span>
          </a>
          <a
            href="https://www.linkedin.com/company/quick-swap-connect/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            title="Follow us on LinkedIn"
          >
            <Linkedin className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">LinkedIn</span>
          </a>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default LandingPage;
