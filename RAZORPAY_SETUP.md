# Razorpay UPI Payment Integration Guide

This guide explains how to configure Razorpay for UPI-only payments on QuickSwap Cash.

## Overview

QuickSwap uses Razorpay for secure payment processing with **UPI method only**. The integration includes:
- ✅ Server-side order creation
- ✅ UPI payment checkout
- ✅ Signature verification
- ✅ Payment recording to database

## Test vs Production Mode

### Test Mode (Current)
- Key ID: `rzp_test_*`
- Test transactions don't charge real money
- Use for development & testing
- Credentials visible in code/Vercel

### Live Mode (Production)
- Key ID: `rzp_live_*`
- Real UPI payments processed
- Credentials stored securely
- Only in Supabase Edge Function Secrets

---

## Step 1: Get Your Razorpay Credentials

### For Test Mode:
Your test credentials are already configured:
```
Key ID: rzp_test_SYvPKXFqNFdcFc
Key Secret: 7MMy53hkxqXATX5N2hzao53H
```

### For Live Mode (When Ready):
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Login with your live account
3. Navigate to **Settings → API Keys**
4. Click **Live Key** tab
5. Copy:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (keep this private!)

---

## Step 2: Configure Supabase Edge Function Secrets

The Razorpay credentials must be stored in **Supabase Edge Function Secrets** (NOT in environment files).

### For Test Mode:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `rffowccdhwrcbqgiiqgh`
3. Navigate to **Edge Functions** (left sidebar)
4. Click on **Secrets** tab
5. Add these three secrets:

| Secret Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_SYvPKXFqNFdcFc` |
| `RAZORPAY_KEY_SECRET` | `7MMy53hkxqXATX5N2hzao53H` |
| `ANON_KEY` | `sb_publishable_clycsE5dCha53_1s8WV1jA_td0Tb0Zb` |

6. Click **Add Secret** for each one
7. Save ✅

### For Live Mode:

Replace the test values with your live credentials:

| Secret Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_live_XXXXXXX` (your live key) |
| `RAZORPAY_KEY_SECRET` | `XXXXXXX` (your live secret) |
| `ANON_KEY` | Same as above |

---

## Step 3: Verify Edge Functions Deployment

### Check if edge functions are deployed:

```bash
# List all edge functions
supabase functions list

# Should show:
# create-razorpay-order  deployed
# verify-razorpay-payment  deployed
```

### Deploy edge functions:

```bash
# Deploy to your Supabase project
supabase functions deploy

# Specify functions:
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

---

## Step 4: Test the Payment Flow

### 1. Test UPI Payment:

1. Go to [https://quickswapconnect.vercel.app](https://quickswapconnect.vercel.app)
2. Login with your test account
3. Go to **Create Request** page
4. Enter a test amount (e.g., ₹100)
5. Click **Post Request**
6. Razorpay UPI checkout should appear
7. Select UPI payment method
8. Use Test UPI ID: `success@razorpay` (for test mode)
9. Complete payment

### 2. Verify in Dashboard:

After successful payment:
- Check Razorpay Dashboard → Payments for transaction
- Check Supabase → `payments` table for record
- Verify payment_method = "upi"
- Verify status = "verified"

---

## Troubleshooting

### Issue: "Razorpay keys not configured"
**Solution:** Ensure secrets are added to Supabase Edge Function Secrets, not .env files
- Secrets must be in: Supabase Dashboard → Edge Functions → Secrets
- NOT in .env, .env.production, or environment variables

### Issue: Payment shows only card/netbanking, not UPI
**Solution:** The UPI filter is set in Razorpay checkout options. This is normal - Razorpay only shows UPI if configured on their dashboard.
- Go to Razorpay Dashboard → Settings → Checkout → Payment Methods
- Enable **UPI** payments
- May need to activate UPI in your Razorpay account settings

### Issue: "Invalid payment signature"
**Solution:** Signature verification failed
- Ensure RAZORPAY_KEY_SECRET is correct
- Verify it's being used for HMAC-SHA256 signature
- Check order_id, payment_id, signature format

### Issue: Payment records not saving to database
**Solution:** Ensure `payments` table migration is run
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'payments'
);

-- If not, run the migration in Supabase SQL Editor
-- Copy contents from: supabase/migrations/20260407_create_payments_table.sql
```

---

## Payment Flow Diagram

```
User creates request
    ↓
Click "Post Request" → Payment Dialog
    ↓
Frontend calls create-razorpay-order (Edge Function)
    ↓
Edge Function creates Razorpay Order → Returns order ID
    ↓
Razorpay Checkout Opens (UPI Method Only)
    ↓
User Scans QR / Enters UPI ID (success@razorpay for test)
    ↓
User Approves Payment
    ↓
Razorpay returns payment confirmation
    ↓
Frontend calls verify-razorpay-payment (Edge Function)
    ↓
Edge Function verifies HMAC-SHA256 signature
    ↓
If valid → Save payment record to database
    ↓
Return success ✅
```

---

## Security Checklist

- ✅ Razorpay secrets in Supabase Edge Function Secrets (not .env)
- ✅ HMAC-SHA256 signature verification enabled
- ✅ RLS policies on payments table (users see only their payments)
- ✅ User authentication required for payments
- ✅ CSP headers allowing checkout.razorpay.com
- ✅ Payment records immutable after creation

---

## Migration from Test to Live

When ready for production:

1. **Get Live Credentials:**
   - Razorpay Dashboard → Settings → API Keys → Live Key

2. **Update Secrets:**
   - Supabase → Edge Functions → Secrets
   - Update `RAZORPAY_KEY_ID` with live key (rzp_live_...)
   - Update `RAZORPAY_KEY_SECRET` with live secret

3. **No Code Changes Required:**
   - The same edge functions work for both test and live
   - Just swap the credentials

4. **Test in Live Environment:**
   - Create test request
   - Complete payment with real UPI
   - Verify in Razorpay Dashboard

---

## Support

For issues:
1. Check Razorpay Dashboard → Logs
2. Check Supabase Dashboard → Functions → Logs
3. Check Browser Console (F12 → Console)
4. Check Vercel Deployment Logs

---

## References

- [Razorpay API Documentation](https://razorpay.com/docs/api/orders/)
- [Razorpay JavaScript Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/checkout/build-your-own/)
- [Razorpay UPI Integration](https://razorpay.com/docs/payments/payment-methods/upi/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
