const API_BASE = 'https://api.football-data.org';
const TOKEN = process.env.FOOTBALL_DATA_TOKEN || process.env.FD_API_TOKEN;
const COMPETITION_ID = '2000';
const ALLOWED_PATHS = new Set([
  `/v4/competitions/${COMPETITION_ID}/matches`,
  `/v4/competitions/${COMPETITION_ID}/standings`,
  `/v4/competitions/${COMPETITION_ID}/scorers`,
  `/v4/competitions/${COMPETITION_ID}/teams`
]);
const ALLOWED_PARAMS = new Set(['limit', 'dateFrom', 'dateTo', 'status', 'stage', 'matchday']);
const ALLOWED_STATUS = new Set(['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELLED']);

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex');
}

function sendJson(res, status, body) {
  setSecurityHeaders(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', status >= 400 ? 'no-store' : 's-maxage=30, stale-while-revalidate=300');
  res.end(JSON.stringify(body));
}

function safeQueryParams(params) {
  const clean = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    if (!ALLOWED_PARAMS.has(key)) continue;
    if (key === 'limit') {
      const limit = Number.parseInt(value, 10);
      if (Number.isFinite(limit) && limit > 0) clean.set(key, String(Math.min(limit, 100)));
      continue;
    }
    if ((key === 'dateFrom' || key === 'dateTo') && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      clean.set(key, value);
      continue;
    }
    if (key === 'status' && ALLOWED_STATUS.has(value)) {
      clean.set(key, value);
      continue;
    }
    if ((key === 'stage' || key === 'matchday') && /^[A-Z0-9_ -]{1,32}$/i.test(value)) {
      clean.set(key, value);
    }
  }
  return clean;
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  const url = new URL(req.url, 'http://localhost');
  const fdPath = url.searchParams.get('path');
  if (!fdPath || !ALLOWED_PATHS.has(fdPath)) {
    sendJson(res, 400, { error: 'Invalid football-data path' });
    return;
  }
  if (!TOKEN) {
    sendJson(res, 501, { error: 'Live feed is not configured' });
    return;
  }

  url.searchParams.delete('path');
  const safeParams = safeQueryParams(url.searchParams);
  const upstreamUrl = `${API_BASE}${fdPath}${safeParams.toString() ? `?${safeParams}` : ''}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'X-Auth-Token': TOKEN,
        'Accept': 'application/json'
      }
    });
    const text = await upstream.text();
    setSecurityHeaders(res);
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', upstream.ok ? 's-maxage=30, stale-while-revalidate=300' : 'no-store');
    res.end(upstream.ok ? text : JSON.stringify({ error: 'Live feed unavailable' }));
  } catch (error) {
    sendJson(res, 502, { error: 'football-data request failed' });
  }
};
