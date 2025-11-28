# [vanish.so](https://vanish.so)

> a vanishing note service supporting aes-gcm 256, custom passwords via pbkdf2, and one-time pads.

## Deploying on Vercel

- Uses `@sveltejs/adapter-vercel`; connect the repo to Vercel and keep the default **Build Command** (`npm run build`) and **Output Directory** (`.vercel/output`, set automatically).
- Set required environment variables in Vercel: `DATABASE_URL` (Neon postgres connection string). Without it the API will refuse to start.
- Optional: set `VERCEL_ANALYTICS_ID` if you use Vercel Analytics in production.
- Run locally with `npm install` (or `bun install`) then `npm run dev`.

### Neon schema

If you need to provision the table manually on Neon, run:

```sql
CREATE TABLE IF NOT EXISTS notes (
  id varchar(256) PRIMARY KEY,
  "confirmBeforeViewing" boolean NOT NULL,
  mode varchar(16) NOT NULL,
  encrypted text NOT NULL,
  exp bigint NOT NULL,
  h varchar(256) NOT NULL,
  cs varchar(256) NOT NULL,
  ss varchar(256) NOT NULL
);
```

## Security posture (zero-trust friendly)

- Client-side only encryption (AES-256-GCM, PBKDF2-derived keys, optional one-time pads). Servers never receive plaintext or user keys.
- Password-derived keys use PBKDF2 (100k iterations) and salted SHA-256 hashes with constant-time comparison on the server.
- Notes self-delete after expiry or on first view; identifiers are validated to avoid abuse.
- Platform hardening: CSP, HSTS, permissions lockdown headers, and strict origin checks for CSRF baked into SvelteKit.
