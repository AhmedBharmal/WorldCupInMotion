const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = __dirname;
const port = Number(process.env.PORT || 8123);
const host = '127.0.0.1';
const competitionId = '2000';
const allowedFootballDataPaths = new Set([
  `/v4/competitions/${competitionId}/matches`,
  `/v4/competitions/${competitionId}/standings`,
  `/v4/competitions/${competitionId}/scorers`,
  `/v4/competitions/${competitionId}/teams`
]);
const allowedFootballDataParams = new Set(['limit', 'dateFrom', 'dateTo', 'status', 'stage', 'matchday']);
const allowedStatuses = new Set(['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELLED']);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    ...extra
  };
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    ...securityHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    })
  });
  res.end(JSON.stringify(body));
}

function safeFootballDataQuery(params) {
  const clean = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    if (!allowedFootballDataParams.has(key)) continue;
    if (key === 'limit') {
      const limit = Number.parseInt(value, 10);
      if (Number.isFinite(limit) && limit > 0) clean.set(key, String(Math.min(limit, 100)));
      continue;
    }
    if ((key === 'dateFrom' || key === 'dateTo') && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      clean.set(key, value);
      continue;
    }
    if (key === 'status' && allowedStatuses.has(value)) {
      clean.set(key, value);
      continue;
    }
    if ((key === 'stage' || key === 'matchday') && /^[A-Z0-9_ -]{1,32}$/i.test(value)) {
      clean.set(key, value);
    }
  }
  return clean;
}

function proxyFootballData(url, res) {
  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.FD_API_TOKEN;
  const fdPath = url.searchParams.get('path');

  if (!fdPath || !allowedFootballDataPaths.has(fdPath)) {
    sendJson(res, 400, { error: 'Invalid football-data path' });
    return;
  }
  if (!token) {
    sendJson(res, 501, { error: 'Live feed is not configured' });
    return;
  }

  url.searchParams.delete('path');
  const query = safeFootballDataQuery(url.searchParams).toString();
  const upstreamPath = `${fdPath}${query ? `?${query}` : ''}`;
  const upstream = https.request({
    hostname: 'api.football-data.org',
    path: upstreamPath,
    method: 'GET',
    headers: {
      'X-Auth-Token': token,
      'Accept': 'application/json'
    }
  }, upstreamRes => {
    const chunks = [];
    upstreamRes.on('data', chunk => chunks.push(chunk));
    upstreamRes.on('end', () => {
      const ok = upstreamRes.statusCode >= 200 && upstreamRes.statusCode < 300;
      res.writeHead(upstreamRes.statusCode || 502, securityHeaders({
        'Content-Type': upstreamRes.headers['content-type'] || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }));
      res.end(ok ? Buffer.concat(chunks) : JSON.stringify({ error: 'Live feed unavailable' }));
    });
  });

  upstream.setTimeout(8000, () => upstream.destroy(new Error('football-data timeout')));
  upstream.on('error', () => {
    sendJson(res, 502, { error: 'football-data request failed' });
  });
  upstream.end();
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/api/fd') {
    proxyFootballData(url, res);
    return;
  }
  if (pathname === '/') pathname = '/wc26_full_optimized.html';

  const file = path.resolve(root, pathname.replace(/^\/+/, ''));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      ...securityHeaders({
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      })
    });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log(`WorldCupInMotion server running at http://${host}:${port}`);
});
