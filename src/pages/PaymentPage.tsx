import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestData = location.state?.requestData as RequestData;

  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (!requestData) {
    navigate("/create");
    return null;
  }

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast.error("Failed to load payment gateway");
      setScriptLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getPostingFee = (amount: number): number => {
    if (amount <= 0) return 5;
    return Math.ceil(amount / 5000) * 5;
  };

  const totalAmount = getPostingFee(requestData.amount);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.error("Payment gateway not ready. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Razorpay order
      const orderResponse = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: totalAmount,
          purpose: "posting_fee",
        },
      });

      if (orderResponse.error) {
        toast.error("Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      const { order_id, amount, key_id } = orderResponse.data;

      // Step 2: Open Razorpay modal
      const options = {
        key: key_id,
        amount: amount,
        currency: "INR",
        name: "QuickSwap",
        description: "Posting Fee for Request",
        order_id: order_id,
        handler: async (response: any) => {
          // Step 3: Verify payment signature
          const verifyResponse = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });

          if (verifyResponse.error || !verifyResponse.data.verified) {
            toast.error("Payment verification failed. Please contact support.");
            setLoading(false);
            return;
          }

          // Step 4: Save request to database
          await saveRequest(response.razorpay_payment_id);
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setLoading(false);
          },
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const saveRequest = async (paymentId: string) => {
    try {
      const { error: insertError } = await supabase
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
          payment_id: paymentId,
          payment_method: "razorpay",
          status: "active",
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

      toast.success("Payment successful! Your request is now live.");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      console.error("Save request error:", err);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

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

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Secure Payment
            </CardTitle>
            <CardDescription>Powered by Razorpay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your payment is secure and encrypted. We accept all major payment methods.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Payment Methods Accepted:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>✓ Credit Card</div>
                <div>✓ Debit Card</div>
                <div>✓ UPI</div>
                <div>✓ Net Banking</div>
                <div>✓ Wallet</div>
                <div>✓ BNPL</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Section */}
        <Alert className="border-primary bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription>
            Once payment is successful, your request will be live immediately and visible to other users.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handlePayment}
          disabled={loading || !scriptLoaded}
          className="w-full h-12 text-base font-semibold"
        >
          {!scriptLoaded ? "Loading Payment Gateway..." : loading ? "Processing..." : `Pay ₹${totalAmount}`}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By proceeding, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
