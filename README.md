# [vanish.so](https://vanish.so)

Original Owner: [bvvst](https://github.com/bvvst/vanishso)

> a vanishing note service supporting aes-gcm 256, custom passwords via pbkdf2, and one-time pads.

## Changes from original
- Prebuild sync was introduced, the SvelteKit/Vite/tooling dependencies were raised, and the adapter was switched to Vercel.
- Neon Postgres replaced libsql with a single DATABASE_URL environment, a new pg schema, and a Neon serverless driver. The necessary notes table SQL was written.
- CSP/HSTS/Permissions-Policy/COOP headers, origin CSRF checks, stringent JSON validation, size restrictions, constant-time hash comparison, and sanitized metadata are examples of hardened security.
- To safeguard the Neon free tier, image attachments to notes were added with client-side type/size caps, encrypted together with text, secure rendering with data-URL validation, and stricter payload restrictions.
- Wired header buttons: contact -> GitHub issues, security modal with feature summary.
- Enhanced error handling, origin-safe share links, the preservation of booleans by Select, the removal of external font load, and chunked OTP random generation to circumvent Web Crypto restrictions all contribute to an improved user experience.
- Security-review hardening: one-time notes are now burned atomically and only after a successful read (a wrong password can no longer destroy them), the JSON API enforces a same-origin check, PBKDF2 was raised to 600k iterations, expired notes are purged on access plus a daily cron, AES is the default mode, OTP rejects unencodable input instead of corrupting it, and the production CSP no longer advertises dev-only websocket origins.

## Deploying on Vercel

- Set required environment variables in Vercel:
  - `DATABASE_URL` (Neon postgres connection string). Without it the API will refuse to start.
  - `CRON_SECRET` (recommended): a long random string that authorizes the scheduled cleanup job. The `/api/cleanup` endpoint refuses every request unless this is set and the caller presents `Authorization: Bearer <CRON_SECRET>`.
- Notes can include an optional image attachment (PNG/JPEG/WEBP/GIF, up to ~1MB before encryption); attachments are encrypted client-side along with text.

### Scheduled cleanup

Note expiry is enforced lazily whenever a note is accessed, but a note that is never visited again would otherwise linger in the database. [`vercel.json`](./vercel.json) registers a daily Vercel Cron that calls `/api/cleanup` to delete every time-expired note. Set `CRON_SECRET` so the job (and only the job) can run it. One-time notes have no timestamp and are removed when they are read.

### Cryptography & post-quantum

All confidentiality comes from **symmetric** primitives:

- **AES** mode — AES-256-GCM with a random 256-bit key carried in the URL fragment (default, recommended).
- **Password** mode — AES-256-GCM with a key derived via PBKDF2-HMAC-SHA256 (600k iterations).
- **OTP** mode — a digit-wise pad over a fixed codebook (kept for parity with the original; AES is preferred).

There is **no public-key cryptography** in the design — no RSA/ECDH key exchange — so there is nothing that Shor's algorithm threatens. AES-256 is already considered post-quantum-secure (Grover's algorithm only halves its strength to ~128 bits), so a post-quantum KEM such as ML-KEM would add dependency and attack surface without protecting anything here. "Harvest now, decrypt later" does not apply because the stored ciphertext is AES-256.

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

