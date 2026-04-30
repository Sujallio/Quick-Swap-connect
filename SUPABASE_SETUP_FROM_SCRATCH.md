# Complete Supabase Setup Guide - From Scratch

This guide covers creating a new Supabase project and configuring everything needed for Razorpay payments.

---

## Step 1: Create a New Supabase Project

### 1.1 Go to Supabase
1. Visit: https://app.supabase.com
2. Click **New Project**
3. Fill in:
   - **Project Name**: `quick-cash-connect` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest region (e.g., `ap-south-1` for India)
4. Click **Create new project**
5. Wait 2-3 minutes for project to initialize

### 1.2 Get Your Project Credentials
Once created:
1. Click **Settings** (⚙️) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Publishable Key (anon)**: `eyJhbGci...`
   - **Service Role Key**: `eyJhbGci...` (keep this SECRET!)
3. Save them - you'll need them later

---

## Step 2: Create Database Tables

### 2.1 Open SQL Editor
1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**

### 2.2 Create Requests Table
Copy and paste this SQL:

```sql
-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  have_type TEXT NOT NULL,
  need_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  location_text TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(10, 8),
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  payment_id TEXT UNIQUE,
  payment_method TEXT DEFAULT 'razorpay',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_city ON public.requests(city);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_payment_id ON public.requests(payment_id) WHERE payment_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
```

Click **Run** (or `Ctrl+Enter`)

---

## Step 3: Set Up Row Level Security (RLS) Policies

### 3.1 Create RLS Policy for Users to See Active Requests
Copy and paste:

```sql
-- Policy: Users can view all active requests (publicly visible)
CREATE POLICY "Users can view all active requests"
  ON public.requests
  FOR SELECT
  USING (status = 'active');

-- Policy: Users can create their own requests
CREATE POLICY "Users can create their own requests"
  ON public.requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON public.requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own requests
CREATE POLICY "Users can update their own requests"
  ON public.requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own requests
CREATE POLICY "Users can delete their own requests"
  ON public.requests
  FOR DELETE
  USING (auth.uid() = user_id);
```

Click **Run**

---

## Step 4: Create Edge Functions for Razorpay

### 4.1 Create First Edge Function (Order Creation)
1. Click **Edge Functions** (left sidebar)
2. Click **Create a new function**
3. **Function name**: `create-razorpay-order`
4. Click **Create**
5. Replace the template with this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, purpose } = await req.json();

    if (!amount || amount < 100) {
      return new Response(JSON.stringify({ error: "Amount must be at least ₹100 (100 paise)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay credentials");
      return new Response(JSON.stringify({ error: "Razorpay credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        description: purpose || "Payment",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Razorpay API error:", error);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      order_id: data.id,
      amount: data.amount,
      key_id: RAZORPAY_KEY_ID,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

Click **Deploy**

### 4.2 Create Second Edge Function (Payment Verification)
1. Click **Create a new function**
2. **Function name**: `verify-razorpay-payment`
3. Replace with this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: "Missing payment details" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_SECRET) {
      console.error("Missing RAZORPAY_KEY_SECRET");
      return new Response(JSON.stringify({ error: "Configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create HMAC-SHA256 signature
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const verified = expectedSignature === razorpay_signature;

    return new Response(JSON.stringify({
      verified: verified,
      payment_id: razorpay_payment_id,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

Click **Deploy**

---

## Step 5: Add Environment Secrets to Edge Functions

### 5.1 Set Secrets
1. In Edge Functions dashboard, find **Settings** or **Secrets**
2. Add two secrets:
   - **RAZORPAY_KEY_ID**: `rzp_live_Sjjz2UOhKOizyg`
   - **RAZORPAY_KEY_SECRET**: `mC0mYFUEn45W5E1GpanoaXlC`
3. Save

---

## Step 6: Update Your Frontend Configuration

### 6.1 Update MIGRATION_INSTRUCTIONS.md
In your project, update the credentials section with your new project's:
- **Project URL**
- **Publishable Key**

### 6.2 Update .env.local
```
VITE_RAZORPAY_KEY_ID=rzp_live_Sjjz2UOhKOizyg
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

### 6.3 Update vercel.json (if using Vercel)
Update with your new Supabase project URL:
```json
{
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@supabase_key",
    "VITE_RAZORPAY_KEY_ID": "@razorpay_key_id"
  }
}
```

---

## Step 7: Set Environment Variables in Vercel (For Production)

### 7.1 Add to Vercel
1. Go to: https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add these:

```
RAZORPAY_KEY_ID = rzp_live_Sjjz2UOhKOizyg
RAZORPAY_KEY_SECRET = mC0mYFUEn45W5E1GpanoaXlC
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGci...
```

5. Click **Save** and **Redeploy**

---

## Step 8: Test Everything

### 8.1 Local Testing
```bash
npm run dev
```

### 8.2 Test Payment Flow
1. Log in to your app
2. Create a new request (Post Request)
3. Enter details and click "Post Request"
4. On Payment Page, click "Pay ₹{amount}"
5. Use real card/UPI/Net Banking
6. Verify request appears with status='active'

### 8.3 Verify in Supabase
1. Go to **Table Editor** → **requests**
2. You should see your new request with:
   - `payment_id` filled (from Razorpay)
   - `status` = 'active'
   - `payment_method` = 'razorpay'

---

## Troubleshooting

### Edge Functions Not Working
- Check **Logs** tab in Edge Functions
- Verify secrets are set correctly
- Ensure RAZORPAY_KEY_SECRET is exactly correct (copy from Razorpay dashboard)

### Payments Not Saving
- Check RLS policies are created
- Verify `user_id` matches `auth.uid()`
- Check Supabase function logs for errors

### Requests Not Visible
- Verify `status = 'active'` in database
- Check RLS policy allows SELECT for active requests
- Verify your `auth.uid()` is set (user must be logged in)

---

## Summary

✅ Supabase project created  
✅ Database tables created  
✅ RLS policies configured  
✅ Edge Functions deployed  
✅ Razorpay credentials set  
✅ Frontend updated  
✅ Ready for payment testing!

You now have a complete Supabase setup from scratch! 🚀
