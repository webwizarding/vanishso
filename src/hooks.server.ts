import type { Handle } from "@sveltejs/kit";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://googleads.g.doubleclick.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com ws: wss:",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": csp,
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy":
    "geolocation=(), microphone=(), camera=(), interest-cohort=(), usb=(), payment=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) =>
      ["content-type", "etag", "cache-control"].includes(name),
  });

  for (const [header, value] of Object.entries(securityHeaders)) {
    if (!response.headers.has(header)) {
      response.headers.set(header, value);
    }
  }

  return response;
};
