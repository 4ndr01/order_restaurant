# order_restaurant

Site de commande de plats pour un restaurant, pensé pour être ouvert en scannant un **QR code posé sur la table**. Le client scanne, commande depuis son téléphone, et suit la préparation en direct. La cuisine voit arriver les commandes sur un écran dédié.

Construit avec **Next.js 16** (App Router), TypeScript et Tailwind CSS. Les données sont stockées dans un simple fichier JSON : aucune base de données à installer.

## Démarrage

```bash
npm install
npm run dev
```

Le site est disponible sur http://localhost:3000.

## Pensé pour le mobile

Le client commande depuis son téléphone, debout ou attablé : toutes les pages sont dessinées d'abord pour un écran de téléphone, et le personnel peut aussi tenir le service depuis un mobile.

- mise en page fluide sans jamais de défilement horizontal, testée de 320 px à l'écran large
- cibles tactiles d'au moins 44 px (boutons, quantités, navigation)
- panier en feuille glissante, avec bouton de validation toujours visible en bas
- respect des encoches et de la barre d'accueil iPhone (`viewport-fit=cover` + `env(safe-area-inset-bottom)`)
- champs de saisie à 16 px pour éviter le zoom automatique d'iOS
- navigation de l'espace restaurant en onglets défilants, utilisable au pouce

## Les trois parcours

### 1. Le client (public)

| Page | Rôle |
| --- | --- |
| `/table/[id]` | Menu avec la table déjà sélectionnée — c'est la cible des QR codes |
| `/menu` | Même menu, sans table (vente à emporter / comptoir) |
| `/commande/[id]` | Suivi en direct : reçue → en préparation → prête → servie |

Le panier permet d'ajuster les quantités et d'ajouter une précision pour la cuisine (allergies, cuisson). Les prix sont recalculés côté serveur à la validation, jamais repris du navigateur.

### 2. La cuisine (`/admin/cuisine`)

Les commandes en cours s'affichent avec la table, l'heure, le détail des plats et la note du client. Un bouton fait avancer la commande d'un statut au suivant. La liste se rafraîchit toute seule toutes les 5 secondes.

### 3. La gestion (`/admin`)

- `/admin/menu` — ajouter/modifier/supprimer des plats et des catégories, signaler une rupture en un clic
- `/admin/tables` — créer les tables, **générer et imprimer un QR code par table**

## Les QR codes

Sur `/admin/tables`, chaque table affiche son QR code, généré côté serveur en PNG. Le champ « Adresse publique du site » définit l'URL encodée dans les QR codes : mettez-y le domaine réel du restaurant (par ex. `https://resto-le-comptoir.fr`) avant d'imprimer, sinon les QR pointeront vers l'adresse depuis laquelle vous consultez la page.

Le bouton **Imprimer les QR codes** ouvre une mise en page épurée (2 QR codes par ligne, sans la navigation) à découper et poser sur les tables.

Pour figer l'adresse une fois pour toutes, définissez `NEXT_PUBLIC_BASE_URL`.

## Accès à l'espace restaurant

Tout ce qui est sous `/admin` et `/api/admin` est protégé par une authentification HTTP Basic (`src/proxy.ts`).

Identifiants par défaut : **admin** / **restaurant**. Changez-les en production :

```bash
ADMIN_USER=chef
ADMIN_PASSWORD=un-mot-de-passe-solide
NEXT_PUBLIC_BASE_URL=https://resto-le-comptoir.fr
```

## Données

Tout est stocké dans `data/db.json`, créé automatiquement au premier lancement à partir de `src/lib/seed.ts` (menu d'exemple + 6 tables). Le dossier `data/` est ignoré par git. `DATA_DIR` permet de le déplacer.

Ce stockage fichier convient à un restaurant unique sur un hébergement avec disque persistant (VPS, Render, Railway, Fly.io). Sur une plateforme sans disque persistant (fonctions serverless), remplacez `src/lib/db.ts` par une vraie base de données : c'est le seul fichier à réécrire, tout le reste passe par lui.

## Structure

```
src/
  app/
    table/[id]/        menu client via QR code
    menu/              menu client sans table
    commande/[id]/     suivi de commande
    admin/             cuisine, menu, tables (protégé)
    api/
      orders/          commandes (public : passer, suivre)
      admin/           menu, catégories, tables, QR, statuts (protégé)
  components/          OrderBoard, OrderTracker, KitchenBoard, MenuManager, TablesManager
  lib/                 db.ts (stockage JSON), menu.ts, base-url.ts, types.ts, seed.ts
  proxy.ts             authentification de l'espace restaurant
```

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
```
