import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

/* ────────────────────────────────────────────────────────────────
   CONTRÔLE D'AUTHENTICITÉ — cartes Pokémon TCG
   Langage visuel : Human Interface Guidelines.
   SF Pro, gris de fond #F5F5F7, cartes flottantes à angles continus,
   anneaux de progression, interrupteurs iOS, mode sombre système.
   ──────────────────────────────────────────────────────────────── */

const CSS = `
.ap{
  --bg:#F5F5F7; --surface:#FFFFFF; --surface2:#F5F5F7; --fill:rgba(120,120,128,.12);
  --label:#1D1D1F; --label2:#6E6E73; --label3:#86868B;
  --sep:rgba(0,0,0,.08); --sep-fort:rgba(0,0,0,.14);
  --blue:#0071E3; --green:#34C759; --orange:#FF9500; --red:#FF3B30;
  --r-l:20px; --r-m:14px; --r-s:10px;
  --ombre:0 4px 20px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04);
  --ressort:cubic-bezier(.16,1,.3,1);

  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif;
  background:var(--bg); color:var(--label); min-height:100%;
  padding:0 0 80px; letter-spacing:-.01em;
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
}
@media (prefers-color-scheme:dark){
  .ap{
    --bg:#000; --surface:#1C1C1E; --surface2:#2C2C2E; --fill:rgba(120,120,128,.24);
    --label:#F5F5F7; --label2:#98989D; --label3:#6E6E73;
    --sep:rgba(255,255,255,.10); --sep-fort:rgba(255,255,255,.18);
    --blue:#0A84FF; --green:#30D158; --orange:#FF9F0A; --red:#FF453A;
    --ombre:0 4px 24px rgba(0,0,0,.5);
  }
}
.ap *{ box-sizing:border-box; }
.ap-mono{ font-family:ui-monospace,"SF Mono",SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums; }

/* ─ héros ─ */
.ap-hero{ text-align:center; padding:76px 24px 44px; max-width:720px; margin:0 auto; }
.ap-eyebrow{ font-size:19px; font-weight:600; color:var(--blue); letter-spacing:-.01em; margin-bottom:8px; }
.ap-h1{ font-size:clamp(38px,7vw,58px); font-weight:700; letter-spacing:-.03em;
  line-height:1.06; margin:0 0 18px; }
.ap-lead{ font-size:clamp(17px,2.4vw,21px); line-height:1.45; color:var(--label2);
  margin:0 auto; max-width:34em; font-weight:400; }

/* ─ barre de recherche ─ */
.ap-recherche{ display:flex; gap:10px; max-width:600px; margin:34px auto 0; }
.ap-recherche .ap-input{ flex:1; min-width:0; height:50px; font-size:17px;
  border-radius:980px; padding:0 20px; text-align:left; }

/* ─ contrôles de base ─ */
.ap-input,.ap-zone{
  width:100%; background:var(--surface); color:var(--label);
  border:1px solid var(--sep-fort); border-radius:var(--r-s);
  font-family:inherit; font-size:16px; padding:11px 14px; letter-spacing:-.01em;
  transition:border-color .18s, box-shadow .18s;
}
.ap-zone{ resize:vertical; min-height:78px; line-height:1.45; }
.ap-input:focus,.ap-zone:focus,.ap-menu:focus{
  outline:none; border-color:var(--blue); box-shadow:0 0 0 4px color-mix(in srgb,var(--blue) 18%,transparent);
}
.ap-input::placeholder,.ap-zone::placeholder{ color:var(--label3); }

.ap-btn{
  border:none; border-radius:980px; cursor:pointer; font-family:inherit;
  font-size:17px; font-weight:500; letter-spacing:-.01em; padding:0 22px; height:50px;
  background:var(--blue); color:#fff; white-space:nowrap;
  transition:transform .18s var(--ressort), opacity .18s, filter .18s;
}
.ap-btn:hover:not(:disabled){ filter:brightness(1.08); }
.ap-btn:active:not(:disabled){ transform:scale(.96); }
.ap-btn:disabled{ opacity:.35; cursor:not-allowed; }
.ap-btn.pleine{ width:100%; }
.ap-btn.discret{ background:var(--fill); color:var(--blue); height:38px; font-size:15px; padding:0 16px; }

/* ─ menu déroulant façon macOS ─ */
.ap-menu{
  appearance:none; -webkit-appearance:none;
  background:var(--fill); color:var(--label); border:none; border-radius:8px;
  font-family:inherit; font-size:14px; font-weight:500; letter-spacing:-.01em;
  padding:6px 28px 6px 11px; cursor:pointer; width:100%;
  background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);
  background-position:calc(100% - 15px) 13px,calc(100% - 11px) 13px;
  background-size:4px 4px,4px 4px; background-repeat:no-repeat;
}

/* ─ interrupteur iOS ─ */
.ap-switch{ position:relative; width:51px; height:31px; flex:none; }
.ap-switch input{ position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:pointer; z-index:2; }
.ap-piste{ position:absolute; inset:0; background:var(--fill); border-radius:980px;
  transition:background .26s var(--ressort); pointer-events:none; }
.ap-pastille{ position:absolute; top:2px; left:2px; width:27px; height:27px; background:#fff;
  border-radius:50%; box-shadow:0 3px 8px rgba(0,0,0,.15),0 1px 1px rgba(0,0,0,.16);
  transition:transform .26s var(--ressort); pointer-events:none; }
.ap-switch input:checked ~ .ap-piste{ background:var(--green); }
.ap-switch input:checked ~ .ap-pastille{ transform:translateX(20px); }

/* ─ grille ─ */
.ap-grille{ max-width:1080px; margin:0 auto; padding:0 24px;
  display:grid; grid-template-columns:minmax(0,1fr); gap:22px; }
@media (min-width:940px){ .ap-grille{ grid-template-columns:396px minmax(0,1fr); gap:26px; align-items:start; } }

/* ─ carte ─ */
.ap-carte{ background:var(--surface); border-radius:var(--r-l); box-shadow:var(--ombre); overflow:hidden;
  animation:apparait .55s var(--ressort) both; }
@keyframes apparait{ from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:none; } }
.ap-carte-corps{ padding:22px; }
.ap-titre-sec{ font-size:13px; font-weight:600; letter-spacing:.02em; text-transform:uppercase;
  color:var(--label3); margin:0 0 12px; }

/* ─ dépôt ─ */
.ap-depot{ width:100%; border:1.5px dashed var(--sep-fort); border-radius:var(--r-m);
  background:transparent; padding:26px 16px; cursor:pointer; font-family:inherit; color:inherit;
  transition:background .18s, border-color .18s, transform .18s var(--ressort); }
.ap-depot:hover,.ap-depot.actif{ border-color:var(--blue); background:color-mix(in srgb,var(--blue) 6%,transparent); }
.ap-depot:active{ transform:scale(.99); }
.ap-depot-t{ font-size:16px; font-weight:500; }
.ap-depot-s{ font-size:13px; color:var(--label3); margin-top:4px; }

/* ─ liste groupée iOS ─ */
.ap-groupe{ background:var(--surface2); border-radius:var(--r-m); overflow:hidden; }
.ap-rang{ display:flex; gap:13px; padding:11px 13px; align-items:center; }
.ap-rang + .ap-rang{ box-shadow:inset 0 .5px 0 var(--sep); }
.ap-rang img{ width:46px; height:64px; object-fit:cover; border-radius:7px; flex:none; background:var(--fill); }
.ap-rang-info{ flex:1; min-width:0; }
.ap-meta{ font-size:12px; color:var(--label3); margin-top:5px; letter-spacing:0; }
.ap-x{ width:26px; height:26px; border-radius:50%; border:none; background:var(--fill);
  color:var(--label2); cursor:pointer; font-size:15px; line-height:1; flex:none;
  transition:background .18s, transform .18s var(--ressort); }
.ap-x:hover{ background:var(--red); color:#fff; }
.ap-x:active{ transform:scale(.9); }

/* ─ champ étiqueté ─ */
.ap-champ{ margin-top:16px; }
.ap-lbl{ display:block; font-size:13px; font-weight:500; color:var(--label2); margin-bottom:6px; }

/* ─ ligne réglage ─ */
.ap-reglage{ display:flex; align-items:center; gap:14px; margin-top:20px;
  padding:14px; background:var(--surface2); border-radius:var(--r-m); }
.ap-reglage-t{ font-size:15px; font-weight:500; }
.ap-reglage-s{ font-size:13px; color:var(--label3); line-height:1.4; margin-top:2px; }

/* ─ jauge ─ */
.ap-jauge{ margin-top:18px; }
.ap-jauge-l{ display:flex; justify-content:space-between; font-size:13px; color:var(--label2); margin-bottom:7px; }
.ap-piste-j{ height:6px; background:var(--fill); border-radius:980px; overflow:hidden; }
.ap-piste-j i{ display:block; height:100%; border-radius:980px; transition:width .8s var(--ressort); }

/* ─ étapes ─ */
.ap-etapes{ display:flex; flex-direction:column; gap:11px; }
.ap-etape{ display:flex; gap:11px; align-items:center; font-size:15px; color:var(--label2);
  animation:apparait .4s var(--ressort) both; }
.ap-etape.faite{ color:var(--label); }
.ap-pastille-e{ width:20px; height:20px; border-radius:50%; flex:none; display:grid; place-items:center;
  background:var(--fill); color:var(--label3); font-size:11px; }
.ap-etape.faite .ap-pastille-e{ background:var(--green); color:#fff; }

/* ─ verdict ─ */
.ap-verdict{ display:flex; gap:26px; align-items:center; flex-wrap:wrap; padding:26px 22px; }
.ap-verdict-txt{ flex:1; min-width:200px; }
.ap-badge{ display:inline-block; font-size:13px; font-weight:600; padding:4px 11px;
  border-radius:980px; margin-bottom:10px; }
.ap-v-titre{ font-size:26px; font-weight:700; letter-spacing:-.025em; line-height:1.14; margin:0; }
.ap-v-sous{ font-size:16px; line-height:1.47; color:var(--label2); margin:9px 0 0; }

/* ─ constats ─ */
.ap-constat{ display:flex; gap:12px; padding:14px 0; }
.ap-constat + .ap-constat{ box-shadow:inset 0 .5px 0 var(--sep); }
.ap-point{ width:9px; height:9px; border-radius:50%; flex:none; margin-top:6px; }
.ap-c-zone{ font-size:12px; font-weight:600; color:var(--label3); text-transform:uppercase; letter-spacing:.03em; }
.ap-c-titre{ font-size:16px; font-weight:600; margin:3px 0 3px; letter-spacing:-.015em; }
.ap-c-obs{ font-size:15px; line-height:1.47; color:var(--label2); }

.ap-puces{ list-style:none; padding:0; margin:0; }
.ap-puces li{ display:flex; gap:11px; font-size:15px; line-height:1.47; padding:7px 0; color:var(--label2); }
.ap-puces svg{ flex:none; margin-top:2px; }

.ap-msg{ background:var(--surface2); border-radius:var(--r-m); padding:15px;
  font-size:15px; line-height:1.55; white-space:pre-wrap; color:var(--label2); }

.ap-alerte{ background:color-mix(in srgb,var(--red) 10%,transparent); border-radius:var(--r-m);
  padding:15px; font-size:15px; line-height:1.47; color:var(--label); }

.ap-vide{ text-align:center; padding:60px 22px; }
.ap-vide-t{ font-size:18px; font-weight:600; margin-top:14px; }
.ap-vide-s{ font-size:15px; color:var(--label3); margin-top:6px; line-height:1.47; }

.ap-pied{ max-width:1080px; margin:34px auto 0; padding:0 24px; font-size:13px;
  line-height:1.5; color:var(--label3); text-align:center; }

@media (prefers-reduced-motion:reduce){ .ap *{ animation:none!important; transition:none!important; } }
`;

/* Une carte fait 63 × 88 mm. La densité px/mm dit ce qui est lisible :
   <8 la carte est à peine distinguable · 8-15 gros éléments · 15-30 le texte
   des attaques · 30-60 micro-typographie · >60 trame d'impression.        */
const LARGEUR_CARTE_MM = 63;

const ROLES = [
  { v: "recto", t: "Recto" },
  { v: "verso", t: "Verso" },
  { v: "tranche", t: "Tranche" },
  { v: "macro", t: "Gros plan" },
  { v: "lot", t: "Lot de cartes" },
  { v: "autre", t: "Autre" },
];
const PRIORITE = { recto: 0, verso: 1, macro: 2, tranche: 3, lot: 4, autre: 5 };

/* ── mesures pixel dans le navigateur ─────────────────────────── */
function mesurerImage(img) {
  const MAX = 1100;
  const ech = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(2, Math.round(img.naturalWidth * ech));
  const h = Math.max(2, Math.round(img.naturalHeight * ech));

  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;

  const L = new Float32Array(w * h);
  for (let i = 0, p = 0; i < d.length; i += 4, p++)
    L[p] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

  let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      const v = 4 * L[p] - L[p - 1] - L[p + 1] - L[p - w] - L[p + w];
      s += v; s2 += v * v; n++;
    }
  const varLap = n ? s2 / n - (s / n) ** 2 : 0;
  const nettete = Math.max(0, Math.min(100, Math.round(Math.log10(varLap + 1) * 33)));

  let clair = 0, sombre = 0;
  for (let i = 0; i < L.length; i++) { if (L[i] > 249) clair++; else if (L[i] < 7) sombre++; }
  const reflets = Math.round((clair / L.length) * 1000) / 10;
  const bouches = Math.round((sombre / L.length) * 1000) / 10;

  const bord = [];
  for (let x = 0; x < w; x += 3) bord.push(L[x], L[(h - 1) * w + x]);
  for (let y = 0; y < h; y += 3) bord.push(L[y * w], L[y * w + w - 1]);
  bord.sort((a, b) => a - b);
  const fond = bord[Math.floor(bord.length / 2)];

  let minX = w, maxX = -1, minY = h, maxY = -1, dedans = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (Math.abs(L[y * w + x] - fond) > 26) {
        dedans++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
  const emprise = Math.round((dedans / L.length) * 100);
  const lb = maxX > minX ? maxX - minX + 1 : w;
  const hb = maxY > minY ? maxY - minY + 1 : h;
  const pxParMm = Math.round((Math.min(lb, hb) / ech / LARGEUR_CARTE_MM) * 10) / 10;

  let front = 0, nf = 0, interne = 0, ni = 0;
  for (let y = 2; y < h - 2; y++)
    for (let x = 2; x < w - 2; x++) {
      const dx = Math.abs(L[y * w + x] - L[y * w + x - 1]);
      if (x % 8 === 0) { front += dx; nf++; } else { interne += dx; ni++; }
    }
  const blocs = ni && nf ? Math.round(((front / nf) / (interne / ni + 0.001)) * 100) / 100 : 1;

  const T = Math.min(224, w - 4, h - 4);
  const ox = Math.floor((w - T) / 2), oy = Math.floor((h - T) / 2);
  const hp = new Float32Array(T * T);
  for (let y = 1; y < T - 1; y++)
    for (let x = 1; x < T - 1; x++) {
      const p = (oy + y) * w + (ox + x);
      hp[y * T + x] = 4 * L[p] - L[p - 1] - L[p + 1] - L[p - w] - L[p + w];
    }
  let pic = 0, lagPic = 0, base = 0, nb = 0;
  for (let lag = 2; lag <= 14; lag++) {
    let acc = 0, m = 0;
    for (let y = 1; y < T - 1; y += 2)
      for (let x = 1; x < T - 1 - lag; x += 2) { acc += hp[y * T + x] * hp[y * T + x + lag]; m++; }
    const v = m ? acc / m : 0;
    base += Math.abs(v); nb++;
    if (v > pic) { pic = v; lagPic = lag; }
  }
  const moy = nb ? base / nb : 1;
  const periodicite = moy > 0 ? Math.round((pic / moy) * 100) / 100 : 0;

  return { natif: `${img.naturalWidth}×${img.naturalHeight}`, pxParMm, nettete, reflets, bouches, emprise, blocs, periodicite, pasTrame: lagPic };
}

function redimensionner(img, max = 1400, q = 0.85) {
  const e = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * e);
  c.height = Math.round(img.naturalHeight * e);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q).split(",")[1];
}

function plafondPreuve(photos) {
  if (!photos.length) return { plafond: 0, note: 0, manques: [], best: 0 };
  const best = Math.max(...photos.map((p) => p.m.pxParMm));
  const netMoy = photos.reduce((a, p) => a + p.m.nettete, 0) / photos.length;
  const reflMax = Math.max(...photos.map((p) => p.m.reflets));
  const roles = new Set(photos.map((p) => p.role));

  let plafond;
  if (best < 8) plafond = 32;
  else if (best < 15) plafond = 52;
  else if (best < 30) plafond = 72;
  else if (best < 60) plafond = 88;
  else plafond = 94;

  if (!roles.has("verso")) plafond = Math.min(plafond, 62);
  if (netMoy < 34) plafond -= 16;
  if (reflMax > 6) plafond -= 9;
  if (photos.some((p) => p.m.blocs > 1.35)) plafond -= 6;

  const manques = [];
  if (!roles.has("recto")) manques.push("le recto complet, à plat, hors pochette");
  if (!roles.has("verso")) manques.push("le verso complet");
  if (!roles.has("macro")) manques.push("un gros plan du bloc d'attaques et du numéro de collection");
  if (!roles.has("tranche")) manques.push("la tranche de la carte, pour voir la couche noire centrale");

  const v = Math.max(10, Math.min(96, Math.round(plafond)));
  return { plafond: v, note: v, manques, best, netMoy: Math.round(netMoy) };
}

/* Lit le rapport même si la réponse a été coupée en cours de route :
   on referme alors les accolades et crochets restés ouverts.        */
function extraireJSON(txt) {
  const net = String(txt || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const i = net.indexOf("{");
  if (i < 0) return null;
  const src = net.slice(i);

  let prof = 0, chaine = false, esc = false;
  for (let k = 0; k < src.length; k++) {
    const ch = src[k];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { chaine = !chaine; continue; }
    if (chaine) continue;
    if (ch === "{") prof++;
    else if (ch === "}" && --prof === 0) {
      try { return JSON.parse(src.slice(0, k + 1)); } catch { break; }
    }
  }

  const pile = [];
  chaine = false; esc = false;
  for (let k = 0; k < src.length; k++) {
    const ch = src[k];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { chaine = !chaine; continue; }
    if (chaine) continue;
    if (ch === "{" || ch === "[") pile.push(ch);
    else if (ch === "}" || ch === "]") pile.pop();
  }

  let rep = src;
  if (chaine) rep += '"';
  rep = rep.replace(/,\s*$/, "").replace(/,\s*"[^"]*"\s*:?\s*$/, "");
  while (pile.length) rep += pile.pop() === "{" ? "}" : "]";

  try { return JSON.parse(rep); } catch { return null; }
}

const TEINTE = {
  probablement_authentique: "var(--green)",
  indetermine: "var(--orange)",
  suspect: "var(--orange)",
  probablement_faux: "var(--red)",
};
const LIBELLE = {
  probablement_authentique: "Rien ne contredit l'authenticité",
  indetermine: "Indéterminé",
  suspect: "Signaux préoccupants",
  probablement_faux: "Très probablement une contrefaçon",
};
const BADGE = {
  probablement_authentique: "Authentique probable",
  indetermine: "Preuves insuffisantes",
  suspect: "À vérifier",
  probablement_faux: "Contrefaçon",
};

/* ── icônes ── */
const Coche = ({ c = "currentColor" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill={c} />
    <path d="M4.6 8.2l2.2 2.2 4.5-4.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Alerte = ({ c = "currentColor" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill={c} />
    <path d="M8 4.2v4.4M8 11.2v.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/* ── anneaux de progression ── */
function Anneaux({ score, confiance, teinte }) {
  const [anime, setAnime] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnime(true), 60); return () => clearTimeout(t); }, []);
  const R1 = 74, R2 = 55, C1 = 2 * Math.PI * R1, C2 = 2 * Math.PI * R2;
  return (
    <svg width="176" height="176" viewBox="0 0 176 176" role="img"
         aria-label={`Score ${score} sur 100, confiance ${confiance} %`} style={{ flex: "none" }}>
      <g transform="rotate(-90 88 88)">
        <circle cx="88" cy="88" r={R1} fill="none" stroke="var(--fill)" strokeWidth="15" />
        <circle cx="88" cy="88" r={R1} fill="none" stroke={teinte} strokeWidth="15" strokeLinecap="round"
                strokeDasharray={C1} strokeDashoffset={anime ? C1 * (1 - score / 100) : C1}
                style={{ transition: "stroke-dashoffset 1.05s cubic-bezier(.16,1,.3,1)" }} />
        <circle cx="88" cy="88" r={R2} fill="none" stroke="var(--fill)" strokeWidth="11" />
        <circle cx="88" cy="88" r={R2} fill="none" stroke="var(--blue)" strokeWidth="11" strokeLinecap="round"
                strokeDasharray={C2} strokeDashoffset={anime ? C2 * (1 - confiance / 100) : C2}
                style={{ transition: "stroke-dashoffset 1.05s cubic-bezier(.16,1,.3,1) .12s" }} />
      </g>
      <text x="88" y="86" textAnchor="middle" fontSize="40" fontWeight="700"
            fill="var(--label)" letterSpacing="-1.6"
            fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">{score}</text>
      <text x="88" y="106" textAnchor="middle" fontSize="13" fill="var(--label3)"
            fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">confiance {confiance} %</text>
    </svg>
  );
}

export default function Scanner() {
  const [photos, setPhotos] = useState([]);
  const [annonce, setAnnonce] = useState({ url: "", titre: "", prix: "", texte: "" });
  const [approfondi, setApprofondi] = useState(false);
  const [journal, setJournal] = useState([]);
  const [occupe, setOccupe] = useState(false);
  const [collecte, setCollecte] = useState(false);
  const [res, setResultat] = useState(null);
  const [err, setErr] = useState("");
  const [survol, setSurvol] = useState(false);
  const [copie, setCopie] = useState(false);
  const fichierRef = useRef(null);

  const preuve = useMemo(() => plafondPreuve(photos), [photos]);

  const chargerDepuisDataUrl = async (url, nom, roleForce) => {
    const img = await new Promise((r, j) => {
      const i = new Image();
      i.onload = () => r(i); i.onerror = () => j(new Error("Image illisible"));
      i.src = url;
    });
    let m;
    try { m = mesurerImage(img); }
    catch { m = { natif: `${img.naturalWidth}×${img.naturalHeight}`, pxParMm: 0, nettete: 0, reflets: 0, bouches: 0, emprise: 0, blocs: 1, periodicite: 0, pasTrame: 0 }; }
    return { id: crypto.randomUUID(), nom, url, img, m, role: roleForce || "recto" };
  };

  const ajouterFichiers = useCallback(async (fichiers) => {
    setErr("");
    for (const f of Array.from(fichiers).filter((x) => x.type.startsWith("image/")).slice(0, 6)) {
      const url = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
      try {
        const p = await chargerDepuisDataUrl(url, f.name);
        setPhotos((l) => (l.length >= 6 ? l : [...l, p]));
      } catch { /* fichier illisible */ }
    }
  }, []);

  const recupererAnnonce = async () => {
    if (!annonce.url.trim()) return;
    setCollecte(true); setErr(""); setResultat(null); setJournal([]);
    const log = (t, k = "att") => setJournal((j) => [...j, { t, k }]);

    try {
      log("Lecture de l'annonce");
      const r = await fetch(`/api/annonce?url=${encodeURIComponent(annonce.url.trim())}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.erreur || `Lecture refusée (${r.status}).`);

      setAnnonce((a) => ({
        ...a,
        titre: d.titre || a.titre,
        prix: d.prix ? `${d.prix} €` : a.prix,
        texte: d.description || a.texte,
      }));
      log(`Annonce lue, ${d.images.length} photos trouvées`, "ok");

      const nouvelles = [];
      for (let i = 0; i < Math.min(d.images.length, 5); i++) {
        try {
          const rep = await fetch(`/api/image?u=${encodeURIComponent(d.images[i])}`);
          if (!rep.ok) continue;
          const blob = await rep.blob();
          const url = await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(blob); });
          nouvelles.push(await chargerDepuisDataUrl(url, `Photo ${i + 1}`, i === 0 ? "recto" : i === 1 ? "verso" : "autre"));
        } catch { /* photo inaccessible */ }
      }
      if (!nouvelles.length) throw new Error("Photos inaccessibles. Déposez-les vous-même juste en dessous.");

      setPhotos(nouvelles);
      log(`${nouvelles.length} photos mesurées`, "ok");
      log("Vérifiez le rôle de chaque photo, puis lancez le contrôle");
    } catch (e) {
      setErr(e.message);
    } finally { setCollecte(false); }
  };

  const lancer = async () => {
    if (!photos.length) return;
    setOccupe(true); setErr(""); setResultat(null);
    const log = (t, k = "att") => setJournal((j) => [...j, { t, k }]);

    try {
      const retenues = [...photos]
        .sort((a, b) => (PRIORITE[a.role] - PRIORITE[b.role]) || (b.m.pxParMm - a.m.pxParMm))
        .slice(0, 3);
      log(`Meilleure densité ${preuve.best?.toFixed(1) ?? 0} px/mm`, "ok");
      const encodees = retenues.map((p) => redimensionner(p.img));
      log(approfondi ? "Vérification du catalogue en ligne" : "Analyse en cours");

      const contexte = retenues.map((p, i) =>
        `Photo ${i + 1} — rôle: ${p.role} | natif ${p.m.natif} | densité ${p.m.pxParMm} px/mm | netteté ${p.m.nettete}/100 | reflets ${p.m.reflets}% | noirs bouchés ${p.m.bouches}% | emprise ${p.m.emprise}% | artefacts JPEG ${p.m.blocs} | périodicité ${p.m.periodicite} (pas ${p.m.pasTrame}px)`
      ).join("\n");

      const consigne = `Tu es expert en authentification de cartes Pokémon TCG à partir de photos d'annonces de seconde main.

Contexte 2026 : les contrefaçons haut de gamme reproduisent désormais correctement les polices, les motifs holographiques et parfois la texture. Les indices visuels d'il y a cinq ans ne suffisent plus. Le signal le plus discriminant reste la COHÉRENCE CATALOGUE.

Métriques mesurées sur les pixels (elles déterminent ce qui est physiquement vérifiable) :
${contexte}

Repères de lisibilité : <8 px/mm la carte est à peine distinguable ; 8-15 gros éléments seulement ; 15-30 le texte des attaques devient lisible ; 30-60 micro-typographie et bavures ; >60 trame d'impression analysable.

Annonce : titre="${annonce.titre || "non fourni"}" | prix="${annonce.prix || "non fourni"}" | description="${(annonce.texte || "non fournie").slice(0, 700)}"

Méthode, dans cet ordre :
1. IDENTIFIER : nom, extension, numéro de collection, symbole de rareté, langue, époque.
2. COHÉRENCE CATALOGUE (signal le plus fort) : cette combinaison existe-t-elle ? numéro vs total de l'extension, rareté vs numéro, crédit illustrateur, ligne de copyright vs époque, style du symbole d'énergie, type d'holo vs époque, carte réellement imprimée dans cette langue. Les numéros et extensions inventés sont le piège le plus fréquent.
3. IMPRESSION ET TYPOGRAPHIE : graisses et crénage du nom, des PV et des attaques, niveau de noir, épaisseur et régularité de la bordure jaune, centrage, saturation, halo autour des glyphes.
4. SURFACE : holo cohérent avec l'époque et la rareté, texture là où elle est attendue, uniformité du vernis.
5. VERSO si présent : teinte du bleu, rondeur et centrage de la Poké Ball, détail du tourbillon, symétrie des marges, ligne ©.
6. TRANCHE si présente : couche noire centrale visible.
7. ANNONCE : prix vs marché réel, vocabulaire (proxy, orica, custom, réplique, fanmade), photos manifestement reprises d'ailleurs, composition du lot.

Règles strictes :
- N'invente jamais un indice que tu ne peux pas voir. Utilise "non_verifiable" largement.
- Si la densité px/mm est insuffisante pour un critère, marque-le "non_verifiable" au lieu de deviner.
- Se tromper dans les deux sens coûte cher. Préfère "indetermine" assorti d'une liste précise de photos à réclamer.

Réponds UNIQUEMENT par ce JSON, sans préambule ni markdown. 7 contrôles maximum. Chaque chaîne fait au plus 110 caractères, sauf "resume" et "observation" qui vont jusqu'à 280. Le "resume" tient en deux phrases :
{"identification":{"carte":"","extension":"","numero":"","langue":"","coherence":"coherent|incoherent|indetermine","note":""},
"controles":[{"zone":"","critere":"","observation":"","verdict":"conforme|suspect|non_verifiable"}],
"drapeaux":[""],"positifs":[""],
"score":0,"confiance":0,
"verdict":"probablement_authentique|indetermine|suspect|probablement_faux",
"resume":"","questions":[""]}`;

      const corps = {
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: [
            ...encodees.map((b64) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } })),
            { type: "text", text: consigne },
          ],
        }],
      };
      if (approfondi) corps.tools = [{ type: "web_search_20250305", name: "web_search" }];

      const rep = await fetch("/api/analyse", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps),
      });
      const data = await rep.json();
      if (!rep.ok) throw new Error(data.erreur || data.error?.message || `Analyse indisponible (${rep.status}).`);

      const texte = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n");
      if (!texte.trim()) throw new Error(`Réponse vide (arrêt : ${data.stop_reason || "inconnu"}).`);

      const j = extraireJSON(texte);
      if (!j) throw new Error(`Rapport illisible. Début reçu : ${texte.slice(0, 220)}`);
      if (data.stop_reason === "max_tokens") log("Réponse coupée, rapport reconstitué", "ok");
      log("Rapport prêt", "ok");

      const confBrute = Math.max(0, Math.min(100, Number(j.confiance) || 0));
      const conf = Math.min(confBrute, preuve.plafond);
      let verdict = j.verdict || "indetermine";
      if (conf < 45 && verdict === "probablement_authentique") verdict = "indetermine";
      if (j.identification?.coherence === "incoherent") verdict = "probablement_faux";

      setResultat({ ...j, confiance: conf, confBrute, verdict, score: Math.max(0, Math.min(100, Number(j.score) || 0)) });
    } catch (e) {
      setErr(e.message || "Échec de l'analyse.");
    } finally { setOccupe(false); }
  };

  const messageVendeur = res
    ? `Bonjour,\n\nJe suis intéressé(e) par votre annonce. Avant d'acheter, pourriez-vous m'envoyer :\n${
        [...(res.questions || []), ...preuve.manques].filter(Boolean).slice(0, 6).map((q) => `• ${q}`).join("\n")
      }\n\nDes photos nettes, à plat, hors pochette et sans reflet direct suffisent. Merci beaucoup !`
    : "";

  const copier = () =>
    navigator.clipboard?.writeText(messageVendeur).then(() => { setCopie(true); setTimeout(() => setCopie(false), 1800); });

  const teinteJauge = preuve.note > 70 ? "var(--green)" : preuve.note > 45 ? "var(--orange)" : "var(--red)";

  return (
    <div className="ap">
      <style>{CSS}</style>

      <header className="ap-hero">
        <div className="ap-eyebrow">Contrôle d'authenticité</div>
        <h1 className="ap-h1">Faux ou authentique.<br />Vous saurez avant d'acheter.</h1>
        <p className="ap-lead">
          Collez le lien d'une annonce Vinted. Le contrôle mesure d'abord ce que les photos
          permettent réellement d'affirmer, puis confronte la carte au catalogue officiel.
        </p>
        <div className="ap-recherche">
          <input className="ap-input" placeholder="vinted.fr/items/…" value={annonce.url}
                 aria-label="Lien de l'annonce Vinted"
                 onChange={(e) => setAnnonce({ ...annonce, url: e.target.value })}
                 onKeyDown={(e) => e.key === "Enter" && recupererAnnonce()} />
          <button className="ap-btn" onClick={recupererAnnonce} disabled={collecte || !annonce.url.trim()}>
            {collecte ? "Lecture…" : "Lire l'annonce"}
          </button>
        </div>
      </header>

      <div className="ap-grille">
        {/* ── colonne des pièces ── */}
        <section className="ap-carte">
          <div className="ap-carte-corps">
            <h2 className="ap-titre-sec">Pièces · {photos.length} sur 6</h2>

            <button type="button" className={`ap-depot ${survol ? "actif" : ""}`}
                    onClick={() => fichierRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setSurvol(true); }}
                    onDragLeave={() => setSurvol(false)}
                    onDrop={(e) => { e.preventDefault(); setSurvol(false); ajouterFichiers(e.dataTransfer.files); }}>
              <div className="ap-depot-t">Déposer des photos</div>
              <div className="ap-depot-s">Quand Vinted refuse la lecture automatique</div>
            </button>
            <input ref={fichierRef} type="file" accept="image/*" multiple hidden
                   onChange={(e) => { ajouterFichiers(e.target.files); e.target.value = ""; }} />

            {photos.length > 0 && (
              <div className="ap-groupe" style={{ marginTop: 14 }}>
                {photos.map((p) => (
                  <div className="ap-rang" key={p.id}>
                    <img src={p.url} alt={p.nom} />
                    <div className="ap-rang-info">
                      <select className="ap-menu" value={p.role} aria-label={`Rôle de ${p.nom}`}
                              onChange={(e) => setPhotos((l) => l.map((q) => q.id === p.id ? { ...q, role: e.target.value } : q))}>
                        {ROLES.map((r) => <option key={r.v} value={r.v}>{r.t}</option>)}
                      </select>
                      <div className="ap-meta ap-mono">
                        {p.m.pxParMm} px/mm · netteté {p.m.nettete} · reflets {p.m.reflets} %
                      </div>
                    </div>
                    <button className="ap-x" aria-label="Retirer cette photo"
                            onClick={() => setPhotos((l) => l.filter((q) => q.id !== p.id))}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="ap-champ">
              <label className="ap-lbl" htmlFor="ap-t">Titre de l'annonce</label>
              <input id="ap-t" className="ap-input" value={annonce.titre}
                     onChange={(e) => setAnnonce({ ...annonce, titre: e.target.value })} />
            </div>
            <div className="ap-champ">
              <label className="ap-lbl" htmlFor="ap-p">Prix demandé</label>
              <input id="ap-p" className="ap-input" value={annonce.prix}
                     onChange={(e) => setAnnonce({ ...annonce, prix: e.target.value })} />
            </div>
            <div className="ap-champ">
              <label className="ap-lbl" htmlFor="ap-d">Description du vendeur</label>
              <textarea id="ap-d" className="ap-zone" value={annonce.texte}
                        onChange={(e) => setAnnonce({ ...annonce, texte: e.target.value })} />
            </div>

            <div className="ap-reglage">
              <div style={{ flex: 1 }}>
                <div className="ap-reglage-t">Vérifier le catalogue</div>
                <div className="ap-reglage-s">Confronte extension, numéro et rareté aux bases publiques. Plus lent.</div>
              </div>
              <label className="ap-switch">
                <input type="checkbox" checked={approfondi} aria-label="Vérifier le catalogue en ligne"
                       onChange={(e) => setApprofondi(e.target.checked)} />
                <span className="ap-piste" /><span className="ap-pastille" />
              </label>
            </div>

            <button className="ap-btn pleine" style={{ marginTop: 18 }}
                    disabled={!photos.length || occupe || collecte} onClick={lancer}>
              {occupe ? "Analyse en cours…" : "Lancer le contrôle"}
            </button>

            {photos.length > 0 && (
              <div className="ap-jauge">
                <div className="ap-jauge-l">
                  <span>Qualité de preuve</span>
                  <span className="ap-mono">{preuve.note} / 100</span>
                </div>
                <div className="ap-piste-j"><i style={{ width: `${preuve.note}%`, background: teinteJauge }} /></div>
                <div className="ap-meta">Plafonne la confiance du verdict à {preuve.plafond} %.</div>
              </div>
            )}
          </div>
        </section>

        {/* ── colonne du rapport ── */}
        <section style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {journal.length > 0 && (
            <div className="ap-carte">
              <div className="ap-carte-corps">
                <h2 className="ap-titre-sec">{occupe || collecte ? "En cours" : "Terminé"}</h2>
                <div className="ap-etapes">
                  {journal.map((l, i) => (
                    <div key={i} className={`ap-etape ${l.k === "ok" ? "faite" : ""}`}>
                      <span className="ap-pastille-e">{l.k === "ok" ? "✓" : "·"}</span>
                      <span>{l.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {err && (
            <div className="ap-carte"><div className="ap-carte-corps"><div className="ap-alerte">{err}</div></div></div>
          )}

          {!res && !occupe && !err && (
            <div className="ap-carte">
              <div className="ap-vide">
                <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
                  <circle cx="21" cy="21" r="13" stroke="var(--label3)" strokeWidth="2.4" />
                  <path d="M30.5 30.5L40 40" stroke="var(--label3)" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                <div className="ap-vide-t">Aucun contrôle en cours</div>
                <div className="ap-vide-s">Le recto et le verso suffisent pour démarrer.</div>
              </div>
            </div>
          )}

          {res && (
            <>
              <div className="ap-carte">
                <div className="ap-verdict">
                  <Anneaux score={res.score} confiance={res.confiance} teinte={TEINTE[res.verdict]} />
                  <div className="ap-verdict-txt">
                    <span className="ap-badge" style={{
                      background: `color-mix(in srgb, ${TEINTE[res.verdict]} 16%, transparent)`,
                      color: TEINTE[res.verdict],
                    }}>{BADGE[res.verdict]}</span>
                    <h2 className="ap-v-titre">{LIBELLE[res.verdict]}</h2>
                    {res.confiance < res.confBrute && (
                      <p className="ap-meta">Confiance abaissée depuis {res.confBrute} % : les photos ne permettent pas d'aller plus loin.</p>
                    )}
                  </div>
                </div>

                {res.resume && (
                  <div className="ap-carte-corps" style={{ paddingTop: 0 }}>
                    <p className="ap-v-sous" style={{ margin: 0 }}>{res.resume}</p>
                  </div>
                )}

                {res.identification && (
                  <div className="ap-carte-corps" style={{ paddingTop: 0 }}>
                    <div className="ap-groupe" style={{ padding: "13px 15px" }}>
                      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-.015em" }}>
                        {res.identification.carte || "Carte non identifiée"}
                      </div>
                      <div className="ap-meta" style={{ marginTop: 4 }}>
                        {res.identification.extension || "extension inconnue"} · n° {res.identification.numero || "—"} · {res.identification.langue || "—"}
                      </div>
                      <div style={{
                        marginTop: 7, fontSize: 14, fontWeight: 500,
                        color: res.identification.coherence === "incoherent" ? "var(--red)"
                             : res.identification.coherence === "coherent" ? "var(--green)" : "var(--label2)",
                      }}>
                        Catalogue : {res.identification.coherence || "indéterminé"}
                        {res.identification.note ? ` — ${res.identification.note}` : ""}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {Array.isArray(res.controles) && res.controles.length > 0 && (
                <div className="ap-carte">
                  <div className="ap-carte-corps">
                    <h2 className="ap-titre-sec">Contrôles</h2>
                    {res.controles.map((c, i) => (
                      <div className="ap-constat" key={i}>
                        <span className="ap-point" style={{
                          background: c.verdict === "suspect" ? "var(--red)"
                                    : c.verdict === "conforme" ? "var(--green)" : "var(--label3)",
                        }} />
                        <div>
                          <div className="ap-c-zone">{c.zone} · {c.verdict === "non_verifiable" ? "non vérifiable" : c.verdict}</div>
                          <div className="ap-c-titre">{c.critere}</div>
                          <div className="ap-c-obs">{c.observation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(res.drapeaux?.filter(Boolean).length > 0 || res.positifs?.filter(Boolean).length > 0) && (
                <div className="ap-carte">
                  <div className="ap-carte-corps">
                    {res.drapeaux?.filter(Boolean).length > 0 && (
                      <>
                        <h2 className="ap-titre-sec">Anomalies</h2>
                        <ul className="ap-puces" style={{ marginBottom: 18 }}>
                          {res.drapeaux.filter(Boolean).map((d, i) => (
                            <li key={i}><Alerte c="var(--red)" /><span>{d}</span></li>
                          ))}
                        </ul>
                      </>
                    )}
                    {res.positifs?.filter(Boolean).length > 0 && (
                      <>
                        <h2 className="ap-titre-sec">Éléments conformes</h2>
                        <ul className="ap-puces">
                          {res.positifs.filter(Boolean).map((d, i) => (
                            <li key={i}><Coche c="var(--green)" /><span>{d}</span></li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="ap-carte">
                <div className="ap-carte-corps">
                  <h2 className="ap-titre-sec">Message au vendeur</h2>
                  <div className="ap-msg">{messageVendeur}</div>
                  <button className="ap-btn discret" style={{ marginTop: 12 }} onClick={copier}>
                    {copie ? "Copié" : "Copier"}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <p className="ap-pied">
        Le contrôle porte sur des photographies, pas sur la carte. Il oriente une décision d'achat ;
        il ne remplace pas un examen en main ni une notation professionnelle.
        Sur une carte à forte valeur, la certitude passe par PSA, BGS ou CGC.
      </p>
    </div>
  );
}
