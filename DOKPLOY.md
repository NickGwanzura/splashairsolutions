# HVACOps - Dokploy Deployment Guide

## Overview

This guide covers deploying HVACOps using [Dokploy](https://dokploy.com/) - an open-source deployment platform that provides Vercel-like functionality with Docker-based deployments.

## Prerequisites

- Dokploy instance running (self-hosted or managed)
- Git repository connected to Dokploy
- PostgreSQL database (managed or self-hosted)
- Domain name (optional but recommended)

## Quick Deploy

### Step 1: Create Application in Dokploy

1. Login to your Dokploy dashboard
2. Click "Create New Application"
3. Select "Docker Compose" as deployment type
4. Connect your GitHub/GitLab repository
5. Select the branch (usually `main` or `production`)

### Step 2: Configure Environment Variables

In Dokploy Dashboard → Your Application → Environment Variables:

#### Required Variables

| Name | Description | Example |
|------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your domain URL | `https://hvacops.yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://hvacops.yourdomain.com` |

#### Optional Variables

| Name | Description | Required For |
|------|-------------|--------------|
| `RESEND_API_KEY` | Resend email API key | Email notifications |
| `EMAIL_FROM` | Sender email address | Email notifications |
| `STRIPE_SECRET_KEY` | Stripe secret key | Payments |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Payment webhooks |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox API token | Maps integration |

### Step 3: Database Migration

After first deployment, run migrations:

```bash
# Via Dokploy terminal or SSH
docker exec -it hvacops-app npx prisma migrate deploy
```

Or add to deployment hooks in `dokploy.json`.

### Step 4: Domain Configuration

1. Go to Domains section in Dokploy
2. Add your domain name
3. Configure DNS to point to your Dokploy server
4. Enable HTTPS (Let's Encrypt auto-provisioned)

## Deployment Configuration

### Dokploy Configuration (`dokploy.json`)

The `dokploy.json` file defines:
- Build configuration
- Health checks
- Environment variable requirements
- Domain routing
- Deployment policies

### Docker Compose (`docker-compose.yml`)

Defines the application service with:
- Multi-stage Dockerfile build
- Environment variable injection
- Health checks
- Network configuration
- Restart policies

### Dockerfile

Multi-stage build optimized for production:
1. **deps**: Install dependencies
2. **builder**: Build the Next.js application
3. **runner**: Minimal runtime image with built app

## Database Options

### Option A: External Database (Recommended)

Use managed PostgreSQL services:
- **Neon** (serverless PostgreSQL)
- **Railway**
- **Supabase**
- **AWS RDS**

Set `DATABASE_URL` to the external database connection string.

### Option B: Docker Compose Database

Uncomment the `db` service in `docker-compose.yml`:

```yaml
db:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: hvacops
    POSTGRES_PASSWORD: ${DB_PASSWORD}
    POSTGRES_DB: hvacops
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

Update `DATABASE_URL`:
```
postgresql://hvacops:${DB_PASSWORD}@db:5432/hvacops
```

## Continuous Deployment

Dokploy automatically deploys on Git push. To enable:

1. Go to Application → Settings → Git
2. Enable "Auto Deploy"
3. Select trigger branch

### Deployment Rollback

If deployment fails:
1. Go to Deployments section
2. Find previous working deployment
3. Click "Rollback"

## Monitoring & Logs

### Application Logs

```bash
# View logs
docker logs -f hvacops-app

# View PM2 logs (if using)
docker exec -it hvacops-app pm2 logs
```

### Health Checks

Application exposes health endpoint:
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{"database":true,"timestamp":"...","version":"1.0.0"}
```

## Troubleshooting

### Build Failures

1. Check build logs in Dokploy dashboard
2. Verify all required environment variables are set
3. Ensure `DATABASE_URL` is accessible from build context

### Database Connection Issues

```bash
# Test database connection from container
docker exec -it hvacops-app npx prisma db pull
```

### Container Won't Start

```bash
# Check container logs
docker logs hvacops-app --tail 100

# Check if port is in use
netstat -tlnp | grep 3000
```

### Environment Variables Not Loading

Ensure variables are set in Dokploy dashboard, not just in `.env` files.

## Advanced Configuration

### Custom Build Args

Add to `docker-compose.yml`:
```yaml
build:
  args:
    - BUILD_ENV=production
```

### Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Multiple Replicas

```yaml
deploy:
  replicas: 3
```

## Security Checklist

- [ ] Use strong `NEXTAUTH_SECRET` (32+ random chars)
- [ ] Enable HTTPS in production
- [ ] Restrict database access to application IP
- [ ] Use environment variables for secrets (never commit to git)
- [ ] Enable firewall rules on Dokploy server
- [ ] Regularly update base images: `docker pull node:20-alpine`

## Backup Strategy

### Database Backup

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
gzip backup_$DATE.sql
```

### Volume Backup

```bash
# Backup persistent volumes
docker run --rm -v hvacops_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz -C /data .
```

## Support

For Dokploy-specific issues:
- [Dokploy Documentation](https://docs.dokploy.com)
- [Dokploy GitHub Issues](https://github.com/dokploy/dokploy/issues)

For application issues:
- Check application logs: `docker logs hvacops-app`
- Review Next.js build output in Dokploy dashboard
