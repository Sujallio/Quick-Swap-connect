import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

let scriptLoaded = false;

export function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded && window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

interface PaymentResult {
  payment_id: string;
}

export async function processPayment(amountINR: number, purpose: string): Promise<PaymentResult> {
  await loadRazorpayScript();

  // Create order via edge function
  const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
    body: { amount: amountINR, purpose },
  });

  if (orderError || !orderData?.order_id) {
    throw new Error(orderError?.message || "Failed to create payment order");
  }

  // Open Razorpay checkout
  return new Promise((resolve, reject) => {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: "INR",
      name: "QuickSwap Cash",
      description: purpose === "posting" ? "Request Posting Fee" : "Contact Unlock Fee",
      order_id: orderData.order_id,
      handler: async (response: any) => {
        try {
          // Verify payment
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });

          if (verifyError || !verifyData?.verified) {
            reject(new Error("Payment verification failed"));
            return;
          }

          resolve({ payment_id: response.razorpay_payment_id });
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
      theme: { color: "#16a34a" },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (res: any) => {
      reject(new Error(res.error?.description || "Payment failed"));
    });
    rzp.open();
  });
}
