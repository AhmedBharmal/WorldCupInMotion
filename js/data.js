/**
 * data.js — WorldCupInMotion Live Data Layer
 *
 * Single source of truth. Every hub panel, nation drawer, ticker,
 * globe stats bar, and leaderboard reads from LIVE_DATA.
 *
 * Sources:
 *   Primary  → football-data.org free tier via /api/fd Vercel proxy
 *   Fallback → pre-tournament static snapshot (clearly labelled)
 *
 * Refresh strategy:
 *   • On load: fetch all endpoints in parallel
 *   • During live matches: refresh every 45s
 *   • No live matches: refresh every 5min
 *   • Each fetch is independently resilient — one failure doesn't
 *     block the others
 *
 * football-data.org competition IDs:
 *   FIFA World Cup 2026 → 2000  (verified, same ID used for WC2022)
 */

// ── CONSTANTS ─────────────────────────────────────────────────
const FD_COMP    = 2000;   // FIFA World Cup
const PROXY      = '/api/fd';
const TIMEOUT_MS = 8000;

// How long ago was data fetched (for freshness badges)
let _lastFetchAt = null;

// ── NORMALIZED LIVE DATA STORE ────────────────────────────────
// Everything reads from here. Never mutate directly — use update fns below.
const LIVE_DATA = {
  // true = at least one endpoint responded with real data this session
  isLive: false,

  // ISO timestamp of the most recent successful fetch
  fetchedAt: null,

  // Matches — all tournament matches from API
  // shape: { id, homeTeam, awayTeam, score, status, utcDate, group, venue, minute, events }
  matches: [],

  // Group standings — all 12 groups
  // shape: { [groupLetter]: [ {team, mp, w, d, l, gf, ga, gd, pts, form}, ... ] }
  standings: {},

  // Top scorers
  // shape: [ {rank, player, team, goals, assists, isoCode}, ... ]
  scorers: [],

  // Team squads keyed by ISO3 code (loaded on demand when nation panel opens)
  // shape: { [ISO3]: { coach, squad: [{name, position, age, club, number}] } }
  squads: {},

  // Derived totals (computed after each fetch)
  totalGoals:  0,
  topScorer:   '—',
  topScorerGoals: 0,
  matchday:    'Pre-tournament',
};

// ── HELPER: proxy fetch with timeout ─────────────────────────
async function fdFetch(fdPath, params = {}) {
  const qs     = new URLSearchParams({ path: fdPath, ...params });
  const url    = `${PROXY}?${qs}`;
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`FD ${res.status}: ${text.slice(0, 120)}`);
  }
  return res.json();
}

// ── FRESHNESS LABEL ───────────────────────────────────────────
export function dataFreshnessLabel() {
  if (!LIVE_DATA.fetchedAt) return 'Pre-tournament data';
  const secs = Math.round((Date.now() - new Date(LIVE_DATA.fetchedAt)) / 1000);
  if (secs < 90)  return `Updated just now`;
  if (secs < 300) return `Updated ${Math.round(secs / 60)}m ago`;
  return `Updated ${new Date(LIVE_DATA.fetchedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
}

// ── MATCHES FETCH ─────────────────────────────────────────────
async function fetchMatches() {
  const data = await fdFetch(`/v4/competitions/${FD_COMP}/matches`);
  const raw  = data.matches || [];

  LIVE_DATA.matches = raw.map(m => ({
    id:       m.id,
    status:   m.status,           // SCHEDULED | IN_PLAY | PAUSED | FINISHED | POSTPONED
    minute:   m.minute ?? null,
    utcDate:  m.utcDate,
    group:    (m.group || '').replace('GROUP_', ''),
    stage:    m.stage || '',
    venue:    m.venue || '',
    homeTeam: {
      id:     m.homeTeam?.id,
      name:   m.homeTeam?.shortName || m.homeTeam?.name || '?',
      tla:    m.homeTeam?.tla || '',
      crest:  m.homeTeam?.crest || '',
    },
    awayTeam: {
      id:     m.awayTeam?.id,
      name:   m.awayTeam?.shortName || m.awayTeam?.name || '?',
      tla:    m.awayTeam?.tla || '',
      crest:  m.awayTeam?.crest || '',
    },
    score: {
      home: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      away: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
    },
  }));

  // Compute matchday
  const live = LIVE_DATA.matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const recent = LIVE_DATA.matches.filter(m => m.status === 'FINISHED');
  if (live.length > 0) {
    LIVE_DATA.matchday = `Live · ${live.length} match${live.length > 1 ? 'es' : ''}`;
  } else if (recent.length > 0) {
    LIVE_DATA.matchday = `Matchday ${data.resultSet?.matchday || '—'}`;
  } else {
    LIVE_DATA.matchday = 'Pre-tournament';
  }
}

// ── STANDINGS FETCH ───────────────────────────────────────────
async function fetchStandings() {
  const data = await fdFetch(`/v4/competitions/${FD_COMP}/standings`);
  const groups = {};

  (data.standings || []).forEach(s => {
    if (s.type !== 'TOTAL') return;
    const letter = (s.group || '').replace('GROUP_', '') || s.stage || '?';
    groups[letter] = (s.table || []).map(row => ({
      pos:    row.position,
      team:   row.team?.shortName || row.team?.name || '?',
      tla:    row.team?.tla || '',
      crest:  row.team?.crest || '',
      isoId:  row.team?.id,
      mp:     row.playedGames ?? 0,
      w:      row.won         ?? 0,
      d:      row.draw        ?? 0,
      l:      row.lost        ?? 0,
      gf:     row.goalsFor    ?? 0,
      ga:     row.goalsAgainst?? 0,
      gd:     row.goalDifference ?? 0,
      pts:    row.points      ?? 0,
      form:   row.form        || '',
    }));
  });

  LIVE_DATA.standings = groups;
}

// ── SCORERS FETCH ─────────────────────────────────────────────
async function fetchScorers() {
  const data = await fdFetch(`/v4/competitions/${FD_COMP}/scorers`, { limit: 20 });
  const raw  = data.scorers || [];

  LIVE_DATA.scorers = raw.map((s, i) => ({
    rank:     i + 1,
    player:   s.player?.name    || '?',
    short:    s.player?.shortName || s.player?.name || '?',
    team:     s.team?.shortName || s.team?.name || '?',
    teamId:   s.team?.id,
    goals:    s.goals          ?? s.numberOfGoals ?? 0,
    assists:  s.assists        ?? 0,
    penalties:s.penalties      ?? 0,
  }));

  // Derive totals
  LIVE_DATA.totalGoals      = LIVE_DATA.scorers.reduce((sum, s) => sum + s.goals, 0);
  LIVE_DATA.topScorer       = LIVE_DATA.scorers[0]?.short || '—';
  LIVE_DATA.topScorerGoals  = LIVE_DATA.scorers[0]?.goals || 0;
}

// ── SQUAD FETCH (on demand) ───────────────────────────────────
// Called when a nation panel opens. FD team IDs are stored during standings fetch.
// We map our ISO3 → FD team ID via the standings data.
const FD_TEAM_ID_BY_ISO3 = {
  // Pre-populated fallback map (from WC2022 lineup, likely same for 2026)
  ARG:759, BRA:1606, FRA:773, ESP:760, DEU:759, ENG:66, PRT:765,
  NLD:1920, BEL:1396, URY:788, MEX:758, USA:762, CAN:7578, MAR:1938,
  JPN:1777, KOR:2612, SEN:825, GHA:1700, CMR:1081, ECU:1773, QAT:172,
  AUS:737, NOR:1631, CHE:1646, CRO:799, DEF:799,
  // More will be resolved live from standings response
};

export async function fetchSquad(iso3) {
  if (LIVE_DATA.squads[iso3]) return LIVE_DATA.squads[iso3]; // cached

  const teamId = FD_TEAM_ID_BY_ISO3[iso3];
  if (!teamId) return null;

  try {
    const data = await fdFetch(`/v4/teams/${teamId}`);
    const squad = (data.squad || []).map(p => ({
      name:     p.name        || '?',
      short:    p.shortName   || p.name || '?',
      position: p.position    || '?',
      number:   p.shirtNumber ?? null,
      age:      p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (365.25 * 86400000)) : null,
      club:     p.currentTeam?.shortName || p.currentTeam?.name || '',
      nationality: p.nationality || '',
    }));

    const result = {
      coach:   data.coach?.name || null,
      coachAge: data.coach?.dateOfBirth
        ? Math.floor((Date.now() - new Date(data.coach.dateOfBirth)) / (365.25 * 86400000))
        : null,
      founded: data.founded || null,
      crest:   data.crest   || null,
      squad,
    };

    LIVE_DATA.squads[iso3] = result;
    return result;
  } catch (err) {
    console.warn(`[WCIM] Squad fetch failed for ${iso3}:`, err.message);
    return null;
  }
}

// ── MAIN REFRESH CYCLE ────────────────────────────────────────
let _refreshTimer = null;

export async function refreshAll() {
  const results = await Promise.allSettled([
    fetchMatches(),
    fetchStandings(),
    fetchScorers(),
  ]);

  const anyOk = results.some(r => r.status === 'fulfilled');
  if (anyOk) {
    LIVE_DATA.isLive   = true;
    LIVE_DATA.fetchedAt = new Date().toISOString();
    _lastFetchAt = Date.now();
  }

  // Log what failed (silently — don't break the UI)
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const labels = ['matches', 'standings', 'scorers'];
      console.info(`[WCIM] ${labels[i]} fetch failed — using fallback:`, r.reason?.message);
    }
  });

  // Notify all registered listeners
  _listeners.forEach(fn => fn(LIVE_DATA));

  // Schedule next refresh
  scheduleNext();
  return LIVE_DATA;
}

function scheduleNext() {
  clearTimeout(_refreshTimer);
  const hasLive = LIVE_DATA.matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const delay   = hasLive ? 45_000 : 300_000; // 45s or 5min
  _refreshTimer = setTimeout(refreshAll, delay);
}

// ── LISTENER REGISTRY ─────────────────────────────────────────
// Components subscribe to data changes: onData(fn) → unsubscribe fn
const _listeners = new Set();

export function onData(fn) {
  _listeners.add(fn);
  // Fire immediately if we already have data
  if (LIVE_DATA.fetchedAt) fn(LIVE_DATA);
  return () => _listeners.delete(fn);
}

// ── ACCESSORS — used by render functions in app.js ────────────

export function getLiveMatches() {
  return LIVE_DATA.matches.filter(
    m => m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED'
  );
}

export function getScheduledMatches() {
  return LIVE_DATA.matches
    .filter(m => m.status === 'SCHEDULED')
    .slice(0, 12);
}

export function getAllGroups() {
  return LIVE_DATA.standings;
}

export function getGroupForTeam(iso3) {
  // Find which group letter has this team (by matching name from WC_NATIONS)
  for (const [letter, rows] of Object.entries(LIVE_DATA.standings)) {
    if (rows.some(r => r.tla && iso3.toLowerCase().includes(r.tla.toLowerCase()))) {
      return { letter, rows };
    }
  }
  return null;
}

export function getMatchesForTeam(iso3) {
  // Match by homeTeam.tla or awayTeam.tla — best we can do without a server-side join
  const nation = window.WC_NATIONS_MAP?.[iso3];
  if (!nation) return [];
  const nameLower = nation.name.toLowerCase();
  return LIVE_DATA.matches.filter(m =>
    m.homeTeam.name.toLowerCase().includes(nameLower) ||
    m.awayTeam.name.toLowerCase().includes(nameLower) ||
    m.homeTeam.tla.toLowerCase() === iso3.slice(0,3).toLowerCase() ||
    m.awayTeam.tla.toLowerCase() === iso3.slice(0,3).toLowerCase()
  );
}

export function getTopScorers(limit = 10) {
  return LIVE_DATA.scorers.slice(0, limit);
}

export function getGlobeStats() {
  return {
    goals:      LIVE_DATA.totalGoals,
    topScorer:  LIVE_DATA.topScorer,
    topGoals:   LIVE_DATA.topScorerGoals,
    matchday:   LIVE_DATA.matchday,
    isLive:     LIVE_DATA.isLive,
    fetchedAt:  LIVE_DATA.fetchedAt,
  };
}

// ── TICKER TEXT BUILDER ───────────────────────────────────────
export function buildTickerItems(wcNations) {
  const isoMap = Object.fromEntries((wcNations || []).map(n => [n.name.toLowerCase(), n]));

  function flag(teamName) {
    const n = isoMap[teamName.toLowerCase()] || Object.values(isoMap).find(n =>
      teamName.toLowerCase().includes(n.name.split(' ')[0].toLowerCase())
    );
    return n ? n.flag : '';
  }

  function scoreText(m) {
    if (m.status === 'SCHEDULED') {
      const d = new Date(m.utcDate);
      return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }) +
             ' ' + d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    }
    const h = m.score.home ?? '?';
    const a = m.score.away ?? '?';
    return `${h}–${a}`;
  }

  const items = LIVE_DATA.matches.slice(0, 20).map(m => {
    const f1    = flag(m.homeTeam.name);
    const f2    = flag(m.awayTeam.name);
    const score = scoreText(m);
    const group = m.group ? ` · Grp ${m.group}` : '';
    if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
      const min = m.minute ? ` ${m.minute}'` : '';
      return `<span class="live">● LIVE${min}</span> ${f1} ${m.homeTeam.name} ${score} ${f2} ${m.awayTeam.name}${group}`;
    }
    if (m.status === 'FINISHED') {
      return `${f1} ${m.homeTeam.name} ${score} ${f2} ${m.awayTeam.name} FT${group}`;
    }
    return `${f1} ${m.homeTeam.name} vs ${f2} ${m.awayTeam.name} · ${score}${group}`;
  });

  if (!items.length) return null; // signal to use static fallback
  return items;
}

// ── SQUAD PANEL RENDERER ──────────────────────────────────────
// Returns HTML string for squad tab — called by renderPanelContent
export function renderSquadHtml(squadData, escFn) {
  if (!squadData) return '<div class="detail-row"><strong>Squad data unavailable</strong><span>Will load from live feed once tournament begins.</span></div>';

  const byPos = { Goalkeeper:[], Defender:[], Midfielder:[], Forward:[] };
  squadData.squad.forEach(p => {
    const pos = p.position?.includes('Goalkeeper') ? 'Goalkeeper'
              : p.position?.includes('Defender')   ? 'Defender'
              : p.position?.includes('Midfielder')  ? 'Midfielder'
              : p.position?.includes('Forward') || p.position?.includes('Offence') ? 'Forward'
              : 'Midfielder';
    (byPos[pos] = byPos[pos] || []).push(p);
  });

  let html = '';
  if (squadData.coach) {
    html += `<div class="detail-row coach-row"><strong>Coach</strong><span>${escFn(squadData.coach)}</span></div>`;
  }

  for (const [pos, players] of Object.entries(byPos)) {
    if (!players.length) continue;
    html += `<div class="squad-pos-label">${escFn(pos)}s</div>`;
    html += players.map(p =>
      `<div class="detail-row squad-player">
        <strong>${escFn(p.short || p.name)}</strong>
        <span>${p.number ? `#${p.number} · ` : ''}${escFn(p.club || '—')}${p.age ? ` · ${p.age}y` : ''}</span>
      </div>`
    ).join('');
  }

  return html || '<div class="detail-row"><strong>Squad loading…</strong></div>';
}

// ── FIXTURES PANEL RENDERER ───────────────────────────────────
export function renderFixturesHtml(matches, escFn) {
  if (!matches.length) {
    return '<div class="detail-row"><strong>Fixtures</strong><span>Schedule not yet available.</span></div>';
  }

  return matches.map(m => {
    const d = new Date(m.utcDate);
    const dateStr = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    const timeStr = m.status === 'SCHEDULED'
      ? d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      : m.status === 'FINISHED' ? 'FT' : m.status === 'IN_PLAY' ? `${m.minute||''}' LIVE` : m.status;
    const scoreStr = (m.score.home !== null && m.score.away !== null)
      ? `${m.score.home}–${m.score.away}`
      : 'vs';

    return `<div class="detail-row fixture-row">
      <strong>${escFn(m.homeTeam.name)} ${scoreStr} ${escFn(m.awayTeam.name)}</strong>
      <span>${escFn(dateStr)} · ${escFn(timeStr)}${m.group ? ` · Grp ${escFn(m.group)}` : ''}</span>
    </div>`;
  }).join('');
}

// ── LIVE MATCHES RENDERER ─────────────────────────────────────
export function renderLiveMatchCards(escFn) {
  const active = LIVE_DATA.matches.filter(
    m => m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED'
  );
  const upcoming = LIVE_DATA.matches
    .filter(m => m.status === 'SCHEDULED')
    .slice(0, 4);

  const toRender = active.length ? active.slice(0, 6) : upcoming;

  if (!toRender.length) {
    return '<div class="hub-empty"><span>No matches to show yet.</span><p>The schedule will appear here once released.</p></div>';
  }

  return toRender.map(m => {
    const isLive    = m.status === 'IN_PLAY' || m.status === 'PAUSED';
    const isFinished= m.status === 'FINISHED';
    const h = m.score.home ?? '—';
    const a = m.score.away ?? '—';
    const d = new Date(m.utcDate);
    const kickoff = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const dateStr = d.toLocaleDateString('en-US', { month:'short', day:'numeric' });

    const statusBadge = isLive
      ? `<span class="match-live-badge">● ${m.minute ? m.minute + "'" : 'LIVE'}</span>`
      : isFinished
      ? `<span class="match-ft-badge">FT</span>`
      : `<span class="match-sched-badge">${escFn(dateStr)} ${escFn(kickoff)}</span>`;

    const scoreDisplay = (isLive || isFinished)
      ? `<strong class="match-score">${h}–${a}</strong>`
      : `<strong class="match-score-pending">vs</strong>`;

    return `<article class="match-card">
      <div class="match-meta">${statusBadge} ${m.group ? `Group ${escFn(m.group)}` : ''} ${m.venue ? '· ' + escFn(m.venue) : ''}</div>
      <div class="match-row">
        <span class="match-team">${escFn(m.homeTeam.name)}</span>
        ${scoreDisplay}
        <span class="match-team">${escFn(m.awayTeam.name)}</span>
      </div>
    </article>`;
  }).join('');
}

// ── GROUP TABLES RENDERER ─────────────────────────────────────
export function renderGroupTablesHtml(escFn) {
  const groups = LIVE_DATA.standings;
  if (!Object.keys(groups).length) {
    return '<div class="hub-empty"><span>Group tables loading…</span><p>Standings will appear once matches begin.</p></div>';
  }

  return `<div class="hub-grid">${Object.entries(groups).sort().map(([letter, rows]) => `
    <article class="group-card">
      <h3>Group ${escFn(letter)}</h3>
      <table class="group-table">
        <thead><tr><th scope="col">Team</th><th scope="col">MP</th><th scope="col">W</th><th scope="col">D</th><th scope="col">L</th><th scope="col">GD</th><th scope="col">Pts</th></tr></thead>
        <tbody>${rows.map((r, i) => `
          <tr class="${i < 2 ? 'qualifying' : ''}">
            <td>${escFn(r.team)}</td>
            <td>${r.mp}</td>
            <td>${r.w}</td>
            <td>${r.d}</td>
            <td>${r.l}</td>
            <td>${r.gd >= 0 ? '+' : ''}${r.gd}</td>
            <td><strong>${r.pts}</strong></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </article>`).join('')}</div>`;
}

// ── SCORERS LEADERBOARD RENDERER ──────────────────────────────
export function renderScorersHtml(tab = 'goals', escFn) {
  const scorers = LIVE_DATA.scorers;
  if (!scorers.length) {
    return '<div class="lb-empty">Scorer data will appear once matches kick off.</div>';
  }

  const sorted = [...scorers].sort((a, b) => {
    if (tab === 'assists')  return b.assists   - a.assists;
    if (tab === 'penalties')return b.penalties - a.penalties;
    return b.goals - a.goals;
  });

  const rankClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
  const val = p => tab === 'assists' ? p.assists : tab === 'penalties' ? p.penalties : p.goals;

  return sorted.slice(0, 8).map((p, i) =>
    `<div class="lb-row">
      <div class="lb-rank ${rankClass(i)}">${i + 1}</div>
      <div class="lb-avatar">${escFn((p.short||p.player).split(' ').map(w=>w[0]).join('').slice(0,2))}</div>
      <div class="lb-info">
        <span class="lb-name">${escFn(p.short || p.player)}</span>
        <span class="lb-country">${escFn(p.team)}</span>
      </div>
      <div class="lb-value">${val(p)}</div>
    </div>`
  ).join('');
}

// ── GLOBE STATS UPDATER ───────────────────────────────────────
export function updateGlobeStatElements() {
  const stats     = getGlobeStats();
  const goalEl    = document.getElementById('goal-count');
  const scorerEl  = document.getElementById('top-scorer');
  const daysEl    = document.getElementById('tournament-days');

  if (goalEl)   goalEl.textContent   = stats.isLive ? stats.goals    : '0';
  if (scorerEl) scorerEl.textContent = stats.isLive ? stats.topScorer: '—';
  if (daysEl) {
    const start = new Date('2026-06-11T00:00:00');
    const end   = new Date('2026-07-19T23:59:59');
    const now   = new Date();
    if (now < start) {
      const days = Math.ceil((start - now) / 86400000);
      daysEl.textContent = days === 1 ? '1d to kickoff' : `${days}d to kickoff`;
      daysEl.style.color = '';
    } else if (now <= end) {
      daysEl.textContent = stats.matchday;
      daysEl.style.color = 'var(--green-text)';
    } else {
      daysEl.textContent = 'Champions crowned';
      daysEl.style.color = 'var(--gold-text)';
    }
  }

  // Update label freshness
  const goalLabel  = goalEl?.closest('.globe-stat')?.querySelector('.label');
  const scorerLabel= scorerEl?.closest('.globe-stat')?.querySelector('.label');
  if (goalLabel)   goalLabel.textContent  = stats.isLive ? 'Tournament goals'  : 'Goals (pre-tournament)';
  if (scorerLabel) scorerLabel.textContent= stats.isLive ? 'Top scorer'         : 'Top scorer (projected)';
}

// ── TICKER UPDATER ────────────────────────────────────────────
export function updateTicker(wcNations) {
  const el = document.getElementById('match-ticker');
  if (!el) return;

  const items = buildTickerItems(wcNations);
  if (!items || !items.length) return; // keep static fallback

  const track = items.join(' &nbsp;·&nbsp; ') + ' &nbsp;·&nbsp; ' + items.join(' &nbsp;·&nbsp; ');
  el.innerHTML = track;
}

// Expose read-only snapshot for debugging in the browser console
window.__WCIM_DATA = () => ({ ...LIVE_DATA });