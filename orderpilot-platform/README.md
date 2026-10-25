# OrderPilot Platform — prototype

Separate test platform for restaurant discovery, ordering, and restaurant-side order responses. It does not change or connect to the original OrderPilot production database.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The client and restaurant views share orders through the dedicated staging Supabase project. For setup, see [`docs/staging-setup.md`](docs/staging-setup.md).

## Demo URLs

- Customer directory: `/`
- Restaurant account picker: `/restaurant`
- Individual restaurant panel: `/restaurant/wunderteig`, `/restaurant/green-table`, or `/restaurant/pasta-club`
- Restaurant menu query: `/?restaurant=wunderteig`, `/?restaurant=green-table`, or `/?restaurant=pasta-club`

The restaurant panel requires the shared test access code configured as `RESTAURANT_DEMO_ACCESS_CODE`. Order data and customer contact details are test data only. No SMS or other external messages are sent.

## Preview

See [`docs/deployment-preview.md`](docs/deployment-preview.md). Deploy only to Vercel Preview; never set these credentials for Production.
