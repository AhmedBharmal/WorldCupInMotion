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
const decorEls  = ['trophy-sharp','trophy-halo','glass','orb1','orb2','glass-sweep']
  .map(id => document.getElementById(id))
  .filter(Boolean);

function updateScrollReveal() {
  const progress = Math.min(window.scrollY / window.innerHeight, 1);
  const radius   = progress * 200;
  globeWrap.style.clipPath   = `circle(${radius}% at 50% 50%)`;
  globeWrap.style.transition = 'none';
  revealEl.style.opacity     = String(Math.max(0, 1 - progress * 1.2));
  if (progress >= 0.83) revealEl.style.pointerEvents = 'none';

  if (progress > 0.12) {
    globeUi.style.display = 'flex';
    globeUi.style.opacity = String(Math.min(1, (progress - 0.12) * 2.2));
  }
  if (progress > 0.35) {
    document.body.classList.remove('light-cursor');
    globeHint.style.opacity = String(Math.min(1, (progress - 0.35) * 2.5));
  }
  decorEls.forEach(el => {
    el.style.opacity = String(Math.max(0, 1 - progress * 1.35));
  });
}

let scrollTicking = false;
window.addEventListener('scroll',()=>{
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateScrollReveal();
    scrollTicking = false;
  });
},{passive:true});

showFrame(0);

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
  {iso:'GBR',name:'England',    flag:'🇬🇧',lat:52.36,lng:-1.17, group:'C'},
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
  {iso:'DNK',name:'Denmark',    flag:'🇩🇰',lat:56.26,lng:9.50,  group:'L'}
];
const nationByIso = Object.fromEntries(WC_NATIONS.map(n => [n.iso, n]));
const NAME_TO_ISO = {
  'united states of america':'USA','united states':'USA','united kingdom':'GBR',
  'england':'GBR','korea':'KOR','south korea':'KOR','republic of korea':'KOR',
  'czechia':'CZE','czech republic':'CZE','ivory coast':'CIV',"cote d'ivoire":'CIV',
  'dem. rep. congo':'COD','democratic republic of the congo':'COD','dr congo':'COD',
  'bosnia and herzegovina':'BIH','saudi arabia':'SAU','south africa':'ZAF',
  'new zealand':'NZL','cape verde':'CPV','cabo verde':'CPV','curacao':'CUW','curaçao':'CUW'
};

function nationForPolygon(props) {
  if (!props) return null;
  const iso = props.ISO_A3 || props.ADM0_A3 || props.iso_a3;
  if (iso && nationByIso[iso]) return nationByIso[iso];
  const name = (props.NAME || props.ADMIN || props.name || '').toLowerCase().trim();
  const mapped = NAME_TO_ISO[name];
  if (mapped && nationByIso[mapped]) return nationByIso[mapped];
  return WC_NATIONS.find(n => n.name.toLowerCase() === name) || null;
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

setTimeout(() => {
  const globeContainer = document.getElementById('globe-container');
  if (!globeContainer) return;

  let hoverIso = null;
  let selectedIso = null;
  let idleTimer = null;
  let geoFeatures = [];
  let globe;

  function refreshGlobeStyles(updatePins = false) {
    globe.polygonsData(geoFeatures);
    if (updatePins) globe.htmlElementsData(WC_NATIONS.map(n => ({...n})));
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
    .polygonLabel(f => {
      const n = nationForPolygon(f.properties);
      return n ? `<div style="font-family:Barlow Condensed,sans-serif;font-size:11px;letter-spacing:.2em;padding:6px 10px;background:rgba(3,6,26,.85);border:1px solid ${GROUP_COLORS[n.group]}55;border-radius:8px;color:#f0ede6;">${n.flag} ${n.name}<br><span style="color:#3d4f6b;font-size:9px;">GROUP ${n.group}</span></div>` : '';
    })
    .onPolygonHover(f => {
      globeContainer.style.cursor = f && nationForPolygon(f.properties) ? 'pointer' : 'grab';
      const nextHoverIso = f ? (nationForPolygon(f.properties) || {}).iso : null;
      if (nextHoverIso === hoverIso) return;
      hoverIso = nextHoverIso;
      refreshGlobeStyles();
    })
    .onPolygonClick(f => {
      const n = nationForPolygon(f.properties);
      if (!n) return;
      selectedIso = selectedIso === n.iso ? null : n.iso;
      refreshGlobeStyles(true);
      globe.pointOfView({ lat: n.lat, lng: n.lng, altitude: 1.6 }, 900);
      document.getElementById('globe-hint').style.opacity = '0';
    })
    .htmlElementsData(WC_NATIONS)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'flag-pin' + (selectedIso === d.iso ? ' pulse' : '');
      el.textContent = d.flag;
      el.title = d.name;
      return el;
    })
    .htmlAltitude(0.12)
    .htmlElementVisibilityModifier((el, vis) => { el.style.opacity = vis ? 1 : 0; });

  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  controls.enableZoom = true;
  controls.enablePan = false;
  controls.minDistance = 120;
  controls.maxDistance = 420;

  function pauseSpin() {
    controls.autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { controls.autoRotate = true; }, 4500);
  }
  globeContainer.addEventListener('mousedown', pauseSpin);
  globeContainer.addEventListener('touchstart', pauseSpin, {passive:true});
  globeContainer.addEventListener('wheel', pauseSpin, {passive:true});

  fetch('https://unpkg.com/world-atlas/countries-110m.json')
    .then(res => res.json())
    .then(data => {
      geoFeatures = topojson.feature(data, data.objects.countries).features;
      globe.polygonsData(geoFeatures);
    })
    .catch(err => console.error('Globe data failed:', err));

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
