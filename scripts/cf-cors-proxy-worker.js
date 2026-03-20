/**
 * Cloudflare Worker: proxy Backblaze B2 (cf-data) and add CORS headers.
 * Use when B2 S3 CORS won't stick; point theme "ColorFlex data base URL" at this Worker's URL.
 *
 * Deploy: Cloudflare Dashboard → Workers → Create → paste this, add route e.g. colorflex-proxy.yourdomain.com/*
 * Theme setting: ColorFlex data base URL = https://colorflex-proxy.yourdomain.com (no /cf-data, no trailing slash)
 */
const B2_BASE = 'https://s3.us-east-005.backblazeb2.com/cf-data';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }
    const path = url.pathname.replace(/^\/+/, '');
    const upstream = `${B2_BASE}/${path}`;
    const res = await fetch(upstream, {
      method: request.method,
      headers: request.headers,
    });
    if (!res.ok) {
      return res;
    }
    const newHeaders = new Headers(res.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD');
    newHeaders.set('Access-Control-Allow-Headers', '*');
    newHeaders.set('Access-Control-Max-Age', '86400');
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  },
};
