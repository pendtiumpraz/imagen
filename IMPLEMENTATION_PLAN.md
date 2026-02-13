# 🕌 PosterDakwah — Islamic Image Generator SaaS

## Implementation Plan

---

## 1. Project Overview

**PosterDakwah** adalah platform SaaS berbasis Next.js untuk membuat poster dakwah, kajian Islam, dan konten jualan dengan bantuan AI. Platform ini menggunakan **ModelsLab API** (model `nano-banana-pro`) untuk text-to-image dan image editing, serta **DeepSeek API** untuk prompt generation otomatis.

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials Provider) |
| Styling | Vanilla CSS (Modern Islamic Design) |
| AI - Image | ModelsLab API (`nano-banana-pro`) |
| AI - Prompt | DeepSeek API |
| File Upload | Next.js API Route + temporary storage |
| State | React Context + SWR |

---

## 2. Database Schema (Prisma)

### 2.1 Models

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum Role {
  USER
  ADMIN
}

enum SubscriptionPlan {
  FREE        // 10 generations/day
  BASIC       // 49.000/bulan - 50 generations/day
  PRO         // 100.000/bulan - 200 generations/day
}

enum GenerationCategory {
  // Dakwah
  POSTER_KAJIAN
  POSTER_DAKWAH
  THUMBNAIL_KAJIAN
  POSTER_RAMADHAN
  POSTER_JUMAT
  KARTU_UCAPAN_ISLAMI
  // Jualan
  POSTER_PRODUK
  BANNER_PROMO
  THUMBNAIL_MARKETPLACE
  FEED_INSTAGRAM
  STORY_INSTAGRAM
}

enum GenerationStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// ==================== MODELS ====================

model User {
  id              String           @id @default(cuid())
  name            String
  email           String           @unique
  password        String           // hashed with bcrypt
  role            Role             @default(USER)
  plan            SubscriptionPlan @default(FREE)
  dailyQuota      Int              @default(10)
  customQuota     Int?             // admin override quota
  isBanned        Boolean          @default(false)
  banReason       String?
  avatarUrl       String?
  
  // Soft delete
  deletedAt       DateTime?
  
  // Timestamps
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Relations
  generations     Generation[]
  subscriptions   Subscription[]
  
  @@index([email])
  @@index([deletedAt])
}

model Generation {
  id              String             @id @default(cuid())
  userId          String
  category        GenerationCategory
  status          GenerationStatus   @default(PENDING)
  
  // Input
  prompt          String             @db.Text
  enhancedPrompt  String?            @db.Text  // DeepSeek enhanced
  referenceImages String[]           // URLs of uploaded reference images
  aspectRatio     String             @default("1:1")
  
  // Output
  resultImageUrl  String?            // Final generated image URL from ModelsLab
  resultMetadata  Json?              // API response metadata
  
  // Error tracking
  errorMessage    String?
  
  // Soft delete
  deletedAt       DateTime?
  
  // Timestamps
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  // Relations
  user            User               @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([userId, createdAt])
  @@index([deletedAt])
}

model Subscription {
  id              String           @id @default(cuid())
  userId          String
  plan            SubscriptionPlan
  price           Int              // dalam rupiah
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean          @default(true)
  
  // Timestamps
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Relations
  user            User             @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([endDate])
}

model AIProvider {
  id              String   @id @default(cuid())
  name            String   @unique // "modelslab" | "deepseek"
  apiKey          String   // encrypted
  baseUrl         String
  modelId         String?
  isActive        Boolean  @default(true)
  config          Json?    // additional config
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model TempFile {
  id              String   @id @default(cuid())
  filename        String
  originalName    String
  mimeType        String
  url             String   // public accessible URL
  expiresAt       DateTime // 5 minutes from upload
  
  createdAt       DateTime @default(now())
  
  @@index([expiresAt])
}

model DailyUsage {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @db.Date
  count           Int      @default(0)
  
  @@unique([userId, date])
  @@index([userId, date])
}

model SystemSetting {
  id              String   @id @default(cuid())
  key             String   @unique
  value           String   @db.Text
  description     String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 3. Project Structure

```
d:\AI\imagen\
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── next.config.js
├── package.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seed admin user + AI providers
├── public/
│   ├── uploads/                  # Temporary uploaded files
│   ├── images/                   # Static images
│   └── fonts/                    # Custom fonts
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   ├── globals.css           # Global styles + design system
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx      # Dashboard home (stats overview)
│   │   │   ├── generate/
│   │   │   │   ├── page.tsx      # Main generator page (category selection)
│   │   │   │   └── [category]/
│   │   │   │       └── page.tsx  # Specific category generator
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx      # User's generated images
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx      # Subscription plans
│   │   │   └── settings/
│   │   │       └── page.tsx      # User settings
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx        # Admin layout
│   │   │   ├── admin/
│   │   │   │   └── page.tsx      # Admin dashboard overview
│   │   │   ├── admin/users/
│   │   │   │   └── page.tsx      # User management
│   │   │   ├── admin/providers/
│   │   │   │   └── page.tsx      # AI Provider settings
│   │   │   └── admin/settings/
│   │   │       └── page.tsx      # System settings
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts  # NextAuth handler
│   │       ├── generate/
│   │       │   ├── route.ts      # Image generation endpoint
│   │       │   └── prompt/
│   │       │       └── route.ts  # DeepSeek prompt enhancement
│   │       ├── upload/
│   │       │   └── route.ts      # Temporary file upload
│   │       ├── gallery/
│   │       │   └── route.ts      # User gallery CRUD
│   │       ├── admin/
│   │       │   ├── users/
│   │       │   │   ├── route.ts          # List users
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts      # User CRUD + ban/quota
│   │       │   ├── providers/
│   │       │   │   ├── route.ts          # List/create providers
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts      # Update provider
│   │       │   └── stats/
│   │       │       └── route.ts          # Admin statistics
│   │       └── cron/
│   │           └── cleanup/
│   │               └── route.ts          # Cleanup expired temp files
│   │
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Dropdown.tsx
│   │   ├── landing/              # Landing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Showcase.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/            # Dashboard components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── QuotaBar.tsx
│   │   │   └── RecentGenerations.tsx
│   │   ├── generator/            # Generator components
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── GeneratorForm.tsx
│   │   │   ├── PromptInput.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── AspectRatioSelector.tsx
│   │   │   ├── GenerationResult.tsx
│   │   │   └── PromptEnhancer.tsx
│   │   ├── gallery/
│   │   │   ├── ImageGrid.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   └── ImageModal.tsx
│   │   └── admin/
│   │       ├── UserTable.tsx
│   │       ├── UserEditModal.tsx
│   │       ├── ProviderCard.tsx
│   │       └── AdminStats.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # NextAuth config
│   │   ├── modelslab.ts          # ModelsLab API wrapper
│   │   ├── deepseek.ts           # DeepSeek API wrapper
│   │   ├── upload.ts             # File upload utilities
│   │   ├── quota.ts              # Quota checking & management
│   │   ├── encryption.ts         # API key encryption
│   │   └── utils.ts              # General utilities
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useQuota.ts
│   │   ├── useGeneration.ts
│   │   └── useToast.ts
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   │
│   └── middleware.ts             # Auth & role middleware
│
└── scripts/
    └── cleanup-temp-files.ts     # Cron job for temp file cleanup
```

---

## 4. Feature Breakdown

### 4.1 Landing Page
Desain modern Islamic yang elegan dan menjual:
- **Hero Section**: Headline menarik + CTA, background geometric Islamic pattern dengan gradient
- **Features Section**: Showcase kategori generate (Dakwah & Jualan)
- **Showcase Section**: Gallery hasil generate (sample images)
- **Pricing Section**: 3 tier pricing cards (Free / Basic / Pro)
- **Testimonials**: Social proof
- **Footer**: Links, contact, social media

**Design Elements:**
- Warna utama: Deep emerald green (#0D7C66) + Gold (#D4A853) + Dark navy (#0F1B2D)
- Font: Outfit (headings) + Inter (body)
- Islamic geometric patterns sebagai decorative elements
- Glassmorphism cards
- Smooth scroll animations
- Gradient overlays
- Micro-animations pada hover

### 4.2 Authentication
- **Register**: Name, Email, Password
- **Login**: Email, Password
- Password hashing dengan bcrypt
- Session management dengan NextAuth.js
- Protected routes via middleware

### 4.3 User Dashboard
- **Overview Stats**: Total generations, today's usage, quota remaining
- **Quick Actions**: Generate buttons per category
- **Recent Generations**: Latest 6 generated images
- **Quota Progress Bar**: Visual daily quota usage

### 4.4 Image Generator Categories

#### Kategori Dakwah (Islamic Content):
| # | Category | Description | Aspect Ratio Default |
|---|----------|-------------|---------------------|
| 1 | Poster Kajian | Poster untuk acara kajian Islam | 3:4 (portrait) |
| 2 | Poster Dakwah | Poster konten dakwah umum | 1:1 (square) |
| 3 | Thumbnail Kajian | Thumbnail YouTube untuk kajian | 16:9 (landscape) |
| 4 | Poster Ramadhan | Poster khusus Ramadhan | 3:4 (portrait) |
| 5 | Poster Jumat | Poster pengingat sholat Jumat | 9:16 (story) |
| 6 | Kartu Ucapan Islami | Kartu ucapan hari besar Islam | 1:1 (square) |

#### Kategori Jualan (Commerce):
| # | Category | Description | Aspect Ratio Default |
|---|----------|-------------|---------------------|
| 1 | Poster Produk | Poster display produk | 1:1 (square) |
| 2 | Banner Promo | Banner promosi/diskon | 16:9 (landscape) |
| 3 | Thumbnail Marketplace | Thumbnail untuk Shopee/Tokped | 1:1 (square) |
| 4 | Feed Instagram | Post feed Instagram | 1:1 (square) |
| 5 | Story Instagram | Story Instagram/TikTok | 9:16 (portrait) |

### 4.5 Generation Flow

```
[User Input]
    ├── Pilih Category
    ├── Input Prompt (manual / AI-assisted)
    ├── Upload Reference Image (optional, max 2)
    ├── Pilih Aspect Ratio
    └── Click "Generate"
         │
         ▼
[Backend Process]
    ├── 1. Check quota (daily limit)
    ├── 2. Upload reference images → get temp URLs
    ├── 3. Enhance prompt via DeepSeek (optional)
    ├── 4. Call ModelsLab API
    │       ├── Text-to-Image (no reference)
    │       └── Image-to-Image (with reference)
    ├── 5. Save generation record to DB
    ├── 6. Increment daily usage
    └── 7. Return result image URL
         │
         ▼
[User Output]
    ├── Display generated image
    ├── Download button
    └── Save to gallery
```

### 4.6 API Integration

#### ModelsLab API (nano-banana-pro)
**Text-to-Image:**
```
POST https://modelslab.com/api/v7/images/text-to-image
{
  "prompt": "...",
  "model_id": "nano-banana-pro",
  "aspect_ratio": "1:1",
  "key": "API_KEY"
}
```

**Image-to-Image (with reference):**
```
POST https://modelslab.com/api/v7/images/image-to-image
{
  "prompt": "...",
  "model_id": "nano-banana-pro",
  "init_image": ["https://...image1.png", "https://...image2.jpg"],
  "aspect_ratio": "1:1",
  "key": "API_KEY"
}
```

#### DeepSeek API (Prompt Enhancement)
```
POST https://api.deepseek.com/v1/chat/completions
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert AI image prompt engineer..."
    },
    {
      "role": "user", 
      "content": "Enhance this prompt for [category]: [user_prompt]"
    }
  ]
}
```

### 4.7 Temporary File Upload System
- User uploads reference image via form
- Backend saves to `public/uploads/` with unique filename
- Creates `TempFile` record with `expiresAt = now + 5 minutes`
- Returns publicly accessible URL (e.g., `https://domain.com/uploads/abc123.png`)
- URL ending always `.png` or `.jpg` based on original upload
- Cron job (or API route) runs every minute to delete expired files
- Files physically deleted from disk + DB record removed

### 4.8 Quota & Subscription System

| Plan | Price | Daily Limit | Features |
|------|-------|------------|----------|
| FREE | Rp 0 | 10/day | Basic generation, watermark |
| BASIC | Rp 49.000/month | 50/day | No watermark, priority queue |
| PRO | Rp 100.000/month | 200/day | No watermark, priority, HD output |

**Quota Logic:**
```typescript
async function checkQuota(userId: string): Promise<{allowed: boolean, remaining: number}> {
  // 1. Get user with plan
  // 2. Check if banned (quota = 0)
  // 3. Check customQuota (admin override) 
  // 4. Get today's usage from DailyUsage
  // 5. Compare with plan limit
  // 6. Return allowed + remaining
}
```

### 4.9 Admin Dashboard

#### User Management
- List all users with search/filter
- View user details (plan, usage, generations)
- Change user password (reset)
- Change daily quota (override)
- Ban user (set quota to 0 + ban reason)
- Unban user
- Soft delete user

#### AI Provider Management
- List configured AI providers
- Add/Edit ModelsLab API Key + settings
- Add/Edit DeepSeek API Key + settings
- Toggle provider active/inactive
- Test API connection

#### Dashboard Stats
- Total users
- Total generations today/week/month
- Active subscriptions
- Revenue overview
- Top users by generation count

### 4.10 Soft Delete
Semua model utama (User, Generation) menggunakan soft delete:
- Field `deletedAt` (nullable DateTime)
- Query default: `WHERE deletedAt IS NULL`
- Prisma middleware untuk auto-filter soft-deleted records
- Admin dapat melihat deleted records jika diperlukan

---

## 5. Design System

### 5.1 Color Palette
```css
:root {
  /* Primary - Emerald Islamic */
  --color-primary-50: #E8F5F0;
  --color-primary-100: #B9E4D3;
  --color-primary-200: #8AD3B6;
  --color-primary-300: #5BC299;
  --color-primary-400: #2CB17C;
  --color-primary-500: #0D9F66;
  --color-primary-600: #0B8A58;
  --color-primary-700: #09754A;
  --color-primary-800: #07603C;
  --color-primary-900: #054B2E;
  
  /* Accent - Gold */
  --color-accent-400: #E8C468;
  --color-accent-500: #D4A853;
  --color-accent-600: #C09540;
  
  /* Dark - Navy */
  --color-dark-800: #0F1B2D;
  --color-dark-700: #162236;
  --color-dark-600: #1D2940;
  --color-dark-500: #243149;
  
  /* Surface */
  --color-surface-50: #FAFBFC;
  --color-surface-100: #F4F6F8;
  --color-surface-200: #E8ECF0;
  --color-surface-800: #1A1F2E;
  --color-surface-900: #111520;
  
  /* Status */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Typography */
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);
  --shadow-glow: 0 0 20px rgba(13,159,102,0.3);
  
  /* Glass */
  --glass-bg: rgba(255,255,255,0.08);
  --glass-border: rgba(255,255,255,0.12);
  --glass-blur: blur(20px);
}
```

### 5.2 Typography Scale
```css
/* Fluid typography */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8rem);
--text-sm: clamp(0.875rem, 0.8rem + 0.3vw, 0.95rem);
--text-base: clamp(1rem, 0.9rem + 0.4vw, 1.1rem);
--text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
--text-xl: clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem);
--text-2xl: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
--text-3xl: clamp(1.875rem, 1.4rem + 1.8vw, 2.5rem);
--text-4xl: clamp(2.25rem, 1.6rem + 2.5vw, 3.5rem);
--text-5xl: clamp(3rem, 2rem + 3.5vw, 4.5rem);
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Core Setup)
**Files to create:**
1. `package.json` - Dependencies
2. `next.config.js` - Next.js config
3. `tsconfig.json` - TypeScript config
4. `.env` / `.env.example` - Environment variables
5. `prisma/schema.prisma` - Database schema
6. `prisma/seed.ts` - Seed data
7. `src/lib/prisma.ts` - Prisma singleton
8. `src/lib/utils.ts` - Utility functions
9. `src/lib/encryption.ts` - API key encryption
10. `src/types/index.ts` - Type definitions
11. `src/middleware.ts` - Auth middleware
12. `src/app/globals.css` - Design system & global styles
13. `src/app/layout.tsx` - Root layout

### Phase 2: Authentication
**Files to create:**
1. `src/lib/auth.ts` - NextAuth configuration
2. `src/app/api/auth/[...nextauth]/route.ts` - Auth API route
3. `src/app/api/auth/register/route.ts` - Registration endpoint
4. `src/app/(auth)/layout.tsx` - Auth layout
5. `src/app/(auth)/login/page.tsx` - Login page
6. `src/app/(auth)/register/page.tsx` - Register page
7. `src/hooks/useAuth.ts` - Auth hook
8. `src/components/ui/Button.tsx` - Button component
9. `src/components/ui/Input.tsx` - Input component

### Phase 3: Landing Page
**Files to create:**
1. `src/app/page.tsx` - Landing page
2. `src/components/landing/Hero.tsx`
3. `src/components/landing/Features.tsx`
4. `src/components/landing/Pricing.tsx`
5. `src/components/landing/Showcase.tsx`
6. `src/components/landing/Testimonials.tsx`
7. `src/components/landing/Footer.tsx`
8. `src/components/landing/Navbar.tsx`

### Phase 4: Dashboard
**Files to create:**
1. `src/app/(dashboard)/layout.tsx` - Dashboard layout
2. `src/app/(dashboard)/dashboard/page.tsx` - Dashboard home
3. `src/components/dashboard/Sidebar.tsx`
4. `src/components/dashboard/TopBar.tsx`
5. `src/components/dashboard/StatsCard.tsx`
6. `src/components/dashboard/QuotaBar.tsx`
7. `src/components/dashboard/RecentGenerations.tsx`
8. `src/components/ui/Card.tsx`
9. `src/components/ui/Badge.tsx`
10. `src/components/ui/Avatar.tsx`
11. `src/components/ui/Spinner.tsx`
12. `src/components/ui/Toast.tsx`
13. `src/hooks/useToast.ts`

### Phase 5: Image Generator
**Files to create:**
1. `src/lib/modelslab.ts` - ModelsLab API wrapper
2. `src/lib/deepseek.ts` - DeepSeek API wrapper
3. `src/lib/upload.ts` - Upload utilities
4. `src/lib/quota.ts` - Quota management
5. `src/app/api/generate/route.ts` - Generation endpoint
6. `src/app/api/generate/prompt/route.ts` - Prompt enhancement
7. `src/app/api/upload/route.ts` - File upload endpoint
8. `src/app/(dashboard)/generate/page.tsx` - Category selection
9. `src/app/(dashboard)/generate/[category]/page.tsx` - Generator UI
10. `src/components/generator/CategoryCard.tsx`
11. `src/components/generator/GeneratorForm.tsx`
12. `src/components/generator/PromptInput.tsx`
13. `src/components/generator/ImageUploader.tsx`
14. `src/components/generator/AspectRatioSelector.tsx`
15. `src/components/generator/GenerationResult.tsx`
16. `src/components/generator/PromptEnhancer.tsx`
17. `src/hooks/useGeneration.ts`
18. `src/hooks/useQuota.ts`

### Phase 6: Gallery
**Files to create:**
1. `src/app/api/gallery/route.ts` - Gallery API
2. `src/app/(dashboard)/gallery/page.tsx` - Gallery page
3. `src/components/gallery/ImageGrid.tsx`
4. `src/components/gallery/ImageCard.tsx`
5. `src/components/gallery/ImageModal.tsx`
6. `src/components/ui/Modal.tsx`

### Phase 7: Subscription
**Files to create:**
1. `src/app/(dashboard)/subscription/page.tsx` - Subscription page
2. `src/app/api/subscription/route.ts` - Subscription API

### Phase 8: Admin Dashboard
**Files to create:**
1. `src/app/(admin)/layout.tsx` - Admin layout
2. `src/app/(admin)/admin/page.tsx` - Admin overview
3. `src/app/(admin)/admin/users/page.tsx` - User management
4. `src/app/(admin)/admin/providers/page.tsx` - AI providers
5. `src/app/(admin)/admin/settings/page.tsx` - System settings
6. `src/app/api/admin/users/route.ts` - Users list API
7. `src/app/api/admin/users/[id]/route.ts` - User CRUD API
8. `src/app/api/admin/providers/route.ts` - Providers list API
9. `src/app/api/admin/providers/[id]/route.ts` - Provider CRUD API
10. `src/app/api/admin/stats/route.ts` - Stats API
11. `src/components/admin/UserTable.tsx`
12. `src/components/admin/UserEditModal.tsx`
13. `src/components/admin/ProviderCard.tsx`
14. `src/components/admin/AdminStats.tsx`

### Phase 9: Temp File Cleanup & Settings
**Files to create:**
1. `src/app/api/cron/cleanup/route.ts` - Cleanup endpoint
2. `src/app/(dashboard)/settings/page.tsx` - User settings
3. `scripts/cleanup-temp-files.ts` - Cleanup script

---

## 7. API Routes Summary

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/[...nextauth]` | Login/signout/session | Public |
| POST | `/api/generate` | Generate image | User |
| POST | `/api/generate/prompt` | Enhance prompt with DeepSeek | User |
| POST | `/api/upload` | Upload reference image | User |
| GET | `/api/gallery` | Get user's generations | User |
| DELETE | `/api/gallery?id=xxx` | Soft delete generation | User |
| GET | `/api/quota` | Check remaining quota | User |
| POST | `/api/subscription` | Subscribe to plan | User |
| GET | `/api/admin/users` | List all users | Admin |
| GET/PUT/DELETE | `/api/admin/users/[id]` | User CRUD | Admin |
| PUT | `/api/admin/users/[id]/quota` | Update user quota | Admin |
| PUT | `/api/admin/users/[id]/ban` | Ban/unban user | Admin |
| PUT | `/api/admin/users/[id]/password` | Reset password | Admin |
| GET/POST | `/api/admin/providers` | AI providers CRUD | Admin |
| PUT/DELETE | `/api/admin/providers/[id]` | Provider update | Admin |
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| POST | `/api/cron/cleanup` | Cleanup expired files | System |

---

## 8. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/posterdakwah"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# ModelsLab (input via admin dashboard)
MODELSLAB_API_KEY="default-key"
MODELSLAB_BASE_URL="https://modelslab.com/api/v7/images"

# DeepSeek (input via admin dashboard)  
DEEPSEEK_API_KEY="default-key"
DEEPSEEK_BASE_URL="https://api.deepseek.com/v1"

# Encryption key for API keys stored in DB
ENCRYPTION_KEY="32-byte-hex-key"

# Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760  # 10MB

# App
APP_URL="http://localhost:3000"
```

---

## 9. Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^4.24.0",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "swr": "^2.2.0",
    "lucide-react": "^0.400.0",
    "react-dropzone": "^14.2.0",
    "react-hot-toast": "^2.4.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "@types/bcryptjs": "^2.4.0"
  }
}
```

---

## 10. Security Considerations

1. **Password Hashing**: bcryptjs with salt rounds 12
2. **API Key Encryption**: AES-256-GCM for stored API keys
3. **Auth Middleware**: Protect all dashboard/admin routes
4. **Role-based Access**: Admin-only routes checked in middleware
5. **Rate Limiting**: Quota system prevents abuse
6. **File Upload Validation**: Check MIME type, file size, image validation
7. **CSRF Protection**: NextAuth built-in CSRF
8. **Input Sanitization**: Validate all user inputs
9. **Soft Delete**: No permanent data loss
10. **Temp File Cleanup**: Automatic cleanup prevents disk abuse

---

## 11. Execution Order

```
1. Initialize Next.js project (npx create-next-app)
2. Install all dependencies
3. Setup Prisma + PostgreSQL schema
4. Run prisma migrate + seed
5. Build design system (globals.css)
6. Implement auth (NextAuth + register)
7. Build landing page
8. Build dashboard layout + sidebar
9. Implement file upload system
10. Build image generator (ModelsLab integration)
11. Build prompt enhancer (DeepSeek integration)
12. Build gallery system
13. Build subscription page
14. Build admin dashboard
15. Implement cron cleanup
16. Polish & test
```

---

*Plan created: 2026-02-13*
*Status: Ready for execution*
