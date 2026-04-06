# Contributing to QuickSwap Cash

Thank you for your interest in contributing to QuickSwap Cash! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and professional. We don't tolerate harassment or discrimination.

## Getting Started

### 1. Set Up Your Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/quick-cash-connect.git
cd quick-cash-connect

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your Supabase credentials

# Start development server
npm run dev
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-description
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Format with Prettier (auto on save)
- Lint with ESLint

```bash
npm run lint      # Check for linting issues
npm run lint --fix # Auto-fix issues
```

### Testing

Write tests for new features:

```bash
npm run test      # Run tests once
npm run test:watch # Watch mode
```

Test requirements:
- ✅ Unit tests for utilities
- ✅ Integration tests for features
- ✅ E2E tests for critical flows

### Commit Messages

Follow conventional commits:

```
feat: add user profile page
fix: correct payment amount calculation
docs: update README with installation steps
style: format code with Prettier
refactor: simplify auth logic
test: add tests for payment processing
chore: update dependencies
```

Format: `type: short description`

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make changes** with clear commits
3. **Test thoroughly**:
   ```bash
   npm run lint
   npm run test
   npm run build  # Ensure it builds
   ```
4. **Update documentation** if needed
5. **Push to your fork**
6. **Create PR** with clear description

### PR Requirements

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Commits are clear and descriptive

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── lib/            # Utilities
├── hooks/          # Custom hooks
├── contexts/       # Context providers
└── integrations/   # External services

supabase/
├── migrations/     # Database schemas
├── functions/      # Edge functions
└── config.toml     # Config
```

## Working with Features

### Adding a New Feature

1. **Create database schema** (if needed)
   ```sql
   -- supabase/migrations/[timestamp]_feature_name.sql
   CREATE TABLE new_table (
     id UUID PRIMARY KEY,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Create React component**
   ```tsx
   // src/components/NewComponent.tsx
   export function NewComponent() {
     return <div>New Component</div>;
   }
   ```

3. **Add integration with database**
   ```tsx
   import { supabase } from "@/integrations/supabase/client";
   
   const { data, error } = await supabase.from('table').select();
   ```

4. **Write tests**
   ```tsx
   import { describe, it, expect } from 'vitest';
   import { NewComponent } from './NewComponent';
   
   describe('NewComponent', () => {
     it('renders correctly', () => {
       // test implementation
     });
   });
   ```

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `AppHeader.tsx` or `BottomNav.tsx` if needed
4. Update documentation

### Fixing a Bug

1. Create an issue describing the bug
2. Create branch from issue number: `git checkout -b fix/issue-123`
3. Fix the bug with tests
4. Reference issue in PR: `Fixes #123`

### Adding Database Fields

1. Create migration file: `supabase/migrations/[timestamp]_description.sql`
2. Add ALTER TABLE statement
3. Update TypeScript types
4. Update any queries that use that table
5. Add database tests

## Debugging

### Frontend Debugging

```typescript
// Use React Developer Tools browser extension
// Console logging
console.log('Debug info:', variable);

// Breakpoints in DevTools
debugger; // Browser will pause here
```

### Database Debugging

```typescript
// Check data in Supabase dashboard
// Or query directly:
const { data, error } = await supabase.from('table').select();
console.log(data, error);
```

### Performance Profiling

```bash
# React DevTools Profiler
# Chrome DevTools Performance tab
# Lighthouse audit
```

## Documentation

### Update These Files

- **README.md** - Project overview and setup
- **SECURITY.md** - Security practices
- **DEPLOYMENT.md** - Deployment instructions
- **CONTRIBUTING.md** - This file (if needed)

### Code Comments

Keep comments clear and helpful:

```typescript
// ✅ GOOD - Explains why
// Sort by creation date to show newest first
const sorted = items.sort((a, b) => 
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);

// ❌ BAD - Just repeats code
const sorted = items.sort((a, b) => ...); // Sort items
```

## Performance Considerations

### Optimization Tips

- Use React.memo for expensive components
- useCallback for functions passed as props
- useMemo for expensive computations
- Lazy load routes with React.lazy
- Optimize images with proper formats and sizes

### Monitoring

```bash
# Check bundle size
npm run build
du -sh dist/

# Profile performance
# Use Chrome DevTools Performance tab
# Use React DevTools Profiler
```

## Security in Development

- ✅ Never commit `.env` files
- ✅ Never hardcode API keys
- ✅ Never trust user input
- ✅ Always validate on backend
- ✅ Review security guidelines in SECURITY.md

## Getting Help

- **Documentation**: Check README.md and docs/
- **Issues**: Search existing issues on GitHub
- **Discussions**: Join our community discussions
- **Discord**: Join our Discord server (if available)

## Review Process

1. Automated checks run (linting, tests, build)
2. Code review by maintainers
3. Any requested changes made
4. Approval and merge

### Review Checklist (for maintainers)

- [ ] Code quality is good
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] No security issues
- [ ] Backwards compatible
- [ ] Performance is acceptable

## After Your PR is Merged

- ✅ Your contribution is now part of QuickSwap Cash
- ✅ You'll be added to the contributors list
- ✅ Thanks for helping improve the project!

## Legal

By contributing, you agree that your contributions will be licensed under the project's license.

---

**Questions?** Create an issue or reach out to the maintainers.

Thank you for contributing! 🎉