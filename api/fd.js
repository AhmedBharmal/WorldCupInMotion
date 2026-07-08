const API_BASE = 'https://api.football-data.org';
const TOKEN = process.env.FOOTBALL_DATA_TOKEN || process.env.FD_API_TOKEN;

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (!TOKEN) {
    sendJson(res, 501, { error: 'Missing FOOTBALL_DATA_TOKEN' });
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const fdPath = url.searchParams.get('path');
  if (!fdPath || !fdPath.startsWith('/v4/')) {
    sendJson(res, 400, { error: 'Invalid football-data path' });
    return;
  }

  url.searchParams.delete('path');
  const upstreamUrl = `${API_BASE}${fdPath}${url.searchParams.toString() ? `?${url.searchParams}` : ''}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'X-Auth-Token': TOKEN,
        'Accept': 'application/json'
      }
    });
    const text = await upstream.text();
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', upstream.ok ? 's-maxage=30, stale-while-revalidate=300' : 'no-store');
    res.end(text);
  } catch (error) {
    sendJson(res, 502, { error: 'football-data request failed' });
  }
};
