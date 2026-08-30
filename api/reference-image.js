/**
 * Proxy très fermé pour les images de référence certifiées.
 * Évite CORS côté navigateur et empêche ce endpoint de devenir un proxy ouvert.
 */
const HOTE_AUTORISE = "d1htnxwo4o0jhw.cloudfront.net";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ erreur: "Utilisez GET." });

  const brut = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  if (!brut) return res.status(400).json({ erreur: "URL manquante." });

  let url;
  try { url = new URL(brut); }
  catch { return res.status(400).json({ erreur: "URL invalide." }); }

  if (url.protocol !== "https:" || url.hostname !== HOTE_AUTORISE) {
    return res.status(403).json({ erreur: "Source de référence non autorisée." });
  }

  try {
    const r = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 compatible; PokemonReferenceVerifier/1.0" },
    });
    if (!r.ok) return res.status(502).json({ erreur: `Référence indisponible (${r.status}).` });

    const type = r.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return res.status(502).json({ erreur: "La source n'a pas renvoyé une image." });

    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 2_500_000) return res.status(413).json({ erreur: "Image de référence trop lourde." });

    res.setHeader("Content-Type", type.includes("tiff") ? "image/jpeg" : type);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ erreur: `Référence inaccessible : ${e.message}` });
  }
}
