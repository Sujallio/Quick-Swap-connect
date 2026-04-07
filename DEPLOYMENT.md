# Production Deployment Checklist

## Before Deployment

### Code Quality
- [ ] Run `npm run lint` - all issues resolved
- [ ] Run `npm run test` - all tests passing
- [ ] Remove all `console.log()` statements
- [ ] Remove all `debugger` statements
- [ ] Check for TODO/FIXME comments in code

### Environment & Configuration
- [ ] Verified `.env` file has ALL required variables
- [ ] Verified `.env.production` exists with production secrets
- [ ] Removed `.env` from git (use `.env.example` instead)
- [ ] Confirmed Supabase project is production-ready
- [ ] Confirmed Razorpay credentials are production keys
- [ ] HTTPS is enforced everywhere

### Security
- [ ] No sensitive keys in code (check for hardcoded secrets)
- [ ] Authentication flow tested end-to-end
- [ ] CORS policies configured correctly
- [ ] Supabase RLS (Row-Level Security) policies reviewed
- [ ] Payment verification working correctly
- [ ] Error messages don't leak sensitive info

### Database
- [ ] All migrations run successfully
- [ ] Database backed up
- [ ] Production database user has minimal required permissions
- [ ] Indexes created for frequently queried fields

### Frontend Optimization
- [ ] `npm run build` completes without warnings
- [ ] Build size checked (should be < 500KB gzipped)
- [ ] Image optimization applied
- [ ] CSS is minified
- [ ] JavaScript is minified and tree-shaken

### Testing
- [ ] Tested on latest Chrome/Firefox/Safari
- [ ] Tested on mobile devices (iOS & Android)
- [ ] Network throttling tested (3G, 4G)
- [ ] User auth flow tested completely
- [ ] Payment flow tested with test credentials
- [ ] Error scenarios tested (network errors, timeouts)

### Documentation
- [ ] README.md is complete and accurate
- [ ] API documentation updated (if applicable)
- [ ] Deployment instructions written
- [ ] Rollback procedure documented

### Monitoring & Analytics (Optional)
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Analytics configured (e.g., Google Analytics)
- [ ] Logging configured for production
- [ ] Uptime monitoring configured

## Deployment Steps

### Step 1: Build
```bash
npm run build
# Verify dist/ folder is created with optimized assets
```

### Step 2: Choose Platform

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

#### Option C: Docker
```bash
docker build -t quickswap-cash .
docker run -p 80:80 quickswap-cash
```

### Step 3: Configure
- Set environment variables in platform dashboard
- Configure custom domain
- Enable HTTPS (automatic on Vercel)
- Set cache headers

### Step 4: Post-Deployment
- [ ] Verify app loads correctly
- [ ] Test all core features
- [ ] Check browser console for errors
- [ ] Verify environment variables are correct
- [ ] Monitor error logs for 24 hours

## Rollback Procedure

If issues occur:
1. Stop current deployment
2. Deploy previous stable version
3. Check logs for error cause
4. Fix and test locally
5. Redeploy

## Performance Targets

- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 3s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 4s

## Security Checklist

- [ ] Content Security Policy headers set
- [ ] X-Frame-Options set to SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] CORS headers correct
- [ ] SSL/TLS certificate valid

## Post-Launch Monitoring

### Daily (First Week)
- [ ] Check error logs
- [ ] Monitor user feedback
- [ ] Check payment processing
- [ ] Verify database performance

### Weekly (First Month)
- [ ] Review analytics
- [ ] Check for security issues
- [ ] Monitor performance metrics
- [ ] Update dependencies if needed

### Monthly (Ongoing)
- [ ] Security updates
- [ ] Performance optimization
- [ ] User feedback analysis
- [ ] Database maintenance

## Contact & Support

- **Production Issues**: [emergency contact]
- **Documentation**: Check README.md
- **Supabase Support**: https://supabase.com/support
- **Razorpay Support**: https://razorpay.com/support
