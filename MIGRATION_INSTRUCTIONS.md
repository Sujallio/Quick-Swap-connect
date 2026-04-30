# Razorpay Payment Integration Setup

This application uses **Razorpay Standard Checkout** for secure payment processing. Follow these steps to complete the setup.

---

## Step 1: Set Razorpay Credentials in Supabase

### 1.1 Get Your Credentials
Your Razorpay credentials are already configured:
- **KEY_ID**: `rzp_test_SjjIkGtcKKtyaj`
- **KEY_SECRET**: `RE0pmmtlL9g7SyRtuQavQuyu`

### 1.2 Add to Supabase Environment Variables
1. Go to: https://app.supabase.com/
2. Select your project: `Quick-Swap-connect`
3. Click **Settings** → **Vault** (or **Environment Variables**)
4. Create two secrets:
   - `RAZORPAY_KEY_ID` = `rzp_test_SjjIkGtcKKtyaj`
   - `RAZORPAY_KEY_SECRET` = `RE0pmmtlL9g7SyRtuQavQuyu`
5. Click **Add** for each

---

## Step 2: Apply Database Migration

### 2.1 Go to Supabase SQL Editor
- Visit: https://app.supabase.com/
- Click **SQL Editor** → **New Query**

### 2.2 Copy and Execute This SQL

```sql
-- Replace transaction_id with payment_id for Razorpay
ALTER TABLE public.requests
DROP COLUMN IF EXISTS transaction_id CASCADE;

-- Add Razorpay payment fields
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS payment_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'razorpay';

-- Drop old RLS policies and create new one for active requests
DROP POLICY IF EXISTS "Users can view verified requests" ON public.requests;
DROP POLICY IF EXISTS "Users can view all active requests" ON public.requests;

CREATE POLICY "Users can view all active requests"
  ON public.requests
  FOR SELECT
  USING (status = 'active');

-- Create index for payment_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_payment_id ON public.requests(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_payment_method ON public.requests(payment_method);
```

### 2.3 Verify Execution
- Click **Run** (or `Ctrl+Enter`)
- You should see: "Query executed successfully"
- Check **Table Editor** → **requests** to verify new columns exist

---

## Step 3: Frontend Configuration

✅ **Already Done** - Frontend is configured to use Razorpay:
- Razorpay script loaded dynamically on Payment Page
- Public Key ID set in `.env.local`
- Payment modal integration complete

### 3.1 Verify .env.local
Confirm the file `c:\Users\sujal\Desktop\QuickSwap\quick-cash-connect\.env.local` contains:

```
VITE_RAZORPAY_KEY_ID=rzp_test_SjjIkGtcKKtyaj
```

⚠️ **IMPORTANT**: The `RAZORPAY_KEY_SECRET` is ONLY in Supabase and never in the frontend.

---

## Step 4: Test the Payment Flow

### 4.1 Start Your Development Server
```bash
npm run dev
```

### 4.2 Test Payment
1. Log in to the app
2. Create a new request (Post Request)
3. Enter request details and click "Post Request"
4. On Payment Page, click **Pay ₹{amount}** button
5. You should see Razorpay checkout modal
6. Choose any payment method (UPI, Card, etc.)

### 4.3 Test Credentials & Troubleshooting

**⚠️ IMPORTANT: If Standard Razorpay Test Credentials Don't Work**

Razorpay's official test credentials are:
- **Test Card**: 4111 1111 1111 1111 · CVV: 123 · Expiry: 12/26
- **Test UPI**: test@razorpay

**If these show errors like:**
- ❌ "International cards are not supported"
- ❌ "Please enter a valid card number"
- ❌ No manual UPI entry option (only QR)

**Your Razorpay account may not be fully activated for testing. Steps to fix:**

1. **Go to Razorpay Dashboard**: https://dashboard.razorpay.com
2. **Check Account Status:**
   - Settings → Account Settings → Verify your phone & email
   - Complete any pending KYC verification
   - Ensure account is in **Test Mode** (not Live)
3. **Check Payment Settings:**
   - Settings → Payment Methods
   - Enable: Cards, UPI, Net Banking, Wallets
   - Verify all are enabled
4. **Generate Fresh Test Keys:**
   - Settings → API Keys
   - Copy fresh **KEY_ID** (starts with `rzp_test_`)
   - Copy fresh **KEY_SECRET**
5. **Update Your Application:**
   - Add new keys to Supabase Vault (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
   - Update .env.local with new KEY_ID
6. **Test Again** with official test credentials above

---

**Temporary Workaround: Use Razorpay Payment Links**

If your account is still having issues:
1. Create a Payment Link in Razorpay Dashboard
2. Use the link directly without backend integration
3. This bypasses account configuration issues

See: https://razorpay.com/docs/payments/payment-gateway/payment-links/

---

**If above doesn't work:**
- Contact Razorpay support (support@razorpay.com)
- Provide them your merchant ID
- Ask them to verify test mode is enabled
- Ask them to check if international test cards are blocked

---

## System Architecture

### Frontend (React + Vite)
```
PaymentPage.tsx
├── Load Razorpay script dynamically
├── Call create-razorpay-order function
├── Open Razorpay modal with order_id
└── On success: Call verify-razorpay-payment
```

### Backend (Supabase Edge Functions - Deno)
```
create-razorpay-order
├── Validate amount ≥ ₹100
├── Call Razorpay API with credentials
└── Return: order_id, amount, key_id

verify-razorpay-payment
├── Check HMAC-SHA256 signature
├── Compare with Razorpay signature
└── Return: verified status
```

### Database
```
requests table:
├── payment_id (UNIQUE, set by Razorpay)
├── payment_method (DEFAULT: 'razorpay')
├── status (active/completed/cancelled)
└── amount (request amount in ₹)
```

---

## Payment Flow

1. **User creates request** → Form data sent to Payment Page
2. **Payment Page opens** → Shows amount breakdown
3. **User clicks "Pay ₹{amount}"** → Razorpay creates order
4. **Razorpay Modal Opens** → User selects payment method (UPI, Card, etc.)
5. **Payment successful** → Signature verified
6. **Request goes live** → Status = 'active', visible to all users
7. **Notification emails sent** → To users in same city

---

## Posting Fee Calculation

```typescript
getPostingFee(amount: number): number
├── If amount ≤ 0: fee = ₹5
├── If amount ≤ 5000: fee = ₹5
├── If amount 5001-10000: fee = ₹10
├── If amount 10001-15000: fee = ₹15
└── Pattern: ₹5 per ₹5000 range
```

Example:
- Request ₹3000 → Fee ₹5
- Request ₹5000 → Fee ₹5
- Request ₹5001 → Fee ₹10
- Request ₹10000 → Fee ₹10
- Request ₹30000 → Fee ₹30

---

## What Changed from UPI System

❌ **Removed:**
- UPI QR code generation
- Manual transaction ID entry
- Payment screenshot uploads
- Admin verification workflow
- 'pending_verification' status

✅ **Added:**
- Razorpay Standard Checkout
- Multiple payment methods (UPI, Card, Net Banking, Wallet, BNPL)
- Automatic signature verification
- Immediate request activation (status = 'active')
- Secure backend order creation

---

## Troubleshooting

### Payment Gateway Not Loading
- Check browser console for errors
- Verify Razorpay script URL: `https://checkout.razorpay.com/v1/checkout.js`
- Clear browser cache and reload

### Order Creation Fails
- ✓ Verify RAZORPAY_KEY_ID is set in Supabase Vault
- ✓ Verify amount ≥ ₹100 (minimum Razorpay amount)
- ✓ Check Supabase function logs for errors

### Signature Verification Fails
- ✓ Verify RAZORPAY_KEY_SECRET is set in Supabase Vault
- ✓ Check that secrets are correctly copied (no extra spaces)
- ✓ View Supabase function logs for detailed error

### Requests Not Visible on Home Page
- ✓ Verify status = 'active' in database
- ✓ Check that requests are in the user's city (or city filter is off)
- ✓ Verify RLS policy allows SELECT for status = 'active'

---

## Edge Function Logs

To debug payment issues:
1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click on function name (create-razorpay-order or verify-razorpay-payment)
3. Click **Logs** tab
4. Look for errors and check request/response data

---

## Security Notes

⚠️ **KEY SECURITY RULES:**
- ✅ Public Key ID is in frontend (.env.local)
- ❌ Secret Key NEVER reaches frontend code
- ✅ Secret Key only in Supabase Vault (backend)
- ✅ All payments verified server-side before saving
- ✅ HMAC-SHA256 signature validation prevents tampering

---

## Production Checklist

Before going live:
- [ ] Switch Razorpay to Live mode (contact Razorpay support)
- [ ] Get Live KEY_ID and KEY_SECRET from Razorpay dashboard
- [ ] Update Supabase secrets with live credentials
- [ ] Update .env.local with live KEY_ID
- [ ] Test complete payment flow with real card
- [ ] Monitor Razorpay dashboard for payment activity
- [ ] Set up webhook (optional) for payment status updates
- [ ] Inform users about payment changes (UPI QR → Razorpay)

---

**Questions?** Check [Razorpay Documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
