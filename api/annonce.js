/**
 * /api/annonce?url=... — lit une annonce Vinted et renvoie titre, prix,
 * description et la liste des photos.
 *
 * On ne renvoie que les LIENS des photos, pas les images elles-mêmes :
 * la réponse reste légère et le navigateur les récupère ensuite une par une
 * via /api/image.
 *
 * Limite assumée : Vinted filtre les requêtes venant d'un hébergeur. Un 403
 * de temps en temps est normal et n'indique pas une panne du site.
 */

const ENTETES = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
};

function decoder(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
}

function extraireImages(html) {
  const vues = new Set();
  for (const m of html.matchAll(/https:\/\/images\d*\.vinted\.net\/[^"'\\\s)<>]+/g)) {
    const u = m[0].replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
    if (/\/(thumb|f\d{2,3}x|\d{2,3}x\d{2,3})\//.test(u)) continue; // vignettes écartées
    vues.add(u);
  }
  if (vues.size === 0) {
    for (const m of html.matchAll(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/g
    )) {
      vues.add(m[1]);
    }
  }
  return [...vues].slice(0, 6);
}

export default async function handler(req, res) {
  const cible = req.query.url;

  if (!cible || !/^https:\/\/(www\.)?vinted\.[a-z.]+\/items\//.test(cible)) {
    return res.status(400).json({ erreur: "Collez le lien complet d'un article Vinted." });
  }

  try {
    const page = await fetch(cible, { headers: ENTETES });

    if (!page.ok) {
      return res.status(page.status).json({
        erreur:
          page.status === 403 || page.status === 429
            ? "Vinted a refusé la lecture automatique. Enregistrez les photos et glissez-les ci-dessous."
            : `Vinted a répondu ${page.status}.`,
      });
    }

    const html = await page.text();
    const images = extraireImages(html);

    if (!images.length) {
      return res.status(404).json({
        erreur: "Aucune photo trouvée sur cette page. Glissez-les manuellement.",
      });
    }

    const titre = decoder(
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/)?.[1]
    );
    const description = decoder(
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/)?.[1]
    );
    const prix = (
      html.match(/"(?:price|total_item_price)"\s*:\s*(?:\{[^}]*"amount"\s*:\s*)?"?([\d.,]+)"?/)?.[1] || ""
    ).replace(/[.,]$/, "").replace(/[.,]00$/, ""); // « 2, » et « 2,00 » deviennent « 2 »

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ url: cible, titre, description, prix, images });
  } catch (e) {
    return res.status(502).json({ erreur: `Lecture impossible : ${e.message}` });
  }
}
