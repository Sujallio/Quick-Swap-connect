import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
      <div className="flex-1 px-4 pb-24 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-sm text-muted-foreground mb-6">Have a question or need help? Reach out to us.</p>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="h-12" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="h-12 pl-10" type="email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" rows={4} maxLength={1000} />
          </div>
          <Button onClick={handleSubmit} disabled={sending} className="w-full h-12 font-semibold">
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Or email us directly at</p>
            <div className="space-y-2">
              <a href="mailto:support.quickswap@gmail.com" className="text-primary font-medium hover:underline block">
                support.quickswap@gmail.com
              </a>
              <a href="mailto:support@quickswapcash.in" className="text-primary font-medium hover:underline block text-xs text-muted-foreground">
                support@quickswapcash.in
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
