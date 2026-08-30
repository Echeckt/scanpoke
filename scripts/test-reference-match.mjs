import { trouverProfilReference, profilsActifs } from "../src/referenceProfiles.js";

const cas = [
  {
    nom: "Rayquaza mal identifié côté set, mais numéro exact",
    input: { carte: "Rayquaza ☆", numero: "107/107", extension: "EX Dragon Frontiers", langue: "anglais", marche: "europeen", variante_tirage: "Gold Star", epoque: "2005" },
    attendu: "rayquaza-gold-star-107-ex-deoxys-en",
  },
  {
    nom: "Dracaufeu japonais No Rarity",
    input: { carte: "リザードン", numero: "No.006", extension: "Japanese Basic", langue: "japonais", marche: "japonais", variante_tirage: "No Rarity Symbol", epoque: "1996" },
    attendu: "charizard-japanese-basic-006-no-rarity",
  },
  {
    nom: "Dracaufeu japonais variante inconnue ne doit pas charger No Rarity",
    input: { carte: "リザードン", numero: "No.006", extension: "Japanese Basic", langue: "japonais", marche: "japonais", variante_tirage: "", epoque: "1996" },
    attendu: null,
  },
];

let erreurs = 0;
for (const c of cas) {
  const obtenu = trouverProfilReference(c.input)?.profil?.id || null;
  const ok = obtenu === c.attendu;
  console.log(`${ok ? "✓" : "✗"} ${c.nom}:`, obtenu);
  if (!ok) erreurs++;
}

console.log(`Profils actifs: ${profilsActifs().length}`);
if (erreurs) process.exit(1);
