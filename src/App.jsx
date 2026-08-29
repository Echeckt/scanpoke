import React, { useState, useRef, useCallback, useMemo } from "react";

/* ────────────────────────────────────────────────────────────────
   CONTRÔLE D'AUTHENTICITÉ — cartes Pokémon TCG
   Direction visuelle : cabine de contrôle d'épreuve d'imprimeur.
   Gris neutre normalisé, encres CMJN, repères de registration.
   Le cadran de verdict est une mire : plus la confiance baisse,
   plus les tons se décalent hors registre.
   ──────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.pc-root{
  --gris:#DEDFDC; --gris-fonce:#C6C8C4; --papier:#FAFAF7;
  --encre:#15171B; --encre-douce:#5A5F66;
  --cyan:#0089B0; --magenta:#C8005F; --jaune:#E0AC00;
  --trait:rgba(21,23,27,.16); --trait-fort:rgba(21,23,27,.42);
  font-family:Archivo,"Helvetica Neue",Arial,sans-serif;
  background:var(--gris); color:var(--encre); min-height:100%;
  padding:0 0 64px; -webkit-font-smoothing:antialiased;
}
.pc-root *{ box-sizing:border-box; }
.pc-mono{ font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace; }
.pc-wrap{ max-width:1180px; margin:0 auto; padding:0 20px; }

.pc-bandeau{ border-bottom:1px solid var(--trait-fort); padding:22px 0 18px; margin-bottom:26px; }
.pc-eyebrow{ font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:10.5px;
  letter-spacing:.22em; text-transform:uppercase; color:var(--encre-douce);
  display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.pc-titre{ font-size:clamp(30px,6.2vw,54px); font-weight:800; letter-spacing:-.032em;
  line-height:.96; margin:12px 0 8px; max-width:15ch; }
.pc-sous{ font-size:14.5px; line-height:1.5; color:var(--encre-douce); max-width:58ch; }
.pc-encres{ display:flex; gap:3px; margin-top:16px; }
.pc-encres span{ height:5px; flex:1; }

.pc-grille{ display:grid; grid-template-columns:minmax(0,1fr); gap:24px; }
@media (min-width:900px){ .pc-grille{ grid-template-columns:400px minmax(0,1fr); gap:34px; align-items:start; } }

.pc-bloc{ background:var(--papier); border:1px solid var(--trait); }
.pc-bloc-tete{ display:flex; align-items:baseline; justify-content:space-between; gap:12px;
  padding:11px 14px; border-bottom:1px solid var(--trait); }
.pc-bloc-titre{ font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:10.5px;
  letter-spacing:.19em; text-transform:uppercase; font-weight:600; }
.pc-bloc-num{ font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:10.5px; color:var(--encre-douce); }
.pc-bloc-corps{ padding:14px; }

.pc-collecte{ display:flex; gap:7px; margin-bottom:4px; }
.pc-collecte input{ flex:1; min-width:0; }
.pc-collecte button{ flex:none; border:1px solid var(--encre); background:var(--encre);
  color:var(--papier); cursor:pointer; font-family:"IBM Plex Mono",monospace;
  font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; padding:0 13px; }
.pc-collecte button:hover:not(:disabled){ background:var(--cyan); border-color:var(--cyan); }
.pc-collecte button:disabled{ opacity:.38; cursor:not-allowed; }

.pc-depot{ border:1px dashed var(--trait-fort); background:transparent; padding:22px 16px;
  text-align:center; cursor:pointer; width:100%; transition:background .14s,border-color .14s;
  font-family:inherit; color:inherit; margin-top:12px; }
.pc-depot:hover,.pc-depot.actif{ background:rgba(0,137,176,.07); border-color:var(--cyan); }
.pc-depot-t{ font-size:14px; font-weight:600; }
.pc-depot-s{ font-size:11.5px; color:var(--encre-douce); margin-top:5px; }

.pc-vignettes{ display:flex; flex-direction:column; gap:9px; margin-top:12px; }
.pc-vig{ display:flex; gap:10px; border:1px solid var(--trait); padding:8px; align-items:flex-start; }
.pc-vig img{ width:56px; height:78px; object-fit:cover; background:var(--gris-fonce); flex:none; }
.pc-vig-info{ flex:1; min-width:0; }
.pc-select{ font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:11px;
  border:1px solid var(--trait-fort); background:var(--papier); color:var(--encre);
  padding:3px 5px; width:100%; margin-bottom:6px; }
.pc-metriques{ font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:10.5px;
  line-height:1.65; color:var(--encre-douce); }
.pc-metriques b{ color:var(--encre); font-weight:500; }
.pc-suppr{ border:none; background:none; cursor:pointer; padding:2px 5px; color:var(--encre-douce);
  font-family:"IBM Plex Mono",monospace; font-size:14px; line-height:1; flex:none; }
.pc-suppr:hover{ color:var(--magenta); }

.pc-label{ display:block; font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:10px;
  letter-spacing:.16em; text-transform:uppercase; color:var(--encre-douce); margin:14px 0 5px; }
.pc-champ,.pc-zone{ width:100%; border:1px solid var(--trait-fort); background:var(--papier);
  color:var(--encre); font-family:inherit; font-size:13.5px; padding:8px 9px; }
.pc-zone{ resize:vertical; min-height:62px; line-height:1.45; }
.pc-champ:focus,.pc-zone:focus,.pc-select:focus{ outline:2px solid var(--cyan); outline-offset:1px; }

.pc-bascule{ display:flex; gap:9px; align-items:flex-start; margin-top:16px; cursor:pointer; }
.pc-bascule input{ margin-top:3px; accent-color:var(--cyan); flex:none; }
.pc-bascule-t{ font-size:13px; font-weight:600; }
.pc-bascule-s{ font-size:11.5px; color:var(--encre-douce); line-height:1.45; }

.pc-action{ width:100%; margin-top:18px; padding:14px; border:none; cursor:pointer;
  background:var(--encre); color:var(--papier); font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:12px; letter-spacing:.17em; text-transform:uppercase; font-weight:600; }
.pc-action:hover:not(:disabled){ background:var(--cyan); }
.pc-action:disabled{ opacity:.38; cursor:not-allowed; }

.pc-journal{ font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:11.5px; line-height:1.85; }
.pc-journal div{ display:flex; gap:9px; }
.pc-journal .ok{ color:var(--cyan); }
.pc-journal .att{ color:var(--encre-douce); }

.pc-mire{ display:flex; gap:22px; align-items:center; flex-wrap:wrap; padding:16px 14px;
  border-bottom:1px solid var(--trait); }
.pc-mire-txt{ flex:1; min-width:190px; }
.pc-verdict{ font-size:clamp(21px,3.6vw,30px); font-weight:800; letter-spacing:-.026em; line-height:1.04; }
.pc-verdict-s{ font-size:13px; line-height:1.5; color:var(--encre-douce); margin-top:7px; }

.pc-jauge{ margin-top:11px; }
.pc-jauge-l{ display:flex; justify-content:space-between; font-family:"IBM Plex Mono",monospace;
  font-size:10px; letter-spacing:.13em; text-transform:uppercase; color:var(--encre-douce); margin-bottom:4px; }
.pc-jauge-p{ height:4px; background:var(--gris-fonce); }
.pc-jauge-p i{ display:block; height:100%; }

.pc-ctrl{ display:grid; grid-template-columns:4px 1fr; gap:11px; padding:11px 0; border-bottom:1px solid var(--trait); }
.pc-ctrl:last-child{ border-bottom:none; }
.pc-ctrl-zone{ font-family:"IBM Plex Mono",monospace; font-size:10px; letter-spacing:.15em;
  text-transform:uppercase; color:var(--encre-douce); }
.pc-ctrl-crit{ font-size:13.5px; font-weight:600; margin:2px 0 3px; }
.pc-ctrl-obs{ font-size:13px; line-height:1.5; color:var(--encre-douce); }

.pc-liste{ list-style:none; padding:0; margin:0; }
.pc-liste li{ display:flex; gap:9px; font-size:13.5px; line-height:1.5; padding:6px 0; }
.pc-puce{ font-family:"IBM Plex Mono",monospace; font-size:12px; flex:none; }

.pc-msg{ font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:12px; line-height:1.65;
  background:var(--gris); border:1px solid var(--trait); padding:11px; white-space:pre-wrap; }
.pc-copier{ margin-top:9px; border:1px solid var(--encre); background:none; color:var(--encre);
  cursor:pointer; font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.15em;
  text-transform:uppercase; padding:7px 13px; }
.pc-copier:hover{ background:var(--encre); color:var(--papier); }

.pc-erreur{ border-left:3px solid var(--magenta); padding:11px 13px; font-size:13px;
  line-height:1.5; background:rgba(200,0,95,.05); }
.pc-vide{ padding:44px 18px; text-align:center; color:var(--encre-douce); }
.pc-vide-t{ font-size:14px; font-weight:600; color:var(--encre); }
.pc-vide-s{ font-size:12.5px; margin-top:6px; line-height:1.5; }
.pc-pied{ margin-top:26px; font-family:"IBM Plex Mono",monospace; font-size:11px; line-height:1.7;
  color:var(--encre-douce); border-top:1px solid var(--trait); padding-top:14px; }

@media (prefers-reduced-motion:reduce){ .pc-root *{ transition:none!important; animation:none!important; } }
`;

/* Une carte fait 63 × 88 mm. La densité px/mm dit ce qui est lisible :
   <8 la carte est à peine distinguable · 8-15 gros éléments · 15-30 le texte
   des attaques · 30-60 micro-typographie · >60 trame d'impression.        */
const LARGEUR_CARTE_MM = 63;

const ROLES = [
  { v: "recto", t: "Recto — carte entière" },
  { v: "verso", t: "Verso — dos de la carte" },
  { v: "tranche", t: "Tranche — couche noire" },
  { v: "macro", t: "Gros plan — texte ou symbole" },
  { v: "lot", t: "Lot / plusieurs cartes" },
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
  if (!photos.length) return { plafond: 0, note: 0, manques: ["recto", "verso"], best: 0 };
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

const COULEURS = {
  probablement_authentique: "var(--cyan)",
  indetermine: "var(--jaune)",
  suspect: "var(--jaune)",
  probablement_faux: "var(--magenta)",
};
const LIBELLES = {
  probablement_authentique: "Rien ne contredit l'authenticité",
  indetermine: "Indéterminé",
  suspect: "Signaux préoccupants",
  probablement_faux: "Très probablement une contrefaçon",
};

function Mire({ score, confiance, verdict }) {
  const d = ((100 - confiance) / 100) * 9;
  const c = COULEURS[verdict] || "var(--jaune)";
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" role="img"
         aria-label={`Score ${score} sur 100, confiance ${confiance}%`}>
      <circle cx={66 - d} cy={66 + d * 0.6} r="46" fill="none" stroke="var(--cyan)" strokeWidth="1.1" opacity=".72" />
      <circle cx={66 + d * 0.85} cy={66 + d * 0.5} r="46" fill="none" stroke="var(--magenta)" strokeWidth="1.1" opacity=".72" />
      <circle cx={66} cy={66 - d} r="46" fill="none" stroke="var(--jaune)" strokeWidth="1.1" opacity=".78" />
      <circle cx="66" cy="66" r="52" fill="none" stroke="var(--trait)" strokeWidth="1" />
      <circle cx="66" cy="66" r="52" fill="none" stroke={c} strokeWidth="3"
              strokeDasharray={`${(score / 100) * 326.7} 326.7`} transform="rotate(-90 66 66)" />
      <line x1="66" y1="4" x2="66" y2="15" stroke="var(--encre)" strokeWidth="1" />
      <line x1="66" y1="117" x2="66" y2="128" stroke="var(--encre)" strokeWidth="1" />
      <line x1="4" y1="66" x2="15" y2="66" stroke="var(--encre)" strokeWidth="1" />
      <line x1="117" y1="66" x2="128" y2="66" stroke="var(--encre)" strokeWidth="1" />
      <text x="66" y="70" textAnchor="middle" fontFamily="Archivo,sans-serif" fontSize="34"
            fontWeight="800" fill="var(--encre)" letterSpacing="-1.4">{score}</text>
      <text x="66" y="86" textAnchor="middle" fontFamily="IBM Plex Mono,monospace" fontSize="8.5"
            letterSpacing="2" fill="var(--encre-douce)">/ 100</text>
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
      } catch { /* fichier illisible, on passe */ }
    }
  }, []);

  /* ── récupération automatique depuis l'URL Vinted ── */
  const recupererAnnonce = async () => {
    if (!annonce.url.trim()) return;
    setCollecte(true); setErr(""); setResultat(null); setJournal([]);
    const log = (t, k = "att") => setJournal((j) => [...j, { t, k }]);

    try {
      log("Lecture de l'annonce…");
      const r = await fetch(`/api/annonce?url=${encodeURIComponent(annonce.url.trim())}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.erreur || `Lecture refusée (${r.status}).`);

      setAnnonce((a) => ({
        ...a,
        titre: d.titre || a.titre,
        prix: d.prix ? `${d.prix} €` : a.prix,
        texte: d.description || a.texte,
      }));
      log(`Annonce lue — ${d.images.length} photo(s) trouvée(s)`, "ok");

      const nouvelles = [];
      for (let i = 0; i < Math.min(d.images.length, 5); i++) {
        try {
          const rep = await fetch(`/api/image?u=${encodeURIComponent(d.images[i])}`);
          if (!rep.ok) continue;
          const blob = await rep.blob();
          const url = await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(blob); });
          nouvelles.push(await chargerDepuisDataUrl(url, `photo ${i + 1}`, i === 0 ? "recto" : i === 1 ? "verso" : "autre"));
        } catch { /* photo inaccessible */ }
      }
      if (!nouvelles.length) throw new Error("Photos inaccessibles. Glissez-les manuellement ci-dessous.");

      setPhotos(nouvelles);
      log(`${nouvelles.length} photo(s) mesurée(s)`, "ok");
      log("Vérifiez le rôle de chaque photo, puis lancez le contrôle.");
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
      log(`Préparation — meilleure densité ${preuve.best?.toFixed(1) ?? 0} px/mm`, "ok");
      const encodees = retenues.map((p) => redimensionner(p.img));
      log(approfondi ? "Vérification catalogue en ligne…" : "Analyse experte en cours…");

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

Réponds UNIQUEMENT par ce JSON, sans préambule ni markdown. Chaque chaîne fait au plus 110 caractères, 7 contrôles maximum :
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
      log("Rapport reçu", "ok");

      const confBrute = Math.max(0, Math.min(100, Number(j.confiance) || 0));
      const conf = Math.min(confBrute, preuve.plafond);
      let verdict = j.verdict || "indetermine";
      if (conf < 45 && verdict === "probablement_authentique") verdict = "indetermine";
      if (j.identification?.coherence === "incoherent") verdict = "probablement_faux";

      log(conf < confBrute ? `Confiance plafonnée à ${conf}% par la qualité des photos` : `Confiance ${conf}%`, "ok");
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

  return (
    <div className="pc-root">
      <style>{CSS}</style>
      <div className="pc-wrap">
        <header className="pc-bandeau">
          <div className="pc-eyebrow">
            <span>⊕ Contrôle d'authenticité</span><span>·</span><span>Pokémon TCG</span>
            <span>·</span><span>Cabine d'épreuve</span>
          </div>
          <h1 className="pc-titre">Ce que la photo prouve vraiment.</h1>
          <p className="pc-sous">
            Les faussaires ont rattrapé la typographie, l'holo et la texture. Ce contrôle mesure d'abord ce que
            les pixels permettent réellement d'affirmer, puis confronte la carte au catalogue officiel — un numéro
            de collection qui n'existe pas reste bien plus difficile à falsifier qu'un motif holographique.
          </p>
          <div className="pc-encres">
            <span style={{ background: "var(--cyan)" }} /><span style={{ background: "var(--magenta)" }} />
            <span style={{ background: "var(--jaune)" }} /><span style={{ background: "var(--encre)" }} />
          </div>
        </header>

        <div className="pc-grille">
          <section className="pc-bloc">
            <div className="pc-bloc-tete">
              <span className="pc-bloc-titre">Pièces à examiner</span>
              <span className="pc-bloc-num pc-mono">{photos.length}/6</span>
            </div>
            <div className="pc-bloc-corps">
              <label className="pc-label" htmlFor="pc-url" style={{ marginTop: 0 }}>Lien de l'annonce Vinted</label>
              <div className="pc-collecte">
                <input id="pc-url" className="pc-champ" placeholder="https://www.vinted.fr/items/…"
                       value={annonce.url}
                       onChange={(e) => setAnnonce({ ...annonce, url: e.target.value })}
                       onKeyDown={(e) => e.key === "Enter" && recupererAnnonce()} />
                <button onClick={recupererAnnonce} disabled={collecte || !annonce.url.trim()}>
                  {collecte ? "…" : "Lire"}
                </button>
              </div>

              <button type="button" className={`pc-depot ${survol ? "actif" : ""}`}
                      onClick={() => fichierRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setSurvol(true); }}
                      onDragLeave={() => setSurvol(false)}
                      onDrop={(e) => { e.preventDefault(); setSurvol(false); ajouterFichiers(e.dataTransfer.files); }}>
                <div className="pc-depot-t">Ou déposez les photos ici</div>
                <div className="pc-depot-s">Recours quand Vinted refuse la lecture automatique.</div>
              </button>
              <input ref={fichierRef} type="file" accept="image/*" multiple hidden
                     onChange={(e) => { ajouterFichiers(e.target.files); e.target.value = ""; }} />

              {photos.length > 0 && (
                <div className="pc-vignettes">
                  {photos.map((p) => (
                    <div className="pc-vig" key={p.id}>
                      <img src={p.url} alt={p.nom} />
                      <div className="pc-vig-info">
                        <select className="pc-select" value={p.role}
                                onChange={(e) => setPhotos((l) => l.map((q) => q.id === p.id ? { ...q, role: e.target.value } : q))}>
                          {ROLES.map((r) => <option key={r.v} value={r.v}>{r.t}</option>)}
                        </select>
                        <div className="pc-metriques">
                          <b>{p.m.pxParMm}</b> px/mm · netteté <b>{p.m.nettete}</b><br />
                          reflets <b>{p.m.reflets}%</b> · JPEG <b>{p.m.blocs}</b><br />{p.m.natif}
                        </div>
                      </div>
                      <button className="pc-suppr" aria-label="Retirer cette photo"
                              onClick={() => setPhotos((l) => l.filter((q) => q.id !== p.id))}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <label className="pc-label" htmlFor="pc-titre">Titre</label>
              <input id="pc-titre" className="pc-champ" value={annonce.titre}
                     onChange={(e) => setAnnonce({ ...annonce, titre: e.target.value })} />

              <label className="pc-label" htmlFor="pc-prix">Prix demandé</label>
              <input id="pc-prix" className="pc-champ" value={annonce.prix}
                     onChange={(e) => setAnnonce({ ...annonce, prix: e.target.value })} />

              <label className="pc-label" htmlFor="pc-desc">Description du vendeur</label>
              <textarea id="pc-desc" className="pc-zone" value={annonce.texte}
                        onChange={(e) => setAnnonce({ ...annonce, texte: e.target.value })} />

              <label className="pc-bascule">
                <input type="checkbox" checked={approfondi} onChange={(e) => setApprofondi(e.target.checked)} />
                <span>
                  <span className="pc-bascule-t">Vérifier le numéro dans le catalogue en ligne</span>
                  <span className="pc-bascule-s"> — confronte extension, numéro et rareté aux bases publiques. Plus lent.</span>
                </span>
              </label>

              <button className="pc-action" disabled={!photos.length || occupe || collecte} onClick={lancer}>
                {occupe ? "Analyse en cours…" : "Lancer le contrôle"}
              </button>

              {photos.length > 0 && (
                <div className="pc-jauge">
                  <div className="pc-jauge-l"><span>Qualité de preuve</span><span>{preuve.note}/100</span></div>
                  <div className="pc-jauge-p">
                    <i style={{ width: `${preuve.note}%`, background: preuve.note > 70 ? "var(--cyan)" : preuve.note > 45 ? "var(--jaune)" : "var(--magenta)" }} />
                  </div>
                  <div className="pc-metriques" style={{ marginTop: 6 }}>
                    Plafonne la confiance du verdict à {preuve.plafond}%.
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            {journal.length > 0 && (
              <div className="pc-bloc" style={{ marginBottom: 20 }}>
                <div className="pc-bloc-tete">
                  <span className="pc-bloc-titre">Journal</span>
                  <span className="pc-bloc-num pc-mono">{occupe || collecte ? "en cours" : "terminé"}</span>
                </div>
                <div className="pc-bloc-corps pc-journal">
                  {journal.map((l, i) => (
                    <div key={i} className={l.k}><span>{l.k === "ok" ? "✓" : "·"}</span><span>{l.t}</span></div>
                  ))}
                </div>
              </div>
            )}

            {err && (
              <div className="pc-bloc" style={{ marginBottom: 20 }}>
                <div className="pc-bloc-corps"><div className="pc-erreur">{err}</div></div>
              </div>
            )}

            {!res && !occupe && !err && (
              <div className="pc-bloc">
                <div className="pc-bloc-tete">
                  <span className="pc-bloc-titre">Rapport</span>
                  <span className="pc-bloc-num pc-mono">en attente</span>
                </div>
                <div className="pc-vide">
                  <div className="pc-vide-t">Aucune pièce déposée</div>
                  <div className="pc-vide-s">
                    Collez le lien de l'annonce et cliquez sur Lire.<br />
                    Le recto et le verso suffisent pour démarrer.
                  </div>
                </div>
              </div>
            )}

            {res && (
              <div className="pc-bloc">
                <div className="pc-mire">
                  <Mire score={res.score} confiance={res.confiance} verdict={res.verdict} />
                  <div className="pc-mire-txt">
                    <div className="pc-verdict" style={{ color: COULEURS[res.verdict] }}>{LIBELLES[res.verdict]}</div>
                    <div className="pc-verdict-s">{res.resume}</div>
                    <div className="pc-jauge">
                      <div className="pc-jauge-l"><span>Confiance</span><span>{res.confiance}%</span></div>
                      <div className="pc-jauge-p"><i style={{ width: `${res.confiance}%`, background: COULEURS[res.verdict] }} /></div>
                    </div>
                    {res.confiance < res.confBrute && (
                      <div className="pc-metriques" style={{ marginTop: 7 }}>
                        Abaissée depuis {res.confBrute}% : les photos ne permettent pas d'aller plus loin.
                      </div>
                    )}
                  </div>
                </div>

                {res.identification && (
                  <div className="pc-bloc-corps" style={{ borderBottom: "1px solid var(--trait)" }}>
                    <div className="pc-bloc-titre" style={{ marginBottom: 9 }}>Identification</div>
                    <div className="pc-metriques">
                      <b>{res.identification.carte || "—"}</b><br />
                      {res.identification.extension || "extension inconnue"} · n° {res.identification.numero || "—"} · {res.identification.langue || "—"}<br />
                      <span style={{ color: res.identification.coherence === "incoherent" ? "var(--magenta)" : res.identification.coherence === "coherent" ? "var(--cyan)" : "inherit" }}>
                        Catalogue : {res.identification.coherence || "indéterminé"}
                      </span>{res.identification.note ? ` — ${res.identification.note}` : ""}
                    </div>
                  </div>
                )}

                {Array.isArray(res.controles) && res.controles.length > 0 && (
                  <div className="pc-bloc-corps" style={{ borderBottom: "1px solid var(--trait)" }}>
                    <div className="pc-bloc-titre" style={{ marginBottom: 5 }}>Contrôles</div>
                    {res.controles.map((c, i) => (
                      <div className="pc-ctrl" key={i}>
                        <div style={{
                          background: c.verdict === "suspect" ? "var(--magenta)" : c.verdict === "conforme" ? "var(--cyan)" : "var(--gris-fonce)",
                          marginTop: 4, height: "calc(100% - 8px)",
                        }} />
                        <div>
                          <div className="pc-ctrl-zone">{c.zone} · {c.verdict === "non_verifiable" ? "non vérifiable" : c.verdict}</div>
                          <div className="pc-ctrl-crit">{c.critere}</div>
                          <div className="pc-ctrl-obs">{c.observation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(res.drapeaux) && res.drapeaux.filter(Boolean).length > 0 && (
                  <div className="pc-bloc-corps" style={{ borderBottom: "1px solid var(--trait)" }}>
                    <div className="pc-bloc-titre" style={{ marginBottom: 5, color: "var(--magenta)" }}>Anomalies retenues</div>
                    <ul className="pc-liste">
                      {res.drapeaux.filter(Boolean).map((d, i) => (
                        <li key={i}><span className="pc-puce" style={{ color: "var(--magenta)" }}>▲</span><span>{d}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(res.positifs) && res.positifs.filter(Boolean).length > 0 && (
                  <div className="pc-bloc-corps" style={{ borderBottom: "1px solid var(--trait)" }}>
                    <div className="pc-bloc-titre" style={{ marginBottom: 5, color: "var(--cyan)" }}>Éléments conformes</div>
                    <ul className="pc-liste">
                      {res.positifs.filter(Boolean).map((d, i) => (
                        <li key={i}><span className="pc-puce" style={{ color: "var(--cyan)" }}>●</span><span>{d}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pc-bloc-corps">
                  <div className="pc-bloc-titre" style={{ marginBottom: 9 }}>Message à envoyer au vendeur</div>
                  <div className="pc-msg">{messageVendeur}</div>
                  <button className="pc-copier" onClick={copier}>{copie ? "Copié" : "Copier le message"}</button>
                </div>
              </div>
            )}

            <div className="pc-pied">
              Le contrôle porte sur des photographies, pas sur la carte. Il oriente une décision d'achat ;
              il ne remplace pas un examen en main ni une notation professionnelle. Sur une carte à forte
              valeur, la certitude passe par PSA, BGS ou CGC.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
