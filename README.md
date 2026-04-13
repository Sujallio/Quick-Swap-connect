# QuickSwap Cash - P2P Emergency Cash Exchange Platform

A modern web application that connects users to exchange cash and digital payments (UPI/Bank transfers) in their local area instantly.

**Live App:** https://quickswapconnect.vercel.app  
**GitHub:** https://github.com/Sujallio/Quick-Swap-connect  
**Contact:** support.quickswap24@gmail.com

---

## 🚀 Features

- 🔍 **Find Nearby Users** - Discover people nearby for instant cash exchanges
- 💵 **Flexible Exchange** - Convert between cash and UPI seamlessly
- 📍 **Location-Based** - Get matched with users in your area
- 🔒 **Secure** - User authentication and payment verification via Razorpay
- 📱 **Mobile-First** - Fully responsive design for all devices
- ⚡ **Real-time** - Instant notifications and updates
- 🎯 **Trust System** - User ratings and reviews
- 📧 **Contact Support** - Built-in contact form with email integration

---

## 📋 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS |
| **Components** | Shadcn/ui (Radix UI) |
| **Database** | Supabase PostgreSQL with RLS |
| **Authentication** | Supabase Auth |
| **Payments** | Razorpay (UPI only) |
| **State Management** | TanStack React Query |
| **Deployment** | Vercel (Auto-deploy from GitHub) |
| **Edge Functions** | Deno (Supabase) |

---

## 💰 Pricing Model

### Posting Fee (Tiered)
- ₹5 per ₹4,000 range
- ₹100–₹4,000: ₹5
- ₹4,001–₹8,000: ₹10
- ₹8,001–₹12,000: ₹15
- ₹12,001–₹16,000: ₹20
- *Pattern: 5 × ⌈amount ÷ 4000⌉*

### Contact Unlock Fee
- ₹5 to reveal helper's phone number

---

## 🔧 Quick Setup

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- Razorpay account
- Resend account (for contact emails)

### Installation

```bash
# Clone repository
git clone https://github.com/Sujallio/Quick-Swap-connect.git
cd quick-cash-connect

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add Supabase credentials from dashboard
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### Development

```bash
npm run dev          # Start dev server (http://localhost:8080)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
```

---

## 🛠️ Razorpay Payment Setup

### Get Credentials

**Test Mode (Development):**
```
Key ID: rzp_test_SYvPKXFqNFdcFc
Key Secret: 7MMy53hkxqXATX5N2hzao53H
```

**Live Mode (Production):**
- Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
- Settings → API Keys → Live Key

### Configure Secrets in Supabase

**Path:** Supabase Dashboard → Edge Functions → Secrets

Add these secrets:

| Name | Value |
|------|-------|
| `RAZORPAY_KEY_ID` | `rzp_test_SYvPKXFqNFdcFc` (test) or your live key |
| `RAZORPAY_KEY_SECRET` | Your secret key |
| `RESEND_API_KEY` | Your Resend API key (for contact emails) |

### Test Payment

1. Login at https://quickswapconnect.vercel.app
2. Go to "Create Request"
3. Fill details and click "Post Request"
4. Use Test UPI: `success@razorpay`

---

## 📧 Email Setup (Contact Form)

### Get Resend API Key

1. Go to https://resend.com
2. Sign up (free tier available)
3. Copy API key from dashboard
4. Add to Supabase secrets as `RESEND_API_KEY`

**Note:** Uses default domain `onboarding@resend.dev`. For custom domain, verify in Resend dashboard.

---

## 🚀 Production Deployment

### Step 1: Build
```bash
npm run build
```

### Step 2: Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

### Step 3: Configure
- Set environment variables in Vercel dashboard
- Razorpay and Resend API keys in Supabase Edge Function secrets
- HTTPS is automatic on Vercel

### Step 4: Verification
- [ ] App loads correctly
- [ ] Authentication works
- [ ] Payment flow completes
- [ ] Contact form sends emails
- [ ] No console errors

---

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── AppHeader.tsx
│   ├── Footer.tsx
│   └── SwapCard.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── CreateRequestPage.tsx
│   ├── ProfilePage.tsx
│   ├── LoginPage.tsx
│   └── ContactPage.tsx
├── lib/                # Utilities
│   ├── razorpay.ts    # Razorpay integration
│   ├── utils.ts
│   └── validation.ts
├── contexts/           # React Context
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   └── use-mobile.tsx
├── integrations/       # External services
│   └── supabase/
└── App.tsx            # Main component

supabase/
├── migrations/        # Database schema
├── functions/         # Edge functions (Deno)
│   ├── create-razorpay-order/
│   ├── verify-razorpay-payment/
│   └── send-contact-email/
└── config.toml
```

---

## 🔒 Security

### Key Practices
- ✅ No hardcoded secrets (use environment variables)
- ✅ Supabase Row-Level Security (RLS) on all tables
- ✅ Payment signature verification
- ✅ HTTPS only in production
- ✅ Secure session storage
- ✅ Input validation and sanitization

### Never Commit
- ❌ `.env` files
- ❌ API keys or secrets
- ❌ Private credentials

### Always Use
- ✅ `.env.example` template
- ✅ Platform secret management (Vercel/Supabase)
- ✅ Environment variables in CI/CD

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles, ratings, contact info |
| `requests` | Cash exchange requests |
| `payments` | Payment transaction records |
| `unlocks` | Track who unlocked which contacts |

All tables protected with RLS policies.

---

## 🔍 Troubleshooting

### Payment Issues
- **"Razorpay keys not configured"** → Check Supabase Edge Function Secrets
- **"401 Unauthorized"** → Ensure JWT verification is disabled for payment functions
- **"Invalid signature"** → Verify RAZORPAY_KEY_SECRET is correct

### Deployment Issues
- Check Vercel deployment logs
- Verify all environment variables are set
- Ensure Supabase project is active
- Check GitHub Actions for build errors

### Contact Form Issues
- Verify Resend API key in Supabase secrets
- Check email spam folder
- Ensure support.quickswap24@gmail.com has access

### Environment Variables
- Ensure `.env` file exists in root
- Variable names are case-sensitive
- Restart dev server after changing `.env`

---

## 📋 Deployment Checklist

**Before Production:**
- [ ] All tests passing (`npm run test`)
- [ ] No console errors or warnings
- [ ] ESLint passes (`npm run lint`)
- [ ] Build completes (`npm run build`)
- [ ] Environment variables configured
- [ ] Razorpay live keys set
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] HTTPS enforced
- [ ] No sensitive data in code

**Post-Deployment:**
- [ ] Test all core features
- [ ] Monitor error logs
- [ ] Verify payments processing
- [ ] Check email delivery

---

## 👥 Contributing

### Code Style
- Use TypeScript for new code
- Follow existing patterns
- Format with Prettier (auto on save)
- Run `npm run lint --fix` before committing

### Commit Messages
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: improve code structure
test: add tests
chore: update dependencies
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with clear commits
3. Run: `npm run lint && npm run test && npm run build`
4. Update documentation
5. Create PR with description

---

## 📞 Support

- **Email:** support.quickswap24@gmail.com
- **Instagram:** [@quickswap.connect](https://www.instagram.com/quickswap.connect)
- **LinkedIn:** [Quick Swap Connect](https://www.linkedin.com/company/quick-swap-connect/)
- **Issues:** GitHub Issues

---

## ⚠️ Disclaimer

QuickSwap Cash is a matching service only. All cash exchanges are conducted **offline at users' own risk**. We are not responsible for fraud or disputes between users. Users must verify identities and amounts before handing over money.

---

## 📄 License

Private project. All rights reserved.

---

**Last Updated:** April 10, 2026  
**Status:** Production Ready


### Payment Failures
- Verify Razorpay keys are configured
- Check amount is within allowed range (₹100–₹1,00,000)
- Ensure browser allows popups for Razorpay checkout

## Performance Optimization

- Code splitting for vendor libraries
- Lazy loading of routes
- Image optimization
- CSS purging with Tailwind

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

Run tests:
```bash
npm run test          # Run once
npm run test:watch    # Watch mode
```

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

## License

[Add your license here]

## Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@quickswapcash.com

## Changelog

**v1.0.0** (April 2026)
- Initial release
- User authentication
- Swap request posting
- Payment integration
- Contact unlock feature
- User ratings system

---

**Built with ❤️ for peer-to-peer cash exchange**
