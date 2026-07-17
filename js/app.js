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
  let cursorFrame=0;
  function scheduleCursorFrame() {
    if (cursorFrame) return;
    cursorFrame = requestAnimationFrame(animRing);
  }
  function animRing(){
    cursorFrame = 0;
    ringX+=(mouseX-ringX)*.18; ringY+=(mouseY-ringY)*.18;
    curRing.style.left=ringX+'px'; curRing.style.top=ringY+'px';
    if (Math.abs(mouseX-ringX) > 0.2 || Math.abs(mouseY-ringY) > 0.2) scheduleCursorFrame();
  }
  document.addEventListener('mousemove',e=>{
    mouseX=e.clientX; mouseY=e.clientY;
    cur.style.left=mouseX+'px'; cur.style.top=mouseY+'px';
    scheduleCursorFrame();
  });
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
let previousStatsActive = null;
const styleCache = new WeakMap();

function setStyleValue(el, prop, value) {
  if (!el) return;
  let cache = styleCache.get(el);
  if (!cache) {
    cache = {};
    styleCache.set(el, cache);
  }
  if (cache[prop] === value) return;
  cache[prop] = value;
  el.style[prop] = value;
}

function setCssVar(el, prop, value) {
  if (!el) return;
  let cache = styleCache.get(el);
  if (!cache) {
    cache = {};
    styleCache.set(el, cache);
  }
  if (cache[prop] === value) return;
  cache[prop] = value;
  el.style.setProperty(prop, value);
}

function isAtScrollBottom() {
  const doc = document.documentElement;
  return window.scrollY + window.innerHeight >= doc.scrollHeight - 2; // 2px tolerance
}

function updateScrollReveal(scrollY = window.scrollY) {
  const rawProgress = Math.min(scrollY / window.innerHeight, 1);
  if (rawProgress >= 0.98) revealLocked = true;
  const progress = revealLocked ? 1 : rawProgress;
  const statsProgress = Math.max(0, Math.min((scrollY - window.innerHeight * 1.22) / (window.innerHeight * 4.6), 1));
  const statsEnter = Math.max(0, Math.min(statsProgress * 3, 1));
  const statsActive = statsProgress > 0.06;
  const boardPhase = Math.max(0, Math.min((statsProgress - 0.48) / 0.52, 1));
  const factsFade = statsProgress <= 0.58
    ? 1
    : Math.max(0.16, 1 - ((statsProgress - 0.58) / 0.42) * 0.84);
  const boardOpacity = Math.max(0, Math.min((statsProgress - 0.38) / 0.24, 1));

  const radius   = progress * 200;
  setStyleValue(globeWrap, 'clipPath', `circle(${radius.toFixed(2)}% at 50% 50%)`);
  setStyleValue(globeWrap, 'transition', 'none');
  setStyleValue(globeWrap, 'opacity', (1 - statsProgress * 0.42).toFixed(3));
  setStyleValue(globeWrap, 'transform', `scale(${(1 - statsProgress * 0.035).toFixed(4)}) translateY(${(-statsProgress * 10).toFixed(2)}px)`);
  setStyleValue(globeWrap, 'pointerEvents', statsActive ? 'none' : 'auto');
  setStyleValue(revealEl, 'opacity', Math.max(0, 1 - progress * 1.2).toFixed(3));
  if (progress >= 0.83) setStyleValue(revealEl, 'pointerEvents', 'none');
  document.body.classList.toggle('stats-active', statsActive);
  if (previousStatsActive !== statsActive) {
    previousStatsActive = statsActive;
    window.__WCIM_SET_GLOBE_ACTIVE?.(!statsActive);
  }

  if (progress > 0.12) {
    setStyleValue(globeUi, 'display', 'flex');
    setStyleValue(globeUi, 'opacity', (Math.min(1, (progress - 0.12) * 2.2) * (1 - statsProgress)).toFixed(3));
  }
  if (globeZoom) {
    setStyleValue(globeZoom, 'opacity', (1 - Math.min(statsProgress * 2.5, 1)).toFixed(3));
    setStyleValue(globeZoom, 'pointerEvents', statsActive ? 'none' : 'auto');
  }
  if (progress > 0.35) {
    document.body.classList.add('globe-active');
    setStyleValue(globeHint, 'opacity', (Math.min(1, (progress - 0.35) * 2.5) * (1 - statsProgress)).toFixed(3));
  }
  decorEls.forEach(el => {
    setStyleValue(el, 'opacity', Math.max(0, 1 - progress * 1.35).toFixed(3));
  });

  if (statsScene) {
    setCssVar(statsScene, '--stats-progress', statsProgress.toFixed(3));
    setCssVar(statsScene, '--stats-enter', statsEnter.toFixed(3));
    setCssVar(statsScene, '--stats-board-lift', `${Math.round(boardPhase * 460)}px`);
    setCssVar(statsScene, '--stats-rail-lift', `${Math.round(boardPhase * 180)}px`);
    setCssVar(statsScene, '--stats-facts-opacity', factsFade.toFixed(3));
    setCssVar(statsScene, '--stats-board-opacity', boardOpacity.toFixed(3));
  }
}

let visualScrollY = window.scrollY;
let scrollRevealFrame = 0;
function scheduleScrollReveal() {
  if (scrollRevealFrame) return;
  scrollRevealFrame = requestAnimationFrame(animateScrollReveal);
}
function animateScrollReveal() {
  scrollRevealFrame = 0;
  const targetScrollY = window.scrollY;
  visualScrollY += (targetScrollY - visualScrollY) * 0.20;
  if (Math.abs(targetScrollY - visualScrollY) < 0.35) visualScrollY = targetScrollY;
  updateScrollReveal(visualScrollY);
  if (visualScrollY !== targetScrollY) scheduleScrollReveal();
}
window.addEventListener('scroll', scheduleScrollReveal, { passive:true });
window.addEventListener('resize', scheduleScrollReveal);
scheduleScrollReveal();

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

const FIFA_RANKS = {
  ARG:1, FRA:2, ESP:3, GBR:4, ENG:4, BRA:5, PRT:6, NLD:7, BEL:8, DEU:9,
  HRV:10, USA:11, MEX:12, URY:13, COL:14, CAN:15, MAR:16, CHE:17, JPN:18, SEN:19,
  IRN:20, KOR:21, AUS:22, TUR:23, NOR:24, ECU:25, EGY:26, SWE:27, QAT:28, ZAF:29,
  CPV:30, CIV:31, SAU:32, TUN:33, GHA:34, PAN:35, NZL:36, PRY:37, DZA:38, BIH:39,
  CZE:40, AUT:41, HTI:42, IRQ:43, JOR:44, UZB:45, CUW:46, COD:47, SCO:48
};

function rankForNation(n) {
  return FIFA_RANKS[n?.iso] ? `#${FIFA_RANKS[n.iso]}` : 'Rank TBC';
}

const TEAM_CODE_ALIASES = {
  CHE: ['SUI'],
  HTI: ['HAI'],
  PRY: ['PAR'],
  ZAF: ['RSA'],
  GBR: ['ENG'],
  SAU: ['KSA'],
  DZA: ['ALG'],
  PRT: ['POR']
};

const MANAGER_OVERRIDES = {
  SEN: 'Pape Thiaw',
  JOR: 'Jamal Sellami'
};

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

const TEAM_DOSSIERS = {
  USA: {
    manager:'Mauricio Pochettino', star:'Christian Pulisic', nickname:'The Stars and Stripes', confed:'CONCACAF', titles:'0 World Cups', best:'1930 semifinal',
    managerWiki:'https://en.wikipedia.org/wiki/Mauricio_Pochettino', starWiki:'https://en.wikipedia.org/wiki/Christian_Pulisic',
    identity:'Vertical wide attacks, athletic midfield pressure, and home-crowd speed built for North American venues.',
    squad:['Matt Turner|GK|Nottingham Forest', 'Zack Steffen|GK|Colorado Rapids', 'Antonee Robinson|DEF|Fulham', 'Tim Ream|DEF|Charlotte FC', 'Chris Richards|DEF|Crystal Palace', 'Sergino Dest|DEF|PSV', 'Tyler Adams|MID|Bournemouth', 'Weston McKennie|MID|Juventus', 'Yunus Musah|MID|AC Milan', 'Gio Reyna|MID|Borussia Dortmund', 'Christian Pulisic|FWD|AC Milan', 'Tim Weah|FWD|Juventus', 'Folarin Balogun|FWD|Monaco', 'Ricardo Pepi|FWD|PSV', 'Brenden Aaronson|MID|Leeds United']
  },
  ARG: {
    manager:'Lionel Scaloni', star:'Lionel Messi', nickname:'La Albiceleste', confed:'CONMEBOL', titles:'3 World Cups', best:'Champions 1978, 1986, 2022',
    managerWiki:'https://en.wikipedia.org/wiki/Lionel_Scaloni', starWiki:'https://en.wikipedia.org/wiki/Lionel_Messi',
    identity:'Possession craft, final-third patience, and brutal transition quality around a veteran core.',
    squad:['Emiliano Martinez|GK|Aston Villa', 'Cristian Romero|DEF|Tottenham', 'Nicolas Otamendi|DEF|Benfica', 'Nahuel Molina|DEF|Atletico Madrid', 'Lisandro Martinez|DEF|Manchester United', 'Rodrigo De Paul|MID|Atletico Madrid', 'Enzo Fernandez|MID|Chelsea', 'Alexis Mac Allister|MID|Liverpool', 'Lionel Messi|FWD|Inter Miami', 'Julian Alvarez|FWD|Atletico Madrid', 'Lautaro Martinez|FWD|Inter Milan', 'Angel Di Maria|FWD|Benfica', 'Leandro Paredes|MID|Roma', 'Giovani Lo Celso|MID|Real Betis', 'Nicolas Gonzalez|FWD|Juventus']
  },
  BRA: {
    manager:'Carlo Ancelotti', star:'Vinicius Junior', nickname:'Selecao', confed:'CONMEBOL', titles:'5 World Cups', best:'Record five-time champions',
    managerWiki:'https://en.wikipedia.org/wiki/Carlo_Ancelotti', starWiki:'https://en.wikipedia.org/wiki/Vin%C3%ADcius_J%C3%BAnior',
    identity:'Explosive wingers, aggressive fullbacks, and chance creation through individual chaos.',
    squad:['Alisson Becker|GK|Liverpool', 'Ederson|GK|Manchester City', 'Marquinhos|DEF|Paris Saint-Germain', 'Eder Militao|DEF|Real Madrid', 'Gabriel Magalhaes|DEF|Arsenal', 'Danilo|DEF|Juventus', 'Bruno Guimaraes|MID|Newcastle United', 'Casemiro|MID|Manchester United', 'Lucas Paqueta|MID|West Ham', 'Rodrygo|FWD|Real Madrid', 'Vinicius Junior|FWD|Real Madrid', 'Raphinha|FWD|Barcelona', 'Endrick|FWD|Real Madrid', 'Richarlison|FWD|Tottenham', 'Gabriel Martinelli|FWD|Arsenal']
  },
  FRA: {
    manager:'Didier Deschamps', star:'Kylian Mbappe', nickname:'Les Bleus', confed:'UEFA', titles:'2 World Cups', best:'Champions 1998, 2018',
    managerWiki:'https://en.wikipedia.org/wiki/Didier_Deschamps', starWiki:'https://en.wikipedia.org/wiki/Kylian_Mbapp%C3%A9',
    identity:'Elite depth, vertical speed, and a tournament-tested defensive spine.',
    squad:['Mike Maignan|GK|AC Milan', 'Jules Kounde|DEF|Barcelona', 'William Saliba|DEF|Arsenal', 'Dayot Upamecano|DEF|Bayern Munich', 'Theo Hernandez|DEF|AC Milan', 'Aurelien Tchouameni|MID|Real Madrid', 'Eduardo Camavinga|MID|Real Madrid', 'Adrien Rabiot|MID|Marseille', 'Antoine Griezmann|MID|Atletico Madrid', 'Kylian Mbappe|FWD|Real Madrid', 'Ousmane Dembele|FWD|Paris Saint-Germain', 'Marcus Thuram|FWD|Inter Milan', 'Randal Kolo Muani|FWD|Paris Saint-Germain', 'Kingsley Coman|FWD|Bayern Munich', 'Ibrahima Konate|DEF|Liverpool']
  },
  ESP: {
    manager:'Luis de la Fuente', star:'Lamine Yamal', nickname:'La Roja', confed:'UEFA', titles:'1 World Cup', best:'Champions 2010',
    managerWiki:'https://en.wikipedia.org/wiki/Luis_de_la_Fuente_(football_manager)', starWiki:'https://en.wikipedia.org/wiki/Lamine_Yamal',
    identity:'Control-heavy possession, wide overloads, and fast switches into young attackers.',
    squad:['Unai Simon|GK|Athletic Club', 'Dani Carvajal|DEF|Real Madrid', 'Robin Le Normand|DEF|Atletico Madrid', 'Aymeric Laporte|DEF|Al Nassr', 'Marc Cucurella|DEF|Chelsea', 'Rodri|MID|Manchester City', 'Pedri|MID|Barcelona', 'Gavi|MID|Barcelona', 'Fabian Ruiz|MID|Paris Saint-Germain', 'Lamine Yamal|FWD|Barcelona', 'Nico Williams|FWD|Athletic Club', 'Alvaro Morata|FWD|AC Milan', 'Dani Olmo|MID|Barcelona', 'Mikel Merino|MID|Arsenal', 'Ferran Torres|FWD|Barcelona']
  },
  DEU: {
    manager:'Julian Nagelsmann', star:'Jamal Musiala', nickname:'Die Mannschaft', confed:'UEFA', titles:'4 World Cups', best:'Champions 1954, 1974, 1990, 2014',
    managerWiki:'https://en.wikipedia.org/wiki/Julian_Nagelsmann', starWiki:'https://en.wikipedia.org/wiki/Jamal_Musiala',
    identity:'Structured possession, central overloads, and quick attacking rotations between creators.',
    squad:['Manuel Neuer|GK|Bayern Munich', 'Marc-Andre ter Stegen|GK|Barcelona', 'Antonio Rudiger|DEF|Real Madrid', 'Jonathan Tah|DEF|Bayer Leverkusen', 'Joshua Kimmich|DEF|Bayern Munich', 'David Raum|DEF|RB Leipzig', 'Ilkay Gundogan|MID|Barcelona', 'Florian Wirtz|MID|Bayer Leverkusen', 'Jamal Musiala|MID|Bayern Munich', 'Aleksandar Pavlovic|MID|Bayern Munich', 'Kai Havertz|FWD|Arsenal', 'Niclas Fullkrug|FWD|West Ham', 'Leroy Sane|FWD|Bayern Munich', 'Serge Gnabry|FWD|Bayern Munich', 'Robert Andrich|MID|Bayer Leverkusen']
  },
  PRT: {
    manager:'Roberto Martinez', star:'Cristiano Ronaldo', nickname:'A Selecao', confed:'UEFA', titles:'0 World Cups', best:'1966 third place',
    managerWiki:'https://en.wikipedia.org/wiki/Roberto_Mart%C3%ADnez', starWiki:'https://en.wikipedia.org/wiki/Cristiano_Ronaldo',
    identity:'Technical midfield control, elite creators, and penalty-box gravity from multiple forwards.',
    squad:['Diogo Costa|GK|Porto', 'Ruben Dias|DEF|Manchester City', 'Pepe|DEF|Porto', 'Joao Cancelo|DEF|Barcelona', 'Nuno Mendes|DEF|Paris Saint-Germain', 'Joao Palhinha|MID|Bayern Munich', 'Vitinha|MID|Paris Saint-Germain', 'Bruno Fernandes|MID|Manchester United', 'Bernardo Silva|MID|Manchester City', 'Cristiano Ronaldo|FWD|Al Nassr', 'Rafael Leao|FWD|AC Milan', 'Goncalo Ramos|FWD|Paris Saint-Germain', 'Diogo Jota|FWD|Liverpool', 'Joao Felix|FWD|Barcelona', 'Pedro Neto|FWD|Chelsea']
  },
  ENG: {
    manager:'Thomas Tuchel', star:'Jude Bellingham', nickname:'Three Lions', confed:'UEFA', titles:'1 World Cup', best:'Champions 1966',
    managerWiki:'https://en.wikipedia.org/wiki/Thomas_Tuchel', starWiki:'https://en.wikipedia.org/wiki/Jude_Bellingham',
    identity:'Powerful attacking options, set-piece threat, and a midfield built to arrive late in the box.',
    squad:['Jordan Pickford|GK|Everton', 'John Stones|DEF|Manchester City', 'Marc Guehi|DEF|Crystal Palace', 'Kyle Walker|DEF|Manchester City', 'Luke Shaw|DEF|Manchester United', 'Declan Rice|MID|Arsenal', 'Kobbie Mainoo|MID|Manchester United', 'Jude Bellingham|MID|Real Madrid', 'Phil Foden|MID|Manchester City', 'Bukayo Saka|FWD|Arsenal', 'Harry Kane|FWD|Bayern Munich', 'Cole Palmer|FWD|Chelsea', 'Ollie Watkins|FWD|Aston Villa', 'Anthony Gordon|FWD|Newcastle United', 'Trent Alexander-Arnold|DEF|Liverpool']
  },
  GBR: {
    manager:'Thomas Tuchel', star:'Jude Bellingham', nickname:'Three Lions', confed:'UEFA', titles:'1 World Cup', best:'Champions 1966',
    managerWiki:'https://en.wikipedia.org/wiki/Thomas_Tuchel', starWiki:'https://en.wikipedia.org/wiki/Jude_Bellingham',
    identity:'Powerful attacking options, set-piece threat, and a midfield built to arrive late in the box.',
    squad:['Jordan Pickford|GK|Everton', 'John Stones|DEF|Manchester City', 'Marc Guehi|DEF|Crystal Palace', 'Kyle Walker|DEF|Manchester City', 'Luke Shaw|DEF|Manchester United', 'Declan Rice|MID|Arsenal', 'Kobbie Mainoo|MID|Manchester United', 'Jude Bellingham|MID|Real Madrid', 'Phil Foden|MID|Manchester City', 'Bukayo Saka|FWD|Arsenal', 'Harry Kane|FWD|Bayern Munich', 'Cole Palmer|FWD|Chelsea', 'Ollie Watkins|FWD|Aston Villa', 'Anthony Gordon|FWD|Newcastle United', 'Trent Alexander-Arnold|DEF|Liverpool']
  }
};

const HOST_STADIUMS = [
  { name:'Estadio Azteca', city:'Mexico City, Mexico', capacity:'87,523', matches:'Opening match, group stage', note:'The only stadium set to host matches in three different World Cups.', wiki:'https://en.wikipedia.org/wiki/Estadio_Azteca', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg/960px-Vista_a%C3%A9rea_del_Estadio_Azteca_-_2026_-_02.jpg' },
  { name:'Estadio Akron', city:'Guadalajara, Mexico', capacity:'46,232', matches:'Group stage', note:'Compact, loud, and built into a green bowl outside Guadalajara.', wiki:'https://en.wikipedia.org/wiki/Estadio_Akron', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_%283%29.jpg/960px-Estadio_Akron_02-07-2022_cabecera_sur_lado_derecho_%283%29.jpg' },
  { name:'Estadio BBVA', city:'Monterrey, Mexico', capacity:'53,500', matches:'Group stage, knockout path', note:'Mountain backdrop, steep bowl, and one of the tournament\'s sharpest silhouettes.', wiki:'https://en.wikipedia.org/wiki/Estadio_BBVA', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Mexico_Guadalupe_Monterrey_Estadio_BBVA_Bancomer_fifa_world_cup_2026_6.JPG/960px-Mexico_Guadalupe_Monterrey_Estadio_BBVA_Bancomer_fifa_world_cup_2026_6.JPG' },
  { name:'BMO Field', city:'Toronto, Canada', capacity:'30,000+', matches:'Canada opener, group stage', note:'Downtown Toronto pressure cooker beside Lake Ontario.', wiki:'https://en.wikipedia.org/wiki/BMO_Field', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Toronto_BMO_Field_in_2024.jpg/960px-Toronto_BMO_Field_in_2024.jpg' },
  { name:'BC Place', city:'Vancouver, Canada', capacity:'54,500', matches:'Group stage, round of 32', note:'Glass-roof theatre with a fast indoor feel.', wiki:'https://en.wikipedia.org/wiki/BC_Place', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/BC_Place_2015_Women%27s_FIFA_World_Cup.jpg/960px-BC_Place_2015_Women%27s_FIFA_World_Cup.jpg' },
  { name:'Mercedes-Benz Stadium', city:'Atlanta, USA', capacity:'71,000', matches:'Group stage, knockout showcase', note:'Indoor theatre with a huge roof halo and fast pitch atmosphere.', wiki:'https://en.wikipedia.org/wiki/Mercedes-Benz_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg/960px-Mercedes_Benz_Stadium_time_lapse_capture_2017-08-13.jpg' },
  { name:'Gillette Stadium', city:'Boston/Foxborough, USA', capacity:'65,878', matches:'Group stage, knockout path', note:'New England route stop with late-tournament edge.', wiki:'https://en.wikipedia.org/wiki/Gillette_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gillette_Stadium_%28Top_View%29.jpg/960px-Gillette_Stadium_%28Top_View%29.jpg' },
  { name:'AT&T Stadium', city:'Dallas, USA', capacity:'80,000', matches:'Semifinal route, high-pressure nights', note:'Scale, screens, and one of the biggest indoor stages in sport.', wiki:'https://en.wikipedia.org/wiki/AT%26T_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg/960px-Arlington_June_2020_4_%28AT%26T_Stadium%29.jpg' },
  { name:'NRG Stadium', city:'Houston, USA', capacity:'72,220', matches:'Group stage, knockout path', note:'Indoor heat shield for one of the busiest host routes.', wiki:'https://en.wikipedia.org/wiki/NRG_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Nrg_stadium.jpg/960px-Nrg_stadium.jpg' },
  { name:'Arrowhead Stadium', city:'Kansas City, USA', capacity:'76,416', matches:'Group stage', note:'Noise-first stadium culture built for tense group nights.', wiki:'https://en.wikipedia.org/wiki/Arrowhead_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg/960px-Aerial_view_of_Arrowhead_Stadium_08-31-2013.jpg' },
  { name:'SoFi Stadium', city:'Los Angeles, USA', capacity:'70,240', matches:'Group stage, knockout path', note:'Host spotlight bowl with a cinematic roof and boardwalk-scale energy.', wiki:'https://en.wikipedia.org/wiki/SoFi_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/SoFi_Stadium_2023.jpg/960px-SoFi_Stadium_2023.jpg' },
  { name:'Hard Rock Stadium', city:'Miami, USA', capacity:'64,767', matches:'Group stage, knockout path', note:'Latin American crossover energy and a potential Argentina-style home away from home.', wiki:'https://en.wikipedia.org/wiki/Hard_Rock_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg/960px-Hard_Rock_Stadium_for_Super_Bowl_LIV_%2849606710103%29.jpg' },
  { name:'MetLife Stadium', city:'New York/New Jersey, USA', capacity:'82,500', matches:'Final, knockouts', note:'The final-scale pressure room for the 2026 champion.', wiki:'https://en.wikipedia.org/wiki/MetLife_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Metlife_stadium_%28Aerial_view%29.jpg/960px-Metlife_stadium_%28Aerial_view%29.jpg' },
  { name:'Lincoln Financial Field', city:'Philadelphia, USA', capacity:'67,594', matches:'Group stage, round of 16', note:'East Coast intensity with a tight, vertical football bowl.', wiki:'https://en.wikipedia.org/wiki/Lincoln_Financial_Field', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Lincoln_Financial_Field_%28Aerial_view%29.jpg/960px-Lincoln_Financial_Field_%28Aerial_view%29.jpg' },
  { name:'Levi\'s Stadium', city:'San Francisco Bay Area, USA', capacity:'68,500', matches:'Group stage, knockout path', note:'West Coast route stop with tactical travel pressure.', wiki:'https://en.wikipedia.org/wiki/Levi%27s_Stadium', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg/250px-Levi%27s_Stadium_in_February_2016_prior_to_Super_Bowl_50_%2824398261729%29.jpg' },
  { name:'Lumen Field', city:'Seattle, USA', capacity:'68,740', matches:'Group stage, knockout path', note:'One of the loudest soccer atmospheres in North America.', wiki:'https://en.wikipedia.org/wiki/Lumen_Field', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/2026_FIFA_World_Cup_-_Belgium_v._Egypt_in_Seattle_-_04.jpg/250px-2026_FIFA_World_Cup_-_Belgium_v._Egypt_in_Seattle_-_04.jpg' }
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
  teams:       [],
  teamsByIso:  {},
  squads:      {},      // { [ISO3]: {coach, squad:[{name,short,position,number,age,club}]} }
  totalGoals:  0,
  topScorer:   '—',
  matchday:    'Pre-tournament',
  lastError:   '',
  lastErrorStatus: null,
};
window.__WCIM_DATA = () => ({ ...LIVE_DATA });

// ── proxy fetch helper ────────────────────────────────────────
async function fdFetch(fdPath, params = {}) {
  const qs  = new URLSearchParams({ path: fdPath, ...params });
  const res = await fetch(`${FD_PROXY}?${qs}`, { signal: AbortSignal.timeout(FD_TIMEOUT) });
  const text = await res.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { message: text }; }
  if (!res.ok) {
    const msg = body.message || body.error || `football-data returned ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.path = fdPath;
    throw err;
  }
  return body;
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
    homeTeam: { id: m.homeTeam?.id, name: m.homeTeam?.name || m.homeTeam?.shortName || '?', tla: m.homeTeam?.tla || '' },
    awayTeam: { id: m.awayTeam?.id, name: m.awayTeam?.name || m.awayTeam?.shortName || '?', tla: m.awayTeam?.tla || '' },
    score:    {
      home: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      away: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
      halfTime: {
        home: m.score?.halfTime?.home ?? null,
        away: m.score?.halfTime?.away ?? null
      }
    },
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
    const letter = (s.group || s.stage || '').replace('GROUP_','').replace(/^Group\s+/i, '') || '?';
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
    tla:     s.team?.tla || '',
    goals:   s.goals   ?? s.numberOfGoals ?? 0,
    assists: s.assists  ?? 0,
    played:  s.playedMatches ?? 0,
    penalties: s.penalties ?? 0,
  }));
  LIVE_DATA.totalGoals = LIVE_DATA.scorers.reduce((t, s) => t + s.goals, 0);
  LIVE_DATA.topScorer  = LIVE_DATA.scorers[0]?.short || '—';
}

// ── fetch squad on demand (when nation panel opens) ───────────
// football-data.org team IDs for WC2026 squads
function normaliseTeam(t) {
  const iso = t.area?.code || t.tla || '';
  return {
    id: t.id,
    iso,
    tla: t.tla || iso,
    name: t.shortName || t.name || '?',
    fullName: t.name || t.shortName || '?',
    crest: t.crest || t.area?.flag || '',
    founded: t.founded || null,
    colors: t.clubColors || '',
    website: t.website || '',
    coach: t.coach?.name || '',
    squad: (t.squad || []).map(p => ({
      id: p.id,
      name: p.name || '?',
      short: p.shortName || p.name || '?',
      position: p.position || 'Player',
      age: p.dateOfBirth
        ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (365.25 * 86400000))
        : null,
      nationality: p.nationality || '',
    }))
  };
}

async function fetchTeams() {
  const data = await fdFetch(`/v4/competitions/${FD_COMP}/teams`);
  LIVE_DATA.teams = (data.teams || []).map(normaliseTeam);
  LIVE_DATA.teamsByIso = {};
  LIVE_DATA.teams.forEach(team => {
    if (team.iso) LIVE_DATA.teamsByIso[team.iso] = team;
    if (team.tla) LIVE_DATA.teamsByIso[team.tla] = team;
  });
}

function liveTeamForNation(n) {
  if (!n) return null;
  return LIVE_DATA.teamsByIso[n.iso]
    || (TEAM_CODE_ALIASES[n.iso] || []).map(code => LIVE_DATA.teamsByIso[code]).find(Boolean)
    || LIVE_DATA.teams.find(team => normalizeName(team.name) === normalizeName(n.name))
    || LIVE_DATA.teams.find(team => normalizeName(team.fullName) === normalizeName(n.name))
    || null;
}

function managerForNation(n, liveTeam = null) {
  return liveTeam?.coach || MANAGER_OVERRIDES[n?.iso] || null;
}

function nationMatchesLiveCode(n, code) {
  if (!n || !code) return false;
  return n.iso === code || (TEAM_CODE_ALIASES[n.iso] || []).includes(code);
}

function nationForLiveRow(row) {
  const code = row?.tla || row?.iso || '';
  const rowName = row?.team || row?.name || '';
  return WC_NATIONS.find(n => nationMatchesLiveCode(n, code))
    || WC_NATIONS.find(n => normalizeName(n.name) === normalizeName(rowName))
    || { name: rowName || '?', iso: code, group: row?.group || '' };
}

async function fetchSquad(iso3) {
  if (LIVE_DATA.squads[iso3]) return LIVE_DATA.squads[iso3];
  if (!LIVE_DATA.teams.length) await fetchTeams();
  const team = liveTeamForNation(WC_NATIONS.find(n => n.iso === iso3));
  if (!team) return null;
  try {
    const result = { coach: team.coach || MANAGER_OVERRIDES[iso3] || null, squad: team.squad };
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
  const results = await Promise.allSettled([fetchMatches(), fetchStandings(), fetchScorers(), fetchTeams()]);
  const anyOk   = results.some(r => r.status === 'fulfilled');

  if (anyOk) {
    LIVE_DATA.isLive   = true;
    LIVE_DATA.fetchedAt = new Date().toISOString();
    LIVE_DATA.lastError = '';
    LIVE_DATA.lastErrorStatus = null;
  } else {
    const reason = results.find(r => r.status === 'rejected')?.reason;
    LIVE_DATA.isLive = false;
    LIVE_DATA.lastError = reason?.message || 'Live feed unavailable';
    LIVE_DATA.lastErrorStatus = reason?.status || null;
  }

  results.forEach((r, i) => {
    if (r.status === 'rejected')
      console.info('[WCIM]', ['matches','standings','scorers','teams'][i], 'unavailable:', r.reason?.message);
  });

  // Update all live surfaces
  updateGlobeStats();
  updateTickerFromLive();
  updateSmallLiveBar();
  updateLeaderboard();
  if (document.getElementById('feature-hub')?.classList.contains('visible')) {
    const active = document.querySelector('.nav-pill.active')?.dataset.view;
    if (active === 'live')   document.getElementById('feature-panel').innerHTML = renderLiveView();
    if (active === 'groups') document.getElementById('feature-panel').innerHTML = renderGroupsView();
    if (active === 'stats')  document.getElementById('feature-panel').innerHTML = renderStatsView();
  }
  if (document.getElementById('nation-panel')?.classList.contains('visible')) {
    const iso = document.getElementById('globe-container')?.dataset.selectedIso;
    const nation = WC_NATIONS.find(n => n.iso === iso);
    if (nation) renderNationPanel(nation);
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
function matchScoreText(match) {
  const home = match?.score?.home;
  const away = match?.score?.away;
  return home == null || away == null ? 'vs' : `${home}-${away}`;
}

function liveTeamName(team) {
  const name = team?.name || team?.shortName || '';
  return !name || name === '?' ? 'TBC' : name;
}

function matchStageText(match) {
  const bits = [
    matchStatusLabel(match?.status),
    match?.stage ? titleCaseWords(String(match.stage).replaceAll('_', ' ')) : '',
    match?.group ? `Group ${match.group}` : ''
  ].filter(Boolean);
  return bits.join(' / ');
}

function liveMinuteText(match) {
  if (!match) return '';
  if (match.minute) return `${match.minute}'`;
  if (match.status === 'IN_PLAY' && match.utcDate) {
    const elapsed = Math.max(1, Math.floor((Date.now() - new Date(match.utcDate).getTime()) / 60000) + 1);
    if (elapsed <= 45) return `${elapsed}'`;
    if (elapsed <= 60) return '45+';
    if (elapsed <= 120) return `${Math.min(90, elapsed - 15)}'`;
  }
  if (match.status === 'PAUSED') return 'HT';
  if (match.status === 'IN_PLAY') return 'Live';
  return matchStatusLabel(match.status);
}

function scorerSummary(match) {
  if (!match) return '';
  const home = match.homeTeam?.name || 'Home';
  const away = match.awayTeam?.name || 'Away';
  const htHome = match.score?.halfTime?.home;
  const htAway = match.score?.halfTime?.away;
  const ftHome = match.score?.home;
  const ftAway = match.score?.away;
  if (ftHome == null || ftAway == null || (ftHome === 0 && ftAway === 0)) return 'No goals yet';
  if (htHome == null || htAway == null) {
    const parts = [];
    if (ftHome) parts.push(`${home}: ${ftHome} goal${ftHome === 1 ? '' : 's'}`);
    if (ftAway) parts.push(`${away}: ${ftAway} goal${ftAway === 1 ? '' : 's'}`);
    return parts.join(' / ');
  }
  const parts = [];
  if (htHome) parts.push(`${home}: ${htHome} first-half goal${htHome === 1 ? '' : 's'}`);
  if (ftHome - htHome > 0) parts.push(`${home}: ${ftHome - htHome} second-half goal${ftHome - htHome === 1 ? '' : 's'}`);
  if (htAway) parts.push(`${away}: ${htAway} first-half goal${htAway === 1 ? '' : 's'}`);
  if (ftAway - htAway > 0) parts.push(`${away}: ${ftAway - htAway} second-half goal${ftAway - htAway === 1 ? '' : 's'}`);
  return parts.join(' / ') || 'No goal event names in feed';
}

function isStaleLiveMatch(match) {
  if (!match || (match.status !== 'IN_PLAY' && match.status !== 'PAUSED') || !match.utcDate) return false;
  return Date.now() - new Date(match.utcDate).getTime() > 150 * 60 * 1000;
}

function matchWinnerText(match) {
  const home = match?.score?.home;
  const away = match?.score?.away;
  if (home == null || away == null || home === away) return 'Result';
  return `${home > away ? match.homeTeam?.name : match.awayTeam?.name} advance`;
}

function updateSmallLiveBar() {
  const bar = document.getElementById('live-match-bar');
  if (!bar) return;
  const active = LIVE_DATA.matches.find(m => (m.status === 'IN_PLAY' || m.status === 'PAUSED') && !isStaleLiveMatch(m));
  const result = [...LIVE_DATA.matches]
    .filter(m => m.status === 'FINISHED' || isStaleLiveMatch(m))
    .sort((a, b) => new Date(b.utcDate || 0) - new Date(a.utcDate || 0))[0];
  const next = LIVE_DATA.matches.find(m => m.status === 'TIMED' || m.status === 'SCHEDULED');
  const match = active || result || next;
  if (!match) {
    bar.classList.add('is-hidden');
    return;
  }

  const isLive = !!active;
  const isResult = !isLive && !!result;
  const state = bar.querySelector('.live-state');
  const title = bar.querySelector('.live-match-title');
  const score = bar.querySelector('.live-scoreline');
  const stage = bar.querySelector('.live-stage');
  const homeName = bar.querySelector('.live-team.home');
  const awayName = bar.querySelector('.live-team.away');
  const nextLabel = bar.querySelector('.live-next-row strong');
  const scorers = bar.querySelector('.live-scorers');
  const date = match.utcDate ? new Date(match.utcDate) : null;
  const time = date ? date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';
  const nextDate = next?.utcDate ? new Date(next.utcDate) : null;
  const nextTime = nextDate ? nextDate.toLocaleDateString('en-US', { month:'short', day:'numeric' }) + ' ' + nextDate.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

  bar.classList.toggle('is-upcoming', !isLive && !isResult);
  bar.classList.toggle('is-result', isResult);
  bar.classList.remove('is-hidden');
  if (state) state.textContent = isLive ? liveMinuteText(match) : isResult ? 'FT' : 'Next';
  if (title) title.textContent = `${liveTeamName(match.homeTeam)} vs ${liveTeamName(match.awayTeam)}`;
  if (score) score.textContent = (isLive || isResult) ? matchScoreText(match) : time;
  if (stage) stage.textContent = isResult ? `${matchWinnerText(match)} / ${match.stage ? titleCaseWords(String(match.stage).replaceAll('_', ' ')) : 'Result'}` : matchStageText(match);
  if (homeName) homeName.textContent = liveTeamName(match.homeTeam);
  if (awayName) awayName.textContent = liveTeamName(match.awayTeam);
  if (scorers) scorers.textContent = (isLive || isResult) ? scorerSummary(match) : 'Goal details on kickoff';
  if (nextLabel) {
    nextLabel.textContent = next
      ? `${liveTeamName(next.homeTeam)} vs ${liveTeamName(next.awayTeam)}${nextTime ? ` / ${nextTime}` : ''}`
      : 'Final path pending';
  }
}

const PLAYER_STAT_TABS = [
  { key:'goals', label:'Goals' }, { key:'assists', label:'Assists' },
  { key:'xg', label:'xG' }, { key:'shots', label:'Shots on Target' },
  { key:'chances', label:'Key Passes' }, { key:'clean', label:'Clean Sheets' },
  { key:'saves', label:'Saves' }, { key:'tackles', label:'Tackles Won' },
  { key:'interceptions', label:'Interceptions' }, { key:'motm', label:'MOTM' },
  { key:'yellow', label:'Yellow Cards' }, { key:'red', label:'Red Cards' }
];
const PLAYER_STAT_LABELS = {
  goals: 'Goals',
  assists: 'Assists',
  played: 'Matches',
  penalties: 'Penalties',
  xg: 'xG',
  shots: 'Shots',
  chances: 'Key Passes',
  clean: 'Clean Sheets',
  saves: 'Saves',
  tackles: 'Tackles',
  interceptions: 'Interceptions',
  motm: 'MOTM',
  yellow: 'Yellow Cards',
  red: 'Red Cards'
};
const LIVE_PLAYER_STAT_KEYS = new Set(['goals']);

const PLAYER_STATS = {
  goals: [['Kylian Mbappe','France','KM',8], ['Lionel Messi','Argentina','LM',8], ['Erling Haaland','Norway','EH',7], ['Harry Kane','England','HK',6], ['Jude Bellingham','England','JB',6], ['Mikel Oyarzabal','Spain','MO',5], ['Ousmane Dembele','France','OD',5], ['Julian Quinones','Mexico','JQ',4], ['Vinicius Junior','Brazil','VJ',4], ['Ismaila Sarr','Senegal','IS',4]],
  assists: [['Michael Olise','France','MO',5], ['Lionel Messi','Argentina','LM',4], ['Bruno Guimaraes','Brazil','BG',4], ['Brahim Diaz','Morocco','BD',4], ['Martin Odegaard','Norway','MO',4], ['Kylian Mbappe','France','KM',3], ['Andreas Schjelderup','Norway','AS',3], ['Roberto Alvarado','Mexico','RA',3], ['Alexander Isak','Sweden','AI',3], ['Florian Wirtz','Germany','FW',3]],
  xg: [['Kylian Mbappe','France','KM','5.48'], ['Lionel Messi','Argentina','LM','5.26'], ['Erling Haaland','Norway','EH','4.43'], ['Ismaila Sarr','Senegal','IS','3.68'], ['Mikel Oyarzabal','Spain','MO','2.78'], ['Harry Kane','England','HK','2.66'], ['Jude Bellingham','England','JB','2.62'], ['Julian Quinones','Mexico','JQ','1.61'], ['Ousmane Dembele','France','OD','1.58'], ['Romelu Lukaku','Belgium','RL','1.01']],
  shots: [['Lionel Messi','Argentina','LM',34], ['Kylian Mbappe','France','KM',33], ['Erling Haaland','Norway','EH',20], ['Harry Kane','England','HK',18], ['Ousmane Dembele','France','OD',18], ['Jude Bellingham','England','JB',17], ['Mikel Oyarzabal','Spain','MO',17], ['Ismaila Sarr','Senegal','IS',17], ['Julian Quinones','Mexico','JQ',14], ['Vinicius Junior','Brazil','VJ',14]],
  chances: [['Michael Olise','France','MO',23], ['Lionel Messi','Argentina','LM',22], ['Lamine Yamal','Spain','LY',18], ['Dani Olmo','Spain','DO',16], ['Brahim Diaz','Morocco','BD',15], ['Martin Odegaard','Norway','MO',15], ['Bruno Guimaraes','Brazil','BG',14], ['Alexis Mac Allister','Argentina','AM',13], ['Kylian Mbappe','France','KM',12], ['Anthony Gordon','England','AG',12]],
  clean: [['Unai Simon','Spain','US',6], ['Emiliano Martinez','Argentina','EM',4], ['Mike Maignan','France','MM',4], ['Jordan Pickford','England','JP',4], ['Orlando Gill','Paraguay','OG',3], ['Yassine Bounou','Morocco','YB',3], ['Gregor Kobel','Switzerland','GK',3], ['Yann Sommer','Switzerland','YS',3], ['Diogo Costa','Portugal','DC',2], ['Alisson Becker','Brazil','AB',2]],
  saves: [['Orlando Gill','Paraguay','OG',23], ['Eloy Room','Curacao','ER',20], ['Gregor Kobel','Switzerland','GK',20], ['Diogo Costa','Portugal','DC',19], ['Vozinha','Cape Verde','VZ',18], ['Emiliano Martinez','Argentina','EM',18], ['Jordan Pickford','England','JP',17], ['Mike Maignan','France','MM',16], ['Unai Simon','Spain','US',15], ['Yassine Bounou','Morocco','YB',15]],
  tackles: [['Declan Rice','England','DR',33], ['Rodri','Spain','RD',32], ['Cristian Romero','Argentina','CR',29], ['Aurelien Tchouameni','France','AT',28], ['Alexis Mac Allister','Argentina','AM',27], ['Pau Cubarsi','Spain','PC',26], ['John Stones','England','JS',25], ['Marc Cucurella','Spain','MC',24], ['Leandro Paredes','Argentina','LP',23], ['Sofyan Amrabat','Morocco','SA',22]],
  interceptions: [['Pau Cubarsi','Spain','PC',21], ['Cristian Romero','Argentina','CR',20], ['John Stones','England','JS',19], ['William Saliba','France','WS',17], ['Rodri','Spain','RD',17], ['Nicolas Otamendi','Argentina','NO',16], ['Marc Cucurella','Spain','MC',16], ['Declan Rice','England','DR',15], ['Jules Kounde','France','JK',15], ['Achraf Hakimi','Morocco','AH',14]],
  motm: [['Lionel Messi','Argentina','LM',5], ['Jude Bellingham','England','JB',4], ['Lamine Yamal','Spain','LY',4], ['Michael Olise','France','MO',3], ['Kylian Mbappe','France','KM',3], ['Rodri','Spain','RD',3], ['Mikel Oyarzabal','Spain','MO',3], ['Dani Olmo','Spain','DO',2], ['Ousmane Dembele','France','OD',2], ['Jordan Pickford','England','JP',2]],
  yellow: [['Nicolas Tagliafico','Argentina','NT',3], ['Cristian Romero','Argentina','CR',3], ['Lamine Yamal','Spain','LY',2], ['Rodri','Spain','RD',2], ['Leandro Paredes','Argentina','LP',2], ['Declan Rice','England','DR',2], ['Breel Embolo','Switzerland','BE',2], ['Michael Olise','France','MO',2], ['Granit Xhaka','Switzerland','GX',2], ['Sofyan Amrabat','Morocco','SA',2]],
  red: [['Jarell Quansah','England','JQ',1], ['Nathan Ngoy','Belgium','NN',1], ['Tarik Muharemovic','Bosnia','TM',1], ['Agustin Canobbio','Uruguay','AC',1], ['Piero Hincapie','Ecuador','PH',1], ['Folarin Balogun','USA','FB',1], ['Breel Embolo','Switzerland','BE',1], ['Miguel Almiron','Paraguay','MA',1], ['Achraf Hakimi','Morocco','AH',1], ['Robin Gosens','Germany','RG',1]]
};

function initPlayerLeaderboard() {
  const tabsWrap = document.querySelector('.lb-tabs');
  const board = document.getElementById('stats-leaderboard');
  if (!tabsWrap || !board) return;
  tabsWrap.innerHTML = PLAYER_STAT_TABS.map((tab, i) =>
    `<button class="lb-tab${i === 0 ? ' active' : ''}" data-lb="${tab.key}">${tab.label}</button>`
  ).join('');
  board.querySelectorAll('.lb-rows').forEach(row => row.remove());
  board.insertAdjacentHTML('beforeend', PLAYER_STAT_TABS.map((tab, i) =>
    `<div class="lb-rows" data-tab="${tab.key}" style="${i === 0 ? '' : 'display:none'}"></div>`
  ).join(''));
  tabsWrap.querySelectorAll('.lb-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsWrap.querySelectorAll('.lb-tab').forEach(tab => tab.classList.toggle('active', tab === btn));
      renderLeaderboardTab(btn.dataset.lb);
    });
  });
  renderLeaderboardTab('goals');
}

function updateLeaderboard() {
  // Re-render whichever tab is currently active
  const activeTab = document.querySelector('.lb-tab.active')?.dataset.lb || 'goals';
  renderLeaderboardTab(activeTab);
}

function renderLeaderboardTab(tab) {
  const allRows = document.querySelectorAll('.lb-rows');
  allRows.forEach(r => { r.style.display = r.dataset.tab === tab ? 'block' : 'none'; });

  let rows = [];
  const isLiveStat = LIVE_DATA.scorers.length && LIVE_PLAYER_STAT_KEYS.has(tab);
  if (isLiveStat) {
    rows = [...LIVE_DATA.scorers]
      .sort((a, b) => (b[tab] || 0) - (a[tab] || 0))
      .slice(0, 10)
      .map(p => ({
        player: p.short || p.player,
        team: p.team,
        initials: (p.short || p.player).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        value: p[tab] ?? 0
      }));
  } else {
    const staticRows = PLAYER_STATS[tab] || PLAYER_STATS.goals;
    rows = staticRows.map(([player, team, initials, value]) => ({ player, team, initials, value }));
  }

  const rankClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

  const activeRows = document.querySelector(`.lb-rows[data-tab="${tab}"]`);
  if (!activeRows) return;

  activeRows.innerHTML = rows.slice(0, 10).map((p, i) => `<div class="lb-row">
      <div class="lb-rank ${rankClass(i)}">${i + 1}</div>
      <div class="lb-avatar">${escapeHtml(p.initials)}</div>
      <div class="lb-info">
        <span class="lb-name">${escapeHtml(p.player)}</span>
        <span class="lb-country">${escapeHtml(p.team)}</span>
      </div>
      <div class="lb-value">${escapeHtml(String(p.value))}</div>
    </div>`).join('');

  const label = document.getElementById('lb-stat-label');
  if (label) label.textContent = PLAYER_STAT_LABELS[tab] || 'Goals';

  const noteEl = document.querySelector('.data-note');
  if (noteEl && LIVE_PLAYER_STAT_KEYS.has(tab) && !LIVE_DATA.isLive) {
    noteEl.innerHTML = `<strong>Live API offline</strong> - ${escapeHtml(LIVE_DATA.lastError || 'Add a valid football-data token to load this stat live.')}`;
  }
  if (noteEl && !LIVE_PLAYER_STAT_KEYS.has(tab)) {
    noteEl.innerHTML = `<strong>Manual snapshot</strong> - football-data.org does not verify ${escapeHtml(PLAYER_STAT_LABELS[tab] || tab)} here, so this tab uses the latest final-week board.`;
  }
  if (noteEl && LIVE_DATA.isLive && isLiveStat) {
    const d = new Date(LIVE_DATA.fetchedAt);
    noteEl.innerHTML = `<strong>Live API</strong> - Updated ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} via football-data.org`;
  }
}

// LIVE MATCHES hub view ─────────────────────────────────────
initPlayerLeaderboard();

function liveFeedNote(surface = 'data') {
  if (LIVE_DATA.isLive) {
    const d = new Date(LIVE_DATA.fetchedAt);
    return `<p class="hub-data-note live-ok">Live ${escapeHtml(surface)} loaded from football-data.org · Updated ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>`;
  }
  const reason = LIVE_DATA.lastError
    ? `${LIVE_DATA.lastErrorStatus ? `HTTP ${LIVE_DATA.lastErrorStatus}: ` : ''}${LIVE_DATA.lastError}`
    : 'Waiting for a valid football-data API response.';
  return `<p class="hub-data-note">Live ${escapeHtml(surface)} unavailable · ${escapeHtml(reason)}</p>`;
}

function renderLiveView() {
  const active   = LIVE_DATA.matches.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED');
  const upcoming = LIVE_DATA.matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED').slice(0, 6);
  const toRender = active.length ? active.slice(0, 6) : upcoming;

  if (!toRender.length) {
    // Static fallback cards until API responds
    return `
      ${liveFeedNote('match')}
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
// STATIC FALLBACK DATA
const BRACKET_PATH = [
  { round:'Round of 32', slots:['A1 vs 3rd B/E/F', 'C1 vs D2', 'I1 vs J2', 'K1 vs L2'], note:'48-team format opens the knockout with 32 survivors.' },
  { round:'Round of 16', slots:['Winner 1 vs Winner 2', 'Winner 3 vs Winner 4', 'Best seeded route', 'Host-side route'], note:'Travel, rest days, and venue heat start to matter.' },
  { round:'Quarterfinals', slots:['East coast lane', 'Central lane', 'West coast lane', 'Mexico/Canada lane'], note:'Eight teams, four pressure rooms.' },
  { round:'Semifinals', slots:['Semifinal 1', 'Semifinal 2'], note:'Two matches decide the MetLife final.' },
  { round:'Final', slots:['Final - MetLife Stadium'], note:'Champion crowned in New York/New Jersey.' }
];

const HISTORY_TIMELINE = [
  { year:'1950', host:'Brazil', winner:'Uruguay', moment:'Maracanazo', final:'Uruguay 2-1 Brazil', fact:'Brazil only needed a draw in Rio, but Alcides Ghiggia\'s late winner stunned the Maracana and created football\'s original national heartbreak.', wiki:'Maracanazo', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Gol_ghiggia_vs_brasil.jpg/960px-Gol_ghiggia_vs_brasil.jpg', caption:'Ghiggia scores the goal that silenced Rio.' },
  { year:'1958', host:'Sweden', winner:'Brazil', moment:'Pele arrives', final:'Brazil 5-2 Sweden', fact:'A 17-year-old Pele scores in the final and turns Brazil from contender into myth.', wiki:'Pel%C3%A9', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pel%C3%A9_goal_1958_WC_final.jpg/960px-Pel%C3%A9_goal_1958_WC_final.jpg', caption:'Pele scoring in the 1958 World Cup final.' },
  { year:'1970', host:'Mexico', winner:'Brazil', moment:'Carlos Alberto team goal', final:'Brazil 4-1 Italy', fact:'Nine Brazilian outfield players touch the ball before Carlos Alberto smashes in the perfect final goal.', wiki:'Brazil_v_Italy_(1970_FIFA_World_Cup)', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Brazil_v_italy_1970_06.jpg/960px-Brazil_v_italy_1970_06.jpg', caption:'The beautiful game in one move.' },
  { year:'1974', host:'West Germany', winner:'West Germany', moment:'Cruyff vs Beckenbauer', final:'West Germany 2-1 Netherlands', fact:'Cruyff\'s Total Football reached the final, but Beckenbauer\'s West Germany turned the great Dutch idea into heartbreak.', wiki:'Johan_Cruyff', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Beckenbauer_cruyff_alfieri.jpg/960px-Beckenbauer_cruyff_alfieri.jpg', caption:'Cruyff and Beckenbauer in the 1974 final.' },
  { year:'1986', host:'Mexico', winner:'Argentina', moment:'Hand of God', final:'Argentina 2-1 England', fact:'Maradona punches in one goal, then scores the Goal of the Century minutes later. Controversy and genius, same match.', wiki:'Argentina_v_England_(1986_FIFA_World_Cup)', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Maradona_shilton_mano_dios.jpg/960px-Maradona_shilton_mano_dios.jpg', caption:'Maradona and Shilton in the Hand of God moment.' },
  { year:'1998', host:'France', winner:'France', moment:'Stade de France coronation', final:'France 3-0 Brazil', fact:'Two Zidane headers in Paris turn France from host nation into world champion.', wiki:'1998_FIFA_World_Cup_final', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Euro_2016_stade_de_France_France-Roumanie_%2827307532960%29.jpg/960px-Euro_2016_stade_de_France_France-Roumanie_%2827307532960%29.jpg', caption:'Stade de France, the venue for Zidane\'s 1998 final.' },
  { year:'2006', host:'Germany', winner:'Italy', moment:'Zidane headbutt', final:'Italy 1-1 France', fact:'Zidane\'s last match swings from Panenka penalty to red card before Italy wins the shootout.', wiki:'2006_FIFA_World_Cup_final', image:'assets/images/history/zidane-headbutt.webp', caption:'Zidane and Materazzi in the 2006 final flashpoint.' },
  { year:'2010', host:'South Africa', winner:'Spain', moment:'Spain lifts its first cup', final:'Spain 1-0 Netherlands', fact:'Iniesta finishes late, Spain completes its possession dynasty, and South Africa gets an unforgettable first African World Cup.', wiki:'2010_FIFA_World_Cup_final', image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/FIFA_World_Cup_2010_Spain_with_cup.jpg/960px-FIFA_World_Cup_2010_Spain_with_cup.jpg', caption:'Spain with the trophy after the 2010 final.' },
  { year:'2014', host:'Brazil', winner:'Germany', moment:'7-1 in Belo Horizonte', final:'Germany 7-1 Brazil', fact:'Germany scores five in 29 minutes and turns a semifinal into the most surreal scoreboard in modern football.', wiki:'Brazil_v_Germany_(2014_FIFA_World_Cup)', image:'assets/images/history/brazil-7-1.jpg', caption:'Brazil players react after the 7-1 semifinal collapse.' },
  { year:'2022', host:'Qatar', winner:'Argentina', moment:'Messi vs Mbappe final', final:'Argentina 3-3 France', fact:'Messi and Mbappe trade destiny for 120 minutes before Argentina wins the penalty epic.', wiki:'2022_FIFA_World_Cup_final', image:'assets/images/history/wc-2022-messi.jpg', caption:'Messi finally lifts the trophy that completed his story.' }
];

const WC26_MOMENTS = [
  {
    tag:'Final set',
    title:'Spain And Argentina For The Cup',
    dek:'The 104th match is locked: Spain meet defending champions Argentina at New York New Jersey Stadium on July 19.',
    source:'FIFA',
    href:'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-live-watch-teams-tickets',
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Metlife%20stadium%20%28Aerial%20view%29.jpg?width=960',
    fallbackImage:'assets/images/brand/world-cup-trophy.webp'
  },
  {
    tag:'Icon duel',
    title:'Messi Meets Yamal In A Final',
    dek:'The final has a generational hook: Argentina built around Messi, Spain powered by Lamine Yamal and a control-first midfield.',
    source:'Guardian',
    href:'https://www.theguardian.com/football/live/2026/jul/17/world-cup-2026-spain-v-argentina-countdown-trump-to-attend-final-england-news-live',
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Lamine%20Yamal%20in%202025%20%28cropped2%29.jpg?width=760',
    fallbackImage:'assets/images/history/wc-2022-messi.jpg'
  },
  {
    tag:'Comeback',
    title:'Argentina Break England Late',
    dek:'Anthony Gordon put England ahead, but Enzo Fernandez and Lautaro Martinez sent Argentina into another final.',
    source:'AP News',
    href:'https://apnews.com/article/afa13ed9fa933f8b75bd56eb16546031',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Argentina_champion_of_the_FIFA_World_Cup_Qatar_2022.jpg/960px-Argentina_champion_of_the_FIFA_World_Cup_Qatar_2022.jpg',
    fallbackImage:'assets/images/history/wc-2022-messi.jpg'
  },
  {
    tag:'England',
    title:'Tuchel Takes The Heat',
    dek:'England are left with the third-place match after tactical criticism and a painful 2-1 semi-final collapse in Atlanta.',
    source:'Guardian',
    href:'https://www.theguardian.com/football/live/2026/jul/16/world-cup-2026-argentina-break-england-hearts-and-head-for-final-with-spain-live',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/England_national_football_team_2018.jpg/960px-England_national_football_team_2018.jpg',
    fallbackImage:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Jude_Bellingham_2023.jpg/640px-Jude_Bellingham_2023.jpg'
  },
  {
    tag:'Spain watch',
    title:'Smoke Disrupts Final Prep',
    dek:'Wildfire smoke around New Jersey has complicated Spain training before the final, though conditions are expected to improve.',
    source:'talkSPORT',
    href:'https://talksport.com/football/world-cup/4436395/spain-world-cup-final-canada-wildfires-smoke-new-jersey/',
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Metlife%20stadium%20%28Aerial%20view%29.jpg?width=960',
    fallbackImage:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/FIFA_World_Cup_2010_Spain_with_cup.jpg/960px-FIFA_World_Cup_2010_Spain_with_cup.jpg'
  },
  {
    tag:'Discipline',
    title:'FIFA Reviews Argentina Banner',
    dek:'Argentina celebrations after the England win triggered a FIFA disciplinary review over a Falklands/Malvinas political message.',
    source:'talkSPORT',
    href:'https://talksport.com/football/world-cup/4436200/fifa-statement-argentina-falklands-government-england/',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Argentina_champion_of_the_FIFA_World_Cup_Qatar_2022.jpg/960px-Argentina_champion_of_the_FIFA_World_Cup_Qatar_2022.jpg',
    fallbackImage:'assets/images/history/wc-2022-messi.jpg'
  },
  {
    tag:'Golden Boot',
    title:'Messi And Mbappe Tied On Eight',
    dek:'The Golden Boot race is level on goals, with Messi ahead on assists before Argentina face Spain and France face England.',
    source:'New York Post',
    href:'https://nypost.com/2026/07/17/betting/world-cup-golden-boot-race-picks-should-you-bet-kylian-mbappe-or-lionel-messi/',
    image:'assets/images/history/wc-2022-messi.jpg',
    fallbackImage:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/France_champion_of_the_Football_World_Cup_Russia_2018.jpg/960px-France_champion_of_the_Football_World_Cup_Russia_2018.jpg'
  },
  {
    tag:'Golden Glove',
    title:'Unai Simon Leads The Glove Race',
    dek:'Spain reach the final with the tournament clean-sheet leader and one of the strongest defensive runs of the whole World Cup.',
    source:'talkSPORT',
    href:'https://talksport.com/betting/4356447/world-cup-odds-2026/',
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Unai%20Sim%C3%B3n.jpg?width=640',
    fallbackImage:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Spain_national_football_team_Euro_2012_final.jpg/960px-Spain_national_football_team_Euro_2012_final.jpg'
  },
  {
    tag:'Assists',
    title:'Olise Still Owns The Creator Board',
    dek:'Michael Olise remains top of the assist race, even after Spain shut down France in the semi-final.',
    source:'Sofascore',
    href:'https://www.sofascore.com/news/world-cup-2026-most-assists-olise-leads-pack',
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/El%20Hadji%20Malick%20Diouf%20Michael%20Olise%20France%20v%20Senegal%2016%20June%202026-362.jpg?width=960',
    fallbackImage:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/FIFA_World_Cup_2010_Spain_with_cup.jpg/960px-FIFA_World_Cup_2010_Spain_with_cup.jpg'
  },
  {
    tag:'Third place',
    title:'England Get France Next',
    dek:'England and France meet in Miami for third place, with both sides trying to leave the tournament with a final statement.',
    source:'talkSPORT',
    href:'https://talksport.com/football/world-cup/4437519/england-vs-france-referee-world-cup-jesus-valenzuela-saez/',
    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/England_national_football_team_2018.jpg/960px-England_national_football_team_2018.jpg',
    fallbackImage:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/France_champion_of_the_Football_World_Cup_Russia_2018.jpg/960px-France_champion_of_the_Football_World_Cup_Russia_2018.jpg'
  },
  {
    tag:'White House',
    title:'Trump To Attend The Final',
    dek:'The White House says Donald Trump will attend the World Cup final, while Argentina president Javier Milei is set to skip it.',
    source:'Times of India',
    href:'https://timesofindia.indiatimes.com/world/us/trump-will-attend-fifa-world-cup-final-says-white-house-argentina-prez-milei-to-skip-event/articleshow/132454212.cms',
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Metlife%20stadium%20%28Aerial%20view%29.jpg?width=960',
    fallbackImage:'assets/images/brand/world-cup-trophy.webp'
  },
  {
    tag:'Viral detail',
    title:'Pickford Bottle Becomes A Story',
    dek:'Messi spotted England goalkeeper Jordan Pickford\'s penalty cheat sheet after Argentina avoided a shootout anyway.',
    source:'People',
    href:'https://people.com/lionel-messi-discovers-england-goalies-water-bottle-cheat-sheet-world-cup-game-12020798',
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Jordan%20Pickford%20England%20v%20Ghana%2023%20June%202026-004.jpg?width=640',
    fallbackImage:'assets/images/history/wc-2022-messi.jpg'
  },
  {
    tag:'France',
    title:'Deschamps Exit Looms',
    dek:'France head toward the third-place match with Didier Deschamps expected to step aside and Zidane talk growing louder.',
    source:'Guardian',
    href:'https://www.theguardian.com/football/live/2026/jul/17/world-cup-2026-spain-v-argentina-countdown-trump-to-attend-final-england-news-live',
    image:'assets/images/history/zidane-headbutt.webp',
    fallbackImage:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/France_champion_of_the_Football_World_Cup_Russia_2018.jpg/960px-France_champion_of_the_Football_World_Cup_Russia_2018.jpg'
  },
  {
    tag:'Final ball',
    title:'TRIONDA Final Takes The Stage',
    dek:'The gold, black, and white final ball is part of the visual identity for the semi-finals and New Jersey showpiece.',
    source:'FIFA',
    href:'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-live-watch-teams-tickets',
    image:'assets/images/brand/jabulani.jpg',
    fallbackImage:'assets/images/brand/jabulani.jpg'
  }
];

function mediaImage(src, alt, fallback = '') {
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" data-fallback="${escapeHtml(fallback)}" onload="this.classList.add('loaded')" onerror="swapImageFallback(this)">`;
}

function swapImageFallback(img) {
  const fallback = img.dataset.fallback;
  if (fallback && img.src !== fallback && !img.dataset.usedFallback) {
    img.dataset.usedFallback = '1';
    img.src = fallback;
    return;
  }
  img.classList.add('loaded', 'image-missing');
  img.removeAttribute('src');
}

const LIVE_LINKS = [
  { label:'FIFA news', href:'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/news' },
  { label:'Google news', href:'https://news.google.com/search?q=FIFA%20World%20Cup%202026' },
  { label:'Fixtures', href:'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/fixtures-results' },
  { label:'AP World Cup', href:'https://apnews.com/hub/world-cup' }
];

const FEATURE_TITLES = {
  overview:['Platform layer', 'World Cup Command'],
  groups:['Group stage', 'Tables & Routes'],
  bracket:['Knockout stage', 'Road To The Final'],
  stadiums:['Stadium explorer', 'Host Venues'],
  history:['World Cup history', 'Iconic Eras'],
  predictions:['News Desk', 'WC26 Moments'],
  search:['Global search', 'Find Anything']
};

function matchesForNation(iso3) {
  const nation = WC_NATIONS.find(n => n.iso === iso3);
  const liveTeam = liveTeamForNation(nation);
  return LIVE_DATA.matches.filter(m => {
    const ids = [m.homeTeam.tla, m.awayTeam.tla].filter(Boolean);
    const names = [m.homeTeam.name, m.awayTeam.name].map(normalizeName);
    return ids.includes(iso3)
      || (liveTeam?.tla && ids.includes(liveTeam.tla))
      || (nation && names.includes(normalizeName(nation.name)))
      || (liveTeam && names.includes(normalizeName(liveTeam.name)));
  });
}

function titleCaseWords(value) {
  return String(value || '').toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());
}

function matchStatusLabel(status) {
  const labels = {
    FINISHED: 'FT',
    SCHEDULED: 'Scheduled',
    TIMED: 'Scheduled',
    IN_PLAY: 'Live',
    PAUSED: 'Half-time',
    POSTPONED: 'Postponed',
    SUSPENDED: 'Suspended',
    CANCELLED: 'Cancelled'
  };
  return labels[status] || titleCaseWords(String(status || 'Status TBC').replaceAll('_', ' '));
}

function matchStageLabel(match) {
  const stage = titleCaseWords(String(match.stage || 'Group stage').replaceAll('_', ' '));
  const group = match.group ? `Group ${match.group}` : '';
  return [stage, group].filter(Boolean).join(' / ');
}

function formatFixtureForPanel(match) {
  const date = match.utcDate
    ? new Date(match.utcDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    : 'Date TBC';
  const score = (match.score.home !== null && match.score.away !== null)
    ? `${match.homeTeam.name} ${match.score.home}-${match.score.away} ${match.awayTeam.name}`
    : `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const detail = [
    matchStageLabel(match),
    matchStatusLabel(match.status),
    match.venue || ''
  ].filter(Boolean).join(' / ');
  return `${date} - ${score} / ${detail}`;
}

function profileForNation(n) {
  const liveTeam = liveTeamForNation(n);
  if (liveTeam) {
    const teamScorers = LIVE_DATA.scorers.filter(s => s.tla === liveTeam.tla || normalizeName(s.team) === normalizeName(liveTeam.name));
    const star = teamScorers[0]?.short || liveTeam.squad.find(p => p.position === 'Offence')?.short || liveTeam.squad[0]?.short || `${n.name} squad`;
    const manager = managerForNation(n, liveTeam) || 'staff TBC';
    const fixtures = matchesForNation(n.iso);
    return {
      rank: rankForNation(n),
      form: `${liveTeam.squad.length || 0} players`,
      model: teamScorers.length ? `${teamScorers[0].goals} goals` : 'Live squad',
      summary: `${n.name} - Group ${n.group}. Manager: ${manager}. Squad and fixtures loaded from football-data.org.`,
      players: [
        `${star} - Top live player`,
        `${manager} - Manager`,
        `${liveTeam.colors || 'Team colours TBC'} - Team colours`
      ],
      fixtures: fixtures.length ? fixtures.map(formatFixtureForPanel) : [`Group ${n.group} fixtures - Awaiting schedule from live feed`],
      story: [
        liveTeam.founded ? `Association founded ${liveTeam.founded}` : `${n.name} association data loaded`,
        liveTeam.colors ? `Colours: ${liveTeam.colors}` : 'Team colours unavailable',
        liveTeam.website ? `Official site: ${liveTeam.website}` : 'Official website unavailable'
      ]
    };
  }
  const fallbackProfile = PLATFORM_PROFILES[n.iso];
  if (fallbackProfile) return { ...fallbackProfile, rank: rankForNation(n) };
  return {
    rank: rankForNation(n),
    form: 'Feed offline',
    model: 'Roster pending',
    summary: `${n.name} is listed in Group ${n.group}. Live manager, squad, match stage, and fixture details require a valid football-data API response.`,
    players: [
      `${n.name} squad - Live roster pending`,
      `Manager - Live feed pending`,
      `Top player - Live scorer feed pending`
    ],
    fixtures: [
      `Group ${n.group} opener - Stage details pending from live matches API`,
      `Group ${n.group} matchday 2 - Stage details pending from live matches API`,
      `Group ${n.group} matchday 3 - Stage details pending from live matches API`
    ],
    story: [
      `${n.name} profile - Live feed required for verified squad details`,
      `Group ${n.group} route - group stage`,
      LIVE_DATA.lastError ? `Live feed issue: ${LIVE_DATA.lastError}` : 'Live feed waiting'
    ]
  };
}

let activePanel = 'overview';

function splitDetailItem(item) {
  const divider = item.includes(' - ') ? ' - ' : ': ';
  const [title, ...rest] = item.split(divider);
  return [title, rest.join(divider)];
}

function nationDossier(n, profile) {
  const base = TEAM_DOSSIERS[n.iso] || {};
  const liveTeam = liveTeamForNation(n);
  const liveScorer = liveTeam
    ? LIVE_DATA.scorers.find(s => s.tla === liveTeam.tla || normalizeName(s.team) === normalizeName(liveTeam.name))
    : null;
  const iso2 = ISO3_TO_ISO2[n.iso] || '';
  const wikiName = `${n.name} national football team`.replaceAll(' ', '_');
  return {
    manager: managerForNation(n, liveTeam) || base.manager || 'Feed offline',
    star: liveScorer?.short || liveTeam?.squad.find(p => p.position === 'Offence')?.short || base.star || (profile.players?.[0]?.split(' - ')[0] || 'Roster pending'),
    nickname: base.nickname || `${n.name} national team`,
    confed: base.confed || 'World football',
    titles: liveTeam?.founded ? `Founded ${liveTeam.founded}` : (base.titles || 'World Cup record TBC'),
    best: liveTeam?.colors ? `Colours: ${liveTeam.colors}` : (base.best || 'Tournament history loading'),
    identity: base.identity || profile.summary,
    managerWiki: base.managerWiki || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiName)}`,
    starWiki: base.starWiki || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiName)}`,
    teamWiki: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiName)}`,
    flagSrc: liveTeam?.crest || (iso2 ? `https://flagcdn.com/w320/${iso2}.png` : ''),
    squad: base.squad || profile.players.map(item => {
      const [name, role] = splitDetailItem(item);
      return `${name}|Player|${role || 'Squad profile'}`;
    })
  };
}

function renderSquadGrid(squadItems) {
  const byRole = {};
  squadItems.forEach(item => {
    const [name, role = 'Player', club = 'Club TBC'] = item.split('|');
    const key = role === 'GK' ? 'Goalkeepers'
      : role === 'DEF' ? 'Defenders'
      : role === 'MID' ? 'Midfielders'
      : role === 'FWD' ? 'Forwards'
      : 'Key Players';
    (byRole[key] = byRole[key] || []).push({ name, role, club });
  });

  return Object.entries(byRole).map(([label, players]) => `
    <div class="squad-pos-label">${escapeHtml(label)}</div>
    <div class="squad-grid">${players.map(player => `
      <div class="squad-chip">
        <strong>${escapeHtml(player.name)}</strong>
        <span>${escapeHtml(player.role)} / ${escapeHtml(player.club)}</span>
      </div>`).join('')}</div>
  `).join('');
}

async function renderPanelContent(profile, nation) {
  const panelContent = document.getElementById('panel-content');
  if (!panelContent) return;
  const dossier = nationDossier(nation, profile);

  if (activePanel === 'overview') {
    panelContent.innerHTML = `
      <div class="team-hero">
        <div>
          <strong>${escapeHtml(dossier.nickname)}</strong>
          <span>${escapeHtml(dossier.identity)}</span>
        </div>
        ${dossier.flagSrc ? `<img class="team-flag-art" src="${dossier.flagSrc}" alt="${escapeHtml(nation.name)} flag">` : ''}
      </div>
      <div class="panel-link-row">
        <a class="profile-link" href="${escapeHtml(dossier.managerWiki)}" target="_blank" rel="noreferrer">Manager wiki</a>
        <a class="profile-link" href="${escapeHtml(dossier.starWiki)}" target="_blank" rel="noreferrer">Star player wiki</a>
      </div>
      <div class="detail-row"><strong>Manager</strong><span>${escapeHtml(dossier.manager)}</span></div>
      <div class="detail-row"><strong>Top player</strong><span>${escapeHtml(dossier.star)}</span></div>
      <div class="detail-row"><strong>World Cup profile</strong><span>${escapeHtml(dossier.titles)} / ${escapeHtml(dossier.best)} / ${escapeHtml(dossier.confed)}</span></div>
      <a class="profile-link" href="${escapeHtml(dossier.teamWiki)}" target="_blank" rel="noreferrer">National team Wikipedia</a>
    `;
    return;
  }

  if (activePanel === 'fixtures') {
    panelContent.innerHTML = profile.fixtures.map(item => {
      const [title, detail] = splitDetailItem(item);
      return `<div class="detail-row"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail || 'Connected fixture intelligence')}</span></div>`;
    }).join('');
    return;
  }
  if (activePanel === 'story') {
    panelContent.innerHTML = `
      <div class="detail-row"><strong>${escapeHtml(dossier.titles)}</strong><span>${escapeHtml(dossier.best)}</span></div>
      ${profile.story.map(item => `<div class="detail-row"><strong>${escapeHtml(item)}</strong></div>`).join('')}
      <a class="profile-link" href="${escapeHtml(dossier.teamWiki)}" target="_blank" rel="noreferrer">Read team history</a>
    `;
    return;
  }

  panelContent.innerHTML = '<div class="detail-row"><strong>Loading squad</strong><span>Checking live team roster first.</span></div>';
  const liveSquad = await fetchSquad(nation.iso);
  if (activePanel !== 'squad') return;
  if (liveSquad?.squad?.length) {
    const squad = liveSquad.squad.map(player => {
      const pos = player.position?.includes('Goalkeeper') ? 'GK'
        : player.position?.includes('Defence') || player.position?.includes('Defender') ? 'DEF'
        : player.position?.includes('Midfield') || player.position?.includes('Midfielder') ? 'MID'
        : 'FWD';
      const meta = [
        player.nationality || nation.name,
        player.age ? `${player.age}y` : ''
      ].filter(Boolean).join(' / ');
      return `${player.short || player.name}|${pos}|${meta}`;
    });
    panelContent.innerHTML = `
      <div class="detail-row"><strong>Manager</strong><span>${escapeHtml(liveSquad.coach || dossier.manager)}</span></div>
      ${renderSquadGrid(squad)}
    `;
    return;
  }

  panelContent.innerHTML = `
    <div class="detail-row"><strong>Manager</strong><span>${escapeHtml(dossier.manager)}</span></div>
    ${renderSquadGrid(dossier.squad)}
  `;
}

function renderNationPanel(n) {
  const profile = profileForNation(n);
  const dossier = nationDossier(n, profile);
  const panel = document.getElementById('nation-panel');
  document.getElementById('panel-kicker').textContent = `${n.iso} selected`;
  document.getElementById('panel-title').textContent = n.name;
  document.getElementById('panel-group').textContent = `GROUP ${n.group}`;
  document.getElementById('panel-summary').textContent = profile.summary;
  document.getElementById('metric-rank').textContent = profile.rank;
  document.getElementById('metric-form').textContent = dossier.manager;
  document.getElementById('metric-odds').textContent = dossier.star;
  document.querySelectorAll('.panel-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.panel === activePanel));
  renderPanelContent(profile, n);
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
    const profile = profileForNation(n);
    const dossier = nationDossier(n, profile);
    const rank = String(profile.rank || '').startsWith('#') ? profile.rank : (profile.rank !== 'TBC' ? `#${profile.rank}` : 'Rank TBC');
    const flagSrc = flagImgUrl(n.iso);
    return `
      <article class="hub-card country-card" data-iso="${escapeHtml(n.iso)}" tabindex="0" role="button" aria-label="${escapeHtml(n.name)}, Group ${n.group}">
        <div class="country-card-head">
          ${flagSrc ? `<img class="country-flag-thumb" src="${flagSrc}" alt="${escapeHtml(n.name)} flag" loading="lazy" width="32" height="22">` : `<span class="country-flag-emoji">${n.flag}</span>`}
          <span class="country-card-group">Group ${escapeHtml(n.group)}</span>
        </div>
        <strong>${escapeHtml(n.name)}</strong>
        <div class="country-card-meta">
          <span class="country-card-rank">${escapeHtml(rank)}</span>
          <span class="country-card-form">${escapeHtml(dossier.manager)}</span>
          <span class="country-card-model">${escapeHtml(dossier.star)}</span>
        </div>
      </article>`;
  }).join('');

  return filterBar + `<div class="hub-grid three country-grid">${cards}</div>`;
}
function renderGroupsView() {
  const groups = [...new Set(WC_NATIONS.map(n => n.group))].sort();
  const knockoutCodes = new Set();
  LIVE_DATA.matches
    .filter(m => m.stage && m.stage !== 'GROUP_STAGE')
    .forEach(m => {
      [m.homeTeam.tla, m.awayTeam.tla].filter(Boolean).forEach(code => knockoutCodes.add(code));
    });
  return `
    ${liveFeedNote('group table')}
    <section class="stage-hero">
      <div>
        <span>Final group stage tables</span>
        <strong>Qualified Routes & Eliminations</strong>
        <p>Completed standings from football-data.org. Teams that did not reach the knockout rounds are shaded softly for quick scanning.</p>
      </div>
      <div class="stage-stat"><b>104</b><small>total matches</small></div>
    </section>
    <div class="group-board">${groups.map(group => {
      const nations = WC_NATIONS.filter(n => n.group === group);
      const liveRows = LIVE_DATA.standings[group] || [];
      return `
        <article class="group-card pro-table" style="--accent:${GROUP_COLORS[group] || '#00cc6e'}">
          <div class="group-card-head">
            <h3>Group ${escapeHtml(group)}</h3>
            <span>${nations.length} teams</span>
          </div>
          <table class="group-table">
            <thead><tr><th>Team</th><th>P</th><th>GD</th><th>Pts</th></tr></thead>
            <tbody>${(liveRows.length ? liveRows : nations).map((row, i) => {
              const n = liveRows.length ? nationForLiveRow(row) : row;
              const profile = profileForNation(n);
              const seedPts = liveRows.length ? row.pts : (i < 2 ? 'Q' : i === 2 ? '3rd' : '-');
              const played = liveRows.length ? row.mp : 0;
              const gd = liveRows.length ? row.gd : 0;
              const advanced = liveRows.length ? knockoutCodes.has(row.tla) : i < 3;
              const status = liveRows.length ? (advanced ? 'Advanced to knockouts' : 'Out') : (i < 2 ? 'Auto route' : i === 2 ? 'Third-place race' : 'At risk');
              const rowClass = liveRows.length ? (advanced ? 'advanced' : 'eliminated') : (i < 3 ? 'advanced' : 'eliminated');
              const rank = liveRows.length ? `${row.w}-${row.d}-${row.l}` : (profile.rank !== 'TBC' ? profile.rank : 'TBC');
              const flag = flagImgUrl(n.iso);
              return `<tr class="group-team-row ${rowClass}">
                <td><span class="table-rank">${i + 1}</span>${flag ? `<img src="${flag}" alt="" loading="lazy">` : ''}<strong>${escapeHtml(n.name)}</strong><em>${escapeHtml(status)}</em></td>
                <td>${escapeHtml(played)}</td><td>${escapeHtml(gd)}</td><td>${escapeHtml(seedPts)}</td>
              </tr><tr class="table-sub ${rowClass}"><td colspan="4">${escapeHtml(rank)}${liveRows.length ? ' final record' : ' team data'} / ${escapeHtml(nationDossier(n, profile).star)}</td></tr>`;
            }).join('')}</tbody>
          </table>
        </article>`;
    }).join('')}</div>`;
}

const KNOCKOUT_ROUNDS = [
  { key:'LAST_32', label:'Round of 32', accent:'#4da6ff' },
  { key:'LAST_16', label:'Round of 16', accent:'#ff5f1f' },
  { key:'QUARTER_FINALS', label:'Quarterfinals', accent:'#ffd100' },
  { key:'SEMI_FINALS', label:'Semifinals', accent:'#00cc6e' },
  { key:'THIRD_PLACE', label:'Third Place', accent:'#c9a84c' },
  { key:'FINAL', label:'Final', accent:'#4da6ff' }
];

function knockoutWinner(match) {
  const home = match.score?.home;
  const away = match.score?.away;
  if (home === null || away === null || home === away) return '';
  return home > away ? 'home' : 'away';
}

function renderKnockoutMatch(match, index) {
  const winner = knockoutWinner(match);
  const homeName = match.homeTeam.name && match.homeTeam.name !== '?' ? match.homeTeam.name : 'TBC';
  const awayName = match.awayTeam.name && match.awayTeam.name !== '?' ? match.awayTeam.name : 'TBC';
  const hasTeams = homeName !== 'TBC' && awayName !== 'TBC';
  const isFinished = match.status === 'FINISHED';
  const date = match.utcDate
    ? new Date(match.utcDate).toLocaleDateString('en-US', { month:'short', day:'numeric' })
    : 'Date TBC';
  const score = isFinished && match.score.home !== null && match.score.away !== null
    ? `${match.score.home}-${match.score.away}`
    : 'vs';
  const status = isFinished ? 'FT' : matchStatusLabel(match.status);
  const venue = match.venue ? ` / ${match.venue}` : '';
  return `<article class="bracket-match final-path-card">
    <span>${escapeHtml(date)} / Match ${index + 1} / ${escapeHtml(status)}</span>
    <div class="bracket-teams">
      <div class="bracket-side ${!hasTeams ? 'tbc' : winner === 'home' ? 'winner' : winner === 'away' ? 'out' : ''}">
        <strong>${escapeHtml(homeName)}</strong>
        <b>${escapeHtml(isFinished ? String(match.score.home ?? '-') : '')}</b>
      </div>
      <div class="bracket-side ${!hasTeams ? 'tbc' : winner === 'away' ? 'winner' : winner === 'home' ? 'out' : ''}">
        <strong>${escapeHtml(awayName)}</strong>
        <b>${escapeHtml(isFinished ? String(match.score.away ?? '-') : '')}</b>
      </div>
    </div>
    <em>${escapeHtml(hasTeams ? score : 'Teams pending from semifinal results')}${venue}</em>
  </article>`;
}

function renderBracketView() {
  const knockoutMatches = LIVE_DATA.matches.filter(m => m.stage && m.stage !== 'GROUP_STAGE');
  if (knockoutMatches.length) {
    return `
      <section class="stage-hero bracket-hero">
        <div>
          <span>Updated knockout bracket</span>
          <strong>Road To The Trophy</strong>
          <p>Knockout results and scheduled ties from football-data.org. Eliminated sides are shaded softly once a match is finished.</p>
        </div>
        <div class="stage-stat"><b>${knockoutMatches.length}</b><small>knockout matches</small></div>
      </section>
      <div class="bracket-track live-bracket">${KNOCKOUT_ROUNDS.map((round, index) => {
        const matches = knockoutMatches
          .filter(match => match.stage === round.key)
          .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
        return `<div class="bracket-column" style="--round:${index + 1}; --round-accent:${round.accent}">
          <div class="bracket-round">${escapeHtml(round.label)} <small>${matches.length}</small></div>
          ${matches.length
            ? matches.map(renderKnockoutMatch).join('')
            : `<article class="bracket-match"><span>Pending</span><strong>No matches</strong><em>Waiting for live feed</em></article>`}
        </div>`;
      }).join('')}</div>`;
  }
  return `
    <section class="stage-hero bracket-hero">
      <div>
        <span>Knockout map</span>
        <strong>Road To MetLife</strong>
        <p>Round of 32 to final, built for quick scanning like a live bracket but styled for this site instead of a plain table.</p>
      </div>
      <div class="stage-stat"><b>32</b><small>knockout teams</small></div>
    </section>
    <div class="bracket-track">${BRACKET_PATH.map((round, index) => `
      <div class="bracket-column" style="--round:${index + 1}">
        <div class="bracket-round">${escapeHtml(round.round)}</div>
        ${round.slots.map((slot, slotIndex) => `<article class="bracket-match">
          <span>Match ${index + 1}.${slotIndex + 1}</span>
          <strong>${escapeHtml(slot)}</strong>
          <em>${escapeHtml(round.note)}</em>
        </article>`).join('')}
      </div>
    `).join('')}</div>`;
}

function renderStadiumsView() {
  return `
    <div class="stadium-grid">${HOST_STADIUMS.map(stadium => `
      <article class="stadium-card">
        <div class="media-fallback" aria-hidden="true"></div>
        <img src="${escapeHtml(stadium.image)}" alt="${escapeHtml(stadium.name)}" loading="eager" onload="this.classList.add('loaded')" onerror="this.remove()">
        <div>
          <span>${escapeHtml(stadium.city)}</span>
          <strong>${escapeHtml(stadium.name)}</strong>
          <p>${escapeHtml(stadium.capacity)} seats / ${escapeHtml(stadium.matches)} / ${escapeHtml(stadium.note)}</p>
          <a class="profile-link" href="${escapeHtml(stadium.wiki)}" target="_blank" rel="noreferrer">Wikipedia</a>
        </div>
      </article>
    `).join('')}</div>
    <div class="route-strip">
      ${HOST_STADIUMS.map((stadium, index) => `${index ? '<span class="route-line"></span>' : ''}<span class="route-dot" title="${escapeHtml(stadium.city)}"></span>`).join('')}
    </div>
  `;
}

function renderStatsView() {
  return `<div class="hub-grid three">${TOURNAMENT_LEADERS.map(([label, name, detail]) => hubCard(label, name, detail)).join('')}</div>`;
}

function renderHistoryView() {
  return `
    <section class="stage-hero history-hero">
      <div>
        <span>1930 to 2026</span>
        <strong>World Cup Memory Wall</strong>
        <p>Big moments, host eras, iconic finals, and the emotional thread that makes this tournament bigger than the bracket.</p>
      </div>
      <div class="stage-stat"><b>23</b><small>editions by 2026</small></div>
    </section>
    <div class="history-wall">${HISTORY_TIMELINE.map(item => `
      <article class="history-card">
        <div class="moment-fallback" aria-hidden="true"></div>
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}" loading="eager" onload="this.classList.add('loaded')" onerror="this.remove()">
        <div>
          <span>${escapeHtml(item.year)} / ${escapeHtml(item.host)}</span>
          <strong>${escapeHtml(item.moment)}</strong>
          <p>${escapeHtml(item.final)}. ${escapeHtml(item.fact)}</p>
          <small>${escapeHtml(item.caption)}</small>
        </div>
      </article>
    `).join('')}</div>`;
}

function renderPredictionsView() {
  const tapeItems = [...WC26_MOMENTS, ...WC26_MOMENTS];
  return `
    <div class="news-stack">
      <div class="news-tape" aria-label="Moving World Cup headlines">
        <div class="news-tape-track">${tapeItems.map((item, index) => `
          <a href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">
            <span>${escapeHtml(item.tag)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <em>${escapeHtml(item.source)}</em>
          </a>
        `).join('')}</div>
      </div>
      <div class="news-terminal">
        <a class="news-lead" href="${escapeHtml(WC26_MOMENTS[0].href)}" target="_blank" rel="noreferrer">
          <div class="moment-fallback" aria-hidden="true"></div>
          ${mediaImage(WC26_MOMENTS[0].image, WC26_MOMENTS[0].title, WC26_MOMENTS[0].fallbackImage)}
          <div class="news-card-content">
            <span>${escapeHtml(WC26_MOMENTS[0].tag)} / Lead story</span>
            <strong>${escapeHtml(WC26_MOMENTS[0].title)}</strong>
            <p>${escapeHtml(WC26_MOMENTS[0].dek)}</p>
            <small>${escapeHtml(WC26_MOMENTS[0].source)} / Open story</small>
          </div>
        </a>
        <div class="news-story-board">${WC26_MOMENTS.slice(1).map((item, index) => `
          <a class="news-story-row" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer" style="--delay:${index * 70}ms">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.dek)}</p>
            </div>
            <em>${escapeHtml(item.tag)}</em>
            <small>${escapeHtml(item.source)}</small>
          </a>
        `).join('')}</div>
      </div>
      <div class="news-image-rail">${WC26_MOMENTS.slice(1).map(item => `
        <a class="news-rail-card" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">
          ${mediaImage(item.image, item.title, item.fallbackImage)}
          <span>${escapeHtml(item.tag)}</span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.dek)}</p>
          </div>
        </a>
      `).join('')}</div>
      <div class="live-link-grid">${LIVE_LINKS.map(link => `
        <a class="live-link-card" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">
          <span>News link</span><strong>${escapeHtml(link.label)}</strong><p>Open current World Cup 2026 updates in a new tab.</p>
        </a>
      `).join('')}</div>
    </div>`;
}
function searchItems(query) {
  const normalized = normalizeName(query);
  const players = Object.entries(PLATFORM_PROFILES).flatMap(([iso, profile]) =>
    profile.players.map(player => ({ type:'Player', title:player.split(' - ')[0], body:`${nationByIso[iso]?.name || iso} - ${player.split(' - ')[1] || 'profile'}`, iso }))
  );
  const countries = WC_NATIONS.map(n => {
    const dossier = nationDossier(n, profileForNation(n));
    return { type:'Country', title:n.name, body:`Group ${n.group} - ${dossier.manager} - ${dossier.star}`, iso:n.iso };
  });
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
  document.body.classList.toggle('feature-active', view !== 'overview');

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
  document.body.classList.remove('feature-active');
}

function openNationPanel(n) {
  // Collapse hub first — one surface at a time
  closeHub();
  activePanel = 'overview';
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

function updateStaticTournamentStatus() {
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

function buildStaticTicker() {
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
refreshAll();

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
          const profile = profileForNation(n);
          const dossier = nationDossier(n, profile);
          const rank = profile.rank !== 'TBC' ? `#${profile.rank}` : 'Rank TBC';
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
                <span class="country-card-form">${escapeHtml(dossier.manager)}</span>
                <span class="country-card-model">${escapeHtml(dossier.star)}</span>
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
  let globeStyleFrame = 0;

  function refreshGlobeStyles() {
    if (!globe || globeStyleFrame) return;
    globeStyleFrame = requestAnimationFrame(() => {
      globeStyleFrame = 0;
      globe.polygonsData(geoFeatures);
    });
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
  window.__WCIM_SET_GLOBE_ACTIVE = active => {
    if (controls) controls.autoRotate = active;
    if (globe && typeof globe.resumeAnimation === 'function' && active) globe.resumeAnimation();
    if (globe && typeof globe.pauseAnimation === 'function' && !active) globe.pauseAnimation();
  };
  window.__WCIM_SET_GLOBE_ACTIVE(!document.body.classList.contains('stats-active'));
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
