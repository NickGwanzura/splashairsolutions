# HVACOps - Vercel Deployment Guide

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [PostgreSQL Database](https://neon.tech) (Neon recommended)
- [Resend Account](https://resend.com) (for emails)
- [Stripe Account](https://stripe.com) (for payments)

## Step 1: Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Email (Resend)
```
RESEND_API_KEY="re_xxxxxxxx"
```

### Payments (Stripe)
```
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Optional
```
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="hvacops-uploads"
```

## Step 2: Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 3: Database Setup

1. Create PostgreSQL database (Neon recommended)
2. Run migrations:
```bash
npx prisma migrate deploy
```

3. Seed initial data:
```bash
npx prisma db seed
```

## Step 4: Deploy to Vercel

### Option A: Git Integration (Recommended)

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Set environment variables
4. Deploy

### Option B: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 5: Post-Deployment

1. **Configure Custom Domain** (optional):
   - Vercel Dashboard → Domains
   - Add your domain
   - Update DNS records

2. **Verify Database Connection**:
   - Check Vercel Functions logs
   - Test login flow

3. **Configure Email Domain**:
   - Add domain to Resend
   - Verify DNS records
   - Update FROM_EMAIL in code

4. **Stripe Webhook**:
   - Add webhook endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Select events: `invoice.payment_succeeded`, `invoice.payment_failed`

## Troubleshooting

### Build Failures
```bash
# Check local build
npm run build

# Clear cache and retry
vercel --force
```

### Database Connection Issues
- Verify `DATABASE_URL` format
- Ensure SSL mode is enabled for serverless
- Check IP allowlist (Neon: 0.0.0.0/0 for Vercel)

### Email Not Sending
- Verify Resend API key
- Check domain verification status
- Review Resend dashboard for blocked emails

### Authentication Issues
- Ensure `NEXTAUTH_URL` matches deployment URL
- Check `NEXTAUTH_SECRET` is set
- Verify callback URLs in OAuth providers

## Monitoring

- **Vercel Analytics**: Dashboard → Analytics
- **Error Tracking**: Integrate Sentry
```bash
npm install @sentry/nextjs
```

## Production Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Database backups enabled
- [ ] Stripe webhooks configured
- [ ] Email domain verified
- [ ] Environment variables set
- [ ] Error monitoring active
- [ ] Privacy policy page
- [ ] Terms of service page

## Support

For issues:
1. Check Vercel Functions logs
2. Review Database connection logs
3. Open issue on GitHub

---

**Deploy URL**: https://vercel.com/new?template=your-template-url
