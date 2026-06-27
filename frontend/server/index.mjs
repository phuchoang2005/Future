// Static file server for the built SPA plus a reverse proxy for the backend API.
//
// Replaces the previous nginx runtime image. Responsibilities (kept 1:1 with the old
// frontend/nginx/default.conf.template so the deployment contract is unchanged):
//   * GET /healthz                  -> 200 "ok\n" (container healthcheck)
//   * /api/** (incl. WebSocket)     -> reverse-proxied to API_UPSTREAM, preserving the path
//                                      (backend context path is /api/v1, and the WS endpoint is
//                                      /api/v1/ws/jobs/:jobId — both are covered by the /api filter)
//   * everything else               -> static files from dist/, with SPA fallback to index.html
//
// Env:
//   PORT             listen port (default 80)
//   API_UPSTREAM     backend base URL (default http://host.docker.internal:8080; prod compose
//                    overrides this to http://backend:8080 for the in-network backend container)
//   PROXY_TIMEOUT_MS upstream read/response timeout in ms (default 660000). Project registration
//                    builds a per-project Docker image and the request blocks until it finishes,
//                    so this must comfortably exceed app.docker.build-timeout-seconds (default 600s).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, 'dist');

const PORT = Number(process.env.PORT || 80);
const API_UPSTREAM = process.env.API_UPSTREAM || 'http://host.docker.internal:8080';
const PROXY_TIMEOUT = Number(process.env.PROXY_TIMEOUT_MS || 660000);

const app = express();
app.disable('x-powered-by');

// Container healthcheck — must not be proxied or rewritten.
app.get('/healthz', (_req, res) => {
  res.type('text/plain').send('ok\n');
});

// Reverse proxy for the backend. pathFilter keeps the full /api/** path (no rewrite) so the
// backend's /api/v1 context path resolves, and ws:true upgrades the job-stream WebSocket.
const apiProxy = createProxyMiddleware({
  target: API_UPSTREAM,
  changeOrigin: true,
  ws: true,
  xfwd: true,
  pathFilter: '/api',
  proxyTimeout: PROXY_TIMEOUT,
  timeout: PROXY_TIMEOUT,
  on: {
    error: (err, _req, res) => {
      // Mirror nginx's 502 when the upstream backend is unreachable.
      if (res && 'writeHead' in res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Bad Gateway: backend unreachable (${API_UPSTREAM})\n`);
      } else if (res && 'destroy' in res) {
        res.destroy(err);
      }
    },
  },
});
app.use(apiProxy);

// Static assets (hashed filenames are safe to cache; index.html is served via the fallback below
// with no-store so a new deploy is picked up immediately).
app.use(express.static(DIST, { index: false }));

// SPA fallback — every non-/api, non-asset route renders the app shell.
app.use((_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(DIST, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`frontend listening on :${PORT} — proxying /api -> ${API_UPSTREAM}`);
});

// WebSocket upgrades (e.g. /api/v1/ws/jobs/:jobId) are not handled by the express middleware
// chain; forward them to the proxy explicitly.
server.on('upgrade', apiProxy.upgrade);
