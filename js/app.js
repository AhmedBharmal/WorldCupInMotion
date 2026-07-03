const EDITIONS = [
  {year:'1930',country:'Uruguay'},
  {year:'1934',country:'Italy'},
  {year:'1938',country:'France'},
  {year:'1950',country:'Brazil'},
  {year:'1954',country:'Switzerland'},
  {year:'1958',country:'Sweden'},
  {year:'1962',country:'Chile'},
  {year:'1966',country:'England'},
  {year:'1970',country:'Mexico'},
  {year:'1974',country:'West Germany'},
  {year:'1978',country:'Argentina'},
  {year:'1982',country:'Spain'},
  {year:'1986',country:'Mexico'},
  {year:'1990',country:'Italy'},
  {year:'1994',country:'USA'},
  {year:'1998',country:'France'},
  {year:'2002',country:'Korea & Japan'},
  {year:'2006',country:'Germany'},
  {year:'2010',country:'South Africa'},
  {year:'2014',country:'Brazil'},
  {year:'2018',country:'Russia'},
  {year:'2022',country:'Qatar'},
  {year:'2026',country:'Canada · Mexico · USA',isLast:true}
];

const FRAME_MS=300, LAST_MS=2400;
let zoomGlobe = () => {};
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Cursor
const cur=document.getElementById('cur');
const curRing=document.getElementById('cur-ring');
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let ringX=0, ringY=0, mouseX=0, mouseY=0;
  document.addEventListener('mousemove',e=>{
    mouseX=e.clientX; mouseY=e.clientY;
    cur.style.left=mouseX+'px'; cur.style.top=mouseY+'px';
  });
  (function animRing(){
    ringX+=(mouseX-ringX)*.18; ringY+=(mouseY-ringY)*.18;
    curRing.style.left=ringX+'px'; curRing.style.top=ringY+'px';
    requestAnimationFrame(animRing);
  })();
}

const yrEl    = document.getElementById('yr');
const ctryEl  = document.getElementById('country');
const progEl  = document.getElementById('prog');
const countEl = document.getElementById('count');
const stageEl = document.getElementById('stage');
const globeWrap = document.getElementById('globe-wrap');
const skipBtn = document.getElementById('skip-btn');
let tid = null;

// ── SEQUENCE ──────────────────────────────────────────────────
function showFrame(i) {
  if (i >= EDITIONS.length) { beginReveal(); return; }
  const ed  = EDITIONS[i];
  const pct = ((i+1)/EDITIONS.length*100).toFixed(1)+'%';

  yrEl.textContent    = ed.year;
  ctryEl.textContent  = ed.country;
  progEl.style.width  = pct;
  countEl.textContent = String(i+1).padStart(2,'0')+' / '+EDITIONS.length;

  if (ed.isLast) {
    yrEl.style.fontSize   = 'clamp(130px,27vw,370px)';
    yrEl.style.color      = '#1a1005';
    ctryEl.style.letterSpacing = '0.65em';
  } else {
    yrEl.style.fontSize   = '';
    yrEl.style.color      = '#1e1308';
    ctryEl.style.letterSpacing = '0.58em';
  }

  tid = setTimeout(()=>showFrame(i+1), ed.isLast ? LAST_MS : FRAME_MS);
}

// ── SKIP ──────────────────────────────────────────────────────
function skip() {
  clearTimeout(tid);
  document.getElementById('skip-btn').style.display='none';
  const last = EDITIONS[EDITIONS.length-1];
  yrEl.textContent   = last.year;
  ctryEl.textContent = last.country;
  yrEl.style.fontSize = 'clamp(130px,27vw,370px)';
  yrEl.style.color   = '#1a1005';
  progEl.style.width = '100%';
  countEl.textContent = '23 / 23';
  setTimeout(beginReveal, 800);
}

// ── REVEAL ────────────────────────────────────────────────────
function beginReveal() {
  stageEl.style.transition  = 'opacity .45s ease';
  stageEl.style.opacity     = '0';
  countEl.style.transition  = 'opacity .3s';
  countEl.style.opacity     = '0';
  document.getElementById('skip-btn').style.opacity = '0';

  setTimeout(()=>{
    stageEl.style.display='none';
    const rev = document.getElementById('reveal');
    rev.style.opacity='1'; rev.style.pointerEvents='all';
    globeWrap.style.clipPath = 'circle(0% at 50% 50%)';
    animateTitle();
  }, 460);
}

function animateTitle() {
  const titleEl = document.getElementById('rv-title');
  const lineEl  = document.getElementById('rv-line');
  const subEl   = document.getElementById('rv-sub');
  const eyeEl   = document.getElementById('rv-eyebrow');
  const hintEl  = document.getElementById('scroll-hint');

  setTimeout(()=>{
    eyeEl.style.transition='opacity .6s'; eyeEl.style.opacity='1';
  },100);

  const TEXT = 'WORLD CUP IN MOTION';
  titleEl.innerHTML = [...TEXT].map(ch=>
    ch===' ' ? '<span class="sp"></span>' : `<span class="ch">${ch}</span>`
  ).join('');

  const chars = titleEl.querySelectorAll('.ch');
  chars.forEach((c,i)=>{
    const d=i*38;
    c.style.transition=`opacity .3s ${d}ms ease,transform .45s ${d}ms cubic-bezier(.16,1,.3,1)`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      c.style.opacity='1'; c.style.transform='translateY(0)';
    }));
  });

  const done = chars.length*38;

  setTimeout(()=>{
    lineEl.style.transition='width .8s cubic-bezier(.16,1,.3,1),opacity .4s';
    lineEl.style.width='140px'; lineEl.style.opacity='1';
  }, done+60);

  setTimeout(()=>{
    subEl.style.transition='opacity .7s'; subEl.style.opacity='1';
  }, done+200);

  setTimeout(()=>{
    hintEl.style.transition='opacity .7s'; hintEl.style.opacity='1';
    hintEl.style.pointerEvents='all';
    document.body.style.overflowY='auto';
  }, done+620);
}

// ── SCROLL REVEAL ────────────────────────────────────────────
const revealEl  = document.getElementById('reveal');
const globeUi   = document.getElementById('globe-ui');
const globeHint = document.getElementById('globe-hint');
const globeZoom = document.getElementById('globe-zoom');
const statsScene = document.getElementById('stats-scene');
const decorEls  = ['trophy-sharp','trophy-halo','glass','orb1','orb2','glass-sweep']
  .map(id => document.getElementById(id))
  .filter(Boolean);

let revealLocked = false;

function isAtScrollBottom() {
  const doc = document.documentElement;
  return window.scrollY + window.innerHeight >= doc.scrollHeight - 2; // 2px tolerance
}

function updateScrollReveal(scrollY = window.scrollY) {
  const rawProgress = Math.min(scrollY / window.innerHeight, 1);
  if (rawProgress >= 0.98) revealLocked = true;
  const progress = revealLocked ? 1 : rawProgress;
  const statsProgress = Math.max(0, Math.min((scrollY - window.innerHeight * 1.18) / (window.innerHeight * 1.18), 1));
  const statsEnter = Math.max(0, Math.min(statsProgress * 1.2, 1));

  const radius   = progress * 200;
  globeWrap.style.clipPath   = `circle(${radius}% at 50% 50%)`;
  globeWrap.style.transition = 'none';
  globeWrap.style.opacity    = String(1 - statsProgress * 0.42);
  globeWrap.style.transform  = `scale(${1 - statsProgress * 0.035}) translateY(${-statsProgress * 10}px)`;
  globeWrap.style.pointerEvents = statsProgress > 0.08 ? 'none' : 'auto';
  revealEl.style.opacity     = String(Math.max(0, 1 - progress * 1.2));
  if (progress >= 0.83) revealEl.style.pointerEvents = 'none';

  if (progress > 0.12) {
    globeUi.style.display = 'flex';
    globeUi.style.opacity = String(Math.min(1, (progress - 0.12) * 2.2) * (1 - statsProgress));
  }
  if (globeZoom) {
    globeZoom.style.opacity = String(1 - Math.min(statsProgress * 2.5, 1));
    globeZoom.style.pointerEvents = statsProgress > 0.04 ? 'none' : 'auto';
  }
  if (progress > 0.35) {
    document.body.classList.add('globe-active');
    globeHint.style.opacity = String(Math.min(1, (progress - 0.35) * 2.5) * (1 - statsProgress));
  }
  decorEls.forEach(el => {
    el.style.opacity = String(Math.max(0, 1 - progress * 1.35));
  });

  if (statsScene) {
    statsScene.style.setProperty('--stats-progress', statsProgress.toFixed(3));
    statsScene.style.setProperty('--stats-enter', statsEnter.toFixed(3));
  }
}

let visualScrollY = window.scrollY;
function animateScrollReveal() {
  visualScrollY += (window.scrollY - visualScrollY) * 0.20;
  if (Math.abs(window.scrollY - visualScrollY) < 0.35) visualScrollY = window.scrollY;
  updateScrollReveal(visualScrollY);
  requestAnimationFrame(animateScrollReveal);
}
requestAnimationFrame(animateScrollReveal);

// ── REVISIT: skip intro if already seen this browser session ──
const INTRO_SEEN_KEY = 'wcim-intro-seen';

function skipToGlobe() {
  // Instantly land in the same end-state beginReveal()/animateTitle() reach,
  // but with no animation and no intro stage flash.
  stageEl.style.display = 'none';
  document.getElementById('skip-btn').style.display = 'none';
  countEl.style.display = 'none';

  const rev = document.getElementById('reveal');
  rev.style.opacity = '0';
  rev.style.pointerEvents = 'none';

  globeWrap.style.clipPath = 'circle(200% at 50% 50%)';
  globeWrap.style.transition = 'none';
  globeWrap.style.opacity = '1';
  globeWrap.style.transform = 'none';
  globeWrap.style.pointerEvents = 'auto';

  document.body.classList.add('globe-active');
  document.body.style.overflowY = 'auto';

  globeUi.style.display = 'flex';
  globeUi.style.opacity = '1';
  globeHint.style.opacity = '1';

  decorEls.forEach(el => { el.style.opacity = '0'; });

  revealLocked = true;
  updateScrollReveal();
}

if (sessionStorage.getItem(INTRO_SEEN_KEY)) {
  skipToGlobe();
} else {
  sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  showFrame(0);
}

// ── WC 2026 DATA ─────────────────────────────────────────────
const GROUP_COLORS = {
  A:'#00ff87', B:'#ff5f1f', C:'#c9a84c', D:'#4da6ff',
  E:'#ff3d7f', F:'#a855f7', G:'#14b8a6', H:'#facc15',
  I:'#f472b6', J:'#22d3ee', K:'#fb923c', L:'#84cc16'
};
const WC_NATIONS = [
  {iso:'MEX',name:'Mexico',     flag:'🇲🇽',lat:23.63,lng:-102.55,group:'A'},
  {iso:'ZAF',name:'South Africa',flag:'🇿🇦',lat:-28.48,lng:24.68, group:'A'},
  {iso:'KOR',name:'South Korea',flag:'🇰🇷',lat:35.91,lng:127.77, group:'A'},
  {iso:'CZE',name:'Czech Republic',flag:'🇨🇿',lat:49.82,lng:15.47,group:'A'},
  {iso:'CAN',name:'Canada',     flag:'🇨🇦',lat:56.13,lng:-106.35,group:'B'},
  {iso:'BIH',name:'Bosnia',     flag:'🇧🇦',lat:43.92,lng:17.68, group:'B'},
  {iso:'QAT',name:'Qatar',      flag:'🇶🇦',lat:25.35,lng:51.18, group:'B'},
  {iso:'CHE',name:'Switzerland',flag:'🇨🇭',lat:46.82,lng:8.23,  group:'B'},
  {iso:'BRA',name:'Brazil',     flag:'🇧🇷',lat:-14.24,lng:-51.93,group:'C'},
  {iso:'MAR',name:'Morocco',    flag:'🇲🇦',lat:31.79,lng:-7.09, group:'C'},
  {iso:'HTI',name:'Haiti',      flag:'🇭🇹',lat:18.97,lng:-72.29,group:'C'},
  {iso:'GBR',name:'England',    flag:'🇬🇧',lat:52.36,lng:-1.17, group:'L'},
  {iso:'USA',name:'USA',        flag:'🇺🇸',lat:37.09,lng:-95.71, group:'D'},
  {iso:'PRY',name:'Paraguay',   flag:'🇵🇾',lat:-23.44,lng:-58.44,group:'D'},
  {iso:'AUS',name:'Australia',  flag:'🇦🇺',lat:-25.27,lng:133.78,group:'D'},
  {iso:'TUR',name:'Turkey',     flag:'🇹🇷',lat:38.96,lng:35.24, group:'D'},
  {iso:'DEU',name:'Germany',    flag:'🇩🇪',lat:51.17,lng:10.45, group:'E'},
  {iso:'CUW',name:'Curaçao',    flag:'🇨🇼',lat:12.17,lng:-68.99,group:'E'},
  {iso:'CIV',name:'Ivory Coast',flag:'🇨🇮',lat:7.54, lng:-5.55, group:'E'},
  {iso:'ECU',name:'Ecuador',    flag:'🇪🇨',lat:-1.83,lng:-78.18,group:'E'},
  {iso:'NLD',name:'Netherlands',flag:'🇳🇱',lat:52.13,lng:5.29,  group:'F'},
  {iso:'JPN',name:'Japan',      flag:'🇯🇵',lat:36.20,lng:138.25,group:'F'},
  {iso:'SWE',name:'Sweden',     flag:'🇸🇪',lat:60.13,lng:18.64, group:'F'},
  {iso:'TUN',name:'Tunisia',    flag:'🇹🇳',lat:33.89,lng:9.54,  group:'F'},
  {iso:'BEL',name:'Belgium',    flag:'🇧🇪',lat:50.50,lng:4.47,  group:'G'},
  {iso:'EGY',name:'Egypt',      flag:'🇪🇬',lat:26.82,lng:30.80, group:'G'},
  {iso:'IRN',name:'Iran',       flag:'🇮🇷',lat:32.43,lng:53.69, group:'G'},
  {iso:'NZL',name:'New Zealand',flag:'🇳🇿',lat:-40.90,lng:174.89,group:'G'},
  {iso:'ESP',name:'Spain',      flag:'🇪🇸',lat:40.42,lng:-3.70, group:'H'},
  {iso:'CPV',name:'Cape Verde', flag:'🇨🇻',lat:16.00,lng:-24.01,group:'H'},
  {iso:'SAU',name:'Saudi Arabia',flag:'🇸🇦',lat:23.89,lng:45.08,group:'H'},
  {iso:'URY',name:'Uruguay',    flag:'🇺🇾',lat:-34.90,lng:-56.16,group:'H'},
  {iso:'FRA',name:'France',     flag:'🇫🇷',lat:46.23,lng:2.21,  group:'I'},
  {iso:'SEN',name:'Senegal',    flag:'🇸🇳',lat:14.50,lng:-14.45,group:'I'},
  {iso:'IRQ',name:'Iraq',       flag:'🇮🇶',lat:33.22,lng:43.68, group:'I'},
  {iso:'NOR',name:'Norway',     flag:'🇳🇴',lat:60.47,lng:8.47,  group:'I'},
  {iso:'ARG',name:'Argentina',  flag:'🇦🇷',lat:-38.42,lng:-63.62,group:'J'},
  {iso:'DZA',name:'Algeria',    flag:'🇩🇿',lat:28.03,lng:2.60,  group:'J'},
  {iso:'AUT',name:'Austria',    flag:'🇦🇹',lat:47.52,lng:14.55, group:'J'},
  {iso:'JOR',name:'Jordan',     flag:'🇯🇴',lat:30.59,lng:36.24, group:'J'},
  {iso:'PRT',name:'Portugal',   flag:'🇵🇹',lat:39.40,lng:-8.22, group:'K'},
  {iso:'COD',name:'DR Congo',   flag:'🇨🇩',lat:-4.04,lng:21.76, group:'K'},
  {iso:'UZB',name:'Uzbekistan', flag:'🇺🇿',lat:41.38,lng:64.59, group:'K'},
  {iso:'COL',name:'Colombia',   flag:'🇨🇴',lat:4.57, lng:-74.30,group:'K'},
  {iso:'HRV',name:'Croatia',    flag:'🇭🇷',lat:45.10,lng:15.20, group:'L'},
  {iso:'GHA',name:'Ghana',      flag:'🇬🇭',lat:7.95, lng:-1.02, group:'L'},
  {iso:'PAN',name:'Panama',     flag:'🇵🇦',lat:8.54, lng:-80.78, group:'L'},
  {iso:'SCO',name:'Scotland',   flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',lat:56.49,lng:-4.20,  group:'C'}
];
const nationByIso = Object.fromEntries(WC_NATIONS.map(n => [n.iso, n]));

const PLATFORM_PROFILES = {
  ARG: {
    rank: '1', form: 'Elite', model: '18%',
    summary: 'Defending champions with a possession-first identity, lethal transition moments, and the highest pressure every opponent can feel.',
    players: ['Lionel Messi - creator', 'Julian Alvarez - forward press', 'Emiliano Martinez - penalty edge'],
    fixtures: ['Opening path: Group J launch window', 'Key route: Miami atmosphere game', 'Venue watch: Hard Rock Stadium'],
    story: ['3 titles', '2022 champions', 'A last-dance narrative that turns every touch into theatre']
  },
  BRA: {
    rank: '5', form: 'Surge', model: '15%',
    summary: 'Brazil brings the most cinematic attacking brand in world football: rhythm, width, individual chaos, and tournament gravity.',
    players: ['Vinicius Jr. - left-side ignition', 'Rodrygo - central drift', 'Bruno Guimaraes - tempo control'],
    fixtures: ['Opening path: Group C launch window', 'Key route: New York/New Jersey showcase', 'Venue watch: MetLife Stadium'],
    story: ['5 titles', 'Most World Cup wins', 'Every campaign carries the weight of the yellow shirt']
  },
  FRA: {
    rank: '2', form: 'Prime', model: '16%',
    summary: 'France pairs explosive vertical speed with elite depth, making every substitution feel like the next phase of a final boss fight.',
    players: ['Kylian Mbappe - gravity runner', 'Antoine Griezmann - space reader', 'Aurelien Tchouameni - midfield shield'],
    fixtures: ['Opening path: Group I launch window', 'Key route: Dallas night match', 'Venue watch: AT&T Stadium'],
    story: ['2 titles', 'Back-to-back finalist era', 'A modern dynasty trying to keep its crown aura']
  },
  USA: {
    rank: '11', form: 'Host', model: '7%',
    summary: 'The host pulse: young legs, vertical attacks, and stadium energy built to turn every home match into a spectacle.',
    players: ['Christian Pulisic - wide creator', 'Weston McKennie - box runner', 'Tyler Adams - ball winner'],
    fixtures: ['Opening path: Group D launch window', 'Key route: Los Angeles spotlight', 'Venue watch: SoFi Stadium'],
    story: ['Host nation', 'Best finish: 1930 semifinal', 'The tournament becomes a home-field stress test']
  },
  ESP: {
    rank: '3', form: 'Control', model: '12%',
    summary: 'Spain compresses the pitch with patient control, sudden overloads, and a midfield rhythm that makes games feel inevitable.',
    players: ['Pedri - rhythm maker', 'Lamine Yamal - edge threat', 'Rodri - control tower'],
    fixtures: ['Opening path: Group H launch window', 'Key route: Atlanta showcase', 'Venue watch: Mercedes-Benz Stadium'],
    story: ['1 title', '2010 champions', 'A new generation carrying the memory of total control']
  },
  DEU: {
    rank: '9', form: 'Reset', model: '9%',
    summary: 'Germany arrives with tournament memory, structural discipline, and the familiar sense that a run can harden fast.',
    players: ['Jamal Musiala - line breaker', 'Florian Wirtz - creator', 'Joshua Kimmich - organizer'],
    fixtures: ['Opening path: Group E launch window', 'Key route: Houston pressure game', 'Venue watch: NRG Stadium'],
    story: ['4 titles', 'Eight finals', 'A rebuild trying to become a machine again']
  },
  PRT: {
    rank: '6', form: 'Loaded', model: '11%',
    summary: 'Portugal has premium squad density, technical calm, and enough final-third options to change the texture of any match.',
    players: ['Cristiano Ronaldo - box presence', 'Bruno Fernandes - chance engine', 'Rafael Leao - open-field threat'],
    fixtures: ['Opening path: Group K launch window', 'Key route: West Coast travel test', 'Venue watch: Levi\'s Stadium'],
    story: ['Best finish: 1966 third place', 'Euro-era confidence', 'The squad depth now matches the ambition']
  },
  ENG: {
    rank: '4', form: 'Loaded', model: '13%',
    summary: 'England carries elite attacking options, tournament scars, and the tension between control and release.',
    players: ['Harry Kane - reference point', 'Jude Bellingham - power creator', 'Bukayo Saka - right-side threat'],
    fixtures: ['Opening path: Group L launch window', 'Key route: Midwest pressure match', 'Venue watch: Arrowhead Stadium'],
    story: ['1 title', '1966 champions', 'A nation chasing release from history']
  },
  GBR: {
    rank: '4', form: 'Loaded', model: '13%',
    summary: 'England carries elite attacking options, tournament scars, and the tension between control and release.',
    players: ['Harry Kane - reference point', 'Jude Bellingham - power creator', 'Bukayo Saka - right-side threat'],
    fixtures: ['Opening path: Group L launch window', 'Key route: Midwest pressure match', 'Venue watch: Arrowhead Stadium'],
    story: ['1 title', '1966 champions', 'A nation chasing release from history']
  }
};

const HOST_STADIUMS = [
  { name:'Estadio Azteca', city:'Mexico City', capacity:'87,523', matches:'Opening match, group stage', note:'Opening-night mythology' },
  { name:'SoFi Stadium', city:'Los Angeles', capacity:'70,240', matches:'Group stage, knockout path', note:'Host spotlight bowl' },
  { name:'MetLife Stadium', city:'New York/New Jersey', capacity:'82,500', matches:'Knockouts, final path', note:'Final-scale pressure' },
  { name:'BC Place', city:'Vancouver', capacity:'54,500', matches:'Group stage, round of 32', note:'Glass-roof theatre' },
  { name:'AT&T Stadium', city:'Dallas', capacity:'80,000', matches:'Semifinal route, high-pressure nights', note:'Scale and spectacle' },
  { name:'Mercedes-Benz Stadium', city:'Atlanta', capacity:'71,000', matches:'Group stage, knockout showcase', note:'Indoor theatre' }
];

// ═══════════════════════════════════════════════════════════════
// LIVE DATA LAYER — football-data.org via /api/fd Vercel proxy
// Competition: FIFA World Cup 2026 (ID 2000)
// All surfaces read from LIVE_DATA. Falls back to static snapshot.
// ═══════════════════════════════════════════════════════════════

const FD_COMP    = 2000;
const FD_PROXY   = '/api/fd';
const FD_TIMEOUT = 8000;

// Single source of truth
const LIVE_DATA = {
  isLive:      false,   // true once any API call succeeds
  fetchedAt:   null,
  matches:     [],      // normalised match objects
  standings:   {},      // { [groupLetter]: [{pos,team,mp,w,d,l,gf,ga,gd,pts},...] }
  scorers:     [],      // [{rank,player,short,team,goals,assists}]
  squads:      {},      // { [ISO3]: {coach, squad:[{name,short,position,number,age,club}]} }
  totalGoals:  0,
  topScorer:   '—',
  matchday:    'Pre-tournament',
};

// ── proxy fetch helper ────────────────────────────────────────
async function fdFetch(fdPath, params = {}) {
  const qs  = new URLSearchParams({ path: fdPath, ...params });
  const res = await fetch(`${FD_PROXY}?${qs}`, { signal: AbortSignal.timeout(FD_TIMEOUT) });
  if (!res.ok) throw new Error(`FD ${res.status} ${fdPath}`);
  return res.json();
}

// ── normalise a raw football-data match object ────────────────
function normaliseMatch(m) {
  return {
    id:       m.id,
    status:   m.status,   // SCHEDULED|IN_PLAY|PAUSED|FINISHED
    minute:   m.minute ?? null,
    utcDate:  m.utcDate,
    group:    (m.group || '').replace('GROUP_',''),
    stage:    m.stage || '',
    venue:    m.venue || '',
    homeTeam: { id: m.homeTeam?.id, name: m.homeTeam?.shortName || m.homeTeam?.name || '?', tla: m.homeTeam?.tla || '' },
    awayTeam: { id: m.awayTeam?.id, name: m.awayTeam?.shortName || m.awayTeam?.name || '?', tla: m.awayTeam?.tla || '' },
    score:    { home: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
                away: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null },
  };
}

// ── fetch matches ─────────────────────────────────────────────
async function fetchMatches() {
  const data = await fdFetch(`/v4/competitions/${FD_COMP}/matches`);
  LIVE_DATA.matches = (data.matches || []).map(normaliseMatch);

  const live   = LIVE_DATA.matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const recent = LIVE_DATA.matches.filter(m => m.status === 'FINISHED');
  LIVE_DATA.matchday = live.length > 0
    ? `Live · ${live.length} match${live.length > 1 ? 'es' : ''}`
    : recent.length > 0
      ? `Matchday ${data.resultSet?.matchday || '—'}`
      : 'Pre-tournament';
}

// ── fetch standings ───────────────────────────────────────────
async function fetchStandings() {
  const data = await fdFetch(`/v4/competitions/${FD_COMP}/standings`);
  const groups = {};
  (data.standings || []).forEach(s => {
    if (s.type !== 'TOTAL') return;
    const letter = (s.group || s.stage || '').replace('GROUP_','') || '?';
    groups[letter] = (s.table || []).map(r => ({
      pos:  r.position,
      team: r.team?.shortName || r.team?.name || '?',
      tla:  r.team?.tla || '',
      mp:   r.playedGames ?? 0,
      w:    r.won          ?? 0,
      d:    r.draw         ?? 0,
      l:    r.lost         ?? 0,
      gf:   r.goalsFor     ?? 0,
      ga:   r.goalsAgainst ?? 0,
      gd:   r.goalDifference ?? 0,
      pts:  r.points       ?? 0,
    }));
  });
  LIVE_DATA.standings = groups;
}

// ── fetch scorers ─────────────────────────────────────────────
async function fetchScorers() {
  const data = await fdFetch(`/v4/competitions/${FD_COMP}/scorers`, { limit: 20 });
  LIVE_DATA.scorers = (data.scorers || []).map((s, i) => ({
    rank:    i + 1,
    player:  s.player?.name || '?',
    short:   s.player?.shortName || s.player?.name || '?',
    team:    s.team?.shortName   || s.team?.name   || '?',
    goals:   s.goals   ?? s.numberOfGoals ?? 0,
    assists: s.assists  ?? 0,
  }));
  LIVE_DATA.totalGoals = LIVE_DATA.scorers.reduce((t, s) => t + s.goals, 0);
  LIVE_DATA.topScorer  = LIVE_DATA.scorers[0]?.short || '—';
}

// ── fetch squad on demand (when nation panel opens) ───────────
// football-data.org team IDs for WC2026 squads
const FD_TEAM_IDS = {
  ARG:762,  BRA:1630, FRA:773,  DEU:759,  ESP:760,  PRT:765,  NLD:1920,
  BEL:1396, ENG:66,   URY:788,  MEX:758,  USA:762,  CAN:7578, MAR:1938,
  JPN:1777, KOR:2612, SEN:825,  GHA:1700, ECU:1773, QAT:172,  AUS:737,
  NOR:1631, CHE:1646, HRV:799,  TUR:1572, IRN:2000, EGY:60,
};

async function fetchSquad(iso3) {
  if (LIVE_DATA.squads[iso3]) return LIVE_DATA.squads[iso3];
  const teamId = FD_TEAM_IDS[iso3];
  if (!teamId) return null;
  try {
    const data  = await fdFetch(`/v4/teams/${teamId}`);
    const squad = (data.squad || []).map(p => ({
      name:     p.name || '?',
      short:    p.shortName || p.name || '?',
      position: p.position || '?',
      number:   p.shirtNumber ?? null,
      age:      p.dateOfBirth
        ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (365.25 * 86400000))
        : null,
      club:     p.currentTeam?.shortName || p.currentTeam?.name || '',
    }));
    const result = { coach: data.coach?.name || null, squad };
    LIVE_DATA.squads[iso3] = result;
    return result;
  } catch (e) {
    console.info(`[WCIM] Squad unavailable for ${iso3}:`, e.message);
    return null;
  }
}

// ── main refresh ──────────────────────────────────────────────
let _refreshTimer = null;

async function refreshAll() {
  const results = await Promise.allSettled([fetchMatches(), fetchStandings(), fetchScorers()]);
  const anyOk   = results.some(r => r.status === 'fulfilled');

  if (anyOk) {
    LIVE_DATA.isLive   = true;
    LIVE_DATA.fetchedAt = new Date().toISOString();
  }

  results.forEach((r, i) => {
    if (r.status === 'rejected')
      console.info('[WCIM]', ['matches','standings','scorers'][i], 'unavailable:', r.reason?.message);
  });

  // Update all live surfaces
  updateGlobeStats();
  updateTickerFromLive();
  updateLeaderboard();
  if (document.getElementById('feature-hub')?.classList.contains('visible')) {
    const active = document.querySelector('.nav-pill.active')?.dataset.view;
    if (active === 'live')   document.getElementById('feature-panel').innerHTML = renderLiveView();
    if (active === 'groups') document.getElementById('feature-panel').innerHTML = renderGroupsView();
    if (active === 'stats')  document.getElementById('feature-panel').innerHTML = renderStatsView();
  }

  // Schedule next — 45s if live, 5min otherwise
  clearTimeout(_refreshTimer);
  const hasLive = LIVE_DATA.matches.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  _refreshTimer = setTimeout(refreshAll, hasLive ? 45_000 : 300_000);
}

// ── globe stats bar updater ───────────────────────────────────
function updateGlobeStats() {
  const goalEl   = document.getElementById('goal-count');
  const scorerEl = document.getElementById('top-scorer');
  const daysEl   = document.getElementById('tournament-days');

  if (goalEl)   goalEl.textContent   = LIVE_DATA.isLive ? LIVE_DATA.totalGoals : '0';
  if (scorerEl) scorerEl.textContent = LIVE_DATA.isLive ? LIVE_DATA.topScorer  : '—';

  const gl = goalEl?.closest('.globe-stat')?.querySelector('.label');
  const sl = scorerEl?.closest('.globe-stat')?.querySelector('.label');
  if (gl) gl.textContent = LIVE_DATA.isLive ? 'Tournament goals'     : 'Goals (pre-tournament)';
  if (sl) sl.textContent = LIVE_DATA.isLive ? 'Top scorer'           : 'Top scorer (projected)';

  updateTournamentStatus(daysEl);
}

// ── tournament countdown / matchday ───────────────────────────
function updateTournamentStatus(el) {
  el = el || document.getElementById('tournament-days');
  if (!el) return;
  const start = new Date('2026-06-11T00:00:00');
  const end   = new Date('2026-07-19T23:59:59');
  const now   = new Date();
  if (LIVE_DATA.isLive && LIVE_DATA.matchday !== 'Pre-tournament') {
    el.textContent = LIVE_DATA.matchday;
    el.style.color = 'var(--green-text)';
  } else if (now < start) {
    const days = Math.ceil((start - now) / 86400000);
    el.textContent = days === 1 ? '1d to kickoff' : `${days}d to kickoff`;
    el.style.color = '';
  } else if (now <= end) {
    el.textContent = `Day ${Math.floor((now - start) / 86400000) + 1}`;
    el.style.color = 'var(--green-text)';
  } else {
    el.textContent = 'Champions crowned';
    el.style.color = 'var(--gold-text)';
  }
}

// ── ticker updater ────────────────────────────────────────────
function buildTicker() {
  // Called on page load — shows static schedule immediately
  const STATIC = [
    { home:'Mexico',    away:'South Africa', date:'Jun 12', venue:'Mexico City',   group:'A' },
    { home:'France',    away:'Iraq',          date:'Jun 15', venue:'Dallas',        group:'I' },
    { home:'Brazil',    away:'Morocco',       date:'Jun 16', venue:'NY/NJ',         group:'C' },
    { home:'USA',       away:'Paraguay',      date:'Jun 17', venue:'Los Angeles',   group:'D' },
    { home:'Germany',   away:'Curaçao',       date:'Jun 18', venue:'Houston',       group:'E' },
    { home:'Spain',     away:'Cape Verde',    date:'Jun 20', venue:'Atlanta',       group:'H' },
    { home:'Argentina', away:'Algeria',       date:'Jun 21', venue:'Miami',         group:'J' },
    { home:'England',   away:'Panama',        date:'Jun 19', venue:'Kansas City',   group:'L' },
  ];
  const items = STATIC.map(f => {
    const n1 = WC_NATIONS.find(n => n.name === f.home);
    const n2 = WC_NATIONS.find(n => n.name === f.away);
    return `${n1?.flag||''} ${f.home} vs ${n2?.flag||''} ${f.away} &nbsp;·&nbsp; ${f.date} &nbsp;·&nbsp; ${f.venue}`;
  });
  const el = document.getElementById('match-ticker');
  if (el) el.innerHTML = items.join(' &ensp;|&ensp; ') + ' &ensp;|&ensp; ' + items.join(' &ensp;|&ensp; ');
}

function updateTickerFromLive() {
  if (!LIVE_DATA.matches.length) return;
  const el = document.getElementById('match-ticker');
  if (!el) return;

  const items = LIVE_DATA.matches.slice(0, 20).map(m => {
    const n1 = WC_NATIONS.find(n => normalizeName(n.name).includes(normalizeName(m.homeTeam.name.split(' ')[0])));
    const n2 = WC_NATIONS.find(n => normalizeName(n.name).includes(normalizeName(m.awayTeam.name.split(' ')[0])));
    const f1 = n1?.flag || '';
    const f2 = n2?.flag || '';
    const grp = m.group ? ` · Grp ${m.group}` : '';

    if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
      const min = m.minute ? ` ${m.minute}'` : '';
      return `<span class="live">● LIVE${min}</span> ${f1} ${m.homeTeam.name} ${m.score.home}–${m.score.away} ${f2} ${m.awayTeam.name}${grp}`;
    }
    if (m.status === 'FINISHED') {
      return `${f1} ${m.homeTeam.name} ${m.score.home}–${m.score.away} ${f2} ${m.awayTeam.name} FT${grp}`;
    }
    const d = new Date(m.utcDate);
    const ds = d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
    return `${f1} ${m.homeTeam.name} vs ${f2} ${m.awayTeam.name} &nbsp;·&nbsp; ${ds}${grp}`;
  });

  if (!items.length) return;
  el.innerHTML = items.join(' &ensp;|&ensp; ') + ' &ensp;|&ensp; ' + items.join(' &ensp;|&ensp; ');
}

// ── leaderboard in stats scene ────────────────────────────────
function updateLeaderboard() {
  if (!LIVE_DATA.scorers.length) return;
  // Re-render whichever tab is currently active
  const activeTab = document.querySelector('.lb-tab.active')?.dataset.lb || 'goals';
  renderLeaderboardTab(activeTab);
}

function renderLeaderboardTab(tab) {
  const allRows = document.querySelectorAll('.lb-rows');
  allRows.forEach(r => { r.style.display = r.dataset.tab === tab ? 'block' : 'none'; });

  if (!LIVE_DATA.scorers.length) return; // keep static HTML

  const sorted = [...LIVE_DATA.scorers].sort((a, b) =>
    tab === 'assists' ? b.assists - a.goals : b.goals - a.assists
  ).sort((a, b) =>
    tab === 'assists' ? b.assists - a.assists : b.goals - a.goals
  );

  const rankClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
  const val       = p => tab === 'assists' ? p.assists : p.goals;

  const activeRows = document.querySelector(`.lb-rows[data-tab="${tab}"]`);
  if (!activeRows) return;

  activeRows.innerHTML = sorted.slice(0, 8).map((p, i) => {
    const initials = (p.short || p.player).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `<div class="lb-row">
      <div class="lb-rank ${rankClass(i)}">${i + 1}</div>
      <div class="lb-avatar">${escapeHtml(initials)}</div>
      <div class="lb-info">
        <span class="lb-name">${escapeHtml(p.short || p.player)}</span>
        <span class="lb-country">${escapeHtml(p.team)}</span>
      </div>
      <div class="lb-value">${val(p)}</div>
    </div>`;
  }).join('');

  const label = document.getElementById('lb-stat-label');
  if (label) label.textContent = tab === 'assists' ? 'Assists' : 'Goals';

  const noteEl = document.querySelector('.data-note');
  if (noteEl && LIVE_DATA.isLive) {
    const d = new Date(LIVE_DATA.fetchedAt);
    noteEl.innerHTML = `<strong>Live data</strong> · Updated ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} via football-data.org`;
  }
}

// ── LIVE MATCHES hub view ─────────────────────────────────────
function renderLiveView() {
  const active   = LIVE_DATA.matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED');
  const upcoming = LIVE_DATA.matches.filter(m => m.status === 'SCHEDULED').slice(0, 6);
  const toRender = active.length ? active.slice(0, 6) : upcoming;

  if (!toRender.length) {
    // Static fallback cards until API responds
    return `
      <p class="hub-data-note">Loading live match data…</p>
      <div class="hub-grid">
        <article class="match-card">
          <div class="match-meta">Group A · Estadio Azteca, Mexico City</div>
          <div class="match-row">
            <span class="match-team">Mexico</span>
            <strong class="match-score-pending">vs</strong>
            <span class="match-team">South Africa</span>
          </div>
          <p>Jun 12 · 19:00 local · Opening match</p>
        </article>
        <article class="match-card">
          <div class="match-meta">Group D · SoFi Stadium, Los Angeles</div>
          <div class="match-row">
            <span class="match-team">USA</span>
            <strong class="match-score-pending">vs</strong>
            <span class="match-team">Paraguay</span>
          </div>
          <p>Jun 17 · 20:00 local</p>
        </article>
      </div>`;
  }

  return `<div class="hub-grid">${toRender.map(m => {
    const isLive     = m.status === 'IN_PLAY' || m.status === 'PAUSED';
    const isFinished = m.status === 'FINISHED';
    const h = m.score.home ?? '—';
    const a = m.score.away ?? '—';
    const d = new Date(m.utcDate);
    const ds = d.toLocaleDateString('en-US', { month:'short', day:'numeric' });
    const ts = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

    const badge = isLive
      ? `<span class="match-live-badge">● ${m.minute ? m.minute + "'" : 'LIVE'}</span>`
      : isFinished
        ? `<span class="match-ft-badge">FT</span>`
        : `<span class="match-sched-badge">${ds} ${ts}</span>`;

    const score = (isLive || isFinished)
      ? `<strong class="match-score">${h}–${a}</strong>`
      : `<strong class="match-score-pending">vs</strong>`;

    const grp = m.group ? `Group ${escapeHtml(m.group)}` : '';
    const ven = m.venue ? ` · ${escapeHtml(m.venue)}` : '';

    return `<article class="match-card">
      <div class="match-meta">${badge} ${grp}${ven}</div>
      <div class="match-row">
        <span class="match-team">${escapeHtml(m.homeTeam.name)}</span>
        ${score}
        <span class="match-team">${escapeHtml(m.awayTeam.name)}</span>
      </div>
    </article>`;
  }).join('')}</div>`;
}

// ── GROUP TABLES hub view ─────────────────────────────────────
function renderGroupsView() {
  const groups = LIVE_DATA.standings;
  if (!Object.keys(groups).length) {
    // Static fallback — 3 sample groups
    const SAMPLE = {
      A:[['Mexico',1,1,0,0,2,'+1'],['South Africa',1,0,1,0,1,'0'],['South Korea',0,0,0,0,0,'0'],['Czech Republic',0,0,0,0,0,'0']],
      D:[['USA',0,0,0,0,0,'0'],['Paraguay',0,0,0,0,0,'0'],['Australia',0,0,0,0,0,'0'],['Turkey',0,0,0,0,0,'0']],
      J:[['Argentina',0,0,0,0,0,'0'],['Algeria',0,0,0,0,0,'0'],['Austria',0,0,0,0,0,'0'],['Jordan',0,0,0,0,0,'0']],
    };
    return `<p class="hub-data-note">Pre-tournament standings — live once matches kick off.</p>
    <div class="hub-grid">${Object.entries(SAMPLE).map(([grp, rows]) => `
      <article class="group-card">
        <h3>Group ${escapeHtml(grp)}</h3>
        <table class="group-table">
          <thead><tr><th>Team</th><th>MP</th><th>GD</th><th>Pts</th></tr></thead>
          <tbody>${rows.map((r,i) => `<tr class="${i<2?'qualifying':''}"><td>${escapeHtml(r[0])}</td><td>${r[1]}</td><td>${escapeHtml(String(r[6]))}</td><td><strong>${r[4]}</strong></td></tr>`).join('')}</tbody>
        </table>
      </article>`).join('')}</div>`;
  }

  return `<div class="hub-grid">${Object.entries(groups).sort().map(([letter, rows]) => `
    <article class="group-card">
      <h3>Group ${escapeHtml(letter)}</h3>
      <table class="group-table">
        <thead><tr><th>Team</th><th>MP</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>${rows.map((r, i) => `
          <tr class="${i < 2 ? 'qualifying' : ''}">
            <td>${escapeHtml(r.team)}</td>
            <td>${r.mp}</td>
            <td>${r.gd >= 0 ? '+' : ''}${r.gd}</td>
            <td><strong>${r.pts}</strong></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </article>`).join('')}</div>`;
}

// ── STATS hub view (top scorers) ──────────────────────────────
function renderStatsView() {
  if (!LIVE_DATA.scorers.length) {
    return `<p class="hub-data-note">Scorer data will appear once matches kick off.</p>
    <div class="hub-grid three">
      <article class="hub-card"><span>Top scorer</span><strong>TBC</strong><p>Live from football-data.org once the tournament begins.</p></article>
      <article class="hub-card"><span>Most assists</span><strong>TBC</strong><p>Assist data updates in real-time during matches.</p></article>
      <article class="hub-card"><span>Golden Boot race</span><strong>Live soon</strong><p>Scorer leaderboard available from matchday 1.</p></article>
    </div>`;
  }

  return `<div class="hub-grid three">${LIVE_DATA.scorers.slice(0, 6).map((s, i) =>
    hubCard(`#${i + 1} · ${escapeHtml(s.team)}`, escapeHtml(s.short || s.player), `${s.goals} goal${s.goals !== 1 ? 's' : ''}${s.assists ? ` · ${s.assists} assist${s.assists !== 1 ? 's' : ''}` : ''}`)
  ).join('')}</div>`;
}

// ── NATION PANEL — squad & fixtures from live API ─────────────
async function renderPanelContent(profile, nation) {
  const panelContent = document.getElementById('panel-content');
  if (!panelContent) return;

  if (activePanel === 'fixtures') {
    // Try live fixtures first
    const matches = LIVE_DATA.matches.filter(m => {
      const n = normalizeName(nation.name);
      return normalizeName(m.homeTeam.name).includes(n.split(' ')[0]) ||
             normalizeName(m.awayTeam.name).includes(n.split(' ')[0]);
    });

    if (matches.length) {
      panelContent.innerHTML = matches.map(m => {
        const d   = new Date(m.utcDate);
        const ds  = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
        const isHome = normalizeName(m.homeTeam.name).includes(normalizeName(nation.name).split(' ')[0]);
        const opp = isHome ? m.awayTeam.name : m.homeTeam.name;
        const loc = isHome ? 'Home' : 'Away';
        const scoreStr = m.status !== 'SCHEDULED'
          ? ` · ${m.score.home ?? '?'}–${m.score.away ?? '?'} ${m.status === 'FINISHED' ? 'FT' : 'LIVE'}`
          : '';
        return `<div class="detail-row">
          <strong>${loc} vs ${escapeHtml(opp)}${scoreStr}</strong>
          <span>${escapeHtml(ds)}${m.group ? ` · Group ${escapeHtml(m.group)}` : ''}${m.venue ? ` · ${escapeHtml(m.venue)}` : ''}</span>
        </div>`;
      }).join('');
      return;
    }
    // Fall back to static
    panelContent.innerHTML = profile.fixtures.map(item => {
      const [title, detail] = splitDetailItem(item);
      return `<div class="detail-row"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail || '')}</span></div>`;
    }).join('');
    return;
  }

  if (activePanel === 'story') {
    panelContent.innerHTML = profile.story.map(item =>
      `<div class="detail-row"><strong>${escapeHtml(item)}</strong></div>`
    ).join('');
    return;
  }

  // Squad tab — try live API
  panelContent.innerHTML = '<div class="detail-row"><strong>Loading squad…</strong></div>';
  const squadData = await fetchSquad(nation.iso);

  if (squadData && squadData.squad.length) {
    const byPos = {};
    squadData.squad.forEach(p => {
      const pos = p.position?.includes('Goalkeeper') ? 'GK'
                : p.position?.includes('Defender')   ? 'DEF'
                : p.position?.includes('Midfielder')  ? 'MID'
                : 'FWD';
      (byPos[pos] = byPos[pos] || []).push(p);
    });

    let html = squadData.coach
      ? `<div class="detail-row"><strong>Coach</strong><span>${escapeHtml(squadData.coach)}</span></div>`
      : '';

    const posOrder = ['GK','DEF','MID','FWD'];
    posOrder.forEach(pos => {
      if (!byPos[pos]?.length) return;
      html += `<div class="squad-pos-label">${{ GK:'Goalkeepers', DEF:'Defenders', MID:'Midfielders', FWD:'Forwards' }[pos]}</div>`;
      html += byPos[pos].map(p =>
        `<div class="detail-row"><strong>${escapeHtml(p.short || p.name)}</strong><span>${p.number ? `#${p.number} · ` : ''}${escapeHtml(p.club || '—')}${p.age ? ` · ${p.age}y` : ''}</span></div>`
      ).join('');
    });
    panelContent.innerHTML = html;
  } else {
    // Fallback to static profile
    panelContent.innerHTML = profile.players.map(item => {
      const [title, detail] = splitDetailItem(item);
      return `<div class="detail-row"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail || 'Data unavailable')}</span></div>`;
    }).join('');
  }
}

// ── STATIC FALLBACK DATA ──────────────────────────────────────
const BRACKET_PATH = [
  { round:'Round of 32', matches:['Mexico vs Turkey', 'France vs Japan', 'Brazil vs Croatia'] },
  { round:'Round of 16', matches:['Argentina vs Portugal', 'Spain vs Germany', 'USA vs Netherlands'] },
  { round:'Semifinals',  matches:['Brazil vs France', 'Argentina vs Spain'] },
  { round:'Final',       matches:['Argentina vs France'] }
];

const HISTORY_TIMELINE = [
  { year:'1930', host:'Uruguay',          winner:'Uruguay',   final:'Uruguay 4–2 Argentina',  fact:'The first World Cup — the mythic starting point.' },
  { year:'1970', host:'Mexico',           winner:'Brazil',    final:'Brazil 4–1 Italy',        fact:'Pelé and Brazil defined the beautiful game.' },
  { year:'1998', host:'France',           winner:'France',    final:'France 3–0 Brazil',       fact:'A host-nation coronation.' },
  { year:'2022', host:'Qatar',            winner:'Argentina', final:'Argentina 3–3 France',    fact:'The penalty epic that closed Messi\'s era.' },
  { year:'2026', host:'Canada/Mexico/USA',winner:'TBD',       final:'MetLife Stadium',         fact:'48 teams · 104 matches · 3 nations.' }
];

const FEATURE_TITLES = {
  overview:['Platform layer',    'World Cup Command'],
  countries:['Countries',        'Country Pages'],
  live:['Live match center',     'Match Control'],
  groups:['Group stage',         'Qualification Tables'],
  bracket:['Knockout stage',     'Interactive Bracket'],
  stadiums:['Stadium explorer',  'Host Routes'],
  stats:['Statistics',           'Top Scorers'],
  history:['World Cup history',  '1930 To 2026'],
  predictions:['Predictions',    'Probability Engine'],
  search:['Global search',       'Find Anything']
};

function profileForNation(n) {
  return PLATFORM_PROFILES[n.iso] || {
    rank: 'TBC',
    form: 'TBC',
    model: 'TBC',
    summary: `${n.name} · Group ${n.group}. Full squad, rankings, form, and fixture data will load from the live feed once tournament data is available.`,
    players: [
      `${n.name} captain · Data unavailable`,
      `Key forward · Data unavailable`,
      `Tactical key · Data unavailable`
    ],
    fixtures: [
      `Group ${n.group} opener · Schedule pending`,
      `Second group match · Schedule pending`,
      `Third group match · Schedule pending`
    ],
    story: [
      `${n.name} World Cup history · Data soon`,
      'Tournament records · Data soon',
      'Qualification route · Data soon'
    ]
  };
}

let activePanel = 'squad';

function splitDetailItem(item) {
  const divider = item.includes(' - ') ? ' - ' : ': ';
  const [title, ...rest] = item.split(divider);
  return [title, rest.join(divider)];
}

function renderPanelContent(profile) {
  const panelContent = document.getElementById('panel-content');
  if (!panelContent) return;
  if (activePanel === 'fixtures') {
    panelContent.innerHTML = profile.fixtures.map(item => {
      const [title, detail] = splitDetailItem(item);
      return `<div class="detail-row"><strong>${title}</strong><span>${detail || 'Connected fixture intelligence'}</span></div>`;
    }).join('');
    return;
  }
  if (activePanel === 'story') {
    const storyItems = profile.story.map(item =>
      `<div class="detail-row"><strong>${escapeHtml(item)}</strong></div>`
    ).join('');
    panelContent.innerHTML = storyItems;
    return;
  }
  panelContent.innerHTML = profile.players.map(item => {
    const [title, detail] = splitDetailItem(item);
    return `<div class="detail-row"><strong>${title}</strong><span>${detail || 'Player intelligence'}</span></div>`;
  }).join('');
}

function renderNationPanel(n) {
  const profile = profileForNation(n);
  const panel = document.getElementById('nation-panel');
  document.getElementById('panel-kicker').textContent = `${n.iso} selected`;
  document.getElementById('panel-title').textContent = n.name;
  document.getElementById('panel-group').textContent = `GROUP ${n.group}`;
  document.getElementById('panel-summary').textContent = profile.summary;
  document.getElementById('metric-rank').textContent = profile.rank;
  document.getElementById('metric-form').textContent = profile.form;
  document.getElementById('metric-odds').textContent = profile.model;
  renderPanelContent(profile);
  panel.classList.add('visible');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hubCard(kicker, title, body, extra = '') {
  return `<article class="hub-card ${extra}"><span>${escapeHtml(kicker)}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></article>`;
}

function renderCountriesView(filterGroup = '') {
  const nations = filterGroup
    ? WC_NATIONS.filter(n => n.group === filterGroup)
    : WC_NATIONS;

  const groups = [...new Set(WC_NATIONS.map(n => n.group))].sort();
  const filterBar = `
    <div class="group-filter-bar" role="group" aria-label="Filter by group">
      <button class="group-filter-btn${!filterGroup ? ' active' : ''}" data-group="">All</button>
      ${groups.map(g => `<button class="group-filter-btn${filterGroup === g ? ' active' : ''}" data-group="${g}">Group ${g}</button>`).join('')}
    </div>`;

  const cards = nations.map(n => {
    const profile = PLATFORM_PROFILES[n.iso];
    const rank  = profile ? `#${profile.rank}` : 'Rank TBC';
    const form  = profile ? profile.form : 'Data soon';
    const model = profile ? profile.model : '—';
    const iso2  = ISO3_TO_ISO2[n.iso] || '';
    const flagSrc = iso2 ? `https://flagcdn.com/w80/${iso2}.png` : '';
    return `
      <article class="hub-card country-card" data-iso="${escapeHtml(n.iso)}" tabindex="0" role="button" aria-label="${escapeHtml(n.name)}, Group ${n.group}">
        <div class="country-card-head">
          ${flagSrc ? `<img class="country-flag-thumb" src="${flagSrc}" alt="${escapeHtml(n.name)} flag" loading="lazy" width="32" height="22">` : `<span class="country-flag-emoji">${n.flag}</span>`}
          <span class="country-card-group">Group ${escapeHtml(n.group)}</span>
        </div>
        <strong>${escapeHtml(n.name)}</strong>
        <div class="country-card-meta">
          <span class="country-card-rank">${escapeHtml(rank)}</span>
          <span class="country-card-form">${escapeHtml(form)}</span>
          ${model !== '—' ? `<span class="country-card-model">${escapeHtml(model)}</span>` : ''}
        </div>
      </article>`;
  }).join('');

  return filterBar + `<div class="hub-grid three country-grid">${cards}</div>`;
}

function renderLiveView() {
  return LIVE_MATCHES.map(match => `
    <article class="match-card">
      <div class="match-meta">${escapeHtml(match.status)} - ${escapeHtml(match.meta)}</div>
      <div class="match-row">
        <span class="match-team">${escapeHtml(match.home)}</span>
        <strong class="match-score">${escapeHtml(match.score)}</strong>
        <span class="match-team">${escapeHtml(match.away)}</span>
      </div>
      <p>${escapeHtml(match.stats)}</p>
      <ul class="event-list">${match.events.map(event => `<li><span>${escapeHtml(event)}</span><span>Timeline</span></li>`).join('')}</ul>
    </article>
  `).join('');
}

function renderGroupsView() {
  return `<div class="hub-grid">${Object.entries(GROUP_TABLES).map(([group, rows]) => `
    <article class="group-card">
      <h3>Group ${escapeHtml(group)}</h3>
      <table class="group-table">
        <thead><tr><th>Team</th><th>Pts</th><th>GD</th><th>Q</th></tr></thead>
        <tbody>${rows.map(row => `<tr><td>${escapeHtml(row[0])}</td><td>${row[4]}</td><td>${escapeHtml(row[6])}</td><td>${escapeHtml(row[7])}</td></tr>`).join('')}</tbody>
      </table>
    </article>
  `).join('')}</div>`;
}

function renderBracketView() {
  return `<div class="bracket-track">${BRACKET_PATH.map(round => `
    <div class="bracket-column">
      <div class="bracket-round">${escapeHtml(round.round)}</div>
      ${round.matches.map(match => `<article class="bracket-match"><strong>${escapeHtml(match)}</strong><em>Projected path · updates live</em></article>`).join('')}
    </div>
  `).join('')}</div>`;
}

function renderStadiumsView() {
  return `
    <div class="hub-grid">${HOST_STADIUMS.map(stadium => `
      <article class="hub-card stadium-card">
        <span>${escapeHtml(stadium.city)}</span>
        <strong>${escapeHtml(stadium.name)}</strong>
        <p>${escapeHtml(stadium.capacity)} seats - ${escapeHtml(stadium.matches)} - ${escapeHtml(stadium.note)}</p>
      </article>
    `).join('')}</div>
    <div class="route-strip">
      ${HOST_STADIUMS.slice(0, 5).map((stadium, index) => `${index ? '<span class="route-line"></span>' : ''}<span class="route-dot" title="${escapeHtml(stadium.city)}"></span>`).join('')}
    </div>
  `;
}

function renderStatsView() {
  return `<div class="hub-grid three">${TOURNAMENT_LEADERS.map(([label, name, detail]) => hubCard(label, name, detail)).join('')}</div>`;
}

function renderHistoryView() {
  return `<div class="hub-grid">${HISTORY_TIMELINE.map(item => hubCard(`${item.year} - ${item.host}`, item.winner, `${item.final}. ${item.fact}`)).join('')}</div>`;
}

function renderPredictionsView() {
  return `
    <p class="hub-data-note">Model outputs — not verified match data. Updated pre-tournament.</p>
    <div class="hub-grid three">
      ${hubCard('Winner model', 'Argentina 18%', 'Defending champions lead the current pre-tournament probability model.')}
      ${hubCard('Dark horse', 'USA 7%', 'Host boost, young squad profile, and favorable home atmosphere factor.')}
      ${hubCard('Projected final', 'France vs Argentina', 'Model-driven bracket simulation — updates live once knockout stage begins.')}
      ${hubCard('Team xG leader', 'Brazil +2.4 xG', 'Expected goals model based on squad depth, recent form, and opposition quality.')}
      ${hubCard('Player to watch', 'Mbappé vs Vinícius', 'Head-to-head model comparison ready for goals, assists, and pressure metrics.')}
      ${hubCard('Model confidence', 'Pre-tournament', 'All projections are separated from verified facts. Confidence scores attach once group stage completes.')}
    </div>`;
}

function searchItems(query) {
  const normalized = normalizeName(query);
  const players = Object.entries(PLATFORM_PROFILES).flatMap(([iso, profile]) =>
    profile.players.map(player => ({ type:'Player', title:player.split(' - ')[0], body:`${nationByIso[iso]?.name || iso} - ${player.split(' - ')[1] || 'profile'}`, iso }))
  );
  const countries = WC_NATIONS.map(n => ({ type:'Country', title:n.name, body:`Group ${n.group} - ${profileForNation(n).form} form`, iso:n.iso }));
  const stadiums = HOST_STADIUMS.map(s => ({ type:'Stadium', title:s.name, body:`${s.city} - ${s.matches}` }));
  const all = [...countries, ...players, ...stadiums];
  if (!normalized) return all.slice(0, 8);
  return all.filter(item => normalizeName(`${item.type} ${item.title} ${item.body}`).includes(normalized)).slice(0, 10);
}

function renderSearchView(query = '') {
  const results = searchItems(query);
  if (!results.length) return '<div class="search-results"><article class="search-result"><strong>No results</strong><p>Try a team, player, stadium, or country.</p></article></div>';
  return `<div class="search-results">${results.map(item => `
    <article class="search-result" data-iso="${escapeHtml(item.iso || '')}">
      <small>${escapeHtml(item.type)}</small>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
    </article>
  `).join('')}</div>`;
}

function renderFeatureView(view, query = '') {
  const hub = document.getElementById('feature-hub');
  const panel = document.getElementById('feature-panel');
  const title = document.getElementById('hub-title');
  const kicker = document.getElementById('hub-kicker');
  if (!hub || !panel || !title || !kicker) return;

  const [nextKicker, nextTitle] = FEATURE_TITLES[view] || FEATURE_TITLES.overview;
  kicker.textContent = nextKicker;
  title.textContent = nextTitle;

  const views = {
    countries: renderCountriesView,
    live: renderLiveView,
    groups: renderGroupsView,
    bracket: renderBracketView,
    stadiums: renderStadiumsView,
    stats: renderStatsView,
    history: renderHistoryView,
    predictions: renderPredictionsView,
    search: () => renderSearchView(query)
  };

  panel.innerHTML = (views[view] || renderCountriesView)();
  hub.classList.toggle('visible', view !== 'overview');
}

// ── ONE-SURFACE-AT-A-TIME ROUTING ────────────────────────────
// Never show feature hub and nation panel simultaneously.
// This is the single source of truth for surface visibility.

function closeNationPanel() {
  const panel = document.getElementById('nation-panel');
  const globeContainer = document.getElementById('globe-container');
  if (panel) panel.classList.remove('visible');
  if (globeContainer) {
    globeContainer.dataset.selectedIso = '';
    globeContainer.dispatchEvent(new CustomEvent('clearSelection'));
  }
  document.querySelectorAll('.flag-pin.pulse').forEach(pin => pin.classList.remove('pulse'));
}

function closeHub() {
  const hub = document.getElementById('feature-hub');
  if (hub) hub.classList.remove('visible');
}

function openNationPanel(n) {
  // Collapse hub first — one surface at a time
  closeHub();
  renderNationPanel(n);
}

function openHub(view, query = '') {
  // Collapse nation panel first — one surface at a time
  closeNationPanel();
  renderFeatureView(view, query);
}

function setPlatformView(view) {
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelectorAll('.deck-card').forEach(card => {
    card.classList.toggle('active', card.dataset.card === view);
  });
  if (view === 'overview') {
    closeHub();
  } else {
    openHub(view);
  }
}

// flagcdn.com needs 2-letter ISO codes; our data uses 3-letter codes.
const ISO3_TO_ISO2 = {
  MEX:'mx', ZAF:'za', KOR:'kr', CZE:'cz', CAN:'ca', BIH:'ba', QAT:'qa', CHE:'ch',
  BRA:'br', MAR:'ma', HTI:'ht', GBR:'gb', USA:'us', PRY:'py', AUS:'au', TUR:'tr',
  DEU:'de', CUW:'cw', CIV:'ci', ECU:'ec', NLD:'nl', JPN:'jp', SWE:'se', TUN:'tn',
  BEL:'be', EGY:'eg', IRN:'ir', NZL:'nz', ESP:'es', CPV:'cv', SAU:'sa', URY:'uy',
  FRA:'fr', SEN:'sn', IRQ:'iq', NOR:'no', ARG:'ar', DZA:'dz', AUT:'at', JOR:'jo',
  PRT:'pt', COD:'cd', UZB:'uz', COL:'co', HRV:'hr', GHA:'gh', PAN:'pa', SCO:'gb-sct'
};
function flagImgUrl(iso3) {
  const iso2 = ISO3_TO_ISO2[iso3];
  return iso2 ? `https://flagcdn.com/w80/${iso2}.png` : '';
}
const NAME_TO_ISO = {
  // Note: the topojson dataset has one shape for the whole UK, so the
  // landmass hover-highlight can only resolve to one of England/Scotland
  // (mapped to England here). This doesn't affect selection — both have
  // their own correct, independent flag pins.
  'united states of america':'USA','united states':'USA','united kingdom':'GBR',
  'england':'GBR','korea':'KOR','south korea':'KOR','republic of korea':'KOR',
  'czechia':'CZE','czech republic':'CZE','ivory coast':'CIV',"cote d'ivoire":'CIV',
  'dem. rep. congo':'COD','democratic republic of the congo':'COD','dr congo':'COD',
  'bosnia and herzegovina':'BIH','saudi arabia':'SAU','south africa':'ZAF',
  'new zealand':'NZL','cape verde':'CPV','cabo verde':'CPV','curacao':'CUW','curaçao':'CUW'
};

function normalizeName(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .trim();
}

function nationForPolygon(props) {
  if (!props) return null;
  const iso = props.ISO_A3 || props.ADM0_A3 || props.iso_a3;
  if (iso && nationByIso[iso]) return nationByIso[iso];
  const name = normalizeName(props.NAME || props.ADMIN || props.name);
  const mapped = NAME_TO_ISO[name];
  if (mapped && nationByIso[mapped]) return nationByIso[mapped];
  return WC_NATIONS.find(n => normalizeName(n.name) === name) || null;
}

function updateTournamentStatus() {
  const start = new Date('2026-06-11T00:00:00');
  const end   = new Date('2026-07-19T23:59:59');
  const now   = new Date();
  const el    = document.getElementById('tournament-days');
  if (!el) return;
  if (now < start) {
    const days = Math.ceil((start - now) / 86400000);
    el.textContent = days + 'd to kickoff';
  } else if (now <= end) {
    const day = Math.floor((now - start) / 86400000) + 1;
    el.textContent = 'Matchday ' + day;
    el.style.color = '#00ff87';
  } else {
    el.textContent = 'Champions crowned';
    el.style.color = '#c9a84c';
  }
}

function buildTicker() {
  const fixtures = [
    '<span class="live">● LIVE</span> 🇲🇽 Mexico 0–0 🇿🇦 South Africa · Group A',
    '🇫🇷 France vs 🇮🇶 Iraq · Jun 15 · Dallas',
    '🇧🇷 Brazil vs 🇲🇦 Morocco · Jun 16 · NY/NJ',
    '🇺🇸 USA vs 🇵🇾 Paraguay · Jun 17 · LA',
    '🇩🇪 Germany vs 🇨🇼 Curaçao · Jun 18 · Houston',
    '🇳🇱 Netherlands vs 🇯🇵 Japan · Jun 19 · Seattle',
    '🇪🇸 Spain vs 🇨🇻 Cape Verde · Jun 20 · Atlanta',
    '🇦🇷 Argentina vs 🇩🇿 Algeria · Jun 21 · Miami'
  ];
  const track = fixtures.join('') + fixtures.join('');
  document.getElementById('match-ticker').innerHTML = track;
}

updateTournamentStatus();
buildTicker();

document.querySelectorAll('.nav-pill').forEach(btn => {
  btn.addEventListener('click', () => setPlatformView(btn.dataset.view));
});

document.getElementById('hub-close')?.addEventListener('click', () => {
  setPlatformView('overview');
});

document.getElementById('global-search')?.addEventListener('input', event => {
  renderFeatureView('search', event.target.value);
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === 'search');
  });
});

document.getElementById('feature-panel')?.addEventListener('click', event => {
  // Search result → open nation panel
  const result = event.target.closest('.search-result[data-iso]');
  if (result?.dataset.iso && nationByIso[result.dataset.iso]) {
    openNationPanel(nationByIso[result.dataset.iso]);
    document.querySelectorAll('.nav-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === 'countries');
    });
    return;
  }
  // Country card → open nation panel
  const card = event.target.closest('.country-card[data-iso]');
  if (card?.dataset.iso && nationByIso[card.dataset.iso]) {
    openNationPanel(nationByIso[card.dataset.iso]);
    document.querySelectorAll('.nav-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === 'countries');
    });
    return;
  }
  // Group filter button
  const filterBtn = event.target.closest('.group-filter-btn');
  if (filterBtn) {
    const group = filterBtn.dataset.group;
    const panel = document.getElementById('feature-panel');
    if (panel) {
      const hub = document.getElementById('feature-hub');
      hub?.querySelectorAll('.group-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group));
      const grid = panel.querySelector('.country-grid');
      if (grid) {
        const nations = group ? WC_NATIONS.filter(n => n.group === group) : WC_NATIONS;
        grid.innerHTML = nations.map(n => {
          const profile = PLATFORM_PROFILES[n.iso];
          const rank  = profile ? `#${profile.rank}` : 'Rank TBC';
          const form  = profile ? profile.form : 'Data soon';
          const model = profile ? profile.model : '—';
          const iso2  = ISO3_TO_ISO2[n.iso] || '';
          const flagSrc = iso2 ? `https://flagcdn.com/w80/${iso2}.png` : '';
          return `
            <article class="hub-card country-card" data-iso="${escapeHtml(n.iso)}" tabindex="0" role="button" aria-label="${escapeHtml(n.name)}, Group ${n.group}">
              <div class="country-card-head">
                ${flagSrc ? `<img class="country-flag-thumb" src="${flagSrc}" alt="${escapeHtml(n.name)} flag" loading="lazy" width="32" height="22">` : `<span class="country-flag-emoji">${n.flag}</span>`}
                <span class="country-card-group">Group ${escapeHtml(n.group)}</span>
              </div>
              <strong>${escapeHtml(n.name)}</strong>
              <div class="country-card-meta">
                <span class="country-card-rank">${escapeHtml(rank)}</span>
                <span class="country-card-form">${escapeHtml(form)}</span>
                ${model !== '—' ? `<span class="country-card-model">${escapeHtml(model)}</span>` : ''}
              </div>
            </article>`;
        }).join('');
      }
    }
  }
});

document.querySelectorAll('.panel-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activePanel = btn.dataset.panel;
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.classList.toggle('active', tab === btn);
    });
    const selectedIso = document.getElementById('globe-container')?.dataset.selectedIso;
    const selectedNation = selectedIso ? nationByIso[selectedIso] : null;
    if (selectedNation) renderNationPanel(selectedNation);
  });
});

document.getElementById('panel-close')?.addEventListener('click', () => {
  closeNationPanel();
  setPlatformView('overview');
});

document.querySelectorAll('.zoom-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    zoomGlobe(btn.dataset.zoom === 'in' ? -1 : 1);
  });
});

function startCanvasGlobe(globeContainer, selectNation) {
  globeContainer.classList.add('fallback-globe');
  globeContainer.innerHTML = '';

  const canvas = document.createElement('canvas');
  canvas.id = 'fallback-globe-canvas';
  globeContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let radius = 0;
  let rotY = -0.55;
  let rotX = -0.18;
  let zoomLevel = 1;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let selectedFallbackIso = null;
  const pinEls = WC_NATIONS.map(n => {
    const el = document.createElement('button');
    el.className = 'flag-pin fallback-pin';
    el.dataset.iso = n.iso;
    el.type = 'button';
    el.innerHTML = `
      <img src="${flagImgUrl(n.iso)}" alt="${n.name}" loading="lazy">
      <span class="pin-tooltip">${n.flag} ${n.name}<br><span class="pin-tooltip-group">GROUP ${n.group}</span></span>
    `;
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      selectedFallbackIso = selectedFallbackIso === n.iso ? null : n.iso;
      selectNation(n);
    });
    globeContainer.appendChild(el);
    return { nation: n, el };
  });

  function resizeFallbackGlobe() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = globeContainer.clientWidth || window.innerWidth;
    height = globeContainer.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = Math.min(width, height) * (width < 700 ? 0.34 : 0.38) * zoomLevel;
  }

  function project(lat, lng) {
    const phi = lat * Math.PI / 180;
    const theta = (lng * Math.PI / 180) + rotY;
    const x = Math.cos(phi) * Math.sin(theta);
    const y = Math.sin(phi);
    const z = Math.cos(phi) * Math.cos(theta);
    const y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
    const z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
    const scale = 0.74 + z2 * 0.26;
    return {
      x: width / 2 + x * radius * scale,
      y: height / 2 - y2 * radius * scale,
      z: z2,
      scale
    };
  }

  function drawGlobe() {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.12, cx, cy, radius * 1.34);
    glow.addColorStop(0, 'rgba(0,255,135,0.15)');
    glow.addColorStop(0.55, 'rgba(77,166,255,0.08)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2);
    ctx.fill();

    const sphere = ctx.createRadialGradient(cx - radius * 0.32, cy - radius * 0.36, radius * 0.08, cx, cy, radius);
    sphere.addColorStop(0, '#235f85');
    sphere.addColorStop(0.42, '#0d2543');
    sphere.addColorStop(0.78, '#071226');
    sphere.addColorStop(1, '#020711');
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,255,135,0.14)';
    ctx.lineWidth = 1;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      for (let lng = -180; lng <= 180; lng += 5) {
        const p = project(lat, lng);
        if (p.z < -0.95) continue;
        if (lng === -180) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    for (let lng = -150; lng <= 180; lng += 30) {
      ctx.beginPath();
      for (let lat = -80; lat <= 80; lat += 4) {
        const p = project(lat, lng);
        if (p.z < -0.95) continue;
        if (lat === -80) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(0,255,135,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    pinEls.forEach(({ nation, el }) => {
      const p = project(nation.lat, nation.lng);
      const visible = p.z > -0.08;
      el.style.opacity = visible ? String(0.36 + Math.max(0, p.z) * 0.64) : '0';
      el.style.pointerEvents = visible ? 'auto' : 'none';
      el.style.transform = `translate(-50%,-120%) scale(${Math.max(0.72, p.scale)})`;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.style.zIndex = String(30 + Math.round(p.z * 20));
      el.classList.toggle('pulse', selectedFallbackIso === nation.iso);
    });

    if (!dragging) rotY += 0.0018;
    requestAnimationFrame(drawGlobe);
  }

  globeContainer.addEventListener('pointerdown', event => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    globeContainer.setPointerCapture?.(event.pointerId);
  });
  globeContainer.addEventListener('pointermove', event => {
    if (!dragging) return;
    rotY += (event.clientX - lastX) * 0.006;
    rotX = Math.max(-0.65, Math.min(0.65, rotX + (event.clientY - lastY) * 0.004));
    lastX = event.clientX;
    lastY = event.clientY;
  });
  globeContainer.addEventListener('pointerup', () => { dragging = false; });
  globeContainer.addEventListener('pointercancel', () => { dragging = false; });
  globeContainer.addEventListener('clearSelection', () => {
    selectedFallbackIso = null;
    pinEls.forEach(({ el }) => el.classList.remove('pulse'));
  });
  zoomGlobe = direction => {
    zoomLevel = Math.max(0.72, Math.min(1.34, zoomLevel + direction * -0.12));
    globeContainer.dataset.zoomLevel = zoomLevel.toFixed(2);
    resizeFallbackGlobe();
  };

  resizeFallbackGlobe();
  window.addEventListener('resize', resizeFallbackGlobe);
  drawGlobe();
}

setTimeout(() => {
  const globeContainer = document.getElementById('globe-container');
  if (!globeContainer) return;

  // ── LOADING STATE ──────────────────────────────────────────
  const loadingEl = document.createElement('div');
  loadingEl.id = 'globe-loading';
  loadingEl.innerHTML = `
    <div class="globe-loading-ring"></div>
    <span>Loading globe data…</span>
  `;
  globeContainer.appendChild(loadingEl);

  function hideLoading() {
    loadingEl.style.opacity = '0';
    setTimeout(() => loadingEl.remove(), 400);
  }

  function showError(msg) {
    hideLoading();
    const errEl = document.createElement('div');
    errEl.id = 'globe-error';
    errEl.innerHTML = `
      <span class="globe-error-icon">⚠</span>
      <strong>${escapeHtml(msg)}</strong>
      <button onclick="location.reload()" class="globe-retry-btn">Retry</button>
    `;
    globeContainer.appendChild(errEl);
  }

  let hoverIso = null;
  let selectedIso = null;
  let idleTimer = null;
  let geoFeatures = [];
  let globe;
  let controls = null;
  let cameraAltitude = 2.35;
  let cameraLat = 18;
  let cameraLng = -45;

  function refreshGlobeStyles() {
    if (globe) globe.polygonsData(geoFeatures);
  }

  function pauseSpin() {
    if (!controls) return;
    controls.autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { controls.autoRotate = true; }, 4500);
  }

  // Small island/compact nations need a much closer zoom altitude —
  // at the default 1.6 they're too tiny on screen to look "zoomed in".
  const CLOSE_ZOOM_ISO = new Set(['CPV', 'CUW', 'HTI']);

  function selectNation(n) {
    const prevIso = selectedIso;
    selectedIso = selectedIso === n.iso ? null : n.iso;
    refreshGlobeStyles();
    globeContainer.dataset.selectedIso = selectedIso || '';
    if (prevIso) {
      const prevPin = globeContainer.querySelector(`.flag-pin[data-iso="${prevIso}"]`);
      if (prevPin) prevPin.classList.remove('pulse');
    }
    if (selectedIso) {
      const newPin = globeContainer.querySelector(`.flag-pin[data-iso="${selectedIso}"]`);
      if (newPin) newPin.classList.add('pulse');
    }
    pauseSpin();
    const altitude = CLOSE_ZOOM_ISO.has(n.iso) ? 0.7 : 1.6;
    cameraLat = n.lat;
    cameraLng = n.lng;
    cameraAltitude = altitude;
    if (globe) globe.pointOfView({ lat: cameraLat, lng: cameraLng, altitude: cameraAltitude }, 900);
    document.getElementById('globe-hint').style.opacity = '0';
    if (selectedIso) {
      openNationPanel(n);
      // Mark the Countries pill active without opening hub
      document.querySelectorAll('.nav-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === 'countries');
      });
    } else {
      document.getElementById('nation-panel').classList.remove('visible');
      setPlatformView('overview');
    }
  }

  globeContainer.addEventListener('clearSelection', () => {
    selectedIso = null;
    refreshGlobeStyles();
  });

  if (new URLSearchParams(location.search).has('fallback') || typeof Globe !== 'function' || typeof topojson === 'undefined') {
    hideLoading();
    startCanvasGlobe(globeContainer, selectNation);
    return;
  }

  globe = Globe()(globeContainer)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .globeCurvatureResolution(6)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#00ff87')
    .atmosphereAltitude(0.12)
    .polygonsData([])
    .polygonCapCurvatureResolution(2)
    .polygonCapColor(f => {
      const n = nationForPolygon(f.properties);
      if (n) {
        const c = GROUP_COLORS[n.group];
        if (selectedIso === n.iso) return '#ffffff';
        if (hoverIso === n.iso) return c;
        return c + 'dd';
      }
      return '#1a2035';
    })
    .polygonSideColor(() => 'rgba(0,0,0,0)')
    .polygonStrokeColor(f => {
      const n = nationForPolygon(f.properties);
      if (!n) return 'rgba(30,38,58,0.4)';
      const c = GROUP_COLORS[n.group];
      return hoverIso === n.iso || selectedIso === n.iso ? c : c + '44';
    })
    .polygonAltitude(f => {
      const n = nationForPolygon(f.properties);
      if (!n) return 0.004;
      if (selectedIso === n.iso) return 0.14;
      if (hoverIso === n.iso) return 0.11;
      return 0.07;
    })
    .polygonLabel(() => '')
    .onPolygonHover(f => {
      globeContainer.style.cursor = 'grab';
      const nextHoverIso = f ? (nationForPolygon(f.properties) || {}).iso : null;
      if (nextHoverIso === hoverIso) return;
      hoverIso = nextHoverIso;
      refreshGlobeStyles();
    })
    .htmlElementsData(WC_NATIONS)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'flag-pin';
      el.dataset.iso = d.iso;
      const img = document.createElement('img');
      img.src = flagImgUrl(d.iso);
      img.alt = d.name;
      img.loading = 'lazy';
      el.appendChild(img);
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';

      const tip = document.createElement('div');
      tip.className = 'pin-tooltip';
      tip.innerHTML = `${d.flag} ${d.name}<br><span class="pin-tooltip-group">GROUP ${d.group}</span>`;
      el.appendChild(tip);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNation(d);
      });
      el.addEventListener('mouseenter', () => {
        if (hoverIso === d.iso) return;
        hoverIso = d.iso;
        globeContainer.style.cursor = 'pointer';
        refreshGlobeStyles();
      });
      el.addEventListener('mouseleave', () => {
        hoverIso = null;
        globeContainer.style.cursor = 'grab';
        refreshGlobeStyles();
      });
      return el;
    })
    .htmlAltitude(0.12)
    .htmlElementVisibilityModifier((el, vis) => {
      el.style.opacity = vis ? 1 : 0;
      el.style.pointerEvents = vis ? 'auto' : 'none';
    });

  controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minDistance = 120;
  controls.maxDistance = 420;
  globe.pointOfView({ lat: cameraLat, lng: cameraLng, altitude: cameraAltitude }, 0);
  zoomGlobe = direction => {
    try {
      const pov = globe.pointOfView();
      if (pov && typeof pov.lat === 'number') cameraLat = pov.lat;
      if (pov && typeof pov.lng === 'number') cameraLng = pov.lng;
    } catch (err) {
      // Some Globe.gl builds do not expose pointOfView as a getter.
    }
    cameraAltitude = Math.max(0.82, Math.min(3.4, cameraAltitude + direction * 0.28));
    globeContainer.dataset.zoomLevel = cameraAltitude.toFixed(2);
    globe.pointOfView({
      lat: cameraLat,
      lng: cameraLng,
      altitude: cameraAltitude
    }, 520);
    pauseSpin();
  };

  globeContainer.addEventListener('mousedown', pauseSpin);
  globeContainer.addEventListener('touchstart', pauseSpin, {passive:true});
  globeContainer.addEventListener('wheel', pauseSpin, {passive:true});

  fetch('https://unpkg.com/world-atlas/countries-110m.json')
    .then(res => {
      if (!res.ok) throw new Error(`Map data ${res.status}`);
      return res.json();
    })
    .then(data => {
      geoFeatures = topojson.feature(data, data.objects.countries).features;
      globe.polygonsData(geoFeatures);
      hideLoading();
    })
    .catch(err => {
      console.error('Globe data failed:', err);
      showError('Map data unavailable — try refreshing.');
    });

  globe.width(window.innerWidth);
  globe.height(window.innerHeight);
  let resizeTicking = false;
  window.addEventListener('resize', () => {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(() => {
      globe.width(window.innerWidth);
      globe.height(window.innerHeight);
      resizeTicking = false;
    });
  });
}, 100);
