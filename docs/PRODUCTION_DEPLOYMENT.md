# VSecure Technologies HRMS — Production Deployment & Cloud Infrastructure Guide

> **System:** VSecure HRMS (Enterprise Workforce & Payroll Management)  
> **Target Release:** Production Phase 6  
> **Company:** VSecure Technologies Pvt Ltd  
> **Production Domain:** `https://hrms.vsecuretechnologies.com`  
> **Android Package Identifier:** `com.vsecuretechnologies.hrms`  

---

## 1. Production Architecture

```
[ Android Mobile App ]          [ Responsive Web Browser ]
(com.vsecuretechnologies.hrms)     (Desktop / Tablet / Phone)
             \                             /
              \                           /
               HTTPS (TLS 1.3) / Strict CSP
                           |
                           v
        +-------------------------------------+
        | Next.js 15 Production Edge / Node.js|
        |  - Security Headers (HSTS, CSP)     |
        |  - Session Revocation & Rate Limit  |
        |  - 4-Tier RBAC Perimeter            |
        |  - Health API: /api/health          |
        +-------------------------------------+
                           |
            Connection Pooler (PgBouncer, Port 6543)
                           |
                           v
        +-------------------------------------+
        |   Managed PostgreSQL 16 (Cloud)     |
        |  - Database URL: SSL Require        |
        |  - Automated Daily Backups          |
        |  - 14 Normalized Relational Models  |
        |  - Versioned Prisma Migrations      |
        +-------------------------------------+
```

---

## 2. Web Portal Deployment

### Option A: Vercel (Recommended for Next.js)
1. Link GitHub repository `vsecure-technologies/hrms` to Vercel.
2. Set Root Directory to `./apps/web`.
3. Configure Environment Variables in Vercel Project Settings (from `.env.production.example`):
   ```ini
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
   NEXT_PUBLIC_TIMEZONE="Asia/Kolkata"
   NEXT_PUBLIC_CURRENCY="INR"
   NEXT_PUBLIC_LOCALE="en-IN"
   SUPER_ADMIN_CODE="VS-001"
   SUPER_ADMIN_EMAIL="vishnu@vsecuretechnologies.com"
   ```
4. Custom Domain: Add `hrms.vsecuretechnologies.com` and point CNAME to `cname.vercel-dns.com`.
5. Deploy. Vercel automatically sets up TLS/SSL certificates via Let's Encrypt.

### Option B: Docker Container / Self-Hosted Linux VPS
1. Run production build in Docker:
   ```bash
   docker build -f apps/web/Dockerfile -t vsecure-hrms-web:latest .
   docker run -d -p 3000:3000 --env-file .env.production vsecure-hrms-web:latest
   ```
2. Configure NGINX reverse proxy with Certbot SSL certificates.

---

## 3. Database Production Hardening

### Connection Pooling & SSL Mode
In high-concurrency environments, use a pooled connection string for Next.js server actions to prevent connection exhaustion:
- **Pooled URL (`DATABASE_URL`)**: Port `6543` with `?pgbouncer=true&sslmode=require`.
- **Direct URL (`DIRECT_URL`)**: Port `5432` with `?sslmode=require` (reserved for Prisma migrations).

### Running Production Migrations
```bash
# Push schema cleanly to production database
pnpm --filter @vsecure/database db:push

# Seed default organization and Super Admin Vishnu
pnpm --filter @vsecure/database db:seed
```

---

## 4. Android APK & Release Build (EAS Build)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 2: Configure Project & Android Credentials
```bash
cd apps/mobile
eas project:init
```

### Step 3: Build Installable Android APK (Internal Preview)
```bash
# Builds standalone .apk for direct distribution to VSecure staff
eas build -p android --profile preview-apk
```
Upon build completion, EAS CLI returns a direct download link and QR code to install the APK directly on any Android phone running Android 10 to Android 15.

### Step 4: Build Google Play Store App Bundle (Production `.aab`)
```bash
# Builds Google Play Store compliant Android App Bundle (.aab)
eas build -p android --profile production
```

---

## 5. Automated Database Backups & Disaster Recovery

### Daily Automated Backup (Cron Schedule)
Add to server crontab (`crontab -e`):
```cron
# Run daily database backup at 02:00 AM IST
0 20 * * * /path/to/HRMS/scripts/backup-db.sh /var/backups/vsecure-hrms >> /var/log/hrms-backup.log 2>&1
```

### Disaster Recovery Test Run
```powershell
# Verify backup archive checksums and simulate data restoration
powershell -ExecutionPolicy Bypass -File .\scripts\test-restore.ps1
```

---

## 6. Pre-Launch Production Smoke Test Checklist

Execute these validation commands before declaring the platform live:

```bash
# 1. Monorepo TypeScript Verification (Must be 5/5 successful)
pnpm turbo typecheck

# 2. Automated Test Suite (Must be 70/70 passing)
pnpm --filter @vsecure/shared test

# 3. Production Build Compilation (Must compile with code 0)
pnpm --filter web build

# 4. HTTP Health Check (Must return status: healthy and HTTP 200)
curl -i https://hrms.vsecuretechnologies.com/api/health

# 5. Core Routes Smoke Test (All must return HTTP 200)
curl -s -o /dev/null -w "%{http_code}\n" https://hrms.vsecuretechnologies.com/
curl -s -o /dev/null -w "%{http_code}\n" https://hrms.vsecuretechnologies.com/employees
curl -s -o /dev/null -w "%{http_code}\n" https://hrms.vsecuretechnologies.com/attendance
curl -s -o /dev/null -w "%{http_code}\n" https://hrms.vsecuretechnologies.com/leave
curl -s -o /dev/null -w "%{http_code}\n" https://hrms.vsecuretechnologies.com/payroll
```

---

## 7. Operational Blocker & Maintenance Contacts

- **Super Administrator**: Vishnu (`VS-001`, `vishnu@vsecuretechnologies.com`)
- **HR Operations Lead**: Priya Sharma (`VS-002`, `priya.sharma@vsecuretechnologies.com`)
- **Cloud Operations Lead**: Arjun Mehta (`VS-003`, `arjun.mehta@vsecuretechnologies.com`)
