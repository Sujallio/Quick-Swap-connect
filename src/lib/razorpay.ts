interface PaymentResult {
  payment_id: string;
}

export async function processPayment(amountINR: number, purpose: string): Promise<PaymentResult> {
  // Mock payment: simulate a short delay and return a fake payment ID
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const mockId = `mock_pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return { payment_id: mockId };
}
