# 🚀 Klinchapp

**AI-Powered Social Media Content Creation**

Create. Post. Nail It.

---

## 📋 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free at supabase.com)
- An Anthropic API key (from console.anthropic.com)

### Installation

1. **Clone/Download this folder**

2. **Install dependencies**
```bash
cd klinchapp-nextjs
npm install
```

3. **Set up Supabase**
   - Create a project at supabase.com
   - Run the SQL schema (see `klinchapp-supabase-setup.md`)
   - Enable Google OAuth in Authentication settings

4. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your actual keys
```

5. **Run development server**
```bash
npm run dev
```

6. **Open http://localhost:3000**

---

## 📁 Project Structure

```
klinchapp-nextjs/
├── app/
│   ├── api/
│   │   ├── auth/callback/    # OAuth callback handler
│   │   └── generate/         # AI content generation (SECURE)
│   ├── dashboard/            # Main app (protected)
│   ├── login/                # Login page
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── lib/
│   ├── supabase-browser.ts   # Client-side Supabase
│   └── supabase-server.ts    # Server-side Supabase
├── .env.example              # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔐 Security

**API Key Protection**: The Anthropic API key is ONLY used on the server side (`/api/generate`). It is never exposed to the browser.

**Authentication**: All dashboard routes require authentication. Unauthenticated users are redirected to login.

**Row Level Security**: Database uses Supabase RLS - users can only access their own data.

---

## ✨ Features

### Current (MVP)
- ✅ Google Sign-In
- ✅ Magic Link (email) Sign-In
- ✅ Product posts (with image)
- ✅ Text-only posts (no image required)
- ✅ Multi-platform support (Instagram, Twitter, LinkedIn, Facebook, TikTok)
- ✅ Multiple mood/tone options
- ✅ Feature highlighting
- ✅ Post history saved to database
- ✅ Usage tracking & limits
- ✅ Copy to clipboard

### Coming Soon
- 🔜 Direct posting to Twitter/X
- 🔜 Direct posting to LinkedIn
- 🔜 Post scheduling
- 🔜 Analytics dashboard
- 🔜 Team accounts
- 🔜 Stripe payments

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables for Production

In Vercel, add these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

---

## 💰 Monetization (Future)

The database schema supports:
- Usage tracking per user
- Plan-based limits (free: 10 posts/month)
- Stripe customer/subscription IDs
- Connected social accounts

---

## 📞 Support

For questions or issues, contact [your-email]

---

*Built with ❤️ using Next.js, Supabase, and Anthropic Claude*
