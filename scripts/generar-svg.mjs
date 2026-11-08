// Genera los SVG animados (estilo cerezo japonés) para el README de perfil.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

// PRNG con semilla para resultados estables
let seed = 20261108;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const r = (a, b) => a + rnd() * (b - a);
const f = (n) => Math.round(n * 100) / 100;

const PETAL_COLORS = ["#ffd1dc", "#ffb7c9", "#f9a3bb", "#ffe4ec", "#ffc6d5"];

const DEFS = `
  <path id="petal" d="M0,0 C-7,-6 -8,-17 -3,-22 L0,-18.5 L3,-22 C8,-17 7,-6 0,0Z"/>
  <g id="flor">
    <use xlink:href="#petal" fill="#ffd3df"/>
    <use xlink:href="#petal" fill="#ffc4d4" transform="rotate(72)"/>
    <use xlink:href="#petal" fill="#ffd3df" transform="rotate(144)"/>
    <use xlink:href="#petal" fill="#ffc4d4" transform="rotate(216)"/>
    <use xlink:href="#petal" fill="#ffd3df" transform="rotate(288)"/>
    <circle r="5" fill="#f28aa8"/>
    <g fill="#c2185b">
      <circle cx="0" cy="-8" r="1.3"/><circle cx="7.6" cy="-2.5" r="1.3"/>
      <circle cx="4.7" cy="6.5" r="1.3"/><circle cx="-4.7" cy="6.5" r="1.3"/>
      <circle cx="-7.6" cy="-2.5" r="1.3"/>
    </g>
  </g>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="2.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="18"/>
  </filter>`;

const BASE_CSS = `
  .fall{animation:fall linear infinite}
  .sway{animation:sway ease-in-out infinite alternate}
  .spin{animation:spin linear infinite;transform-box:fill-box;transform-origin:center}
  .flip{animation:flip ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
  .mote{animation:mote linear infinite}
  .twinkle{animation:twinkle ease-in-out infinite alternate}
  .rise{animation:rise 1.6s cubic-bezier(.2,.7,.2,1) backwards}
  @keyframes sway{from{transform:translateX(-22px)}to{transform:translateX(22px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes flip{from{transform:scaleX(1)}to{transform:scaleX(.25)}}
  @keyframes mote{0%{transform:translate(0,0);opacity:0}20%{opacity:.95}80%{opacity:.6}100%{transform:translate(24px,-130px);opacity:0}}
  @keyframes twinkle{from{opacity:.15}to{opacity:1}}
  @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

// Pétalos cayendo con viento (diagonal), balanceo, giro y "aleteo"
function petals(n, { w, h, scale = [0.45, 0.9], dur = [9, 17], opacity = [0.75, 1] }) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = f(r(0, w + 180));
    const d = f(r(...dur));
    const delay = f(-r(0, d));
    const sw = f(r(2.5, 5));
    const sp = f(r(4, 10));
    const fl = f(r(0.8, 2.2));
    const sc = f(r(...scale));
    const col = PETAL_COLORS[Math.floor(r(0, PETAL_COLORS.length))];
    s += `
    <g transform="translate(${x},0)" opacity="${f(r(...opacity))}">
      <g class="fall" style="animation-duration:${d}s;animation-delay:${delay}s">
        <g class="sway" style="animation-duration:${sw}s;animation-delay:${f(-r(0, sw))}s">
          <g class="spin" style="animation-duration:${sp}s">
            <g class="flip" style="animation-duration:${fl}s">
              <use xlink:href="#petal" fill="${col}" transform="scale(${sc})"/>
            </g>
          </g>
        </g>
      </g>
    </g>`;
  }
  return s;
}

// Partículas luminosas que flotan hacia arriba
function motes(n, { x0, x1, y0, y1 }) {
  let s = `<g filter="url(#glow)">`;
  for (let i = 0; i < n; i++) {
    const d = f(r(6, 12));
    s += `<circle class="mote" cx="${f(r(x0, x1))}" cy="${f(r(y0, y1))}" r="${f(r(1, 2.6))}" fill="#fff0f6" style="animation-duration:${d}s;animation-delay:${f(-r(0, d))}s"/>`;
  }
  return s + `</g>`;
}

function stars(n, { x0, x1, y0, y1 }) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const d = f(r(1.5, 4));
    s += `<circle class="twinkle" cx="${f(r(x0, x1))}" cy="${f(r(y0, y1))}" r="${f(r(0.6, 1.5))}" fill="#fff" style="animation-duration:${d}s;animation-delay:${f(-r(0, d))}s"/>`;
  }
  return s;
}

// Rama de cerezo con racimos de flores
function branch() {
  const flowers = [
    [238, 12, 0.95], [222, 26, 0.7], [255, 30, 0.6], [180, 40, 0.75],
    [318, 160, 0.95], [300, 140, 0.7], [334, 142, 0.6], [286, 118, 0.55],
    [468, 72, 1], [450, 58, 0.65], [490, 88, 0.6], [420, 92, 0.55],
    [560, 152, 0.9], [540, 140, 0.6], [578, 136, 0.55], [520, 118, 0.85],
    [96, 52, 0.6], [360, 124, 0.5], [130, 76, 0.5],
  ];
  const buds = [[205, 20], [275, 38], [338, 172], [482, 62], [585, 158], [400, 104], [150, 56]];
  let s = `
  <g class="branch">
    <g fill="none" stroke="#2a1622" stroke-linecap="round">
      <path d="M-30,28 C70,38 160,68 240,95 S400,130 520,118" stroke-width="13"/>
      <path d="M150,62 C175,32 205,18 240,10" stroke-width="6"/>
      <path d="M262,100 C282,128 298,146 320,160" stroke-width="5.5"/>
      <path d="M380,121 C410,92 440,80 470,72" stroke-width="6"/>
      <path d="M470,121 C498,140 524,150 562,152" stroke-width="5"/>
      <path d="M90,40 C100,30 112,24 126,22" stroke-width="3"/>
      <path d="M520,118 C545,112 565,104 590,102" stroke-width="3.5"/>
    </g>
    <path d="M-30,24 C70,34 160,63 240,90 S400,124 520,113" fill="none" stroke="#5a3346" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`;
  for (const [x, y] of buds) s += `<ellipse cx="${x}" cy="${y}" rx="4" ry="5.5" fill="#f48fb1"/>`;
  for (const [x, y, sc] of flowers)
    s += `<use xlink:href="#flor" transform="translate(${x},${y}) rotate(${f(r(0, 72))}) scale(${sc})"/>`;
  return s + `</g>`;
}

const svg = (w, h, css, body) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<defs>${DEFS}
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#120d22"/>
    <stop offset=".55" stop-color="#3b1f46"/>
    <stop offset="1" stop-color="#b9708f"/>
  </linearGradient>
  <radialGradient id="moonglow">
    <stop offset="0" stop-color="#ffe3ec" stop-opacity=".55"/>
    <stop offset="1" stop-color="#ffe3ec" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="frame"><rect width="${w}" height="${h}" rx="22"/></clipPath>
</defs>
<style>${BASE_CSS}${css}</style>
${body}
</svg>
`;

// ---------- BANNER ----------
const W = 1200, H = 400;
const SANS = "'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman','Noto Serif JP',serif";
const banner = svg(W, H, `
  @keyframes fall{from{transform:translate(0,-40px)}to{transform:translate(-170px,${H + 40}px)}}
  .branch{transform-origin:0 30px;animation:breeze 7s ease-in-out infinite alternate}
  @keyframes breeze{from{transform:rotate(-.9deg)}to{transform:rotate(.9deg)}}
  .mist{animation:mist 18s ease-in-out infinite alternate}
  @keyframes mist{from{transform:translateX(-60px)}to{transform:translateX(60px)}}
  .moon{animation:pulse 6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
  @keyframes pulse{from{transform:scale(.96);opacity:.8}to{transform:scale(1.05);opacity:1}}
  .draw{stroke-dasharray:420;animation:draw 2.4s .9s ease-out backwards}
  @keyframes draw{from{stroke-dashoffset:420}to{stroke-dashoffset:0}}
  .d1{animation-delay:.15s}.d2{animation-delay:.45s}.d3{animation-delay:.8s}.d4{animation-delay:1.1s}`,
`<title>Jennifer Carreño · Reech AI</title>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars(45, { x0: 620, x1: 1190, y0: 10, y1: 220 })}
  <circle class="moon" cx="985" cy="110" r="120" fill="url(#moonglow)"/>
  <circle cx="985" cy="110" r="56" fill="#fde9f0"/>
  <circle cx="1003" cy="98" r="9" fill="#f6d3df" opacity=".7"/><circle cx="968" cy="128" r="6" fill="#f6d3df" opacity=".6"/>
  <ellipse class="mist" cx="700" cy="330" rx="520" ry="40" fill="#f7bfd2" opacity=".35" filter="url(#soft)"/>
  <path d="M640,400 L868,252 Q900,230 932,252 L1200,392 L1200,400Z" fill="#2b1934"/>
  <path d="M836,273 L868,252 Q900,230 932,252 L964,273 L948,279 L933,268 L917,283 L901,270 L885,284 L869,270 L852,280Z" fill="#f9e1ea" opacity=".92"/>
  <path d="M0,400 L0,362 Q200,330 410,356 T820,352 T1200,346 L1200,400Z" fill="#1c1226"/>
  ${branch()}
  ${motes(26, { x0: 40, x1: 1160, y0: 220, y1: 390 })}

  <g font-family="${SANS}">
    <text class="rise d1" x="92" y="203" font-size="17" fill="#ffc3d4" letter-spacing="2">はじめまして  ·  Hola, soy</text>
    <g class="rise d2">
      <rect x="92" y="222" width="50" height="50" rx="7" fill="#c62f4b"/>
      <rect x="96" y="226" width="42" height="42" rx="4" fill="none" stroke="#ffd9e2" stroke-width="1.2" opacity=".8"/>
      <text x="117" y="257" font-size="28" fill="#fff" text-anchor="middle" font-family="${SERIF}">桜</text>
      <text x="160" y="266" font-size="54" fill="#ffffff" font-family="${SERIF}" letter-spacing="1">Jennifer Carreño</text>
    </g>
    <path class="draw" d="M94,290 H514" stroke="#f7a8c0" stroke-width="2" stroke-linecap="round"/>
    <text class="rise d3" x="92" y="324" font-size="19" fill="#f8e3ea">Project Manager  ·  Contenido  ·  Automatización  ·  Marketing con IA</text>
    <text class="rise d4" x="92" y="356" font-size="17" fill="#e9b8c9" letter-spacing="1">en <tspan fill="#ffffff" font-weight="600">Reech AI</tspan>  —  reechai.com</text>
  </g>
  ${petals(34, { w: W, h: H })}
</g>`);

// ---------- DIVISOR ----------
const DW = 1200, DH = 60;
const divider = svg(DW, DH, `
  @keyframes fall{from{transform:translate(0,-20px)}to{transform:translate(-90px,${DH + 20}px)}}
  .bloom{animation:bloom 4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
  @keyframes bloom{from{transform:rotate(-12deg) scale(.92)}to{transform:rotate(12deg) scale(1.05)}}`,
`<title>divisor</title>
  <defs><linearGradient id="line" x1="0" x2="1">
    <stop offset="0" stop-color="#f48fb1" stop-opacity="0"/><stop offset=".5" stop-color="#f48fb1"/><stop offset="1" stop-color="#f48fb1" stop-opacity="0"/>
  </linearGradient></defs>
  <rect x="80" y="29" width="1040" height="2" fill="url(#line)"/>
  <g transform="translate(560,30)"><g class="bloom" style="animation-duration:5s"><use xlink:href="#flor" transform="scale(.55)"/></g></g>
  <g transform="translate(600,30)"><g class="bloom"><use xlink:href="#flor" transform="scale(.8)"/></g></g>
  <g transform="translate(640,30)"><g class="bloom" style="animation-duration:4.6s"><use xlink:href="#flor" transform="scale(.55)"/></g></g>
  ${petals(14, { w: DW, h: DH, scale: [0.3, 0.55], dur: [3.5, 6] })}`);

// ---------- PIE ----------
const FW = 1200, FH = 200;
const footer = svg(FW, FH, `
  @keyframes fall{from{transform:translate(0,-30px)}to{transform:translate(-140px,${FH + 30}px)}}
  .branch{transform-origin:0 30px;animation:breeze 7s ease-in-out infinite alternate}
  @keyframes breeze{from{transform:rotate(-1.2deg)}to{transform:rotate(1.2deg)}}`,
`<title>Gracias por pasar</title>
<g clip-path="url(#frame)">
  <rect width="${FW}" height="${FH}" fill="url(#sky)"/>
  ${stars(30, { x0: 20, x1: 1180, y0: 10, y1: 120 })}
  <g transform="translate(${FW},0) scale(-.62,.62)">${branch()}</g>
  ${motes(16, { x0: 40, x1: 1160, y0: 110, y1: 195 })}
  <text class="rise" x="600" y="104" text-anchor="middle" font-family="${SERIF}" font-size="34" fill="#fff" letter-spacing="3">ありがとう</text>
  <text class="rise" style="animation-delay:.5s" x="600" y="140" text-anchor="middle" font-family="${SANS}" font-size="18" fill="#f8d3df" letter-spacing="2">Gracias por pasar  ·  que florezcan tus ideas</text>
  ${petals(22, { w: FW, h: FH, scale: [0.4, 0.75], dur: [6, 11] })}
</g>`);

writeFileSync(join(OUT, "banner.svg"), banner);
writeFileSync(join(OUT, "divider.svg"), divider);
writeFileSync(join(OUT, "footer.svg"), footer);
console.log("ok", OUT);
