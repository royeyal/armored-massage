/**
 * Cloudflare Worker for the Armored Massage Webflow custom code.
 *
 * Webflow references two URLs that never change:
 *   /main.css  -> assets/main.<hash>.css
 *   /main.js   -> assets/main.<hash>.js
 *
 * The indirection is the cache-busting strategy. The hashed files are
 * immutable, so browsers may keep them forever; the stable URLs are served
 * `no-cache`, which means the browser still revalidates but gets a 304 (a few
 * hundred bytes) when nothing changed. A deploy changes the hash, the
 * revalidation returns the new body, and every visitor picks it up on their
 * next page load — with no Webflow edit and no manual purge.
 *
 * The mapping comes from the Vite manifest, which is imported at build time,
 * so a stale dist/ fails the deploy rather than silently serving the old file.
 */

import viteManifest from '../dist/.vite/manifest.json';

// Webflow serves the site from armoredmassage.com while the bundle comes from
// this Worker. Stylesheets and classic scripts would not need CORS, but
// `<script type="module">` is fetched in CORS mode and fails without it.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function errorResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

function getHashedJSPath() {
  return viteManifest['main.js']?.file ?? null;
}

function getHashedCSSPath() {
  const css = viteManifest['main.js']?.css;
  return css?.length ? css[0] : null;
}

async function serveAsset(env, request, pathname, contentType, cacheControl) {
  const url = new URL(request.url);
  url.pathname = `/${pathname}`;
  const assetRes = await env.ASSETS.fetch(
    new Request(url.toString(), { method: 'GET', headers: request.headers })
  );
  if (!assetRes.ok && assetRes.status !== 304) {
    return errorResponse(`${pathname} not found`, 404);
  }
  const headers = new Headers(assetRes.headers);
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', cacheControl);
  headers.set('X-Content-Type-Options', 'nosniff');
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  return new Response(assetRes.body, { status: assetRes.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Cheap "is the deploy live?" check that does not depend on the manifest.
    if (url.pathname === '/health') {
      return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain', ...CORS_HEADERS },
      });
    }

    if (url.pathname === '/main.js') {
      const path = getHashedJSPath();
      if (!path) return errorResponse('JS bundle not found in manifest', 404);
      return serveAsset(
        env,
        request,
        path,
        'application/javascript; charset=utf-8',
        'public, no-cache'
      );
    }

    if (url.pathname === '/main.css') {
      const path = getHashedCSSPath();
      if (!path) return errorResponse('CSS bundle not found in manifest', 404);
      return serveAsset(
        env,
        request,
        path,
        'text/css; charset=utf-8',
        'public, no-cache'
      );
    }

    // Hashed filenames are content-addressed, so anything else in dist/ can be
    // cached hard — the name changes whenever the bytes do.
    try {
      const assetRes = await env.ASSETS.fetch(request);
      const headers = new Headers(assetRes.headers);
      headers.set('X-Content-Type-Options', 'nosniff');
      if (url.pathname.startsWith('/assets/')) {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
      Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
      return new Response(assetRes.body, { status: assetRes.status, headers });
    } catch {
      return errorResponse('Not found', 404);
    }
  },
};
