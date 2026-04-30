// CORS proxy for GitHub Device Flow endpoints
// GitHub's Device Flow endpoints don't return CORS headers, so browsers block them.
// This worker proxies only the two required endpoints.
//
// Deploy: https://dash.cloudflare.com → Workers → Create → Paste this file
// Or: npx wrangler deploy

const GITHUB_DEVICE_BASE = 'https://github.com/login/device';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const { pathname } = new URL(request.url);

    if (request.method !== 'POST' || (pathname !== '/code' && pathname !== '/token')) {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    const upstream = await fetch(`${GITHUB_DEVICE_BASE}${pathname}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: request.body,
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...CORS,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
