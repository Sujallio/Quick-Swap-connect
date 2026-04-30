# Razorpay Payment Integration Setup

This application uses **Razorpay Standard Checkout** for secure payment processing. Follow these steps to complete the setup.

---

## Step 1: Set Razorpay Credentials in Supabase

### 1.1 Get Your Credentials
Your Razorpay credentials are now configured for LIVE mode:
- **KEY_ID**: `rzp_live_Sjjz2UOhKOizyg`
- **KEY_SECRET**: `mC0mYFUEn45W5E1GpanoaXlC`

⚠️ **IMPORTANT: These are LIVE credentials - real money will be charged!**

### 1.2 Add to Supabase Environment Variables

**If you're updating credentials (IMPORTANT - Don't create new, UPDATE existing):**

1. Go to: https://app.supabase.com/
2. Select your project: `Quick-Swap-connect`
3. Click **Settings** → **Vault**
4. You'll see existing secrets: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
5. **Click on each secret to EDIT it:**
   - Click `RAZORPAY_KEY_ID` → Edit → Change value to `rzp_live_Sjjz2UOhKOizyg` → Save
   - Click `RAZORPAY_KEY_SECRET` → Edit → Change value to `mC0mYFUEn45W5E1GpanoaXlC` → Save

**If secrets don't exist yet (first time setup):**

1. Go to: https://app.supabase.com/
2. Select your project: `Quick-Swap-connect`
3. Click **Settings** → **Vault**
4. Click **Create Secret** button
5. Create two secrets:
   - Name: `RAZORPAY_KEY_ID` → Value: `rzp_live_Sjjz2UOhKOizyg`
   - Name: `RAZORPAY_KEY_SECRET` → Value: `mC0mYFUEn45W5E1GpanoaXlC`
6. Click **Create** for each

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
VITE_RAZORPAY_KEY_ID=rzp_live_Sjjz2UOhKOizyg
```

⚠️ **IMPORTANT**: The `RAZORPAY_KEY_SECRET` is ONLY in Supabase Vault (never in frontend code).

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

### 4.3 Payment Testing (LIVE MODE)

⚠️ **WARNING: You are now in LIVE MODE - Real money will be charged!**

Do NOT test with fake data. Only test with:
1. **Small real transactions** (₹5-₹10)
2. **Your own cards/accounts** 
3. **Real bank transfers** if needed

**Testing Steps:**
1. Log in to your app
2. Create a new request with a small amount (₹10)
3. Click "Pay ₹{amount}"
4. Enter your real card or use UPI/Net Banking
5. Complete payment (real money will be charged)
6. Verify request appears with status='active'
7. Monitor your bank account for transaction confirmation

**Monitor your Razorpay Dashboard:**
- Go to: https://dashboard.razorpay.com
- View all payments in real-time
- Track settlement in your bank account (usually 2-3 days)

**If You Made a Test Payment:**
- Check your Razorpay Dashboard
- Look for the transaction in Payments section
- Download receipt for your records
- Refund must be processed manually if needed

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

✅ **LIVE MODE ACTIVATED** - Your Razorpay account is now in LIVE mode

Completed steps:
- [x] Switch Razorpay to Live mode ✅
- [x] Get Live KEY_ID and KEY_SECRET from Razorpay ✅
- [ ] Update Supabase secrets with live credentials (DO THIS NOW)
- [ ] Update .env.local with live KEY_ID (DONE)
- [ ] Test complete payment flow with real card
- [ ] Monitor Razorpay dashboard for payment activity
- [ ] Set up webhook (optional) for payment status updates
- [ ] Inform users about payment system (Razorpay integration)

---

**Questions?** Check [Razorpay Documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
