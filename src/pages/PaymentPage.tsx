import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, AlertCircle, Upload } from "lucide-react";

// Sujal's UPI Configuration
const UPI_ID = "sujalchh59-1@oksbi";

// Generate QR code dynamically using your UPI ID
const UPI_QR_IMAGE = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${UPI_ID}`;

interface RequestData {
  amount: number;
  needType: string;
  haveType: string;
  city: string;
  locationText: string;
  urgency: string;
  description: string;
  lat?: number;
  lng?: number;
}

const PaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestData = location.state?.requestData as RequestData;

  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!requestData) {
    navigate("/create");
    return null;
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter the UPI Transaction ID");
      return;
    }

    if (transactionId.trim().length < 5) {
      toast.error("Transaction ID must be at least 5 characters");
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshot) {
        const fileName = `${user.id}/${Date.now()}-${screenshot.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from("payment-screenshots")
          .upload(fileName, screenshot, { upsert: false });

        if (uploadError) {
          toast.error("Failed to upload screenshot");
          setLoading(false);
          return;
        }

        screenshotUrl = data?.path || null;
      }

      // Check for duplicate transaction ID
      const { data: existing } = await supabase
        .from("requests")
        .select("id")
        .eq("transaction_id", transactionId.trim())
        .single();

      if (existing) {
        toast.error("This Transaction ID has already been submitted");
        setLoading(false);
        return;
      }

      // Insert request with pending_verification status
      const { error: insertError, data: insertedRequest } = await supabase
        .from("requests")
        .insert({
          user_id: user.id,
          amount: requestData.amount,
          need_type: requestData.needType,
          have_type: requestData.haveType,
          city: requestData.city,
          location_text: requestData.locationText,
          urgency: requestData.urgency,
          description: requestData.description,
          latitude: requestData.lat ?? null,
          longitude: requestData.lng ?? null,
          transaction_id: transactionId.trim(),
          payment_method: "upi_manual",
          payment_screenshot: screenshotUrl,
          status: "pending_verification",
        } as any)
        .select()
        .single();

      if (insertError) {
        toast.error("Failed to save request. Please try again.");
        console.error("Insert error:", insertError);
        setLoading(false);
        return;
      }

      // Send email notification to users in same city (async, non-blocking)
      supabase.functions
        .invoke("send-request-notification-emails", {
          body: {
            city: requestData.city,
            amount: requestData.amount,
            need_type: requestData.needType,
            have_type: requestData.haveType,
            requesterId: user.id,
          },
        })
        .catch((err) => {
          console.error("Failed to send notifications:", err);
        });

      toast.success("Request submitted successfully!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      console.error("Payment submission error:", err);
      toast.error(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPostingFee = (amount: number): number => {
    if (amount <= 0) return 5;
    return Math.ceil(amount / 5000) * 5;
  };

  // Users only pay the posting fee, not the request amount
  const totalAmount = getPostingFee(requestData.amount);

  return (
    <div className="pb-24 pt-4 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/create")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        {/* Payment Details Card */}
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-muted-foreground">Request Amount</span>
              <span className="text-lg font-bold text-primary">₹{requestData.amount}</span>
            </div>
            <p className="text-xs text-muted-foreground px-3">
              💡 This is what you want to exchange with someone, not what you pay.
            </p>
            <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Posting Fee</span>
              <span className="text-sm font-semibold">₹{getPostingFee(requestData.amount)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">💳 You Pay</span>
              <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">UPI Payment</CardTitle>
            <CardDescription>Scan the QR code below to send payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <img
                src={UPI_QR_IMAGE}
                alt="UPI QR Code"
                className="w-64 h-64 border-4 border-primary rounded-lg"
              />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Or send to:</p>
                <p className="text-lg font-bold text-primary">{UPI_ID}</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                After scanning and completing the payment, enter your UPI Transaction ID below
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Transaction ID Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verify Payment</CardTitle>
            <CardDescription>Enter your transaction details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="txnId">
                UPI Transaction ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="txnId"
                placeholder="e.g., UPI12345678901234"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="h-12 font-mono"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Found in your UPI app under transaction history
              </p>
            </div>

            {/* Screenshot Upload (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="screenshot">
                Payment Screenshot <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <div className="flex flex-col gap-2">
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  disabled={loading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  onClick={() => document.getElementById("screenshot")?.click()}
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {screenshot ? "Screenshot Uploaded" : "Upload Screenshot"}
                </Button>
                {screenshotPreview && (
                  <div className="relative w-full">
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot preview"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotPreview("");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Helps us verify payment faster. Max 5MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Section */}
        <Alert className="border-primary bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription>
            Once submitted, your request will be reviewed by our team. You'll see it live after verification.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
        >
          {loading ? "Submitting..." : "Submit Payment & Request"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;
