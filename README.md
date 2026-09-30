# मवेशी बाज़ार (Maveshi Bajar) — Bilingual Livestock Selling PWA MVP

A mobile-first, high-performance, bilingual (Hindi-first + English supported) Progressive Web Application (PWA) MVP built with **Next.js 15+ App Router**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas / Mongoose**, and **Cloudinary**.

Designed for a single livestock farmer/seller to list and sell cattle:
- 🐄 **गाय (Cow)**
- 🐃 **भैंस (Buffalo)**
- 🐾 **पड़वा / पड़िया (Buffalo Calf - Male / Female)**

---

## 🌟 Key Features

1. **Bilingual (Hindi Primary + English Secondary)**:
   - Centralized i18n translation system (`src/messages/hi.json` & `src/messages/en.json`).
   - Sticky language switcher (`हिन्दी | English`) with persistent selection (localStorage + cookie).
   - Zero buyer authentication required — instant access to all animal details.

2. **Strict Limit Enforcement**:
   - `MAX_ANIMALS = 10` enforced on the backend (`src/config/app.ts`).
   - 1 to 5 photos per animal with exactly 1 designated main thumbnail.
   - Max 1 video per animal, strictly validated to `<= 20 seconds` duration.

3. **Direct Cloudinary Media & Video Delivery**:
   - Cloudinary WebP/AVIF responsive image optimization.
   - **Direct Video Streaming**: Videos stream directly from Cloudinary URLs to the browser — Vercel never acts as a video proxy server.
   - Backend duration validator automatically deletes exceeding video assets from Cloudinary.

4. **Smooth Mobile Video Player**:
   - Native HTML5 video player with mobile-friendly overlay controls:
     - Play / Pause
     - Seek slider & duration counter
     - Forward 5s & Rewind 5s
     - Fullscreen & mobile orientation support
     - Volume & Mute toggle
     - `playsInline` attribute

5. **Centralized Seller Profile & 1-Click Contacts**:
   - Single source of truth (`src/config/site.ts` with DB overrides).
   - 📞 `tel:` direct phone dialing.
   - 💬 `https://wa.me/` direct WhatsApp with pre-filled animal inquiry text.
   - Admin can upload and update the seller profile image via Cloudinary with automatic cleanup of previous assets.

6. **Admin Dashboard & CRUD**:
   - Secure session authentication (`/admin/login`) with HTTP-only cookies and bcrypt hashing.
   - Simple dashboard with live animal counter: `X / 10 पशु सूचीबद्ध`.
   - Add/Edit animals with live multi-image preview and thumbnail picker.
   - Safe delete with explicit bilingual confirmation warning before Cloudinary media & MongoDB documents are removed.

7. **Progressive Web App (PWA)**:
   - Native web manifest (`src/app/manifest.ts`).
   - Offline app-shell caching with service worker (`public/sw.js`).
   - Mobile viewport, apple touch icons, and install app prompt banner.

---

## 🏗️ Architecture & Project Structure

```text
maveshi_bajar/
├── public/
│   ├── icon.svg                 # Brand SVG icon
│   ├── icon-192.png             # 192x192 PWA icon
│   ├── icon-512.png             # 512x512 PWA icon
│   └── sw.js                    # Service Worker (offline caching)
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── animals/
│   │   │   │   ├── [id]/edit/   # Edit Animal form
│   │   │   │   └── new/         # Add Animal form (1-5 photos, thumbnail, video <=20s)
│   │   │   ├── login/           # Admin login
│   │   │   └── page.tsx         # Admin dashboard (count, table, delete modal)
│   │   ├── animal/[id]/         # Dynamic Animal details page (SEO, gallery, video player)
│   │   ├── api/
│   │   │   ├── animals/         # GET list, POST create (limit 10)
│   │   │   ├── animals/[id]/    # GET single, PUT update, DELETE (Cloudinary cleanup)
│   │   │   ├── auth/            # login, logout, me session
│   │   │   ├── contact/         # Public seller contact info
│   │   │   ├── seller/          # Seller profile update
│   │   │   └── upload/          # Cloudinary upload & video duration check
│   │   ├── contact/             # Public contact page
│   │   ├── globals.css          # Tailwind CSS styles
│   │   ├── layout.tsx           # PWA head, Header, Footer, LanguageProvider
│   │   ├── manifest.ts          # Next.js App Router Web App Manifest
│   │   └── page.tsx             # Homepage (Hero, Category filter, AnimalCards)
│   ├── components/
│   │   ├── admin/               # DeleteConfirmModal, ImageUploadPicker, VideoUploader, SellerModal
│   │   ├── animal/              # AnimalCard, CategoryFilter, ImageGallery, VideoPlayer
│   │   └── common/              # Header, Footer, LanguageSwitcher, ContactButtons, PWAInstaller
│   ├── config/
│   │   ├── app.ts               # MAX_ANIMALS=10, MAX_VIDEO_DURATION_SECONDS=20, etc.
│   │   └── site.ts              # Centralized SELLER_NAME, PHONE, WHATSAPP, ADDRESS
│   ├── context/
│   │   └── LanguageContext.tsx  # React Context with localStorage & cookie persistence
│   ├── lib/
│   │   ├── auth.ts              # JWT signing, verify, bcrypt
│   │   ├── cloudinary-client.ts # Client-safe Cloudinary image transforms
│   │   ├── cloudinary-server.ts # Server Cloudinary SDK, upload & delete
│   │   ├── db.ts                # Cached Mongoose connection with demo fallback
│   │   ├── i18n.ts              # Interpolation translation helper
│   │   └── utils.ts             # Tailwind merge & price formatter
│   ├── messages/
│   │   ├── hi.json              # Hindi primary translations
│   │   └── en.json              # English secondary translations
│   ├── models/
│   │   ├── Admin.ts             # Admin schema
│   │   ├── Animal.ts            # Animal schema
│   │   └── SellerSettings.ts    # Dynamic seller profile schema
│   ├── services/
│   │   ├── animalService.ts     # Animal business logic, limit enforcement & CRUD
│   │   ├── authService.ts       # Admin auth & initial seeding
│   │   └── sellerService.ts     # Seller profile logic & image cleanup
│   └── types/                   # TypeScript interfaces
├── .env.example
└── README.md
```

---

## ⚙️ Configuration & Limits

### `src/config/app.ts`
All business limits are centralized:
```ts
export const APP_CONFIG = {
  MAX_ANIMALS: 10,
  MIN_IMAGES_PER_ANIMAL: 1,
  MAX_IMAGES_PER_ANIMAL: 5,
  MAX_VIDEOS_PER_ANIMAL: 1,
  MAX_VIDEO_DURATION_SECONDS: 20,
  MAX_VIDEO_RESOLUTION: 1080,
  CLOUDINARY_FOLDERS: {
    IMAGES: "animal-app/animals/images",
    VIDEOS: "animal-app/animals/videos",
    SELLER: "animal-app/seller",
  },
} as const;
```

To change video limit from 20s to 300s in the future, simply update `MAX_VIDEO_DURATION_SECONDS: 300` in `src/config/app.ts`.

### `src/config/site.ts`
All contact numbers are centralized:
```ts
export const SITE_CONFIG = {
  APP_NAME: "मवेशी बाज़ार | Maveshi Bajar",
  SELLER_NAME: "रामेश्वर यादव (Rameshwar Yadav)",
  SELLER_PHONE: "+919876543210",
  SELLER_WHATSAPP: "919876543210",
  SELLER_PROFILE_IMAGE: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  SELLER_ADDRESS: "ग्राम - रामपुर, जिला - मेरठ, उत्तर प्रदेश (Meerut, Uttar Pradesh)",
  SELLER_EXPERIENCE: "15+ वर्ष का पशुपालन अनुभव (15+ Years Livestock Experience)",
};
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your MongoDB Atlas and Cloudinary credentials:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/maveshi_bajar?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
JWT_SECRET=super_secret_production_key_maveshi_2026
ADMIN_EMAIL=admin@maveshibajar.com
ADMIN_PASSWORD=admin123456
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Login
- URL: `http://localhost:3000/admin/login`
- Email: `admin@maveshibajar.com`
- Password: `admin123456`

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. In the Vercel dashboard, click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
4. Click **Deploy**. Vercel will build and serve the application globally with edge caching.
