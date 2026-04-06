# QuickSwap Cash - P2P Emergency Cash Exchange Platform

A modern web application that connects users to exchange cash and digital payments (UPI/Bank transfers) in their local area instantly.

## Features

- 🔍 **Find Nearby Users**: Discover people nearby for instant cash exchanges
- 💵 **Flexible Exchange**: Convert between cash and UPI seamlessly
- 📍 **Location-Based**: Get matched with users in your area
- 🔒 **Secure**: User authentication and payment verification via Razorpay
- 📱 **Mobile-First**: Fully responsive design for all devices
- ⚡ **Real-time**: Instant notifications and updates
- 🎯 **Trust System**: User ratings and reviews

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Razorpay
- **Forms**: React Hook Form
- **State Management**: TanStack React Query

## Prerequisites

- Node.js 18+ or Bun
- npm/yarn/bun package manager
- Supabase account
- Razorpay account

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd quick-cash-connect
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

Get these values from your Supabase dashboard:
- Go to **Settings** → **API**
- Copy the **Project URL** and **Publishable Key**

4. **Run migrations** (if using Supabase locally)
```bash
npx supabase migration up
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode (with sourcemaps)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run test         # Run tests (Vitest)
npm run test:watch   # Watch mode for tests
```

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder with:
- Code minification and optimization
- Tree-shaking of unused code
- Vendor chunk splitting for better caching

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir dist
```

#### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # Shadcn UI components
│   ├── ErrorBoundary.tsx
│   ├── AppHeader.tsx
│   └── ...
├── pages/            # Page components
│   ├── HomePage.tsx
│   ├── CreateRequestPage.tsx
│   └── ...
├── lib/              # Utilities & helpers
│   ├── env-validation.ts
│   ├── razorpay.ts
│   └── utils.ts
├── integrations/     # External service integrations
│   └── supabase/
├── contexts/         # React Context providers
│   └── AuthContext.tsx
├── hooks/            # Custom React hooks
│   └── use-mobile.tsx
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles

supabase/
├── migrations/       # Database schema migrations
├── functions/        # Edge functions
└── config.toml       # Supabase configuration
```

## Database Schema

Key tables:
- `users` - User profiles and auth
- `requests` - Swap requests
- `ratings` - User ratings
- `payments` - Payment records

See `supabase/migrations/` for detailed schema.

## Pricing

### Posting Fee (Tiered)
- ₹100–₹5,000: ₹5
- ₹5,001–₹10,000: ₹10
- ₹10,001–₹15,000: ₹15
- Increases by ₹5 per ₹5,000 range

### Contact Unlock Fee
- ₹5 to reveal helper's phone number

## Security

- ✅ Environment variable validation on app startup
- ✅ Error boundaries for graceful error handling
- ✅ Secure authentication with Supabase
- ✅ Payment verification with Razorpay
- ✅ HTTPS only in production
- ✅ No sensitive data in localStorage (secure session storage)

## Troubleshooting

### Environment Variables Not Found
- Ensure `.env` file exists in project root
- Check variable names match exactly (they're case-sensitive)
- Restart development server after changing `.env`

### Supabase Connection Issues
- Verify Supabase URL and key are correct
- Check internet connection
- Ensure Supabase project is active

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
