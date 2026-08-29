/**
 * /api/analyse — relaie la demande d'analyse vers Anthropic.
 * La clé vit dans les variables d'environnement Vercel, jamais dans le code.
 */

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erreur: "Utilisez POST." });
  }

  const cle = process.env.ANTHROPIC_API_KEY;
  if (!cle) {
    return res.status(500).json({
      erreur:
        "Clé absente. Ajoutez ANTHROPIC_API_KEY dans Vercel → Settings → Environment Variables, puis redéployez.",
    });
  }

  try {
    const amont = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cle,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await amont.json();
    return res.status(amont.status).json(data);
  } catch (e) {
    return res.status(502).json({ erreur: `Analyse indisponible : ${e.message}` });
  }
}
