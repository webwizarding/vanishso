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

## Deploying on Vercel

- Set required environment variables in Vercel: `DATABASE_URL` (Neon postgres connection string). Without it the API will refuse to start.
- Notes can include an optional image attachment (PNG/JPEG/WEBP/GIF, up to ~1MB before encryption); attachments are encrypted client-side along with text.

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

