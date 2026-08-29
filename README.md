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
