# Contrôle d'authenticité — cartes Pokémon

Colle le lien d'une annonce Vinted, le site récupère titre, prix et photos,
mesure ce que les images permettent réellement de vérifier, puis rend un
rapport d'authenticité.

## Mise en ligne

1. Envoie ce dossier dans un dépôt GitHub.
2. Sur vercel.com : **Add New → Project**, choisis le dépôt, **Deploy**.
3. **Settings → Environment Variables** : ajoute `ANTHROPIC_API_KEY`
   avec ta clé de console.anthropic.com.
4. **Deployments → Redeploy** pour que la clé soit prise en compte.

## La clé ne va JAMAIS dans le dépôt

Le dépôt est public : une clé écrite dans un fichier serait lue et dépensée
en quelques minutes. Elle ne vit que dans les variables Vercel.

## Ce qui va casser de temps en temps

Vinted filtre les requêtes venant d'un hébergeur. Le bouton « Lire » renverra
parfois une erreur — c'est normal, pas une panne. Le dépôt de photos manuel
reste disponible juste en dessous et fonctionne toujours.

## Coût

Chaque analyse consomme quelques centimes d'API. Sur un site public, ce sont
des inconnus qui les dépensent. Pense à fixer une limite mensuelle dans la
console Anthropic.

## Correctif V1.1 — détection du dos

- La balance des blancs n'utilise plus aveuglément le pourtour d'une photo colorée.
- Un dos Pokémon centré est reconnu avant la logique « macro ».
- Les mesures du bleu du dos (saturation, teinte, luminosité) sont transmises à l'analyse.
- Les anomalies ont maintenant une gravité : faible, forte ou rédhibitoire.
- Une contradiction rédhibitoire ne peut plus être compensée par des détails faciles à copier.

## v1.2 — garde-fou colorimétrique local
- Le score ne dépend plus du fait que le modèle pense à reporter le bleu délavé dans `controles`.
- Mesure relative bleu vs rouge Poké Ball / jaune du logo dans la même photo.
- Si le bleu est très faible alors que rouge/jaune restent francs et que le blanc central reste neutre, un contrôle local rédhibitoire est injecté.
- Une anomalie locale rédhibitoire force le score d'authenticité à 0/100 et un plancher de confiance de 92% pour ce défaut précis.
