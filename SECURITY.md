# Security Guidelines

## Overview

This document outlines security best practices for QuickSwap Cash. All team members must follow these guidelines.

## Sensitive Information

### Never Commit
- ❌ `.env` files (local environment variables)
- ❌ API keys or secrets
- ❌ Private keys or credentials
- ❌ Database passwords
- ❌ Authentication tokens

### Always Use
- ✅ `.env.example` - template for developers
- ✅ `.env.production.example` - template for production
- ✅ Platform secrets management (Vercel, Netlify, etc.)
- ✅ Environment variables in CI/CD pipelines

## Code Security

### Application Code
```typescript
// ❌ BAD - Never hardcode secrets
const apiKey = "sk_live_abc123xyz";

// ✅ GOOD - Use environment variables
const apiKey = import.meta.env.VITE_RAZORPAY_KEY;
```

### Dependency Security
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Input Validation
- Always validate user input
- Use TypeScript for type safety
- Validate form data before submission
- Sanitize data before storing in database

## Authentication Security

### User Passwords
- ✅ Handled by Supabase (bcrypt hashing)
- ✅ HTTPS only in production
- ✅ Secure session storage with `localStorage`

### API Keys
- ❌ Never log API keys
- ❌ Never send to untrusted domains
- ❌ Rotate regularly (every 90 days)

### Session Management
```typescript
// ✅ GOOD - Automatic session management
const { data: { session } } = await supabase.auth.getSession();

// ❌ BAD - Manual token handling without encryption
localStorage.setItem('token', 'raw-token');
```

## Payment Security

### Razorpay Integration
- ✅ Use Razorpay's hosted checkout (most secure)
- ✅ Verify every payment signature server-side
- ✅ Never store full credit card details
- ✅ PCI DSS compliance handled by Razorpay

### Amount Validation
```typescript
// ✅ Validate amounts are within allowed range
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 100000;

if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
  throw new Error('Invalid amount');
}
```

## Database Security

### Row-Level Security (RLS)
All tables should have RLS policies:
```sql
-- Users can only see their own requests
CREATE POLICY "Users can view own requests"
  ON requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only create requests for themselves
CREATE POLICY "Users can create own requests"
  ON requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### No Direct Admin Access
- ❌ Never expose database credentials
- ❌ Never expose connection strings
- ✅ Use Supabase dashboard for admin access
- ✅ Use edge functions for server-side logic

## HTTPS & Transport

### Production
- ✅ HTTPS everywhere (auto on Vercel, Netlify)
- ✅ Certificate must be valid (not self-signed)
- ✅ HSTS headers enabled
- ✅ No mixed HTTP/HTTPS content

### Subdomain Handling
- ✅ Use same domain for all requests
- ✅ Configure CORS properly
- ✅ Validate origin headers

## Error Handling

### Never Expose
```typescript
// ❌ BAD - Exposes database errors
catch (err) {
  return { error: err.message }; // "Column 'password' does not exist"
}

// ✅ GOOD - Generic error messages
catch (err) {
  console.error('Database error:', err); // Log for debugging
  return { error: 'An unexpected error occurred' };
}
```

### User-Friendly Messages
- Keep error messages generic to users
- Log detailed errors server-side
- Never include stack traces in responses

## Data Privacy

### Personal Information
- ✅ Collect only necessary data
- ✅ Inform users how data is used (Privacy Policy)
- ✅ Provide data deletion options
- ✅ Encrypt sensitive data at rest

### Phone Numbers
- ✅ Only revealed to users who paid (contact unlock fee)
- ✅ Stored securely in database
- ✅ Not logged or cached in unnecessary places

### Location Data
- ✅ Only collected with user consent
- ✅ Stored but not logged
- ✅ Used only for matching users

## Dependencies & Updates

### Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Major version updates (review breaking changes)
npm install package@latest
```

### Security Audits
```bash
# Run security audit
npm audit

# Fix automatically
npm audit fix

# Fix with risk
npm audit fix --force
```

### Vulnerable Packages
- Monitor security advisories
- Update immediately for critical issues
- Test thoroughly before deploying

## Deployment Security

### Environment Variables
- [ ] All required variables set
- [ ] No test/dev credentials in production
- [ ] No hardcoded secrets
- [ ] Regular rotation of secrets

### Access Control
- [ ] Only authorized team members deploy
- [ ] Deployment logs monitored
- [ ] Rollback procedure documented
- [ ] Staging tests before production

## Monitoring & Incident Response

### Monitoring
- ✅ Error tracking (Sentry, LogRocket, etc.)
- ✅ Performance monitoring
- ✅ Security scanning
- ✅ Uptime monitoring

### Incident Response
1. **Detect** - Monitor for security issues
2. **Assess** - Determine impact and severity
3. **Respond** - Take immediate action
4. **Notify** - Inform affected users if needed
5. **Review** - Post-mortem analysis

## Compliance

### Privacy Regulations
- ✅ GDPR compliance (if serving EU users)
- ✅ CCPA compliance (if serving California users)
- ✅ Data retention policies
- ✅ User consent mechanisms

### Payment Compliance
- ✅ PCI DSS (Razorpay handles this)
- ✅ Payment regulations by jurisdiction
- ✅ Fraud detection
- ✅ Transaction logging

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [Razorpay Security](https://razorpay.com/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Questions?

Contact the security team or create an issue for security concerns.

---

**Last Updated**: April 2026
**Status**: Production Ready