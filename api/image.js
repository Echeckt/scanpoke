/**
 * /api/image?u=... — relaie une photo hébergée par Vinted.
 *
 * Sans ce relais, le navigateur peut afficher l'image mais pas la lire :
 * toute mesure de netteté ou de densité est refusée pour cause d'origine
 * différente. Le passage par le serveur rend les pixels analysables.
 */

export default async function handler(req, res) {
  const u = req.query.u;

  if (!u || !/^https:\/\/images\d*\.vinted\.net\//.test(u)) {
    return res.status(400).json({ erreur: "Image non autorisée." });
  }

  try {
    const amont = await fetch(u, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Referer: "https://www.vinted.fr/",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
    });

    if (!amont.ok) {
      return res.status(amont.status).json({ erreur: `Image indisponible (${amont.status}).` });
    }

    const buf = Buffer.from(await amont.arrayBuffer());

    res.setHeader("Content-Type", amont.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({ erreur: `Relais impossible : ${e.message}` });
  }
}
