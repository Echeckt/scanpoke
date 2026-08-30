import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

/* ────────────────────────────────────────────────────────────────
   CONTRÔLE D'AUTHENTICITÉ — cartes Pokémon TCG
   Langage visuel : cabinet d'expertise plutôt que HIG grand public —
   obsidienne, or de certificat, rouge Poké Ball en accent de marque,
   Fraunces en display pour les verdicts, SF Pro pour l'interface.
   Un seul écran doit tenir sans scroll sur un ordinateur portable :
   la place gagnée sur le héros va aux pièces et au rapport.
   ──────────────────────────────────────────────────────────────── */

const CSS = `
.ap{
  --bg:#0B0A0C; --surface:#151417; --surface2:#1B1A1E; --fill:rgba(255,255,255,.06);
  --label:#F3F1EC; --label2:#A6A3AA; --label3:#726F78;
  --sep:rgba(255,255,255,.08); --sep-fort:rgba(255,255,255,.16);
  --blue:#E4B84B; --green:#34C77A; --orange:#F2A93B; --red:#F0454F;
  --marque:#E5484D; --marque-onde:rgba(229,72,77,.16);
  --r-l:20px; --r-m:14px; --r-s:10px;
  --ombre:0 24px 60px -24px rgba(0,0,0,.65), 0 1px 0 rgba(255,255,255,.04) inset;
  --ressort:cubic-bezier(.16,1,.3,1);
  --affiche:"Fraunces","Iowan Old Style","Palatino Linotype",Georgia,serif;

  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif;
  background:
    radial-gradient(900px 480px at 12% -8%, var(--marque-onde), transparent 60%),
    radial-gradient(760px 420px at 100% 0%, rgba(228,184,75,.13), transparent 55%),
    var(--bg);
  color:var(--label); min-height:100%;
  padding:0 0 52px; letter-spacing:-.01em;
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
}
.ap *{ box-sizing:border-box; }
.ap-mono{ font-family:ui-monospace,"SF Mono",SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums; }

/* ─ en-tête compact ─ */
.ap-entete{ position:sticky; top:0; z-index:30; backdrop-filter:blur(20px) saturate(160%);
  -webkit-backdrop-filter:blur(20px) saturate(160%);
  background:rgba(11,10,12,.74); border-bottom:1px solid var(--sep); }
.ap-entete-haut{ max-width:1080px; margin:0 auto; padding:13px 24px; display:flex;
  align-items:center; gap:22px; flex-wrap:wrap; }
.ap-marque{ display:flex; align-items:center; gap:11px; flex:none; }
.ap-marque-txt{ display:flex; flex-direction:column; line-height:1.18; }
.ap-marque-nom{ font-family:var(--affiche); font-size:17px; font-weight:600; letter-spacing:-.01em; }
.ap-marque-sub{ font-size:11.5px; color:var(--label3); letter-spacing:.02em; text-transform:uppercase; margin-top:1px; }
.ap-tagline{ max-width:1080px; margin:0 auto; padding:10px 24px 0;
  font-size:13.5px; color:var(--label3); line-height:1.5; }

/* ─ barre de recherche ─ */
.ap-recherche{ display:flex; gap:9px; flex:1; min-width:260px; max-width:560px; margin:0 0 0 auto; }
.ap-recherche .ap-input{ flex:1; min-width:0; height:42px; font-size:15px;
  border-radius:980px; padding:0 18px; text-align:left; }

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
.ap-recherche .ap-btn{ height:42px; font-size:14.5px; padding:0 20px; flex:none; }

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
.ap-grille{ max-width:1080px; margin:0 auto; padding:16px 24px 0;
  display:grid; grid-template-columns:minmax(0,1fr); gap:16px; }
@media (min-width:940px){ .ap-grille{ grid-template-columns:376px minmax(0,1fr); gap:18px; align-items:start; } }

/* ─ carte ─ */
.ap-carte{ background:var(--surface); border:1px solid var(--sep); border-radius:var(--r-l);
  box-shadow:var(--ombre); overflow:hidden; animation:apparait .5s var(--ressort) both; }
@keyframes apparait{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:none; } }
.ap-carte-corps{ padding:18px; }
.ap-titre-sec{ font-size:12px; font-weight:600; letter-spacing:.03em; text-transform:uppercase;
  color:var(--label3); margin:0 0 10px; }

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
.ap-reglage{ display:flex; align-items:center; gap:14px; margin-top:14px;
  padding:12px 14px; background:var(--surface2); border-radius:var(--r-m); }
.ap-reglage-t{ font-size:15px; font-weight:500; }
.ap-reglage-s{ font-size:13px; color:var(--label3); line-height:1.4; margin-top:2px; }

/* ─ jauge ─ */
.ap-jauge{ margin-top:14px; }
.ap-jauge-l{ display:flex; justify-content:space-between; font-size:13px; color:var(--label2); margin-bottom:7px; }
.ap-piste-j{ height:6px; background:var(--fill); border-radius:980px; overflow:hidden; }
.ap-piste-j i{ display:block; height:100%; border-radius:980px; transition:width .8s var(--ressort); }

/* ─ étapes ─ */
.ap-etapes{ display:flex; flex-direction:column; gap:11px; }
.ap-etape{ display:flex; gap:11px; align-items:center; font-size:15px; color:var(--label2);
  animation:apparait .4s var(--ressort) both; }
.ap-etape.faite{ color:var(--label); }
.ap-etape.active{ color:var(--label); }
.ap-pastille-e{ width:20px; height:20px; border-radius:50%; flex:none; display:grid; place-items:center;
  background:var(--fill); color:var(--label3); font-size:11px; }
.ap-etape.faite .ap-pastille-e{ background:var(--green); color:#fff; }
.ap-pastille-e.tourne{ background:transparent; border:2px solid var(--sep-fort);
  border-top-color:var(--blue); animation:tourne .8s linear infinite; }
@keyframes tourne{ to{ transform:rotate(360deg); } }
.ap-etape.active .ap-etape-txt{ animation:respire 1.6s ease-in-out infinite; }
@keyframes respire{ 0%,100%{ opacity:1; } 50%{ opacity:.5; } }

/* ─ verdict ─ */
.ap-verdict{ display:flex; gap:20px; align-items:center; flex-wrap:wrap; padding:20px 18px; }
.ap-verdict-txt{ flex:1; min-width:200px; }
.ap-badge{ display:inline-block; font-size:12.5px; font-weight:600; padding:4px 11px;
  border-radius:980px; margin-bottom:9px; }
.ap-v-titre{ font-family:var(--affiche); font-size:25px; font-weight:600; letter-spacing:-.015em; line-height:1.16; margin:0; }
.ap-v-sous{ font-size:15px; line-height:1.47; color:var(--label2); margin:8px 0 0; }

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

.ap-vide{ text-align:center; padding:40px 22px; }
.ap-vide-t{ font-size:17px; font-weight:600; margin-top:12px; }
.ap-vide-s{ font-size:14px; color:var(--label3); margin-top:5px; line-height:1.47; }

.ap-pied{ max-width:1080px; margin:22px auto 0; padding:0 24px; font-size:12.5px;
  line-height:1.5; color:var(--label3); text-align:center; }

/* ─ calibration ─ */
.ap-calib{ display:grid; grid-template-columns:repeat(auto-fit,minmax(132px,1fr)); gap:1px;
  background:var(--sep); border-radius:var(--r-m); overflow:hidden; }
.ap-calib > div{ background:var(--surface); padding:14px 15px; }
.ap-calib-n{ font-size:26px; font-weight:700; letter-spacing:-.03em; line-height:1.1; }
.ap-calib-l{ font-size:12.5px; color:var(--label3); margin-top:3px; line-height:1.35; }

.ap-verite{ display:inline-flex; gap:6px; align-items:center; flex-wrap:wrap; }
.ap-verite button{ border:1px solid var(--sep-fort); background:transparent; cursor:pointer;
  font-family:inherit; font-size:12.5px; font-weight:500; color:var(--label2);
  padding:4px 11px; border-radius:980px; transition:all .16s; }
.ap-verite button:hover{ border-color:var(--label3); }
.ap-verite button[aria-pressed="true"].vraie{ background:var(--green); border-color:var(--green); color:#fff; }
.ap-verite button[aria-pressed="true"].fausse{ background:var(--red); border-color:var(--red); color:#fff; }

/* ─ sélecteur segmenté ─ */
.ap-seg{ display:inline-flex; background:var(--fill); border-radius:8px; padding:2px; gap:2px; }
.ap-seg button{ border:none; background:none; cursor:pointer; font-family:inherit; font-size:12px;
  font-weight:500; color:var(--label2); padding:4px 10px; border-radius:6px;
  transition:background .16s, color .16s; }
.ap-seg button[aria-pressed="true"]{ background:var(--surface); color:var(--label);
  box-shadow:0 1px 3px rgba(0,0,0,.12); }

/* ─ étiquette de catégorie ─ */
.ap-cat{ display:inline-block; font-size:10.5px; font-weight:600; letter-spacing:.04em;
  text-transform:uppercase; padding:2px 7px; border-radius:5px; margin-left:7px;
  background:var(--fill); color:var(--label3); vertical-align:1px; }
.ap-cat.probant{ background:color-mix(in srgb,var(--blue) 15%,transparent); color:var(--blue); }

/* ─ avertissement doublon ─ */
.ap-avert{ max-width:1080px; margin:0 auto; display:flex; gap:12px; align-items:center;
  background:color-mix(in srgb,var(--orange) 13%,transparent); border-radius:var(--r-m);
  padding:11px 16px; text-align:left; animation:apparait .4s var(--ressort) both; }
.ap-avert-t{ font-size:14px; line-height:1.4; flex:1; }

/* ─ historique ─ */
.ap-hist{ max-width:1080px; margin:16px auto 0; padding:0 24px; }
.ap-hist-tete{ display:flex; align-items:baseline; justify-content:space-between; gap:14px; margin-bottom:10px; }
.ap-hist-rang{ display:flex; gap:13px; padding:11px 13px; align-items:center; cursor:pointer;
  border:none; background:none; width:100%; text-align:left; font-family:inherit; color:inherit;
  transition:background .16s; }
.ap-hist-rang + .ap-hist-rang{ box-shadow:inset 0 .5px 0 var(--sep); }
.ap-hist-rang:hover{ background:var(--fill); }
.ap-hist-rang img{ width:38px; height:53px; object-fit:cover; border-radius:6px; flex:none; background:var(--fill); }
.ap-hist-info{ flex:1; min-width:0; }
.ap-hist-t{ font-size:15px; font-weight:500; letter-spacing:-.01em; overflow:hidden;
  text-overflow:ellipsis; white-space:nowrap; }
.ap-pastille-v{ font-size:12px; font-weight:600; padding:3px 9px; border-radius:980px; flex:none; }

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
const EDITIONS = [
  { v: "japonaise", t: "Dos japonais" },
  { v: "internationale", t: "Dos international" },
  { v: "indetermine", t: "Édition ?" },
];

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
  let sMin = Infinity, sMax = -Infinity, dMin = Infinity, dMax = -Infinity;
  const coins = { hg: null, bd: null, bg: null, hd: null };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (Math.abs(L[y * w + x] - fond) > 26) {
        dedans++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        const su = x + y, di = x - y;
        if (su < sMin) { sMin = su; coins.hg = [x, y]; }
        if (su > sMax) { sMax = su; coins.bd = [x, y]; }
        if (di < dMin) { dMin = di; coins.bg = [x, y]; }
        if (di > dMax) { dMax = di; coins.hd = [x, y]; }
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

  /* ── colorimétrie ──────────────────────────────────────────────
     Le pourtour de la photo sert d'étalon de lumière : on ramène le
     fond au neutre avant de mesurer, sinon une lampe chaude suffit à
     faire passer une carte pour sursaturée. Les presses de 1996 ont
     un gamut plus étroit que les imprimantes actuelles : une
     saturation trop haute est un signal de réimpression.          */
  let br = 0, bgv = 0, bbv = 0, bn = 0;
  const bord3 = (p) => { const i = p * 4; br += d[i]; bgv += d[i + 1]; bbv += d[i + 2]; bn++; };
  for (let x = 0; x < w; x += 3) { bord3(x); bord3((h - 1) * w + x); }
  for (let y = 0; y < h; y += 3) { bord3(y * w); bord3(y * w + w - 1); }
  const cible = bn ? (br + bgv + bbv) / (3 * bn) : 128;
  const kr = br > 0 ? cible / (br / bn) : 1;
  const kg = bgv > 0 ? cible / (bgv / bn) : 1;
  const kb = bbv > 0 ? cible / (bbv / bn) : 1;

  let sSom = 0, sN = 0, vives = 0;
  const echSat = [];
  // Zones utiles : le centre porte la Poké Ball, le pourtour porte
  // la bordure jaune des faces avant.
  const cx0 = minX + (maxX - minX) * 0.35, cx1 = minX + (maxX - minX) * 0.65;
  const cy0 = minY + (maxY - minY) * 0.35, cy1 = minY + (maxY - minY) * 0.65;
  const mx0 = minX + (maxX - minX) * 0.08, mx1 = maxX - (maxX - minX) * 0.08;
  const my0 = minY + (maxY - minY) * 0.08, my1 = maxY - (maxY - minY) * 0.08;
  let bleus = 0, jaunes = 0, rougesC = 0, nC = 0, jaunesB = 0, nB = 0, satBleuSom = 0, nBleu = 0;
  let sommeBruitC = 0, nBruitC = 0, teintePrecC = null, xPrecC = null;

  for (let y = Math.max(0, minY); y <= Math.min(h - 1, maxY); y++)
    for (let x = Math.max(0, minX); x <= Math.min(w - 1, maxX); x++) {
      const p = y * w + x;
      if (Math.abs(L[p] - fond) <= 26) continue;
      const i = p * 4;
      const r = d[i] * kr, g = d[i + 1] * kg, b = d[i + 2] * kb;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx < 12) continue;
      const sat = (mx - mn) / mx;
      sSom += sat; sN++;
      if (sat > 0.8) vives++;
      if ((sN & 7) === 0) echSat.push(sat);

      const dl = mx - mn;
      let teinte = 0;
      if (dl > 0) {
        if (mx === r) teinte = 60 * ((((g - b) / dl) % 6) + 6) % 360;
        else if (mx === g) teinte = 60 * ((b - r) / dl + 2);
        else teinte = 60 * ((r - g) / dl + 4);
        if (teinte < 0) teinte += 360;
      }
      const estBleu = teinte >= 190 && teinte <= 255 && sat > 0.22;
      const estJaune = teinte >= 38 && teinte <= 72 && sat > 0.3;
      const estRouge = (teinte < 18 || teinte > 342) && sat > 0.35;
      if (estBleu) { bleus++; satBleuSom += sat; nBleu++; }
      if (estJaune) jaunes++;

      const auCentre = x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1;
      if (auCentre) {
        nC++; if (estRouge) rougesC++;
        // Un aplat imprimé (la Poké Ball) est fait de quelques zones de
        // couleur unie : la teinte ne saute qu'aux quelques pixels de
        // frontière entre elles. Une illustration ou un fond holographique
        // scintille pixel à pixel, partout — d'où l'écart moyen entre
        // voisins immédiats plutôt qu'une variance sur toute la zone, qui
        // confondrait à tort "deux aplats différents" et "du bruit".
        if (sat > 0.15) {
          if (teintePrecC !== null && x === xPrecC + 1) {
            let diff = Math.abs(teinte - teintePrecC);
            if (diff > 180) diff = 360 - diff;
            sommeBruitC += diff; nBruitC++;
          }
          teintePrecC = teinte; xPrecC = x;
        } else {
          teintePrecC = null; xPrecC = null;
        }
      }
      const auBord = x < mx0 || x > mx1 || y < my0 || y > my1;
      if (auBord) { nB++; if (estJaune) jaunesB++; }
    }
  echSat.sort((a, b) => a - b);
  const satMoy = sN ? Math.round((sSom / sN) * 1000) / 10 : 0;
  const satP90 = echSat.length ? Math.round(echSat[Math.floor(echSat.length * 0.9)] * 1000) / 10 : 0;
  const partVive = sN ? Math.round((vives / sN) * 1000) / 10 : 0;
  const partBleu = sN ? Math.round((bleus / sN) * 1000) / 10 : 0;
  const partJaune = sN ? Math.round((jaunes / sN) * 1000) / 10 : 0;
  const rougeCentre = nC ? Math.round((rougesC / nC) * 1000) / 10 : 0;
  const jauneBord = nB ? Math.round((jaunesB / nB) * 1000) / 10 : 0;
  // Écart moyen de teinte (en degrés) entre pixels voisins dans la zone
  // centrale. Proche de 0 = quelques aplats nets (Poké Ball authentique).
  // Élevé = ça scintille partout (illustration détaillée, holo, paillettes).
  const bruitTeinteCentre = nBruitC ? Math.round((sommeBruitC / nBruitC) * 10) / 10 : 0;
  // Saturation moyenne des pixels bleus seulement (pas de toute la carte) :
  // le dos japonais est décrit comme plus sombre et plus saturé que le dos
  // international, plus clair. Sert uniquement à une suggestion automatique
  // d'édition, jamais imposée — c'est un repère, pas une mesure calibrée.
  const satBleu = nBleu ? Math.round((satBleuSom / nBleu) * 1000) / 10 : 0;

  /* ── géométrie ─────────────────────────────────────────────────
     Une photo prise de biais rend le centrage, l'épaisseur de bordure
     et le crénage inexploitables. On mesure le biais pour interdire
     ces critères plutôt que de les juger sur une image déformée.  */
  let biais = 0, ratio = 0;
  if (coins.hg && coins.hd && coins.bg && coins.bd) {
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const haut = dist(coins.hg, coins.hd), bas = dist(coins.bg, coins.bd);
    const gau = dist(coins.hg, coins.bg), dro = dist(coins.hd, coins.bd);
    if (haut && bas && gau && dro) {
      biais = Math.round(Math.max(haut / bas, bas / haut, gau / dro, dro / gau) * 100) / 100;
      ratio = Math.round((Math.min(haut, bas) / Math.max(gau, dro)) * 100) / 100;
    }
  }

  return {
    natif: `${img.naturalWidth}×${img.naturalHeight}`, pxParMm, nettete, reflets, bouches, emprise, blocs,
    periodicite, pasTrame: lagPic, satMoy, satP90, partVive, biais, ratio,
    partBleu, partJaune, rougeCentre, jauneBord, bruitTeinteCentre, satBleu,
  };
}

/* ── reconnaissance automatique du rôle ────────────────────────
   Le dos est le seul motif rigoureusement identique sur toutes les
   cartes jamais imprimées : vaste champ bleu, rayons blancs, Poké
   Ball rouge et blanche au centre. C'est donc la face la plus facile
   à reconnaître de tout le jeu, et il n'y avait aucune raison de la
   deviner par l'ordre d'arrivée des photos.                      */
function deduireRole(m) {
  const formeCarte = m.ratio > 0 && Math.abs(m.ratio - 0.716) < 0.14;

  // Un recadrage serré remplit presque tout le cadre ; un lot de cartes
  // laisse voir le fond entre les cartes et autour. C'est ce qui les sépare.
  if (!formeCarte && m.emprise > 72) return "macro";
  if (m.ratio > 1.05 && m.emprise >= 40 && m.emprise <= 72) return "lot";
  if (!formeCarte && m.emprise > 55) return "macro";

  // Bleu dominant plus rouge au centre : c'est la Poké Ball — mais seulement
  // si ce centre est un aplat imprimé. Un Pokémon rouge/orange sur fond
  // holographique donne le même bleu+rouge sans être un dos : sa teinte,
  // elle, saute partout (illustration, paillettes), donc on l'exclut ici.
  const centreAplat = m.bruitTeinteCentre < 22;
  if (m.partBleu > 26 && m.rougeCentre > 6 && centreAplat) return "verso";
  // Bleu massif suffit, même si le centre est masqué par un doigt ou un reflet.
  if (m.partBleu > 42 && centreAplat) return "verso";
  // Bordure jaune franche sur le pourtour : face avant moderne ou Wizards.
  if (m.jauneBord > 16) return "recto";

  return m.partBleu > 20 ? "verso" : "recto";
}

/* ── suggestion d'édition du dos (japonais / international) ──────
   Repère de couleur seulement, pas une lecture de texte : le dos
   japonais est décrit comme plus sombre et plus saturé que le dos
   international, plus clair. Seuil choisi au jugé, jamais mesuré sur
   un vrai échantillon — c'est pour ça que l'appli l'affiche comme une
   suggestion modifiable, jamais comme un fait acquis.               */
function suggererEdition(m) {
  if (m.partBleu < 15) return "indetermine"; // pas assez de bleu pour juger
  return m.satBleu >= 58 ? "japonaise" : "internationale";
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

/* ── historique local ──────────────────────────────────────────
   Stocké dans le navigateur, donc propre à cet appareil : rien ne
   part sur un serveur, mais rien ne suit non plus d'un appareil à
   l'autre. Son rôle est d'éviter de repayer deux fois la même
   annonce.                                                       */
const CLE_HIST = "scanpoke.historique.v1";
const MAX_HIST = 60;

function lireHistorique() {
  try {
    const b = localStorage.getItem(CLE_HIST);
    const l = b ? JSON.parse(b) : [];
    return Array.isArray(l) ? l : [];
  } catch { return []; }
}

function ecrireHistorique(liste) {
  const essai = (l) => {
    try { localStorage.setItem(CLE_HIST, JSON.stringify(l)); return true; }
    catch { return false; }
  };
  if (essai(liste)) return liste;
  // quota atteint : on élague les plus anciennes et on réessaie
  const court = liste.slice(0, Math.max(5, Math.floor(liste.length / 2)));
  return essai(court) ? court : liste;
}

function normaliserUrl(u) {
  try { const x = new URL(String(u).trim()); return (x.origin + x.pathname).replace(/\/$/, ""); }
  catch { return String(u || "").trim(); }
}

function miniature(img, max = 128, q = 0.62) {
  try {
    const e = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * e));
    c.height = Math.max(1, Math.round(img.naturalHeight * e));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", q);
  } catch { return ""; }
}

const dateCourte = (t) =>
  new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const milliers = (n) => (n || 0).toLocaleString("fr-FR");

/* ── notation asymétrique ──────────────────────────────────────
   La leçon d'un cas réel : un bloc de copyright lisible et correct
   avait fait monter la note. C'est une faute de raisonnement. Les
   faussaires actuels reproduisent fidèlement le texte, la mise en
   page, les PV, l'illustrateur, le numéro. Voir ces éléments passer
   ne prouve rien — c'est le minimum syndical d'une bonne copie.
   Les voir échouer, en revanche, est accablant.

   D'où la règle : un critère REPRODUCTIBLE ne peut que faire
   descendre. Seuls les critères DIFFICILES — trame d'impression,
   couche noire de tranche, physique de l'holographie, gamut de la
   presse d'époque, texture du carton — peuvent faire monter, et
   seulement s'ils ont pu être réellement observés.

   Conséquence assumée : une bonne photo d'un faux ne bat plus une
   mauvaise photo d'une vraie.                                   */
const POIDS = {
  reproductible: { credit: 0, charge: 2.6 },
  difficile:     { credit: 3.2, charge: 3.2 },
  contextuel:    { credit: 0.8, charge: 1.6 },
};

function scorer(controles, identification, confiance = 100) {
  const l = Array.isArray(controles) ? controles : [];
  let credit = 0, charge = 0, probantsVus = 0, reproductiblesVus = 0;

  for (const c of l) {
    const cat = POIDS[c.categorie] ? c.categorie : "reproductible";
    const p = POIDS[cat];
    if (c.verdict === "non_verifiable") continue;
    if (cat === "difficile") probantsVus++;
    if (cat === "reproductible") reproductiblesVus++;
    if (c.verdict === "suspect") charge += p.charge;
    else if (c.verdict === "conforme") credit += p.credit;
  }

  let score = 50 + credit * 2.6 - charge * 5.4;

  // Rien de probant observé : on ne peut pas dépasser le doute raisonnable,
  // quelle que soit la beauté de la photo.
  if (probantsVus === 0) score = Math.min(score, 58);

  /* Un score au-dessus de la neutralité doit être adossé à de la
     confiance : on le ramène vers 50 à proportion. Sans ça, trois
     critères conformes affichaient 94 à côté d'un verdict
     « indéterminé » — et c'est le gros chiffre qu'on lit en premier.
     En dessous de 50, aucun rabais : un défaut constaté reste un
     défaut, même sur une photo médiocre. L'absence de preuve n'est
     pas une preuve, mais la présence d'un défaut en est une.      */
  if (score > 50) score = 50 + (score - 50) * (Math.max(0, Math.min(100, confiance)) / 100);

  // Une incohérence catalogue reste rédhibitoire — qu'elle vienne du modèle
  // ou du recoupement déterministe dos/langue fait côté client.
  if (identification?.coherence === "incoherent") score = Math.min(score, 8);
  if (incoherenceDos(identification) === true) score = Math.min(score, 8);

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    probantsVus, reproductiblesVus,
    plafonneFauteDeProbant: probantsVus === 0,
  };
}

/* ── calibration ───────────────────────────────────────────────
   Un outil qui ne se confronte jamais au réel ne fait que produire
   des avis. Dès qu'une carte est confirmée vraie ou fausse — par un
   expert, une notation, un test de tranche — on peut mesurer deux
   choses : est-ce que les verdicts tombaient juste, et existe-t-il
   un écart colorimétrique réel entre les vraies et les fausses de
   cette collection. Les seuils cessent alors d'être devinés.

   Prudence assumée : en dessous de trois exemplaires par camp, on
   n'affiche aucune conclusion. Deux points ne font pas une loi.  */
const MIN_CALIB = 3;

function calibration(historique) {
  const etiq = historique.filter((e) => e.verite === "vraie" || e.verite === "fausse");
  const vraies = etiq.filter((e) => e.verite === "vraie");
  const fausses = etiq.filter((e) => e.verite === "fausse");

  let justes = 0, ratees = 0, alertesVaines = 0, prudentes = 0;
  for (const e of etiq) {
    const d = e.verdict;
    if (e.verite === "fausse") {
      if (d === "probablement_faux" || d === "suspect") justes++;
      else if (d === "probablement_authentique") ratees++;   // l'erreur la plus coûteuse
      else prudentes++;
    } else {
      if (d === "probablement_authentique") justes++;
      else if (d === "probablement_faux") alertesVaines++;
      else prudentes++;
    }
  }

  const moyenne = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const ecart = (a) => {
    if (a.length < 2) return 0;
    const m = moyenne(a);
    return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1));
  };
  const sat = (l) => l.map((e) => e.metriques?.satMoy).filter((n) => typeof n === "number" && n > 0);

  const sv = sat(vraies), sf = sat(fausses);
  const mv = moyenne(sv), mf = moyenne(sf);
  const ev = ecart(sv), ef = ecart(sf);
  const commun = Math.sqrt((ev * ev + ef * ef) / 2) || 0;
  const separation = commun > 0 ? Math.abs(mv - mf) / commun : 0;

  const exploitable = sv.length >= MIN_CALIB && sf.length >= MIN_CALIB;

  return {
    total: etiq.length, nVraies: vraies.length, nFausses: fausses.length,
    justes, ratees, alertesVaines, prudentes,
    satVraies: Math.round(mv * 10) / 10, satFausses: Math.round(mf * 10) / 10,
    ecartVraies: Math.round(ev * 10) / 10, ecartFausses: Math.round(ef * 10) / 10,
    nSatVraies: sv.length, nSatFausses: sf.length,
    separation: Math.round(separation * 100) / 100,
    exploitable,
    // Une séparation supérieure à 0.8 correspond à un écart franc entre
    // les deux populations ; en dessous, les nuages se recouvrent trop.
    concluante: exploitable && separation >= 0.8,
  };
}

/* ── connaissances par époque ──────────────────────────────────
   Compilé à partir de guides d'authentification publiés en 2026.
   Le classement copiable / probant compte plus que la liste elle-même :
   c'est lui qui empêche l'outil de se rassurer à bon compte.     */
const SAVOIR = `
CONNAISSANCES DE RÉFÉRENCE (état 2026)

Dimensions communes : 63 × 88 mm, poids 1,70 à 1,80 g. Les contrefaçons tombent le plus souvent entre 1,2 et 1,5 g, ou au contraire entre 2,0 et 2,5 g, parce que le carton n'est pas le bon. Les sources divergent sur l'épaisseur exacte : ne t'appuie pas dessus.

MARQUEUR D'ÉDITION AU DOS
Le Japon a son PROPRE dos, différent de tout le reste du monde, et ce depuis 1996 — pas seulement sur les tirages anciens. Dos japonais : bleu plus sombre et plus saturé, contour de la Poké Ball plus épais, bouton/charnière positionné correctement depuis 2001, bande grise en bordure de carte, et la balle est représentée immobile (elle ne semble pas tournoyer). Le texte en arc au-dessus de la balle dit « POCKET MONSTERS » sur les tirages de 1996 à 2001, puis « Pokémon » ensuite — mais le dessin reste japonais dans les deux cas, ce changement de texte ne signifie pas un alignement sur l'international.
TOUT le reste du monde (français, anglais, allemand, espagnol, italien, chinois simplifié, chinois traditionnel, coréen, etc.) partage un seul et même dos international, inchangé depuis 1999 : bleu plus clair, contour de balle plus fin, effet de tournoiement autour de la balle, bordure jaune/beige.
Conséquence pour le contrôle de cohérence : le dos dit seulement « japonais » ou « pas japonais ». S'il est japonais, le recto DOIT être en japonais (kana/kanji) ; s'il est international, le recto ne doit PAS être en japonais, mais peut être dans n'importe quelle autre langue. Un décalage dans l'un ou l'autre sens est une incohérence de catalogue à part entière, pas un simple doute.
En revanche le dos ne permet jamais de distinguer chinois, coréen ou une langue européenne entre eux — pour ça, c'est l'écriture du recto qu'il faut lire, et c'est un repère très fiable, visible au premier coup d'œil : kana/kanji = japonais, sinogrammes (simplifiés ou traditionnels) = chinois, hangul = coréen, alphabet latin = langue européenne (français, anglais, allemand, espagnol, italien…).

BASE SET JAPONAIS 1996-1998
Copyright : mentions Nintendo, GAMEFREAK, Creatures avec millésimes 1996-1997 selon le tirage. Bordures blanches plus étroites que sur les rééditions occidentales. Carton légèrement plus fin que le moderne. Holo starburst d'époque, pas de texture en relief.
Signature chromatique : jaunes chauds légèrement crémeux, rouges tirant sur le brique, bleus du dos profonds sans jamais être fluorescents.
Les faux ratent dans LES DEUX SENS : soit trop vifs (jaune citron agressif, rouge néon), soit trop ternes et délavés. Une saturation anormalement BASSE est un signal au même titre qu'une saturation haute.

WIZARDS OF THE COAST 1999-2003
Base Set anglais : la ligne de copyright mentionne Nintendo, Creatures, GAME FREAK avec les millésimes 1995, 96, 98, 99, et Wizards pour 1999. Le nom du Pokémon porte un ®. Le logo Nintendo porte TM ou ®. Le format de la carte est imprimé en bas à gauche.
1ère édition : tampon à gauche de l'illustration ET absence d'ombre portée au cadre. Une carte estampillée 1ère édition qui porte une ombre portée est fausse, sans discussion.
Fautes classiques des contrefaçons : orthographe du copyright (Nintedo, Gamefrek), symboles ® ou TM absents, accent manquant à Pokémon, coquilles dans l'entrée Pokédex.

ÈRE E-CARD À ÉPÉE-BOUCLIER 2002-2022
Motifs holographiques spécifiques par rareté : cosmos sur les holos standard, gravure sur les cartes V, textures pleine illustration sur les full arts.

ÈRE MODERNE, ÉCARLATE-VIOLET ET MÉGA-ÉVOLUTION 2023-2026
Cibles privilégiées des faussaires : Méga-Évolution ex, Special Illustration Rares, alt arts. Motif cosmos ou matrice de points. La texture en relief doit exister là où la rareté l'impose.
Défauts fréquents relevés en 2026 : carton rugueux, holographie décentrée, graisse de police erronée, tranches irrégulières.

TEINTES QUI TRAHISSENT, TOUTES ÉPOQUES
Jaunes qui virent au verdâtre, rouges qui virent à l'orangé, bleus qui virent au grisâtre. L'écart est faible mais constant sur toute la carte.

HOLOGRAPHIE
Le motif doit changer avec l'angle et correspondre à l'époque et à la rareté. Un film arc-en-ciel générique, identique quel que soit l'angle, plat et sans profondeur, est un faux. Certains faux posent un simple foil argenté avec une couleur imprimée par-dessus.

CATALOGUE
Une carte annoncée 1/1 ou en tirage unique qui n'apparaît dans aucune base publique doit être écartée. Les coffrets de notation contrefaits existent aussi : un boîtier PSA ou BGS ne garantit pas tout.
`.trim();

/* Ordonnés par pouvoir discriminant réel en 2026, pas par commodité.
   Aucun ne se fait depuis une photo — c'est précisément le propos. */
const TESTS_PHYSIQUES = [
  {
    titre: "Texture au doigt",
    force: "Le plus fiable aujourd'hui",
    texte: "Passez un ongle sur la face avant. Une carte authentique offre un grain fin, presque un microsillon, avec une légère résistance sonore. Les contrefaçons glissent : lisses, cireuses ou brillantes. Certaines impriment un motif de texture qui trompe l'œil sous verre, mais la surface reste plate au toucher. Reproduire un carton réellement gaufré à grande échelle reste coûteux, et c'est ce test qui rattrape les faux ayant passé la lumière.",
  },
  {
    titre: "Pesée",
    force: "Très fiable, demande une balance",
    texte: "1,70 à 1,80 g pour une carte standard, un peu plus pour une holo ou une texturée. Les contrefaçons manquent la cible de 0,2 g ou davantage, par défaut comme par excès. Une balance au centième coûte une quinzaine d'euros. Pesez d'abord cinq cartes dont vous êtes sûr pour situer votre propre référence, puis la carte suspecte : un écart de plus de 0,05 g avec ce groupe mérite la méfiance.",
  },
  {
    titre: "Holographie sous angle variable",
    force: "Fiable, gratuit",
    texte: "Inclinez la carte sous une lampe. Le motif doit se déplacer et correspondre à l'époque : starburst sur le vintage, cosmos sur les holos standard, gravure sur les V, texture sur les pleines illustrations. Un arc-en-ciel générique qui reste identique quel que soit l'angle, ou un foil argenté recouvert d'une couleur imprimée, trahit la copie.",
  },
  {
    titre: "Tranche et lumière",
    force: "Filtre de premier passage seulement",
    texte: "Placez la carte devant une lampe puissante. Une carte authentique est un sandwich à noyau noir qui bloque presque toute la lumière. Attention : les contrefaçons de 2025 et 2026 ajoutent désormais leur propre couche noire. Un échec règle la question, une réussite ne prouve plus rien. C'est un tri, pas un verdict.",
  },
  {
    titre: "Trame d'impression à la loupe",
    force: "Décisif, demande une loupe 10×",
    texte: "Sous grossissement, l'impression authentique révèle une rosace de points régulière. Les copies produisent un tramage différent, des points empâtés ou un rendu continu. C'est le contrôle que les professionnels emploient sur les cartes de valeur, et celui qu'aucune photo d'annonce ne permet.",
  },
];

/* ── cohérence dos / langue ────────────────────────────────────
   Double vérification indépendante du jugement du modèle : le Japon
   a son propre dos depuis 1996 (bleu plus sombre, balle immobile,
   bordure grise), quel que soit le texte qui y est écrit ; tout le
   reste du monde partage un seul dos international. Le dos ne dit
   donc que "japonais" ou "pas japonais" — jamais lequel des autres
   pays — et doit rester cohérent avec l'écriture lue au recto dans
   les deux sens. On ne fait confiance ni exclusivement au modèle ni
   exclusivement à ce recoupement : les deux se corrigent l'un
   l'autre.                                                        */
/* ── correspondance langue → code TCGdex ─────────────────────────
   Best-effort : sert uniquement à surligner, dans la liste renvoyée
   par le catalogue, la langue que Claude a lue sur le recto. Si le
   texte ne correspond à rien de connu, on ne surligne rien plutôt
   que de deviner.                                                 */
function codeLangueTCGdex(texte) {
  const t = String(texte || "").toLowerCase();
  if (/simplifi/.test(t)) return null; // TCGdex ne référence que le chinois traditionnel
  if (/chinois/.test(t)) return "zh-tw";
  if (/japon/.test(t)) return "ja";
  if (/fran[cç]ais/.test(t)) return "fr";
  if (/anglais/.test(t)) return "en";
  if (/allemand/.test(t)) return "de";
  if (/espagnol/.test(t)) return "es";
  if (/italien/.test(t)) return "it";
  if (/portugais/.test(t)) return "pt";
  if (/indon[ée]sien/.test(t)) return "id";
  if (/tha[iï]/.test(t)) return "th";
  return null;
}
const LIBELLE_LANGUE = {
  en: "Anglais", fr: "Français", de: "Allemand", es: "Espagnol", it: "Italien",
  pt: "Portugais", ja: "Japonais", "zh-tw": "Chinois (traditionnel)", id: "Indonésien", th: "Thaï",
};

function incoherenceDos(identification) {
  const dos = identification?.edition_dos;
  if (!dos || dos === "non_visible") return null;
  const langue = String(identification?.langue || "").toLowerCase();
  const japonais = /japon|jp\b/.test(langue);
  const autreLangue = /fran[cç]ais|anglais|allemand|italien|espagnol|cor[ée]en|chinois|n[ée]erlandais|portugais/.test(langue);
  if (dos === "japonaise" && autreLangue) return true;
  if (dos === "internationale" && japonais) return true;
  return false;
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

/* Marque maison : une sphère à bande abstraite, clin d'œil générique au
   jeu de cartes sans reprendre le logo déposé de l'éditeur. */
const LogoMarque = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" style={{ flex: "none" }}>
    <defs>
      <linearGradient id="lm-haut" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F0666B" />
        <stop offset="1" stopColor="var(--marque)" />
      </linearGradient>
    </defs>
    <circle cx="15" cy="15" r="12.5" fill="#EDEAE2" />
    <path d="M2.5 15a12.5 12.5 0 0 1 25 0z" fill="url(#lm-haut)" />
    <rect x="2.5" y="13.9" width="25" height="2.2" fill="#17161A" />
    <circle cx="15" cy="15" r="4.3" fill="#17161A" />
    <circle cx="15" cy="15" r="2.4" fill="#EDEAE2" />
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
      <text x="88" y="87" textAnchor="middle" fontSize="42" fontWeight="600"
            fill="var(--label)" letterSpacing="-1"
            style={{ fontFamily: "var(--affiche), -apple-system, sans-serif" }}>{score}</text>
      <text x="88" y="106" textAnchor="middle" fontSize="12.5" fill="var(--label3)"
            fontFamily="-apple-system,BlinkMacSystemFont,sans-serif" letterSpacing=".01em">confiance {confiance} %</text>
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
  const [catalogue, setCatalogue] = useState(null);
  const [err, setErr] = useState("");
  const [survol, setSurvol] = useState(false);
  const [copie, setCopie] = useState(false);
  const fichierRef = useRef(null);
  const [historique, setHistorique] = useState([]);

  useEffect(() => { setHistorique(lireHistorique()); }, []);

  const majHistorique = (l) => setHistorique(ecrireHistorique(l));

  const dejaVue = useMemo(() => {
    const n = normaliserUrl(annonce.url);
    return n && n.includes("/items/") ? historique.find((e) => normaliserUrl(e.url) === n) : null;
  }, [annonce.url, historique]);

  const totalTokens = useMemo(
    () => historique.reduce((a, e) => a + (e.tokens?.entree || 0) + (e.tokens?.sortie || 0), 0),
    [historique]
  );

  const calib = useMemo(() => calibration(historique), [historique]);

  const etiqueter = (id, verite) =>
    majHistorique(historique.map((e) => e.id === id ? { ...e, verite: e.verite === verite ? null : verite } : e));

  const exporter = () => {
    const blob = new Blob([JSON.stringify(historique, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `scanpoke-historique-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const importerRef = useRef(null);
  const importer = async (f) => {
    try {
      const l = JSON.parse(await f.text());
      if (!Array.isArray(l)) throw new Error("Fichier inattendu");
      const vus = new Set();
      const fusion = [...l, ...historique]
        .filter((e) => e && e.id && e.rapport)
        .sort((a, b) => (b.date || 0) - (a.date || 0))
        .filter((e) => { const c = normaliserUrl(e.url) || e.id; if (vus.has(c)) return false; vus.add(c); return true; })
        .slice(0, MAX_HIST);
      majHistorique(fusion);
    } catch { setErr("Fichier d'historique illisible."); }
  };

  const preuve = useMemo(() => plafondPreuve(photos), [photos]);

  const chargerDepuisDataUrl = async (url, nom, roleForce) => {
    const img = await new Promise((r, j) => {
      const i = new Image();
      i.onload = () => r(i); i.onerror = () => j(new Error("Image illisible"));
      i.src = url;
    });
    let m;
    try { m = mesurerImage(img); }
    catch { m = { natif: `${img.naturalWidth}×${img.naturalHeight}`, pxParMm: 0, nettete: 0, reflets: 0, bouches: 0, emprise: 0, blocs: 1, periodicite: 0, pasTrame: 0, satMoy: 0, partBleu: 0, ratio: 0, bruitTeinteCentre: 99 }; }
    let role;
    try { role = roleForce || deduireRole(m); } catch { role = roleForce || "recto"; }
    let edition = "indetermine";
    try { if (role === "verso") edition = suggererEdition(m); } catch { edition = "indetermine"; }
    return { id: crypto.randomUUID(), nom, url, img, m, role, sujet: true, edition };
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
          nouvelles.push(await chargerDepuisDataUrl(url, `Photo ${i + 1}`)); // le rôle est reconnu par la mesure
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
    setOccupe(true); setErr(""); setResultat(null); setCatalogue(null);
    const log = (t, k = "att") => setJournal((j) => [...j, { t, k }]);

    try {
      const sujets = photos.filter((p) => p.sujet !== false);
      const refs = photos.filter((p) => p.sujet === false);
      if (!sujets.length) throw new Error("Marquez au moins une photo comme « Sujet ».");

      const triees = [...sujets].sort((a, b) => (PRIORITE[a.role] - PRIORITE[b.role]) || (b.m.pxParMm - a.m.pxParMm));
      const retenues = triees.slice(0, refs.length ? 3 : 4);
      const retenuesRef = [...refs]
        .sort((a, b) => (PRIORITE[a.role] - PRIORITE[b.role]) || (b.m.pxParMm - a.m.pxParMm))
        .slice(0, 2);

      log(`Meilleure densité ${preuve.best?.toFixed(1) ?? 0} px/mm`, "ok");
      if (retenuesRef.length) log(`${retenuesRef.length} photo(s) de référence jointes`, "ok");

      const encodees = retenues.map((p) => redimensionner(p.img));
      const encodeesRef = retenuesRef.map((p) => redimensionner(p.img));
      log(approfondi ? "Recherche web en cours" : "Analyse en cours");

      const decrire = (p, i, prefixe) => {
        const indiceDos = p.role === "verso" && p.edition && p.edition !== "indetermine"
          ? ` | suggestion automatique d'édition du dos (à vérifier toi-même sur l'image, pas un fait acquis) : ${p.edition}`
          : "";
        return `${prefixe} ${i + 1} — rôle: ${p.role} | natif ${p.m.natif} | densité ${p.m.pxParMm} px/mm | netteté ${p.m.nettete}/100 | biais perspective ${p.m.biais || "n/d"} | reflets ${p.m.reflets}% | saturation moyenne ${p.m.satMoy}% (p90 ${p.m.satP90}%, part très vive ${p.m.partVive}%) | artefacts JPEG ${p.m.blocs} | périodicité ${p.m.periodicite} (pas ${p.m.pasTrame}px)${indiceDos}`;
      };

      const contexte = retenues.map((p, i) => decrire(p, i, "Photo sujet")).join("\n");

      const refTexte = retenuesRef.length
        ? `\n\nPHOTOS DE RÉFÉRENCE — l'utilisateur affirme que cette carte-là est authentique. Elles arrivent APRÈS les photos du sujet dans l'ordre des images. Compare le sujet à la référence plutôt que dans l'absolu : c'est bien plus fiable. Attarde-toi sur l'écart de saturation, de teinte, de grain et de comportement holographique. Si la référence est plus vive que le sujet, ce n'est pas un signal négatif pour le sujet.\n${
            retenuesRef.map((p, i) => decrire(p, i, "Photo référence")).join("\n")
          }`
        : "";

      const satSujet = retenues.length
        ? Math.round((retenues.reduce((a, p) => a + (p.m.satMoy || 0), 0) / retenues.length) * 10) / 10
        : 0;

      const calibTexte = calib.exploitable
        ? `\n\nRÉFÉRENCE MESURÉE SUR CETTE COLLECTION — ${calib.nSatVraies} cartes confirmées authentiques et ${calib.nSatFausses} confirmées fausses, photographiées dans des conditions comparables :
saturation moyenne des authentiques : ${calib.satVraies} % (écart-type ${calib.ecartVraies})
saturation moyenne des contrefaçons : ${calib.satFausses} % (écart-type ${calib.ecartFausses})
séparation des deux populations : ${calib.separation} ${calib.concluante ? "— écart franc, ce critère est exploitable ici" : "— les deux nuages se recouvrent, ce critère reste faible et ne doit pas peser lourd"}
la carte analysée mesure ${satSujet} %.
Utilise cette référence plutôt que des seuils génériques, mais uniquement au poids que la séparation justifie.`
        : "";

      const consigne = `Tu es expert en authentification de cartes Pokémon TCG à partir de photos d'annonces de seconde main.

RÈGLE CENTRALE — ASYMÉTRIE DES INDICES.
En 2026, une contrefaçon de qualité reproduit correctement : le bloc de copyright, la mise en page, les polices à taille normale, les PV, le nom de l'illustrateur, le numéro de collection, le texte des attaques, le dos avec Poké Ball et tourbillon. Constater que ces éléments sont conformes NE PROUVE RIEN — c'est le minimum d'une bonne copie. Les voir échouer est en revanche accablant. Classe-les "reproductible".
Ce qui reste difficile à falsifier : trame d'impression et rosace CMJN à fort grossissement, couche noire centrale visible sur la tranche, comportement de l'holographie selon l'angle, gamut de la presse d'époque (les presses de 1996 saturent moins que les imprimantes actuelles), texture et grain du carton, tolérances de coupe et de centrage de l'époque, cohérence de l'usure avec l'âge annoncé. Classe-les "difficile".
Prix, vocabulaire de l'annonce, mise en scène des photos : "contextuel".

NE FAIS JAMAIS MONTER TA CONFIANCE PARCE QU'UN ÉLÉMENT REPRODUCTIBLE EST DEVENU LISIBLE. La lisibilité est une propriété de l'appareil photo, pas de la carte.

Mesures effectuées sur les pixels :
${contexte}

Lisibilité : <8 px/mm la carte est à peine distinguable ; 8-15 gros éléments ; 15-30 le texte des attaques ; 30-60 micro-typographie ; >60 trame d'impression. Cette échelle parle de FINESSE — texte, trame, micro-détail. La couleur d'ensemble d'une zone (le bleu du dos, le rouge de la Poké Ball, le jaune de la bordure) se juge sur une moyenne de milliers de pixels : elle reste jugeable même à 8-15 px/mm ou sur un seul angle fixe. Ne te sers JAMAIS d'une densité faible ou d'un angle unique comme excuse pour classer la colorimétrie "non_verifiable" — ça, c'est vrai pour l'holographie (qui a besoin de plusieurs angles) et pour la trame d'impression (qui a besoin de finesse), pas pour une teinte dominante.
Biais de perspective : 1.00 = photo bien à plat. Au-delà de 1.10, le centrage, l'épaisseur de bordure et le crénage sont déformés — marque ces critères "non_verifiable".
Saturation : mesurée après neutralisation de la lumière ambiante sur le fond de la photo. Attention, l'écart joue DANS LES DEUX SENS : les contrefaçons sont soit trop vives, soit trop ternes et délavées par rapport à la carte d'époque. Une saturation anormalement basse est un signal au même titre qu'une saturation haute.${calibTexte}${refTexte}

${SAVOIR}

Annonce : titre="${annonce.titre || "non fourni"}" | prix="${annonce.prix || "non fourni"}" | description="${(annonce.texte || "non fournie").slice(0, 700)}"

Méthode :
1. IDENTIFIER : nom, extension, numéro, rareté, époque. Le "nom" doit être copié EXACTEMENT tel qu'il est imprimé sur le recto, dans sa langue et son orthographe d'origine — jamais traduit ni francisé (une carte anglaise nommée "Charizard" reste "Charizard", pas "Dracaufeu" : un nom traduit rend le contrôle catalogue muet). Pour la langue, identifie la famille d'écriture du recto — c'est un repère visuel immédiat, sans ambiguïté : kana/kanji = japonais, sinogrammes = chinois (simplifié ou traditionnel), hangul = coréen, alphabet latin = langue européenne (français, anglais, allemand, espagnol, italien…).
2. COHÉRENCE CATALOGUE : cette combinaison existe-t-elle réellement ? numéro vs total de l'extension, rareté vs numéro, illustrateur, ligne de copyright vs époque, holo vs époque, carte imprimée dans cette langue. Si une photo du dos est disponible, regarde s'il porte le dos exclusif japonais (bleu plus sombre et saturé, contour de balle épais, balle immobile, bordure grise) ou le dos international partagé par tout le reste du monde (bleu plus clair, contour fin, effet de tournoiement, bordure jaune) — le texte en arc aide aussi ("POCKET MONSTERS" ou "Pokémon" = japonais dans les deux cas, à condition que le reste du dessin soit bien japonais). Un dos japonais avec un recto écrit dans une autre écriture (ou l'inverse : dos international avec un recto en japonais) est une incohérence de catalogue à part entière — le dos ne distingue en revanche jamais le chinois, le coréen ou une langue européenne entre eux, seule l'écriture du recto le fait. Un élément inventé est rédhibitoire. (catégorie "reproductible" : conforme ne prouve rien, incohérent condamne)
3. IMPRESSION : trame, bavures, halo autour des glyphes, niveau de noir — uniquement si la densité le permet. ("difficile")
4. COLORIMÉTRIE : saturation et gamut cohérents avec l'époque de la carte — vérifiable sur une seule photo, quelle que soit sa résolution (voir remarque sur la lisibilité). Regarde en particulier, si le dos est visible, si le bleu du tourbillon est plausible : un bleu qui vire au cyan, au turquoise ou au néon, trop uniforme ou trop vif par rapport au bleu marine/pétrole habituel, est un signal réel — décris ce que tu vois plutôt que de conclure "non vérifiable" par défaut. ("difficile")
5. SURFACE : holographie, texture, vernis, grain du carton. ("difficile")
6. USURE : coins, tranches, rayures cohérents avec l'âge annoncé. Une carte présentée comme ancienne mais d'aspect neuf est suspecte ; une usure authentique est un signal positif réel. ("difficile")
7. GÉOMÉTRIE : centrage, bordures, coupe — seulement si le biais est inférieur à 1.10. ("difficile")
8. TEXTE ET MISE EN PAGE : PV, coût et dégâts des attaques, faiblesse, résistance, retraite, texte d'aptitude. Si tu reconnais cette carte précise (tu la connais probablement si elle est très collectionnée — Dracaufeu/Charizard, Pikachu, Mewtwo, etc.), compare CHAQUE valeur lisible à ce que tu sais du vrai tirage plutôt que de la lire passivement : nombre exact de symboles d'énergie pour chaque attaque, dégâts, PV, icône et valeur de résistance, coût de retraite. Un chiffre ou un symbole faux est une preuve reproductible mais rédhibitoire dès lors que tu peux vraiment le lire à l'écran — ne classe "non_verifiable" que ce qui est réellement illisible dans l'image, jamais ce que la densité px/mm estimée suggère d'ignorer : cette densité mesure la taille de la carte dans la photo, pas la netteté réelle du texte que tu as sous les yeux. ("reproductible")
9. ANNONCE : prix vs marché, vocabulaire, photos reprises d'ailleurs. ("contextuel")

Règles strictes :
- N'invente jamais un indice que tu ne peux pas voir. "non_verifiable" est un verdict honorable et attendu — mais seulement pour ce qui est vraiment illisible, pas comme option par défaut par excès de prudence. Si tu peux lire un chiffre, un symbole ou un mot dans l'image, lis-le et compare-le à ce que tu sais, même si la carte est plastifiée, dans une pochette, ou photographiée à une résolution modeste.
- Si aucun critère "difficile" n'est vérifiable, dis-le explicitement dans le résumé : les photos ne peuvent pas établir l'authenticité, seulement la contredire.
- Se tromper dans les deux sens coûte cher.
- "edition_dos" : renseigne-le uniquement si une photo du dos est présente et lisible. Mets "japonaise" pour le dos exclusif japonais (bleu sombre et saturé, contour de balle épais, balle immobile, bordure grise — quel que soit le texte, "POCKET MONSTERS" ou "Pokémon"), "internationale" pour le dos unique partagé par tout le reste du monde (français, anglais, chinois, coréen…), et "non_visible" si aucun dos n'est fourni ou si le dessin est illisible — n'invente jamais cette valeur. Ce champ dit seulement "japonais" ou "pas japonais", jamais laquelle des autres langues.

Réponds UNIQUEMENT par ce JSON, sans préambule ni markdown. 8 contrôles maximum. Chaînes limitées à 110 caractères, sauf "resume" et "observation" jusqu'à 280. Le "resume" tient en deux ou trois phrases :
{"identification":{"carte":"","extension":"","numero":"","langue":"","edition_dos":"japonaise|internationale|non_visible","coherence":"coherent|incoherent|indetermine","note":""},
"controles":[{"zone":"","critere":"","categorie":"reproductible|difficile|contextuel","observation":"","verdict":"conforme|suspect|non_verifiable"}],
"drapeaux":[""],"positifs":[""],
"confiance":0,
"resume":"","questions":[""]}`;

      const corps = {
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: [
            ...encodees.map((b64) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } })),
            ...encodeesRef.map((b64) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } })),
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

      // Le score n'est plus celui du modèle : il découle des catégories,
      // donc un critère reproductible conforme ne peut plus le gonfler.
      const note = scorer(j.controles, j.identification, conf);

      let verdict;
      if (note.score <= 22) verdict = "probablement_faux";
      else if (note.score < 45) verdict = "suspect";
      else if (note.score >= 68 && conf >= 55 && !note.plafonneFauteDeProbant) verdict = "probablement_authentique";
      else verdict = "indetermine";

      const message = `Bonjour,\n\nJe suis intéressé(e) par votre annonce. Avant d'acheter, pourriez-vous m'envoyer :\n${
        [...(j.questions || []), ...preuve.manques].filter(Boolean).slice(0, 6).map((q) => `• ${q}`).join("\n")
      }\n\nDes photos nettes, à plat, hors pochette et sans reflet direct suffisent. Merci beaucoup !`;

      const tokens = {
        entree: data.usage?.input_tokens || 0,
        sortie: data.usage?.output_tokens || 0,
      };

      const rapport = {
        ...j, confiance: conf, confBrute, verdict, message, tokens,
        score: note.score,
        probantsVus: note.probantsVus,
        plafonneFauteDeProbant: note.plafonneFauteDeProbant,
        avecReference: retenuesRef.length > 0,
      };
      setResultat(rapport);

      const moyM = (f) => Math.round((retenues.reduce((a, p) => a + (p.m[f] || 0), 0) / retenues.length) * 10) / 10;

      majHistorique([{
        id: crypto.randomUUID(),
        date: Date.now(),
        url: annonce.url.trim(),
        titre: annonce.titre || j.identification?.carte || "Analyse sans titre",
        prix: annonce.prix,
        vignette: miniature(retenues[0].img),
        verdict, score: rapport.score, confiance: conf,
        verite: null,
        metriques: {
          satMoy: satSujet, satP90: moyM("satP90"), partVive: moyM("partVive"),
          pxParMm: Math.max(...retenues.map((p) => p.m.pxParMm || 0)),
          biais: Math.min(...retenues.map((p) => p.m.biais || 99)),
          nettete: moyM("nettete"),
        },
        tokens, rapport,
      }, ...historique.filter((e) => normaliserUrl(e.url) !== normaliserUrl(annonce.url))].slice(0, MAX_HIST));

      if (j.identification?.carte) {
        log("Vérification du catalogue TCGdex");
        try {
          const q = new URLSearchParams({ nom: j.identification.carte });
          if (j.identification.numero) q.set("numero", j.identification.numero);
          const rc = await fetch(`/api/catalogue?${q.toString()}`);
          const dc = await rc.json();
          setCatalogue(dc);
          log(dc.trouve ? `Trouvée dans ${dc.langues.length} langue(s) au catalogue` : "Introuvable dans le catalogue TCGdex",
              dc.trouve ? "ok" : "att");
        } catch {
          setCatalogue(null);
        }
      }
    } catch (e) {
      setErr(e.message || "Échec de l'analyse.");
    } finally { setOccupe(false); }
  };

  const messageVendeur = res?.message || "";

  const copier = () =>
    navigator.clipboard?.writeText(messageVendeur).then(() => { setCopie(true); setTimeout(() => setCopie(false), 1800); });

  const rouvrir = (e) => {
    setResultat(e.rapport);
    setCatalogue(null);
    setErr(""); setJournal([]);
    setAnnonce((a) => ({ ...a, url: e.url, titre: e.titre, prix: e.prix || a.prix }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const oublier = (id) => majHistorique(historique.filter((e) => e.id !== id));

  const teinteJauge = preuve.note > 70 ? "var(--green)" : preuve.note > 45 ? "var(--orange)" : "var(--red)";

  return (
    <div className="ap">
      <style>{CSS}</style>

      <header className="ap-entete">
        <div className="ap-entete-haut">
          <div className="ap-marque">
            <LogoMarque />
            <div className="ap-marque-txt">
              <span className="ap-marque-nom">Faux ou authentique</span>
              <span className="ap-marque-sub">Cartes Pokémon TCG</span>
            </div>
          </div>
          <div className="ap-recherche">
            <input className="ap-input" placeholder="vinted.fr/items/…" value={annonce.url}
                   aria-label="Lien de l'annonce Vinted"
                   onChange={(e) => setAnnonce({ ...annonce, url: e.target.value })}
                   onKeyDown={(e) => e.key === "Enter" && recupererAnnonce()} />
            <button className="ap-btn" onClick={recupererAnnonce} disabled={collecte || !annonce.url.trim()}>
              {collecte ? "Lecture…" : "Lire l'annonce"}
            </button>
          </div>
        </div>

        {dejaVue && (
          <div className="ap-tagline" style={{ paddingTop: 0, paddingBottom: 12 }}>
            <div className="ap-avert">
              <Alerte c="var(--orange)" />
              <span className="ap-avert-t">
                Déjà analysée le {dateCourte(dejaVue.date)}. Relancer consommera de nouveaux crédits.
              </span>
              <button className="ap-btn discret" onClick={() => rouvrir(dejaVue)}>Voir le rapport</button>
            </div>
          </div>
        )}
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
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <select className="ap-menu" value={p.role} aria-label={`Rôle de ${p.nom}`} style={{ flex: 1 }}
                                onChange={(e) => setPhotos((l) => l.map((q) => q.id === p.id ? {
                                  ...q, role: e.target.value,
                                  edition: e.target.value === "verso" ? suggererEdition(q.m) : "indetermine",
                                } : q))}>
                          {ROLES.map((r) => <option key={r.v} value={r.v}>{r.t}</option>)}
                        </select>
                        <div className="ap-seg" role="group" aria-label="Sujet ou référence">
                          <button aria-pressed={p.sujet !== false}
                                  onClick={() => setPhotos((l) => l.map((q) => q.id === p.id ? { ...q, sujet: true } : q))}>Sujet</button>
                          <button aria-pressed={p.sujet === false}
                                  onClick={() => setPhotos((l) => l.map((q) => q.id === p.id ? { ...q, sujet: false } : q))}>Réf.</button>
                        </div>
                      </div>
                      {p.role === "verso" && (
                        <select className="ap-menu" value={p.edition || "indetermine"}
                                aria-label={`Édition suggérée pour ${p.nom}`}
                                style={{ marginTop: 6, fontSize: 12.5, padding: "5px 8px" }}
                                onChange={(e) => setPhotos((l) => l.map((q) => q.id === p.id ? { ...q, edition: e.target.value } : q))}>
                          {EDITIONS.map((r) => <option key={r.v} value={r.v}>{r.t}</option>)}
                        </select>
                      )}
                      <div className="ap-meta ap-mono">
                        {p.m.pxParMm} px/mm · sat {p.m.satMoy} % · biais {p.m.biais || "n/d"}
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
                <div className="ap-reglage-t">Recherche web pendant l'analyse</div>
                <div className="ap-reglage-s">
                  En plus du catalogue TCGdex (automatique) : Claude cherche sur le web le prix
                  réel du marché, les variantes/erratas rares, et si les photos de l'annonce sont
                  reprises d'ailleurs. Plus lent.
                </div>
              </div>
              <label className="ap-switch">
                <input type="checkbox" checked={approfondi} aria-label="Laisser Claude chercher sur le web pendant l'analyse"
                       onChange={(e) => setApprofondi(e.target.checked)} />
                <span className="ap-piste" /><span className="ap-pastille" />
              </label>
            </div>

            <button className="ap-btn pleine" style={{ marginTop: 18 }}
                    disabled={!photos.length || occupe || collecte} onClick={lancer}>
              {occupe ? "Analyse en cours…" : dejaVue ? "Relancer (nouvelle dépense)" : "Lancer le contrôle"}
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
                  {journal.map((l, i) => {
                    const active = l.k !== "ok" && i === journal.length - 1 && (occupe || collecte);
                    return (
                      <div key={i} className={`ap-etape ${l.k === "ok" ? "faite" : ""} ${active ? "active" : ""}`}>
                        <span className={`ap-pastille-e ${active ? "tourne" : ""}`}>
                          {l.k === "ok" ? "✓" : active ? "" : "·"}
                        </span>
                        <span className="ap-etape-txt">{l.t}{active ? "…" : ""}</span>
                      </div>
                    );
                  })}
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
                        {res.identification.edition_dos && res.identification.edition_dos !== "non_visible" && (
                          <> · dos {res.identification.edition_dos}</>
                        )}
                      </div>
                      <div style={{
                        marginTop: 7, fontSize: 14, fontWeight: 500,
                        color: res.identification.coherence === "incoherent" ? "var(--red)"
                             : res.identification.coherence === "coherent" ? "var(--green)" : "var(--label2)",
                      }}>
                        Catalogue : {res.identification.coherence || "indéterminé"}
                        {res.identification.note ? ` — ${res.identification.note}` : ""}
                      </div>
                      {incoherenceDos(res.identification) === true && (
                        <div className="ap-alerte" style={{ marginTop: 9 }}>
                          Le dos indique une édition {res.identification.edition_dos} alors que le recto
                          semble en {res.identification.langue}. Ce décalage est rédhibitoire — vérifiez
                          qu'il ne s'agit pas de deux cartes différentes prises en photo, sinon écartez l'annonce.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {catalogue && (() => {
                const attendu = codeLangueTCGdex(res.identification?.langue);
                const manquant = catalogue.trouve && attendu && !catalogue.langues.includes(attendu);
                return (
                  <div className="ap-carte">
                    <div className="ap-carte-corps">
                      <h2 className="ap-titre-sec">Catalogue officiel · TCGdex</h2>
                      {!catalogue.trouve ? (
                        <div className="ap-meta">
                          Introuvable sous ce nom dans TCGdex — soit une carte très récente ou une
                          promo pas encore référencée, soit un nom mal identifié. Une carte absente
                          du catalogue n'est pas pour autant une contrefaçon : vérifiez juste le nom.
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                          {catalogue.image && (
                            <img src={catalogue.image} alt="" style={{
                              width: 60, height: 84, objectFit: "cover", borderRadius: 8,
                              flex: "none", background: "var(--fill)",
                            }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>{catalogue.nom}</div>
                            <div className="ap-meta" style={{ marginTop: 3 }}>
                              {catalogue.extension || "extension inconnue"} · n° {catalogue.numero || "—"}
                              {catalogue.rarete ? ` · ${catalogue.rarete}` : ""}
                            </div>
                            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {catalogue.langues.map((code) => (
                                <span key={code} className="ap-cat"
                                      style={code === attendu ? {
                                        background: "color-mix(in srgb, var(--green) 20%, transparent)",
                                        color: "var(--green)",
                                      } : undefined}>
                                  {LIBELLE_LANGUE[code] || code}
                                </span>
                              ))}
                            </div>
                            {manquant && (
                              <div className="ap-alerte" style={{ marginTop: 10 }}>
                                TCGdex ne recense cette carte qu'en {catalogue.langues.map((c) => LIBELLE_LANGUE[c] || c).join(", ")} —
                                pas en {res.identification.langue}. Si le catalogue a raison, la carte
                                photographiée n'existe tout simplement pas dans cette langue.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {Array.isArray(res.controles) && res.controles.length > 0 && (
                <div className="ap-carte">
                <div className="ap-carte-corps">
                  <h2 className="ap-titre-sec">Contrôles</h2>
                  {res.plafonneFauteDeProbant && (
                    <div className="ap-alerte" style={{
                      background: "color-mix(in srgb, var(--orange) 12%, transparent)", marginBottom: 16,
                    }}>
                      Aucun critère probant n'a pu être observé. Tout ce qui a été vérifié ici,
                      un bon faux le reproduit. Ces photos peuvent contredire l'authenticité, pas l'établir.
                    </div>
                  )}
                  {res.controles.map((c, i) => (
                    <div className="ap-constat" key={i}>
                      <span className="ap-point" style={{
                        background: c.verdict === "suspect" ? "var(--red)"
                                  : c.verdict === "conforme" ? (c.categorie === "difficile" ? "var(--green)" : "var(--label3)")
                                  : "var(--label3)",
                      }} />
                      <div>
                        <div className="ap-c-zone">
                          {c.zone} · {c.verdict === "non_verifiable" ? "non vérifiable" : c.verdict}
                          <span className={`ap-cat ${c.categorie === "difficile" ? "probant" : ""}`}>
                            {c.categorie === "difficile" ? "probant" : c.categorie === "contextuel" ? "contexte" : "copiable"}
                          </span>
                        </div>
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
                  <h2 className="ap-titre-sec">À faire vous-même, carte en main</h2>
                  <p className="ap-meta" style={{ marginTop: 0, marginBottom: 14 }}>
                    Aucun de ces contrôles ne se fait depuis une photo, et tous valent mieux que
                    l'analyse ci-dessus. Classés par pouvoir discriminant réel en 2026.
                  </p>
                  {TESTS_PHYSIQUES.map((t, i) => (
                    <div className="ap-constat" key={i}>
                      <span className="ap-point" style={{ background: "var(--blue)" }} />
                      <div>
                        <div className="ap-c-zone">{t.force}</div>
                        <div className="ap-c-titre">{t.titre}</div>
                        <div className="ap-c-obs">{t.texte}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ap-carte">
                <div className="ap-carte-corps">
                  <h2 className="ap-titre-sec">Vous avez la réponse ?</h2>
                  <p className="ap-meta" style={{ marginTop: 0, marginBottom: 11 }}>
                    Après un test de tranche, une notation ou l'avis d'un expert, confirmez ici.
                    Chaque carte confirmée règle les seuils sur votre collection au lieu de valeurs devinées.
                  </p>
                  {(() => {
                    const entree = historique.find((e) => normaliserUrl(e.url) === normaliserUrl(annonce.url)) || historique[0];
                    if (!entree) return null;
                    return (
                      <span className="ap-verite">
                        <button className="vraie" aria-pressed={entree.verite === "vraie"}
                                onClick={() => etiqueter(entree.id, "vraie")}>Confirmée vraie</button>
                        <button className="fausse" aria-pressed={entree.verite === "fausse"}
                                onClick={() => etiqueter(entree.id, "fausse")}>Confirmée fausse</button>
                      </span>
                    );
                  })()}
                </div>
              </div>

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

      {historique.length > 0 && (
        <section className="ap-hist" style={{ marginBottom: 22 }}>
          <div className="ap-hist-tete">
            <div>
              <h2 className="ap-titre-sec" style={{ margin: 0 }}>Calibration</h2>
              <div className="ap-meta">
                {calib.total === 0
                  ? "Confirmez des cartes ci-dessous pour que l'outil se mesure au réel."
                  : `${calib.total} carte${calib.total > 1 ? "s" : ""} confirmée${calib.total > 1 ? "s" : ""} · ${calib.nVraies} vraie${calib.nVraies > 1 ? "s" : ""}, ${calib.nFausses} fausse${calib.nFausses > 1 ? "s" : ""}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ap-btn discret" onClick={exporter}>Exporter</button>
              <button className="ap-btn discret" onClick={() => importerRef.current?.click()}>Importer</button>
              <input ref={importerRef} type="file" accept="application/json" hidden
                     onChange={(e) => { if (e.target.files?.[0]) importer(e.target.files[0]); e.target.value = ""; }} />
            </div>
          </div>

          {calib.total > 0 && (
            <div className="ap-calib">
              <div>
                <div className="ap-calib-n" style={{ color: "var(--green)" }}>{calib.justes}</div>
                <div className="ap-calib-l">verdicts justes</div>
              </div>
              <div>
                <div className="ap-calib-n" style={{ color: calib.ratees ? "var(--red)" : "var(--label3)" }}>{calib.ratees}</div>
                <div className="ap-calib-l">fausses annoncées authentiques</div>
              </div>
              <div>
                <div className="ap-calib-n" style={{ color: "var(--label3)" }}>{calib.prudentes}</div>
                <div className="ap-calib-l">restées indéterminées</div>
              </div>
              <div>
                <div className="ap-calib-n" style={{ color: calib.alertesVaines ? "var(--orange)" : "var(--label3)" }}>{calib.alertesVaines}</div>
                <div className="ap-calib-l">vraies accusées à tort</div>
              </div>
            </div>
          )}

          {calib.total > 0 && (
            <div className="ap-carte" style={{ marginTop: 14 }}>
              <div className="ap-carte-corps">
                <h3 className="ap-titre-sec">Saturation mesurée</h3>
                {calib.exploitable ? (
                  <>
                    <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--label2)" }}>
                      Authentiques : <b style={{ color: "var(--green)" }}>{calib.satVraies} %</b> (± {calib.ecartVraies}, n = {calib.nSatVraies})<br />
                      Contrefaçons : <b style={{ color: "var(--red)" }}>{calib.satFausses} %</b> (± {calib.ecartFausses}, n = {calib.nSatFausses})
                    </div>
                    <div className="ap-meta" style={{ marginTop: 9 }}>
                      Séparation {calib.separation} — {calib.concluante
                        ? "écart franc, ce critère pèse désormais dans l'analyse de vos cartes."
                        : "les deux nuages se recouvrent, le critère reste faible et n'est utilisé qu'avec prudence."}
                    </div>
                  </>
                ) : (
                  <div className="ap-meta">
                    Il faut au moins {MIN_CALIB} cartes confirmées de chaque camp pour conclure quoi que ce soit.
                    Actuellement {calib.nVraies} vraie{calib.nVraies > 1 ? "s" : ""} et {calib.nFausses} fausse{calib.nFausses > 1 ? "s" : ""}.
                    Deux points ne font pas une loi.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {historique.length > 0 && (
        <section className="ap-hist">
          <div className="ap-hist-tete">
            <div>
              <h2 className="ap-titre-sec" style={{ margin: 0 }}>
                Historique · {historique.length} {historique.length > 1 ? "analyses" : "analyse"}
              </h2>
              <div className="ap-meta">{milliers(totalTokens)} tokens consommés au total</div>
            </div>
            <button className="ap-btn discret"
                    onClick={() => { if (confirm("Effacer tout l'historique ?")) majHistorique([]); }}>
              Tout effacer
            </button>
          </div>

          <div className="ap-carte">
            <div className="ap-groupe" style={{ borderRadius: 0, background: "transparent" }}>
              {historique.map((e) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                  <button className="ap-hist-rang" onClick={() => rouvrir(e)} style={{ flex: "1 1 240px", width: "auto" }}>
                    {e.vignette
                      ? <img src={e.vignette} alt="" />
                      : <span style={{ width: 38, height: 53, borderRadius: 6, background: "var(--fill)", flex: "none" }} />}
                    <span className="ap-hist-info">
                      <span className="ap-hist-t" style={{ display: "block" }}>{e.titre}</span>
                      <span className="ap-meta" style={{ display: "block" }}>
                        {dateCourte(e.date)}
                        {e.prix ? ` · ${e.prix}` : ""}
                        {e.metriques?.satMoy ? ` · sat ${e.metriques.satMoy} %` : ""}
                        {` · ${milliers((e.tokens?.entree || 0) + (e.tokens?.sortie || 0))} tokens`}
                      </span>
                    </span>
                    <span className="ap-pastille-v" style={{
                      background: `color-mix(in srgb, ${TEINTE[e.verdict]} 16%, transparent)`,
                      color: TEINTE[e.verdict],
                    }}>{e.score}</span>
                  </button>
                  <span className="ap-verite" style={{ padding: "0 8px" }}>
                    <button className="vraie" aria-pressed={e.verite === "vraie"}
                            onClick={() => etiqueter(e.id, "vraie")}>Vraie</button>
                    <button className="fausse" aria-pressed={e.verite === "fausse"}
                            onClick={() => etiqueter(e.id, "fausse")}>Fausse</button>
                  </span>
                  <button className="ap-x" style={{ margin: "0 13px 0 0" }}
                          aria-label={`Retirer ${e.titre} de l'historique`}
                          onClick={() => oublier(e.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <p className="ap-pied">
        Le contrôle porte sur des photographies, pas sur la carte. Il oriente une décision d'achat ;
        il ne remplace pas un examen en main ni une notation professionnelle.
        Sur une carte à forte valeur, la certitude passe par PSA, BGS ou CGC.
      </p>
    </div>
  );
}
