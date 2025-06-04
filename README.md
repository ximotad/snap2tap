
# Flete Inspection PWA

A mobile-first Progressive Web App for rental equipment inspections, built with React, Supabase, and Tailwind CSS. Mirrors Record360's end-to-end inspection workflow with features like barcode scanning, photo/video capture, digital signatures, and offline support.

## Features

- 📱 **Mobile-First Design**: Touch-optimized UI with ≥44px touch targets
- 📷 **Media Capture**: Photo and video recording with background uploads
- ✍️ **Digital Signatures**: Canvas-based signature capture
- 📊 **Dynamic Checklists**: Different forms based on transaction type
- 🔄 **Real-time Sync**: Supabase real-time updates
- 📴 **Offline Support**: Service worker with static asset caching
- 📧 **Email Notifications**: Send inspection reports to recipients
- 🏗️ **PWA Ready**: Installable as native app

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **State Management**: React hooks
- **PWA**: Service Worker, Web App Manifest

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd flete-inspection-mvp
   pnpm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `scripts/supabase-schema.sql`
   - Create storage buckets: `inspections_media`, `signatures`
   - Get your project URL and anon key

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

### Supabase Setup

1. **Database Schema**
   ```sql
   -- Run scripts/supabase-schema.sql in Supabase SQL Editor
   ```

2. **Storage Buckets**
   - Create `inspections_media` bucket (public read, authenticated write)
   - Create `signatures` bucket (public read, authenticated write)

3. **RLS Policies** (disabled for demo, enable in production)
   ```sql
   -- Enable RLS and create policies based on your auth requirements
   ```

### Production Deployment

#### Vercel (Recommended)

1. **Connect GitHub repo to Vercel**
2. **Set environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**: Vercel will automatically build and deploy

#### Manual Deployment

```bash
pnpm build
# Deploy dist/ folder to your hosting provider
```

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── asset-lookup-screen.tsx
│   ├── transaction-type-screen.tsx
│   ├── media-capture-screen.tsx
│   ├── checklist-screen.tsx
│   ├── review-and-sign-screen.tsx
│   ├── records-list-screen.tsx
│   └── record-detail-screen.tsx
├── lib/                 # Utilities
│   └── supabase.ts      # Supabase client
├── types/               # TypeScript definitions
│   └── database.ts      # Database types
└── pages/
    └── Index.tsx        # Main app component

public/
├── manifest.json        # PWA manifest
├── sw.js               # Service worker
├── icon-192.png        # App icons
└── icon-512.png

scripts/
├── supabase-schema.sql  # Database schema
└── seed.sql            # Demo data
```

## Usage Flow

1. **Asset Lookup**: Enter/scan asset ID, view open transactions
2. **Transaction Type**: Select checkout/return/update
3. **Media Capture**: Take photos/videos with camera
4. **Checklist**: Fill dynamic form based on transaction type
5. **Review & Sign**: Add recipients, capture signature, submit
6. **Records**: View inspection history and details

## API Integration

The app uses Supabase for:
- **Database**: PostgreSQL with real-time subscriptions
- **Storage**: File uploads for media and signatures
- **Auth**: JWT-based authentication (demo uses fixed token)
- **Edge Functions**: Email notifications (optional)

## PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline**: Service worker caches static assets
- **Touch-optimized**: All interactive elements ≥44px
- **Performance**: Lazy loading, optimized images

## Demo Data

The app includes seeded demo data:
- **TRUCK123**: Asset with open checkout transaction
- **FORKLIFT9**: Asset with closed transaction history
- Sample media files and inspection records

## Development Notes

- **Authentication**: Currently uses demo token, integrate real auth in production
- **File Upload**: Uses Supabase storage with TUS for large files
- **Real-time**: Supabase real-time updates for multi-user scenarios
- **Validation**: Form validation with TypeScript and Zod
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create GitHub issue
- Check Supabase docs for backend questions
- Review React/Vite docs for frontend questions

---

**Built with ❤️ for efficient equipment inspections**
