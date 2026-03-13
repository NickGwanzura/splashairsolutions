# HVACOps - Vercel Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Connect GitHub Repo to Vercel

1. Go to [vercel.com](https://vercel.com) and login
2. Click "Add New Project"
3. Import your GitHub repo: `splashairservice`
4. Click "Deploy" (it will fail initially - that's ok!)

### Step 2: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

#### Required Variables

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Neon PostgreSQL URL | Production |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production |
| `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://splashairservice.vercel.app`) | Production |
| `NEXT_PUBLIC_APP_URL` | Same public app URL used in invite emails | Production |

#### Optional Variables

| Name | Value | Environment |
|------|-------|-------------|
| `RESEND_API_KEY` | Your Resend API key | Production |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Your Mapbox token | Production |
| `NEXT_PUBLIC_ENABLE_PUBLIC_DEMO` | `true` only if you intentionally want public demo access | Optional |

### Step 3: Generate Secrets

Run this locally to generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Copy the output and paste it into Vercel environment variables.

### Step 3.5: Validate Before Deploy

Run this locally with your production values pulled from Vercel:

```bash
npm run vercel:check
```

### Step 4: Redeploy

After setting environment variables:

1. Go to Deployments tab
2. Click the 3 dots on latest deployment
3. Click "Redeploy"

Or push a new commit:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Step 5: Database Setup

Once deployed, run migrations:

**Option A: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel env pull .env.production
export $(cat .env.production | xargs)
npx prisma migrate deploy
```

**Option B: Local with Production DB**
```bash
# Copy production DATABASE_URL from Vercel
echo "DATABASE_URL=your_production_url" > .env.production.local

# Deploy migrations
DOTENV_CONFIG_PATH=.env.production.local npx prisma migrate deploy

```

Do not run `npx prisma db seed` against production. The checked-in seed script is destructive and is intended only for local demo data.

---

## Environment Variable Reference

### Authentication (Required)

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret
```

**Get NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database (Required)

**Neon PostgreSQL (Recommended):**
1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string
4. Format: `postgresql://user:pass@host/db?sslmode=require`

### Email (Optional)

**Resend:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Copy API key

```
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=HVACOps <noreply@yourdomain.com>
```

### Payments (Optional)

**Stripe:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Maps (Optional)

**Mapbox:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

---

## Troubleshooting

### "Secret does not exist" Error

**Cause:** Old `vercel.json` referenced secrets incorrectly.

**Fix:** 
1. Delete the project in Vercel
2. Re-import from GitHub
3. Set environment variables BEFORE first deploy

### Build Fails

Check build logs in Vercel Dashboard:
1. Go to Deployments
2. Click failed deployment
3. View Build Logs

Common issues:
- Missing `DATABASE_URL` → Add env var
- Missing `NEXTAUTH_SECRET` → Generate and add
- Prisma generate failed → Check `postinstall` script

### Database Connection Failed

1. Check `DATABASE_URL` format
2. Ensure SSL mode: `?sslmode=require`
3. Whitelist Vercel IPs in Neon: `0.0.0.0/0`

### 404 on Dynamic Routes

Add to `vercel.json`:
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

---

## Custom Domain (Optional)

1. Vercel Dashboard → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to custom domain
5. Redeploy

---

## Monitoring

### Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

Should return:
```json
{"database":true,"timestamp":"...","version":"1.0.0"}
```

### Logs
- Vercel Dashboard → Functions → Logs
- Filter by function or error level

---

## Support

For issues:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
3. Check Prisma connection pooling guide

---

## Production Checklist

- [ ] Database URL set
- [ ] NEXTAUTH_SECRET generated
- [ ] NEXTAUTH_URL matches domain
- [ ] Database migrated
- [ ] Initial data seeded
- [ ] Email service configured (optional)
- [ ] Stripe webhooks configured (optional)
- [ ] Custom domain configured (optional)
- [ ] Team members invited

---

**Deploy URL:** https://vercel.com/new/clone?repository-url=https://github.com/NickGwanzura/splashairservice
