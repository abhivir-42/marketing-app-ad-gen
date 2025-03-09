# Supabase Integration Setup

This document explains how to set up the Supabase integration for persistent storage in the ad generation tool.

## 1. Create the Supabase Table

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `dljrfjawvzmcosdvdxeb`
3. Navigate to the SQL Editor
4. Copy and paste the SQL from the `supabase_table_setup.sql` file in this directory
5. Execute the SQL to create the table and set up permissions

## 2. Environment Variables

The following environment variables need to be set:

```
NEXT_PUBLIC_SUPABASE_URL=https://dljrfjawvzmcosdvdxeb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsanJmamF3dnptY29zZHZkeGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NDQ3MjksImV4cCI6MjA1NzEyMDcyOX0.XMC5ndAOEN0atq8m_wiFhYh8Ng2ZvrYakJa_kVJvxG4
```

These variables have been added to:
- `.env.local` (for local development)
- `.env.production` (for production builds)
- `vercel.json` (for Vercel deployment)

## 3. How It Works

The integration:

1. Uses anonymous session IDs stored in browser localStorage to identify users
2. In development: Falls back to localStorage for storage for faster development
3. In production: Uses Supabase for persistent storage
4. Handles all localStorage operations through the storage service for seamless operation

## 4. Files Modified

- Added: `src/services/supabase.ts` - Supabase client setup
- Added: `src/services/storage.ts` - Storage abstraction layer
- Modified: Various components to use the storage service

## 5. Testing

1. Run the app locally to test localStorage fallback
2. Deploy to Vercel to test Supabase integration 