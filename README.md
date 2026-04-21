# ShopAssist

Production-oriented Shopify embedded app foundation for Omniweb AI.

## Structure

- `frontend` - Next.js App Router application, Shopify embedded admin UI, Prisma schema, and server routes.
- `backend` - reserved for future non-Next backend workers or services if the architecture expands.
- `assets` - reserved for app imagery, icons, videos, and branded media.

## Phase 1 Included

- Next.js + TypeScript app scaffold inside `frontend`
- Shopify auth/session route foundation
- Prisma schema for multi-tenant merchant data and Shopify sessions
- PostgreSQL-ready environment template
- Embedded admin shell with section navigation
- Default onboarding logic for new shop installs

## Local setup

1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Fill in Shopify app credentials and PostgreSQL connection details.
3. Optionally set `OMNIWEB_ENGINE_URL` if you already have the Omniweb AI Engine running locally or remotely.
3. From `frontend`, run `npm install`.
4. Generate the Prisma client with `npm run prisma:generate`.
5. Apply the schema with `npm run prisma:migrate` or `npm run db:push`.
6. Optionally seed a local shop with `npm run db:seed`.
7. Start the app with `npm run dev`.

## Integration model

- Shopify auth and merchant configuration stay inside `frontend`.
- Omniweb AI Engine owns Clerk auth, tenant identity, prompt composition, and LiveKit token issuance.
- The Shopify app stores an encrypted Omniweb API key per shop and proxies token/config requests to the engine.
- The new Connection page links a shop to an Omniweb tenant without copying LiveKit secrets into the Shopify app.

## Notes

- This app is intentionally limited to Shopify-side configuration, sync, and secure backend coordination.
- LiveKit runtime execution, telephony, and voice/media orchestration are expected to live outside this app.
- Subsequent phases should build settings forms, sync services, webhook processing, and diagnostics on top of the current foundation.
