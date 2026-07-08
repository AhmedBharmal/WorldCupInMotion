const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = __dirname;
const port = Number(process.env.PORT || 8123);
const host = '127.0.0.1';
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

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function proxyFootballData(url, res) {
  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.FD_API_TOKEN;
  const fdPath = url.searchParams.get('path');

  if (!token) {
    sendJson(res, 501, { error: 'Missing FOOTBALL_DATA_TOKEN' });
    return;
  }
  if (!fdPath || !fdPath.startsWith('/v4/')) {
    sendJson(res, 400, { error: 'Invalid football-data path' });
    return;
  }

  url.searchParams.delete('path');
  const query = url.searchParams.toString();
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
      res.writeHead(upstreamRes.statusCode || 502, {
        'Content-Type': upstreamRes.headers['content-type'] || 'application/json; charset=utf-8',
        'Cache-Control': upstreamRes.statusCode === 200 ? 'no-store' : 'no-store'
      });
      res.end(Buffer.concat(chunks));
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
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log(`WorldCupInMotion server running at http://${host}:${port}`);
});
