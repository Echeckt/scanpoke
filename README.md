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

## v1.3 — ROI du dos + seuil relatif robuste
- Le bleu du dos est maintenant mesuré dans une zone reconstruite à partir du motif bleu lui-même, au lieu d'un détourage global pollué par la main ou le décor.
- Le garde-fou compare le bleu aux encres jaune/rouge dans cette même zone et utilise aussi le ratio bleu/référence.
- Le cas de régression Rayquaza (bleu ~42–43 % alors que les autres encres restent nettement plus saturées) déclenche désormais une anomalie rédhibitoire.
- Le garde-fou peut reconnaître un dos par sa signature visuelle même si son rôle a été mal sélectionné dans l'interface.

## v1.4 — profils régionaux Japon / Chine / Europe
- Détection régionale avant le verdict : 🇯🇵 japonais, 🇨🇳 chinois, 🇪🇺 européen/international latin, ou autre/indéterminé.
- Le recto détermine le marché ; un dos international ne peut jamais distinguer chinois et européen à lui seul.
- Trois familles de dos : japonais Old Back (1996–juil. 2001), japonais moderne, international.
- Le garde-fou colorimétrique V1.3 n'est plus universel : il ne s'applique qu'au profil de dos international. Un vrai Old Back japonais ne peut donc plus être condamné par les seuils du Rayquaza international.
- Le prompt adapte désormais catalogue, holo, texture, colorimétrie, mise en page et cohérence à la carte précise et à son marché.
- Ajout d'un sélecteur « Profil régional » laissé sur détection automatique par défaut, avec possibilité de forcer Japon / Chine / Europe en cas de besoin.
- Les conseils physiques ont été rendus dépendants du tirage : aucune texture ou plage de poids n'est présentée comme universelle.
