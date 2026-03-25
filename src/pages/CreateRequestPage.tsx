import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, LocateFixed, Loader2 } from "lucide-react";
import { processPayment } from "@/lib/razorpay";

const getPostingFee = (amount: number): number => {
  if (amount <= 1000) return 5;
  if (amount <= 5000) return 10;
  if (amount <= 10000) return 15;
  if (amount <= 25000) return 20;
  if (amount <= 50000) return 25;
  return 30;
};

const CreateRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    amount: "",
    needType: "cash",
    haveType: "upi",
    city: "",
    locationText: "",
    urgency: "low",
    description: "",
  });

  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        // Reverse geocode to detect city
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
          );
          const data = await res.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            "";
          setDetectedCity(city);
          if (city) {
            setForm((prev) => ({ ...prev, city: city }));
            toast.success(`Location captured! Detected city: ${city}`);
          } else {
            toast.success("Location captured!");
          }
        } catch {
          toast.success("Location captured!");
        }

        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || "Failed to get location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Please login first"); return; }
    if (!form.amount || !form.city) {
      toast.error("Amount and City are required");
      return;
    }
    const amount = parseInt(form.amount);
    if (isNaN(amount) || amount < 100 || amount > 100000) {
      toast.error("Amount must be between ₹100 and ₹1,00,000");
      return;
    }

    // Validate city matches GPS location if both are provided
    if (coords && detectedCity) {
      const enteredCity = form.city.trim().toLowerCase();
      const detected = detectedCity.toLowerCase();
      if (enteredCity !== detected && !detected.includes(enteredCity) && !enteredCity.includes(detected)) {
        toast.error(`City mismatch! Your GPS location shows "${detectedCity}" but you entered "${form.city.trim()}". Please correct the city or remove the live location.`);
        return;
      }
    }
      toast.error("Amount must be between ₹100 and ₹1,00,000");
      return;
    }

    const postingFee = getPostingFee(amount);
    setLoading(true);

    // Check daily limit
    const { data: canPost } = await supabase.rpc("check_daily_request_limit", { p_user_id: user.id });
    if (!canPost) {
      toast.error("Daily limit reached (max 5 requests/day)");
      setLoading(false);
      return;
    }

    // Razorpay payment
    let paymentId: string;
    try {
      const result = await processPayment(postingFee, "posting");
      paymentId = result.payment_id;
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("requests").insert({
      user_id: user.id,
      amount,
      need_type: form.needType,
      have_type: form.haveType,
      city: form.city.trim(),
      location_text: form.locationText.trim(),
      urgency: form.urgency,
      description: form.description.trim(),
      payment_id: paymentId,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    } as any);

    setLoading(false);
    if (error) {
      toast.error("Failed to create request");
    } else {
      toast.success("Request posted!");
      navigate("/");
    }
  };

  return (
    <div className="pb-24 pt-4 px-4">
      <h1 className="text-xl font-bold text-foreground mb-1">Post a Request</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Posting fee: ₹5–₹30 based on amount (mock)
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            placeholder="e.g. 2000"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="h-12 text-lg font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>I Need</Label>
            <Select value={form.needType} onValueChange={(v) => setForm({ ...form, needType: v })}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="upi">📱 UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>I Have</Label>
            <Select value={form.haveType} onValueChange={(v) => setForm({ ...form, haveType: v })}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="upi">📱 UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>City</Label>
          <Input
            placeholder="e.g. Mumbai"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Location Details</Label>
          <Input
            placeholder="e.g. Near Andheri Station"
            value={form.locationText}
            onChange={(e) => setForm({ ...form, locationText: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Live Location (optional)</Label>
          <Button
            type="button"
            variant={coords ? "secondary" : "outline"}
            className="w-full h-12"
            onClick={handleGetLocation}
            disabled={locating}
          >
            {locating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Getting location...</>
            ) : coords ? (
              <><LocateFixed className="mr-2 h-4 w-4 text-primary" />Location captured ✓</>
            ) : (
              <><LocateFixed className="mr-2 h-4 w-4" />Use My Current Location</>
            )}
          </Button>
          {coords && (
            <p className="text-xs text-muted-foreground">
              📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Urgency</Label>
          <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Textarea
            placeholder="Any extra details..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={500}
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-base font-semibold">
          <Send className="mr-2 h-4 w-4" />
          {loading ? "Posting..." : `Post Request · ₹${form.amount ? getPostingFee(parseInt(form.amount) || 0) : 5}`}
        </Button>
      </div>
    </div>
  );
};

export default CreateRequestPage;
