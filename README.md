# laundry.li

This project is now split into:

- `frontend/`: Next.js + Tailwind UI
- `backend/`: JavaScript API server

## Local development

Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Run the backend:

```bash
cd backend && npm run dev
```

Run the frontend:

```bash
cd frontend && npm run dev
```

The frontend proxies `/api/*`, `/invoice/:id`, and `/invoice-text/:id` to the backend.

---

# Migration Plan

# laundry.li — Full Stack Laundry Pickup App

## Architecture Overview

```
laundry.li (monorepo)
├── frontend/              Next.js 15 + React 19 + Tailwind CSS
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        ← data models (source of truth)
│   │   └── migrations/          ← auto-generated SQL (committed to git)
│   ├── src/
│   │   ├── server.js            ← Express entry point
│   │   ├── db.js                ← Prisma client singleton
│   │   ├── seed.js              ← seeds admin user
│   │   ├── mailer.js            ← email templates (unchanged)
│   │   ├── routes/
│   │   │   ├── auth.js          ← /api/auth/*, /api/register
│   │   │   ├── admin.js         ← /api/admin/*
│   │   │   ├── orders.js        ← /api/repeat-pickup, /api/registrations
│   │   │   ├── bag.js           ← /api/bag/:code
│   │   │   └── invoice.js       ← /invoice/:id, /invoice-text/:id
│   │   └── lib/
│   │       ├── helpers.js       ← formatMoney, calculateAmounts, hash/verify password
│   │       ├── invoice.js       ← createInvoiceHtml, createInvoiceText, buildRecord
│   │       ├── session.js       ← createSession, destroySession, requireAuth middleware
│   │       ├── customer.js      ← customer DB helpers (serialize, queries)
│   │       ├── order.js         ← order DB helpers (insert, query)
│   │       └── qr.js            ← createBagIdentity (QR code generation)
│   ├── Dockerfile
│   ├── .env                     ← NOT committed to git
│   └── package.json
└── package.json                 ← monorepo scripts
```

---

## Tech Stack

| Layer    | Technology                             |
| -------- | -------------------------------------- |
| Frontend | Next.js 15, React 19, Tailwind CSS     |
| Backend  | Node.js 20, Express 4                  |
| ORM      | Prisma 5                               |
| Database | PostgreSQL 16                          |
| Email    | Nodemailer                             |
| QR Codes | qrcode npm package                     |
| Deploy   | AWS EC2 + RDS **or** ECS Fargate + RDS |
| CI/CD    | GitHub Actions                         |

---

## Part 1 — Local Development (macOS)

### Prerequisites

- Node.js 20+ (`node -v`)
- npm 10+ (`npm -v`)
- Homebrew (`brew -v`)

### 1. Install PostgreSQL

```bash
brew install postgresql@16
brew services start postgresql@16

# Add to PATH — paste into ~/.zshrc then restart terminal
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# Create the database
createdb laundry_db

# Verify connection
psql laundry_db -c "SELECT version();"
```

### 2. Install dependencies

```bash
# From project root
cd backend && npm install
cd ../frontend && npm install
```

### 3. Create `backend/.env`

```env
# Server
PORT=4000
HOST=127.0.0.1
FRONTEND_URL=http://localhost:3000
APP_BASE_URL=https://laundry.li

# PostgreSQL (local)
DATABASE_URL="postgresql://localhost/laundry_db?schema=public"

# Admin seed (change ADMIN_PASSWORD before production)
ADMIN_EMAIL=admin@laundry.li
ADMIN_PASSWORD=LaundryAdmin123!

# SMTP — leave blank in dev to skip emails
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
ADMIN_NOTIFY_EMAIL=
```

### 4. Run migrations and seed

```bash
cd backend

# Creates all tables and generates the Prisma client
npx prisma migrate dev --name init

# Seeds the admin user
npm run seed
```

### 5. Start both servers

```bash
# From project root
npm run dev:backend    # → http://127.0.0.1:4000
npm run dev:frontend   # → http://localhost:3000
```

---

## Part 2 — Migration Plan (SQLite monolith → Express + Prisma + PostgreSQL)

### Step 1 — Install new packages

```bash
cd backend
npm install express cors cookie-parser @prisma/client
npm install --save-dev prisma
```

New `backend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "node src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed.js",
    "migrate": "npx prisma migrate deploy",
    "studio": "npx prisma studio"
  }
}
```

### Step 2 — Initialize Prisma

```bash
cd backend
npx prisma init --datasource-provider postgresql
```

This creates `backend/prisma/schema.prisma` and appends `DATABASE_URL` to `.env`.

### Step 3 — `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id           String    @id @default(uuid())
  email        String    @unique
  firstName    String    @map("first_name")
  lastName     String    @map("last_name")
  address      String
  postalCode   String    @map("postal_code")
  city         String
  phone        String?
  bagCode      String    @unique @map("bag_code")
  qrPayload    String    @map("qr_payload")
  qrSvg        String    @map("qr_svg")
  passwordHash String?   @map("password_hash")
  status       String    @default("active")
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  orders   Order[]
  sessions Session[]

  @@map("customers")
}

model Order {
  id            String    @id @default(uuid())
  customerId    String    @map("customer_id")
  pickupDate    String    @map("pickup_date")
  pickupSlot    String    @map("pickup_slot")
  laundryType   String    @map("laundry_type")
  shirtsCount   Int       @map("shirts_count")
  notes         String?
  amount        Decimal
  invoiceNumber String    @unique @map("invoice_number")
  invoiceHtml   String    @map("invoice_html")
  invoiceText   String?   @map("invoice_text")
  status        String    @default("scheduled")
  returnWindow  String?   @map("return_window")
  billingPlan   String    @default("single") @map("billing_plan")
  updatedAt     DateTime? @map("updated_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  customer Customer @relation(fields: [customerId], references: [id])

  @@map("orders")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  role      String
  createdAt DateTime @default(now()) @map("created_at")
  expiresAt DateTime @map("expires_at")

  @@map("sessions")
}

model Admin {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("admins")
}
```

### Step 4 — `src/db.js` — Prisma singleton

```javascript
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
```

### Step 5 — How Prisma replaces raw SQLite calls

Old code (unsafe string interpolation):

```javascript
// BEFORE — raw SQLite, manual escaping, synchronous, SQL-injection-prone
dbGet(`SELECT * FROM customers WHERE email = '${email}'`);
```

New code (Prisma, fully safe, async):

```javascript
// AFTER — Prisma, parameterized, typed, safe
await prisma.customer.findUnique({ where: { email } });
```

More examples:

| Old (SQLite)                         | New (Prisma)                                               |
| ------------------------------------ | ---------------------------------------------------------- |
| `dbGet("SELECT * FROM customers")`   | `prisma.customer.findMany()`                               |
| `dbRun("INSERT INTO orders ...")`    | `prisma.order.create({ data: { ... } })`                   |
| `dbRun("UPDATE orders SET status…")` | `prisma.order.update({ where: { id }, data: { status } })` |
| `dbRun("DELETE FROM sessions …")`    | `prisma.session.delete({ where: { id } })`                 |

### Step 6 — Useful Prisma commands

```bash
# Open visual DB browser in browser
npx prisma studio

# Create a new migration after changing schema.prisma
npx prisma migrate dev --name describe_your_change

# Apply pending migrations (run in production / CI)
npx prisma migrate deploy

# Regenerate Prisma client after schema change (usually automatic)
npx prisma generate

# Reset database and re-run all migrations (dev only — destroys all data)
npx prisma migrate reset

# Pull schema from an existing database (useful for legacy DBs)
npx prisma db pull
```

---

## Part 3 — AWS Deployment

### Option A — EC2 + RDS (Simpler, good starting point)

**Architecture:**

```
Internet → Route 53 → EC2 (Nginx → Express on :4000 + Next.js on :3000) → RDS PostgreSQL
```

#### Step A1 — Create RDS PostgreSQL

1. AWS Console → **RDS → Create database**
2. Options:
   - Engine: PostgreSQL 16
   - Template: Free tier (dev) or Production
   - DB identifier: `laundry-db`
   - Master username: `laundry_admin`
   - DB name: `laundry_db`
   - VPC: same as your EC2 instance
   - **Public access: No**
3. After creation, note the **Endpoint**, e.g.:
   `laundry-db.xxxx.us-east-1.rds.amazonaws.com`

Your `DATABASE_URL` for production:

```
postgresql://laundry_admin:YOUR_PASSWORD@laundry-db.xxxx.us-east-1.rds.amazonaws.com:5432/laundry_db?schema=public&sslmode=require
```

#### Step A2 — Create EC2 Instance

1. EC2 → **Launch Instance**
2. Settings:
   - AMI: Ubuntu 24.04 LTS
   - Instance type: t3.small (2 vCPU / 2 GB RAM)
   - Key pair: create or upload `.pem` key
3. Security group inbound rules:

   | Type  | Port | Source       |
   | ----- | ---- | ------------ |
   | SSH   | 22   | Your IP only |
   | HTTP  | 80   | 0.0.0.0/0    |
   | HTTPS | 443  | 0.0.0.0/0    |

4. RDS security group: allow port 5432 from EC2 security group

#### Step A3 — Provision EC2

```bash
# SSH in
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (keeps server running and auto-restarts on crash)
sudo npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# Clone your repo
git clone https://github.com/Malaya47/New-project.git /home/ubuntu/app
cd /home/ubuntu/app/backend
npm install --production
```

Set up `.env` at `/home/ubuntu/app/backend/.env` with your RDS `DATABASE_URL`.

```bash
# Run migrations against RDS
cd /home/ubuntu/app/backend
npx prisma migrate deploy
npm run seed

# Start with PM2
pm2 start src/server.js --name laundry-backend
pm2 save
pm2 startup   # run the command it prints to enable auto-start
```

#### Step A4 — Nginx reverse proxy

Create `/etc/nginx/sites-available/laundry`:

```nginx
server {
    listen 80;
    server_name laundry.li www.laundry.li;

    location /api/ {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    location /invoice/ {
        proxy_pass http://127.0.0.1:4000;
    }

    location /invoice-text/ {
        proxy_pass http://127.0.0.1:4000;
    }

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/laundry /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### Step A5 — Free SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d laundry.li -d www.laundry.li
# Certbot installs a cron job to auto-renew every 90 days
```

---

### Option B — ECS Fargate + RDS (Scalable, Docker-based)

**Architecture:**

```
Internet → Route 53 → ALB (HTTPS :443) → ECS Fargate Tasks (Express :4000) → RDS PostgreSQL
```

#### Step B1 — `backend/Dockerfile`

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate

EXPOSE 4000
CMD ["node", "src/server.js"]
```

#### Step B2 — `backend/.dockerignore`

```
node_modules
.env
*.log
```

#### Step B3 — Push to ECR

```bash
# Authenticate Docker with your ECR registry
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create repo (one time)
aws ecr create-repository --repository-name laundry-backend --region us-east-1

# Build and push
docker build -t laundry-backend ./backend
docker tag  laundry-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/laundry-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/laundry-backend:latest
```

#### Step B4 — Create ECS Fargate service

1. **ECS → Clusters → Create**: `laundry-cluster` (Fargate)
2. **Task Definition**:
   - Container image: ECR URI
   - Container port: 4000
   - CPU: 0.5 vCPU / Memory: 1 GB
   - Environment variables: inject from **AWS Secrets Manager** or **Parameter Store**
3. **Service**:
   - Desired count: 2 (multi-AZ for high availability)
   - Attach ALB on port 443
   - Health check path: `/health`
4. Add an **ACM certificate** to the ALB listener for HTTPS

#### Step B5 — Run migrations in CI before deploy

```bash
DATABASE_URL="your-rds-url" npx prisma migrate deploy
```

Add this as a step in GitHub Actions before the ECS deploy step (see Part 4).

---

## Part 4 — CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        run: |
          docker build -t laundry-backend ./backend
          docker tag laundry-backend:latest ${{ secrets.ECR_REGISTRY }}/laundry-backend:${{ github.sha }}
          docker push ${{ secrets.ECR_REGISTRY }}/laundry-backend:${{ github.sha }}

      - name: Run Prisma migrations
        run: |
          cd backend
          npm ci
          npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-def.json
          service: laundry-backend-service
          cluster: laundry-cluster
          wait-for-service-stability: true
```

**Required GitHub Secrets:**

| Secret                  | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM user with ECR + ECS permissions               |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key                                    |
| `ECR_REGISTRY`          | `YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com` |
| `DATABASE_URL`          | RDS PostgreSQL connection string                  |

---

## Part 5 — Environment Variables Reference

| Variable             | Required | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| `PORT`               | Yes      | Backend port (default: 4000)             |
| `HOST`               | No       | Bind host (default: 127.0.0.1)           |
| `DATABASE_URL`       | Yes      | Full PostgreSQL connection string        |
| `FRONTEND_URL`       | Yes      | CORS allowed origin                      |
| `APP_BASE_URL`       | Yes      | Domain used in QR code payloads          |
| `ADMIN_EMAIL`        | Yes      | Seed admin email                         |
| `ADMIN_PASSWORD`     | Yes      | Seed admin password — **change in prod** |
| `SMTP_HOST`          | No       | SMTP server hostname                     |
| `SMTP_PORT`          | No       | SMTP port (587 or 465)                   |
| `SMTP_USER`          | No       | SMTP login username                      |
| `SMTP_PASS`          | No       | SMTP login password                      |
| `MAIL_FROM`          | No       | Sender display name/address              |
| `ADMIN_NOTIFY_EMAIL` | No       | Where admin notification emails are sent |

---

## Part 6 — API Endpoints Reference

### Auth

| Method | Path                 | Auth     | Description                    |
| ------ | -------------------- | -------- | ------------------------------ |
| POST   | `/api/register`      | None     | Register + book first pickup   |
| POST   | `/api/auth/register` | None     | Alias for `/api/register`      |
| POST   | `/api/auth/signup`   | None     | Account-only signup (no order) |
| POST   | `/api/auth/login`    | None     | Customer login                 |
| POST   | `/api/auth/start`    | None     | Login or auto-create account   |
| POST   | `/api/auth/logout`   | Customer | Logout, clears session cookie  |
| GET    | `/api/auth/session`  | None     | Current session + profile      |

### Customer

| Method | Path                 | Auth     | Description                    |
| ------ | -------------------- | -------- | ------------------------------ |
| POST   | `/api/repeat-pickup` | Optional | Book a repeat pickup           |
| GET    | `/api/bag/:code`     | None     | Lookup customer by QR bag code |

### Admin (requires admin session cookie)

| Method | Path                              | Description            |
| ------ | --------------------------------- | ---------------------- |
| POST   | `/api/admin/login`                | Admin login            |
| GET    | `/api/admin/overview`             | Stats + recent data    |
| GET    | `/api/admin/customers`            | Full customer list     |
| GET    | `/api/admin/customers/:id/orders` | Customer order history |
| POST   | `/api/admin/orders/:id`           | Update order status    |

### Invoices & Health

| Method | Path                 | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/invoice/:id`       | HTML invoice page    |
| GET    | `/invoice-text/:id`  | Plain text invoice   |
| GET    | `/api/registrations` | Recent registrations |
| GET    | `/health`            | Health check         |

---

## Part 7 — Deployment Comparison

| Factor                | Option A: EC2 + RDS   | Option B: ECS Fargate + RDS   |
| --------------------- | --------------------- | ----------------------------- |
| Complexity            | Low                   | Medium                        |
| Cost (small scale)    | ~$30–50/month         | ~$50–80/month                 |
| Scaling               | Manual (resize EC2)   | Automatic (desired count)     |
| Zero-downtime deploys | With PM2 cluster mode | Built-in with rolling updates |
| Recommended for       | MVP / early stage     | Growth stage / production     |

---

## Local Development Quick Reference

```bash
# Start everything
npm run dev:backend && npm run dev:frontend

# Prisma — open DB browser
cd backend && npx prisma studio

# Prisma — after changing schema.prisma
cd backend && npx prisma migrate dev --name your_change

# View backend logs (if using PM2 on server)
pm2 logs laundry-backend

# Check backend health
curl http://localhost:4000/health
```

# 1. Create the PostgreSQL database

createdb laundry_db

# 2. Run migrations (creates tables)

cd backend && npx prisma migrate dev --name init

# 3. Seed the admin user

npm run seed

# 4. Start the server

npm run dev

---

# 1. Start PostgreSQL (if not already running)

brew services start postgresql@16

# 2. Start the backend

cd "/Users/malayatiwari/Documents/New project/backend" && npm run dev

# for checking if postgres is already running or not

brew services list | grep postgresql
