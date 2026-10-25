# Preview deployment

This separate hosted preview supports customer ordering and restaurant order updates backed by the dedicated staging Supabase project. It is a test workflow only; it does not send messages or submit real restaurant orders.

## Preview configuration

Configure these variables in the Vercel project `orderpilot-platform-demo`, **Preview** environment only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` — server only; never add a `NEXT_PUBLIC_` prefix
- `RESTAURANT_DEMO_ACCESS_CODE` — shared code entered on the restaurant screen

Apply `supabase/migrations/202610250003_platform_demo_orders.sql` only to `orderpilot-platform-staging`. See [`staging-setup.md`](staging-setup.md). Do not connect `orderpilot-db` or add these variables to Production.

The `/legacy`, `/admin`, `/api/orders`, and `/api/admin` routes remain guarded from the inherited production app. Keep Vercel deployment protection enabled while using Preview.

Deploy this folder as a Preview only. Do not use `--prod`.
