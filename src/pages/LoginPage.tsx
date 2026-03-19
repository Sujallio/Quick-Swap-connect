import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Smartphone, Shield } from "lucide-react";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setStep("otp");
      toast.success("OTP sent! (Use 123456 for testing)");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Enter the OTP");
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">QuickSwap Cash</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to exchange cash & digital money nearby
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex h-12 items-center rounded-lg border bg-muted px-3 text-sm font-medium text-muted-foreground">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="h-12 text-base"
                    maxLength={10}
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={loading || phone.length < 10}
                className="w-full h-12 text-base font-semibold"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 text-center text-xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  OTP sent to +91{phone}
                </p>
              </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full h-12 text-base font-semibold"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setStep("phone"); setOtp(""); }}
                className="w-full"
              >
                Change phone number
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
