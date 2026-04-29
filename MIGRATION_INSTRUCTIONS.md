# ⚠️ Manual Database Migration Required

The code for the UPI payment system has been deployed, but you need to:
1. Apply the SQL migration to your Supabase database
2. Create a storage bucket for payment screenshots
3. Update UPI configuration

---

## Step 1: Apply the SQL Migration

### 1.1 Go to Supabase Dashboard
- Visit: https://app.supabase.com/
- Select your project: `Quick-Swap-connect`

### 1.2 Navigate to SQL Editor
- Click on **SQL Editor** in the left sidebar
- Click **New Query**

### 1.3 Copy and Paste the SQL
Copy this entire SQL code:

```sql
-- Add UPI payment fields to requests table
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'upi_manual',
ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- Update RLS policy to show only verified requests publicly
DROP POLICY IF EXISTS "Users can view all active requests" ON public.requests;
CREATE POLICY "Users can view verified requests"
  ON public.requests
  FOR SELECT
  USING (status = 'verified');

-- Create index for transaction_id for uniqueness and faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_transaction_id ON public.requests(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_requests_payment_method ON public.requests(payment_method);
```

### 1.4 Execute the Query
- Paste the SQL into the editor
- Click **Run** (or press `Ctrl+Enter`)
- You should see: "Query executed successfully"

---

## Step 2: Create Storage Bucket for Payment Screenshots

### 2.1 Navigate to Storage
- Click on **Storage** in the left sidebar
- Click **Create a new bucket**

### 2.2 Create the Bucket
- **Bucket name:** `payment-screenshots`
- **Privacy:** Public (so images can be viewed)
- Click **Create bucket**

### 2.3 Set RLS Policies
Once created, click on the bucket → **Policies**

Add this policy to allow authenticated users to upload:

```
Policy Name: Users can upload payment screenshots
Definition: CREATE POLICY "Users can upload payment screenshots" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-screenshots' AND (SELECT COUNT(*) FROM public.requests WHERE payment_screenshot = name) = 0);
```

Or simply allow public access (simpler):
- Click **Add policy**
- Choose: **For SELECT** → **Public access** → **Save**
- Click **Add policy**
- Choose: **For INSERT** → **Public access** → **Save**

---

## Step 3: Update UPI Configuration

### 3.1 Edit PaymentPage.tsx
Open `src/pages/PaymentPage.tsx` and update:

```typescript
// Line ~7
const UPI_QR_IMAGE = "YOUR_QR_CODE_URL_HERE";  // Replace with actual QR code image URL
const UPI_ID = "your_actual_upi_id@bank";       // Replace with your UPI ID
```

**To generate a QR code:**
1. Visit: https://www.qr-code-generator.com/
2. Enter your UPI address (e.g., `9876543210@upi` or `name@okhdfcbank`)
3. Download the QR image as PNG
4. Upload to Supabase Storage → `payment-screenshots` bucket
5. Copy the public URL and paste into `UPI_QR_IMAGE`

Or use dynamic QR generation:
```typescript
const UPI_ID = "your_upi_id@bank";
const UPI_QR_IMAGE = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${UPI_ID}`;
```

---

## What This Migration Does:

✅ Adds `transaction_id` field (unique, prevents duplicates)
✅ Adds `payment_method` field (defaults to 'upi_manual')
✅ Adds `payment_screenshot` field (for optional payment proof)
✅ Updates RLS policy to only show verified requests publicly
✅ Creates storage bucket for payment screenshot uploads
✅ Creates indexes for faster lookups and unique constraint enforcement

---

## Verification Checklist:

After running the migration, verify:

1. ✓ Go to **Table Editor** → **requests**
2. ✓ Check that new columns appear: `transaction_id`, `payment_method`, `payment_screenshot`
3. ✓ Confirm `payment_method` has default value `'upi_manual'`
4. ✓ Go to **Storage** → verify `payment-screenshots` bucket exists
5. ✓ Test creating a new request (should redirect to `/payment`)

## Important Notes:

⚠️ **No requests are public yet** - After this migration, requests with `status = 'active'` will NOT be visible. They must be manually verified first by admins.

🔧 **Existing requests**: Existing requests will still have `status = 'active'`. You may want to:
- Update them to `status = 'verified'` if they're valid
- Update them to `status = 'rejected'` if they're spam

### Optional: Update Existing Requests
To make all existing requests visible (if they were previously active):
```sql
UPDATE public.requests 
SET status = 'verified' 
WHERE status = 'active';
```

## Feature Overview:

### User Flow:
1. User fills out request form (Create Request page)
2. Clicks "Post Request" → Redirected to Payment Page
3. User scans UPI QR code and makes payment
4. User enters transaction ID (and optionally upload screenshot)
5. Clicks "Submit Payment & Request"
6. Request saved with `status = 'pending_verification'`
7. Emails sent to users in same city (async)

### Admin Panel Updates:
- New **"Pending"** tab shows unverified payments
- Admin can see:
  - Amount & request type
  - Transaction ID
  - Payment screenshot (if provided)
- Buttons: **Verify** (approve) or **Reject** (decline)

### UPI QR Settings:
Update the UPI details in `src/pages/PaymentPage.tsx`:
```typescript
const UPI_QR_IMAGE = "https://via.placeholder.com/300x300?text=UPI+QR+Code"; // Replace with actual QR
const UPI_ID = "yourname@upi"; // Replace with your UPI address
```

## Troubleshooting:

If you get an error like `"relation already exists"`:
- This means the column already exists
- The `IF NOT EXISTS` clauses should handle this
- Just re-run the query

If you see `"permission denied"`:
- Make sure you're logged in with an admin account
- Go to **Project Settings** → **Database** → verify role permissions

## Next Steps:

1. ✅ Apply the migration (above)
2. ✅ Update UPI QR image and UPI ID in PaymentPage.tsx
3. ✅ Test the complete flow:
   - Create a test request
   - Enter fake transaction ID (e.g., "TXN123456789")
   - Check it appears in admin panel as pending
   - Approve it as admin
   - Verify it now shows publicly

---

**Need help?** Check the [PaymentPage.tsx](../src/pages/PaymentPage.tsx) and [AdminPage.tsx](../src/pages/AdminPage.tsx) for implementation details.
