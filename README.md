# Faux ou authentique — V1.7 · base de références certifiées

Cette version remplace progressivement les seuils génériques par une comparaison au **tirage exact**.

## Ce qui change

- La première passe identifie la carte : nom, numéro, set, marché, langue, famille de dos et variante d'impression.
- L'identité est comparée à `src/referenceProfiles.js`.
- Lorsqu'un profil `active` est trouvé, l'application charge **3 exemplaires certifiés PSA** (recto + verso) via `/api/reference-image.js`.
- Une deuxième passe Claude compare les photos du sujet aux 3 références du **même tirage**.
- Les contrôles colorimétriques/géométriques génériques sont alors remplacés par les contrôles issus de la base certifiée.
- Si les références ne sont pas accessibles, l'application retombe automatiquement sur les garde-fous V1.5.
- L'interface affiche le profil utilisé, le nombre de références, les certificats et la correspondance visuelle.

## Profils actifs dans ce pilote

### Rayquaza ☆ 107/107 · EX Deoxys · anglais
3 scans PSA recto/verso :
- PSA 53934211 — MINT 9
- PSA 67477272 — NM-MT 8
- PSA 73204806 — NM 7

Le profil verrouille notamment **EX Deoxys** : un modèle qui identifierait par erreur le Gold Star 107/107 comme EX Dragon Frontiers est corrigé avant le verdict final.

### リザードン No.006 · Japanese Basic · No Rarity Symbol
3 scans PSA recto/verso :
- PSA 99040038 — NM-MT 8
- PSA 76281909 — NM-MT 8
- PSA 91829633 — EX 5

Ce profil exige que la première passe voie explicitement la variante **No Rarity Symbol**. Il n'est donc pas appliqué aveuglément à tous les Dracaufeu japonais No.006.

## Profils préparés, mais pas encore actifs

La structure contient aussi les identités de :
- Charizard 4/102 Base Set EN Unlimited
- Shining Charizard 107/105 Neo Destiny EN
- Charizard Gold Star 100/101 EX Dragon Frontiers EN
- Umbreon Gold Star 17/17 POP Series 5 EN
- Mewtwo Gold Star 103/110 EX Holon Phantoms EN
- Lugia 9/111 Neo Genesis EN
- Umbreon VMAX 215/203 Evolving Skies EN
- Umbreon VMAX 173/132 CS4aC chinois simplifié

Ils sont `queued` : **aucun verdict n'utilise leurs références tant que 3 exemplaires certifiés n'ont pas été ajoutés**.

## Pourquoi les images ne sont pas copiées dans le ZIP

Les URLs des scans de certification sont stockées comme provenance, mais les images restent hébergées chez leur source. `/api/reference-image.js` les charge à la demande depuis un hôte explicitement autorisé. Cela évite de redistribuer une photothèque tierce dans le projet et permet de retirer/remplacer facilement une référence.

## Sécurité importante

Une certification connue ne suffit pas si le numéro de certification a été cloné sur une fausse slab. La base doit donc conserver plusieurs références indépendantes et peut retirer immédiatement une référence signalée/deactivated. Ne jamais construire un profil à partir d'une seule annonce marketplace.

## Déploiement

Même configuration que la V1.5 :

```bash
npm install
npm run dev
```

Variable Vercel requise : `ANTHROPIC_API_KEY`.

## Ajouter un profil actif

Dans `src/referenceProfiles.js` :
1. verrouiller nom/set/numéro/langue/marché/variante ;
2. ajouter au moins 3 certifications indépendantes ;
3. fournir `frontUrl`, `backUrl` et `certUrl` ;
4. passer `status` de `queued` à `active` seulement après contrôle manuel des 3 dossiers.


## V1.7 — séparation identité / authenticité
- Une ressemblance avec des scans PSA ne donne plus de crédit positif au score : elle confirme surtout le bon modèle/tirage.
- Les différences répétées face aux références restent des signaux négatifs forts.
- Les aveux explicites du vendeur (`Not Official`, `replica`, `reproduction`, `proxy`, etc.) sont détectés localement et ne sont plus plafonnés par la qualité des photos.
- Quand un profil exact à 3 références PSA est trouvé, son identité verrouille extension/numéro/année/note et le lookup TCGdex générique est ignoré pour éviter les contradictions.
