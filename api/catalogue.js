/**
 * /api/catalogue?nom=...&numero=... — interroge TCGdex (api.tcgdex.net),
 * base de données ouverte et gratuite du Pokémon TCG, indépendante de
 * Vinted et de notre propre analyse d'image.
 *
 * Objectif précis : vérifier les langues connues par TCGdex pour cette carte.
 * C'est un signal de catalogue utile, mais la base peut être incomplète —
 * notamment pour certains marchés asiatiques — et ne doit jamais suffire seule.
 *
 * TCGdex n'a pas de clé, mais on passe par ce relais pour éviter tout
 * souci de CORS côté navigateur et pour ne faire qu'un aller-retour
 * réseau depuis le poste de l'utilisateur.
 */

const LANGUES = ["en", "fr", "de", "es", "it", "pt", "ja", "zh-tw", "id", "th"];

async function chercherCandidats(nom, langue = "en") {
  const code = LANGUES.includes(langue) ? langue : "en";
  const url = `https://api.tcgdex.net/v2/${code}/cards?name=${encodeURIComponent(nom)}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const liste = await r.json();
  return Array.isArray(liste) ? liste : [];
}

function meilleurCandidat(liste, numero) {
  if (!liste.length) return null;
  if (numero) {
    const n = String(numero).replace(/^0+/, "");
    const exact = liste.find((c) => String(c.localId || "").replace(/^0+/, "") === n);
    if (exact) return exact;
  }
  return liste[0];
}

export default async function handler(req, res) {
  const nom = String(req.query.nom || "").trim();
  const numero = String(req.query.numero || "").trim();
  const langueDemandee = String(req.query.langue || "en").trim().toLowerCase();

  if (!nom) {
    return res.status(400).json({ erreur: "Nom de carte manquant." });
  }

  try {
    let candidats = await chercherCandidats(nom, langueDemandee);
    if (!candidats.length && langueDemandee !== "en") candidats = await chercherCandidats(nom, "en");
    const candidat = meilleurCandidat(candidats, numero);

    if (!candidat) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ trouve: false });
    }

    const essais = await Promise.all(
      LANGUES.map(async (code) => {
        try {
          const r = await fetch(`https://api.tcgdex.net/v2/${code}/cards/${candidat.id}`);
          if (!r.ok) return null;
          const c = await r.json();
          return c && c.name ? { code, carte: c } : null;
        } catch {
          return null;
        }
      })
    );

    const disponibles = essais.filter(Boolean);
    const ref = disponibles.find((d) => d.code === "en") || disponibles[0];

    res.setHeader("Cache-Control", "public, max-age=3600");

    if (!ref) {
      return res.status(200).json({ trouve: false });
    }

    return res.status(200).json({
      trouve: true,
      id: candidat.id,
      nom: ref.carte.name,
      extension: ref.carte.set?.name || "",
      numero: ref.carte.localId || "",
      rarete: ref.carte.rarity || "",
      illustrateur: ref.carte.illustrator || "",
      image: candidat.image ? `${candidat.image}/high.webp` : "",
      langues: disponibles.map((d) => d.code),
    });
  } catch (e) {
    return res.status(502).json({ erreur: `Catalogue indisponible : ${e.message}` });
  }
}
