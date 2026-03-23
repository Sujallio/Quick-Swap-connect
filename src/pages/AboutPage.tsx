import { Shield, ArrowRight, Users, Lock, AlertTriangle, MapPin } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="pb-24 pt-4 px-4 space-y-6">
      <h1 className="text-xl font-bold text-foreground">About QuickSwap Cash</h1>

      {/* Purpose */}
      <section className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Our Purpose</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          QuickSwap Cash helps you find nearby people for emergency cash and UPI exchanges.
          Whether you need cash urgently or want to convert digital money to cash (or vice versa),
          our platform connects you with people in your area who can help.
        </p>
      </section>

      {/* How It Works */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">How It Works</h2>
        </div>
        <div className="space-y-3">
          {[
            { step: "1", title: "Post a Request", desc: "Tell us how much you need and what type (cash or UPI)" },
            { step: "2", title: "Browse & Match", desc: "Find nearby requests that match your needs" },
            { step: "3", title: "Unlock Contact", desc: "Pay ₹5 to unlock the poster's phone number" },
            { step: "4", title: "Meet & Exchange", desc: "Connect via WhatsApp and meet offline to complete the exchange" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Safety Instructions</h2>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Always meet in a public, well-lit place
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Verify the person's identity before exchanging money
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Count cash carefully and confirm UPI transfers before leaving
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Avoid sharing personal details beyond what's needed for the exchange
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            Trust your instincts — if something feels off, walk away
          </li>
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="font-semibold text-destructive">Disclaimer</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This platform only connects users for cash/digital exchange. All transactions are
          conducted offline at users' own risk. We are not responsible for any fraud, loss,
          or disputes arising from exchanges made through this platform.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
