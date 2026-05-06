# 👓 EyeWear Store — Native PWA E-Commerce App

A full-stack Progressive Web App for eyewear e-commerce, built with Next.js, Tailwind CSS, Prisma, and PostgreSQL. Inspired by Lenskart.com.

---

## ✨ Features

### Customer Storefront
- 🛍️ Product listing with filters (category, price range, brand, discount)
- 🔍 Product search
- 📷 Multi-image product gallery
- 🔄 **360° Degree View** — drag to rotate product
- 🥽 **3D AR Try-On** — view glasses in augmented reality on your phone
- 🛒 Cart with persistent storage
- ❤️ Wishlist
- 🔐 Authentication (register/login)
- 📦 Order placement with COD
- 📋 Order history
- ⭐ Product reviews & ratings
- 📱 **PWA** — installable on mobile, works offline

### Admin Panel
- 📊 Dashboard with revenue, order & customer stats
- ➕ Add / Edit products with rich form
- 🖼️ Upload product images to Cloudinary
- 🔄 Upload 360° image sequences
- 🥽 Upload 3D model files (.glb / .usdz)
- 📦 Inline stock management
- 🔀 Order status management
- 👥 User management

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Database | PostgreSQL (via Neon — free) |
| ORM | Prisma |
| Auth | NextAuth.js v4 |
| File Storage | Cloudinary (free) |
| 3D / AR | Google `<model-viewer>` |
| 360° View | Custom drag viewer |
| Cart State | Zustand (persisted) |
| PWA | next-pwa |
| Email | Nodemailer + Gmail |
| Deployment | Vercel (free) |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd eyewear-pwa
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Fill in `.env` with your credentials:

```env
# PostgreSQL from neon.tech (free)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# From cloudinary.com (free account)
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"

# Gmail App Password (not your regular password)
EMAIL_USER="your@gmail.com"
EMAIL_PASS="your-app-password"
```

### 3. Set Up Database

```bash
npx prisma db push
```

### 4. Seed Demo Data

```bash
npm run db:seed
```

This creates:
- **Admin:** `admin@eyewear.com` / `admin123`
- **Customer:** `customer@example.com` / `customer123`
- 4 categories + 6 sample products

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
eyewear-pwa/
├── app/
│   ├── (store)/          # Customer-facing pages
│   │   ├── page.tsx      # Homepage
│   │   ├── products/     # Product listing & detail
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   └── account/
│   ├── (auth)/           # Login & Register
│   ├── admin/            # Admin dashboard (role-gated)
│   │   ├── page.tsx      # Dashboard KPIs
│   │   ├── products/     # Product CRUD + stock
│   │   ├── orders/       # Order management
│   │   └── users/        # User list
│   └── api/              # Next.js API routes
├── components/
│   ├── store/            # Customer UI components
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── Viewer360.tsx  # 360° spin viewer
│   │   └── TryOn3D.tsx    # AR model-viewer
│   └── admin/
│       ├── AdminSidebar.tsx
│       └── ProductForm.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── cloudinary.ts
│   ├── email.ts
│   ├── cartStore.ts       # Zustand cart
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
    └── manifest.json      # PWA manifest
```

---

## 🚢 Deploy to Vercel (Free)

### Step 1: Database — Neon (Free PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (use the **pooled** connection string)
4. Set as `DATABASE_URL`

### Step 2: File Storage — Cloudinary (Free)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, API Secret from the dashboard
3. Create an **unsigned upload preset** named `eyewear_uploads` for the storefront

### Step 3: Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo to Vercel at [vercel.com](https://vercel.com):
1. Import your GitHub repo
2. Add all environment variables in Vercel dashboard
3. Deploy!

After deploy, run the database migrations:
```bash
DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_URL="your-neon-url" npm run db:seed
```

---

## 🔄 Adding 360° View to a Product

1. Take **24–36 photos** of the product, rotating it evenly (every 10–15 degrees)
2. Name files sequentially: `frame_001.jpg`, `frame_002.jpg`, etc.
3. In Admin → Edit Product → 360° View Images → Upload all files
4. Images are sorted alphabetically, so naming matters!

## 🥽 Adding 3D AR Try-On

1. Get a `.glb` or `.usdz` 3D model of the eyewear frame
   - Use tools like Blender, or purchase from CGTrader/Sketchfab
   - For glasses, a simple transparent GLB works best
2. In Admin → Edit Product → 3D Try-On Model → Upload the file
3. On Android (Chrome): Uses ARCore for full AR
4. On iOS (Safari): Uses ARKit / QuickLook
5. On Desktop: Interactive 3D viewer

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register customer |
| GET | `/api/products` | Public | List products (supports filters) |
| GET | `/api/products/[slug]` | Public | Product detail |
| POST | `/api/upload` | Admin | Upload file to Cloudinary |
| GET/POST | `/api/wishlist` | Customer | Get/toggle wishlist |
| GET/POST | `/api/orders` | Customer | List / place orders |
| GET/POST | `/api/addresses` | Customer | Manage addresses |
| GET/POST | `/api/admin/products` | Admin | List / create products |
| PATCH/DELETE | `/api/admin/products/[id]` | Admin | Update / soft-delete |
| GET/PATCH | `/api/admin/orders` | Admin | List / update orders |
| GET | `/api/admin/users` | Admin | List users |

---

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an app password for "Mail"
4. Use that 16-character password as `EMAIL_PASS`

---

## 🛡️ Environment Security

- Never commit `.env` — it's in `.gitignore`
- On Vercel, set all env vars in Project Settings → Environment Variables
- `NEXTAUTH_SECRET` must be unique and random in production
- Cloudinary credentials give upload access — keep them private

---

## 🧪 Local Database GUI

```bash
npm run db:studio
```

Opens Prisma Studio at [localhost:5555](http://localhost:5555) to view/edit data visually.

---

## 📱 Installing as PWA

On mobile Chrome/Safari:
1. Visit the deployed URL
2. Tap "Add to Home Screen" (Android) or Share → Add to Home Screen (iOS)
3. The app installs natively with an icon

---

## 🎨 Customisation

- **Colors:** Edit `tailwind.config.js` → `colors.brand` to change from orange to any color
- **Logo:** Replace the 👓 emoji in `Navbar.tsx` and `Footer.tsx`
- **Categories:** Add via Prisma Studio or a seeder update
- **Email template:** Edit `lib/email.ts`
- **PWA name:** Edit `public/manifest.json`
