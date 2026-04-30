import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentResult {
  payment_id: string;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export async function processPayment(amountINR: number, purpose: string): Promise<PaymentResult> {
  await loadRazorpayScript();

  // Create order via edge function
  const { data: orderData, error: orderError } = await supabase.functions.invoke(
    "create-razorpay-order",
    { body: { amount: amountINR, purpose } }
  );

  if (orderError || !orderData?.order_id) {
    throw new Error(orderData?.error || orderError?.message || "Failed to create payment order");
  }

  // Open Razorpay checkout
  return new Promise<PaymentResult>((resolve, reject) => {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: "INR",
      name: "QuickSwap",
      description: purpose === "unlock" ? "Contact Unlock Fee" : "Request Posting Fee",
      order_id: orderData.order_id,
      handler: async (response: any) => {
        try {
          // Verify payment via edge function
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
            "verify-razorpay-payment",
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            }
          );

          if (verifyError || !verifyData?.verified) {
            reject(new Error("Payment verification failed"));
            return;
          }

          resolve({ payment_id: response.razorpay_payment_id });
        } catch (err: any) {
          reject(new Error(err.message || "Payment verification failed"));
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled by user")),
      },
      theme: { color: "#000000" },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      reject(new Error(response.error?.description || "Payment failed"));
    });
    rzp.open();
  });
}
