/*
 * Base de références authentifiées.
 *
 * Principe : on ne compare jamais une carte à un profil générique lorsqu'une
 * référence du TIRAGE EXACT est disponible. Les images restent chez la source
 * (PSA ici) et sont chargées à la demande via /api/reference-image ; elles ne
 * sont donc pas redistribuées dans le projet.
 *
 * status:
 *   - active : au moins 3 exemplaires certifiés avec recto + verso exploitables
 *   - queued : identité verrouillée, références visuelles encore à valider
 */

export const REFERENCE_PROFILES = [
  {
    id: "rayquaza-gold-star-107-ex-deoxys-en",
    status: "active",
    priority: 100,
    title: "Rayquaza ☆ 107/107 · EX Deoxys · anglais",
    pokemon: "Rayquaza",
    printedName: "Rayquaza ☆",
    aliases: ["rayquaza", "rayquaza ☆", "rayquaza star", "rayquaza gold star", "rayquaza-holo"],
    set: "EX Deoxys",
    setAliases: ["ex deoxys", "deoxys"],
    number: "107/107",
    numberAliases: ["107", "107/107", "#107"],
    market: "europeen",
    language: "anglais",
    languageAliases: ["anglais", "english", "en"],
    backFamily: "internationale",
    year: "2005",
    variant: "Gold Star",
    variantAliases: ["gold star", "☆", "star"],
    exactIdentityConfidence: 100,
    canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Deoxys/Rayquaza-Gold-Star-DX107",
    references: [
      {
        authority: "PSA",
        cert: "53934211",
        grade: "MINT 9",
        certUrl: "https://www.psacard.com/cert/53934211/psa",
        frontUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/112463872/small/352359962.tif?f=jpg",
        backUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/112463872/small/352359945.tif?f=jpg",
      },
      {
        authority: "PSA",
        cert: "67477272",
        grade: "NM-MT 8",
        certUrl: "https://www.psacard.com/cert/67477272/psa",
        frontUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/131565072/small/ld-RckpzmE-DhMZkuSOuCQ.jpg",
        backUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/131565072/small/PW48SkYjkEasDVWn2fP3Pw.jpg",
      },
      {
        authority: "PSA",
        cert: "73204806",
        grade: "NM 7",
        certUrl: "https://www.psacard.com/cert/73204806/psa",
        frontUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/138362402/small/VCWpMRIbn0mplmAQqAnqKQ.jpg",
        backUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/138362402/small/RtSv3RFBoUe1PwhT3LQAfA.jpg",
      },
    ],
  },
  {
    id: "charizard-japanese-basic-006-no-rarity",
    status: "active",
    priority: 95,
    title: "リザードン No.006 · Japanese Basic · No Rarity",
    pokemon: "Charizard",
    printedName: "リザードン",
    aliases: ["リザードン", "charizard", "dracaufeu", "charizard-holo"],
    set: "Pokémon Japanese Basic",
    setAliases: ["pokemon japanese basic", "japanese basic", "expansion pack", "base set", "拡張パック"],
    number: "No.006",
    numberAliases: ["006", "6", "no.006", "#6"],
    market: "japonais",
    language: "japonais",
    languageAliases: ["japonais", "japanese", "ja"],
    backFamily: "japonaise_old",
    year: "1996",
    variant: "No Rarity Symbol",
    variantAliases: ["no rarity", "no rarity symbol", "sans symbole de rareté", "sans symbole rarete"],
    strictVariant: true,
    exactIdentityConfidence: 100,
    canonicalSource: "https://www.psacard.com/cert/91829633/psa",
    references: [
      {
        authority: "PSA",
        cert: "99040038",
        grade: "NM-MT 8",
        certUrl: "https://www.psacard.com/cert/99040038/psa",
        frontUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/166913825/small/ILo5WKHnQkSj3YuOt784KA.jpg",
        backUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/166913825/small/dldP-SAM_ECP6q63IcIdJQ.jpg",
      },
      {
        authority: "PSA",
        cert: "76281909",
        grade: "NM-MT 8",
        certUrl: "https://www.psacard.com/cert/76281909/psa",
        frontUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/142392197/small/9aznKjLRIkGM4qUrELyhGA_f6a47.jpg",
        backUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/142392197/small/Q-sTO7Q0-kWSuKGk-Kc0wQ_281ee.jpg",
      },
      {
        authority: "PSA",
        cert: "91829633",
        grade: "EX 5",
        certUrl: "https://www.psacard.com/cert/91829633/psa",
        frontUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/158454715/small/cS2jCPfvNE2qew7GRG8f1A.jpg",
        backUrl: "https://d1htnxwo4o0jhw.cloudfront.net/cert/158454715/small/kdocAiYtckyKJtaieJD8EA.jpg",
      },
    ],
  },

  // Profils d'identité préparés pour la suite. Ils ne sont PAS utilisés pour
  // condamner/authentifier tant que 3 références visuelles certifiées n'ont pas
  // été ajoutées et validées.
  {
    id: "charizard-base-set-4-en-unlimited",
    status: "queued",
    title: "Charizard 4/102 · Base Set · anglais · Unlimited",
    pokemon: "Charizard", printedName: "Charizard",
    aliases: ["charizard"], set: "Base Set", setAliases: ["base set"],
    number: "4/102", numberAliases: ["4", "4/102"], market: "europeen", language: "anglais",
    languageAliases: ["anglais", "english", "en"], backFamily: "internationale", year: "1999",
    variant: "Unlimited", canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Charizard-V1-BS4", references: [],
  },
  {
    id: "shining-charizard-107-neo-destiny-en",
    status: "queued",
    title: "Shining Charizard 107/105 · Neo Destiny · anglais",
    pokemon: "Charizard", printedName: "Shining Charizard",
    aliases: ["shining charizard", "dracaufeu brillant"], set: "Neo Destiny", setAliases: ["neo destiny"],
    number: "107/105", numberAliases: ["107", "107/105"], market: "europeen", language: "anglais",
    languageAliases: ["anglais", "english", "en"], backFamily: "internationale", year: "2002",
    variant: "Shining", canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Charizard-NDE107", references: [],
  },
  {
    id: "charizard-gold-star-100-dragon-frontiers-en",
    status: "queued",
    title: "Charizard ☆ 100/101 · EX Dragon Frontiers · anglais",
    pokemon: "Charizard", printedName: "Charizard ☆",
    aliases: ["charizard", "charizard star", "charizard gold star"], set: "EX Dragon Frontiers", setAliases: ["ex dragon frontiers", "dragon frontiers"],
    number: "100/101", numberAliases: ["100", "100/101"], market: "europeen", language: "anglais",
    languageAliases: ["anglais", "english", "en"], backFamily: "internationale", year: "2006",
    variant: "Gold Star δ Delta Species", canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Charizard-Gold-Star-Delta-Species-DF100", references: [],
  },
  {
    id: "umbreon-gold-star-17-pop5-en",
    status: "queued",
    title: "Umbreon ☆ 17/17 · POP Series 5 · anglais",
    pokemon: "Umbreon", printedName: "Umbreon ☆",
    aliases: ["umbreon", "umbreon star", "umbreon gold star"], set: "POP Series 5", setAliases: ["pop series 5", "pop5"],
    number: "17/17", numberAliases: ["17", "17/17"], market: "europeen", language: "anglais",
    languageAliases: ["anglais", "english", "en"], backFamily: "internationale", year: "2007",
    variant: "Gold Star", canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/POP-Series-5/Umbreon-Gold-Star-POP517", references: [],
  },
  {
    id: "mewtwo-gold-star-103-holon-phantoms-en",
    status: "queued",
    title: "Mewtwo ☆ 103/110 · EX Holon Phantoms · anglais",
    pokemon: "Mewtwo", printedName: "Mewtwo ☆",
    aliases: ["mewtwo", "mewtwo star", "mewtwo gold star"], set: "EX Holon Phantoms", setAliases: ["ex holon phantoms", "holon phantoms"],
    number: "103/110", numberAliases: ["103", "103/110"], market: "europeen", language: "anglais",
    languageAliases: ["anglais", "english", "en"], backFamily: "internationale", year: "2006",
    variant: "Gold Star", canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Holon-Phantoms/Mewtwo-Gold-Star-HP103", references: [],
  },
  {
    id: "lugia-9-neo-genesis-en-unlimited",
    status: "queued",
    title: "Lugia 9/111 · Neo Genesis · anglais",
    pokemon: "Lugia", printedName: "Lugia",
    aliases: ["lugia"], set: "Neo Genesis", setAliases: ["neo genesis"],
    number: "9/111", numberAliases: ["9", "9/111"], market: "europeen", language: "anglais",
    languageAliases: ["anglais", "english", "en"], backFamily: "internationale", year: "2000",
    variant: "Holo Rare", canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Lugia-NG9", references: [],
  },
  {
    id: "umbreon-vmax-215-evolving-skies-en",
    status: "queued",
    title: "Umbreon VMAX 215/203 · Evolving Skies · anglais",
    pokemon: "Umbreon", printedName: "Umbreon VMAX",
    aliases: ["umbreon vmax"], set: "Evolving Skies", setAliases: ["evolving skies", "evs"],
    number: "215/203", numberAliases: ["215", "215/203"], market: "europeen", language: "anglais",
    languageAliases: ["anglais", "english", "en"], backFamily: "internationale", year: "2021",
    variant: "Special Art / Alternate Art", canonicalSource: "https://www.cardmarket.com/en/Pokemon/Products/Singles/Evolving-Skies/Umbreon-VMAX-V3", references: [],
  },
  {
    id: "umbreon-vmax-173-cs4ac-s-chinese",
    status: "queued",
    title: "Umbreon VMAX 173/132 · CS4aC · chinois simplifié",
    pokemon: "Umbreon", printedName: "Umbreon VMAX",
    aliases: ["umbreon vmax"], set: "CS4aC", setAliases: ["cs4ac"],
    number: "173/132", numberAliases: ["173", "173/132"], market: "chinois", language: "chinois simplifié",
    languageAliases: ["chinois simplifié", "simplified chinese", "s-chinese", "zh-hans"], backFamily: "internationale", year: "2024",
    variant: "Hyper Rare · pack variant à distinguer", canonicalSource: "", references: [],
  },
];

function norm(v) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[☆★]/g, " star ")
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, " ")
    .trim();
}

function contientUn(texte, valeurs = []) {
  const t = norm(texte);
  if (!t) return false;
  return valeurs.some((v) => {
    const n = norm(v);
    return n && (t === n || t.includes(n) || n.includes(t));
  });
}

function numeroCompatible(recu, aliases = []) {
  const r = norm(recu).replace(/\s+/g, "");
  if (!r) return false;
  return aliases.some((a) => {
    const n = norm(a).replace(/\s+/g, "");
    return n && (r === n || r.endsWith(n) || n.endsWith(r));
  });
}

/**
 * Renvoie le meilleur profil et un score de correspondance.
 * Les références actives demandent au minimum nom + numéro. Pour les variantes
 * strictes (ex. No Rarity), la variante doit également être explicitement vue.
 */
export function trouverProfilReference(identification = {}) {
  const carte = identification.carte || identification.nom || "";
  const numero = identification.numero || "";
  const extension = identification.extension || identification.set || "";
  const langue = identification.langue || identification.variante_marche || "";
  const marche = norm(identification.marche || "");
  const variante = `${identification.variante_tirage || ""} ${identification.variante || ""} ${identification.note || ""}`;
  const epoque = norm(identification.epoque || "");

  const candidats = REFERENCE_PROFILES.map((p) => {
    let score = 0;
    const raisons = [];
    if (contientUn(carte, [p.printedName, p.pokemon, ...(p.aliases || [])])) { score += 38; raisons.push("nom"); }
    if (numeroCompatible(numero, [p.number, ...(p.numberAliases || [])])) { score += 36; raisons.push("numero"); }
    if (contientUn(extension, [p.set, ...(p.setAliases || [])])) { score += 12; raisons.push("set"); }
    if (contientUn(langue, [p.language, ...(p.languageAliases || [])])) { score += 7; raisons.push("langue"); }
    if (marche && marche === norm(p.market)) { score += 5; raisons.push("marche"); }
    if (epoque && norm(p.year) && epoque.includes(norm(p.year))) { score += 2; raisons.push("annee"); }

    const varianteVue = contientUn(variante, [p.variant, ...(p.variantAliases || [])]);
    if (varianteVue) { score += 8; raisons.push("variante"); }
    if (p.strictVariant && !varianteVue) score -= 28;

    return { profil: p, score, raisons, varianteVue };
  }).sort((a, b) => b.score - a.score || (b.profil.priority || 0) - (a.profil.priority || 0));

  const best = candidats[0];
  if (!best || best.score < 66) return null;
  if (!best.raisons.includes("nom") || !best.raisons.includes("numero")) return null;
  if (best.profil.strictVariant && !best.varianteVue) return null;
  return best;
}

export function profilsActifs() {
  return REFERENCE_PROFILES.filter((p) => p.status === "active" && p.references?.length >= 3);
}
