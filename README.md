# order_restaurant

Plateforme de commande à table par QR code, ouverte à **plusieurs restaurants indépendants**. Chaque restaurateur crée son compte, obtient son propre menu et ses propres QR codes, et ne voit jamais les données des autres. Le client scanne le QR code de sa table, commande depuis son téléphone, et suit la préparation en direct. La cuisine voit arriver les commandes sur un écran dédié.

Construit avec **Next.js 16** (App Router), TypeScript et Tailwind CSS. Les données sont stockées dans Postgres, avec un cloisonnement strict entre restaurants au niveau de chaque requête.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseignez DATABASE_URL et SESSION_SECRET
npm run dev
```

Le site est disponible sur http://localhost:3000. Sans `DATABASE_URL` ou `SESSION_SECRET`, le serveur refuse de démarrer avec un message explicite — voir [Données](#données) pour obtenir une base gratuite en quelques minutes.

## Pensé pour le mobile

Le client commande depuis son téléphone, debout ou attablé : toutes les pages sont dessinées d'abord pour un écran de téléphone, et le personnel peut aussi tenir le service depuis un mobile.

- mise en page fluide sans jamais de défilement horizontal, testée de 320 px à l'écran large
- cibles tactiles d'au moins 44 px (boutons, quantités, navigation)
- panier en feuille glissante, avec bouton de validation toujours visible en bas
- respect des encoches et de la barre d'accueil iPhone (`viewport-fit=cover` + `env(safe-area-inset-bottom)`)
- champs de saisie à 16 px pour éviter le zoom automatique d'iOS

## Multi-restaurants

Chaque restaurant a sa propre adresse : `/r/<slug>/...`. Un restaurateur s'inscrit sur `/signup` (nom du restaurant, adresse, email, mot de passe), et obtient immédiatement un menu d'exemple modifiable, six tables, et son espace de gestion.

**Le cloisonnement des données ne repose jamais sur l'URL.** Toutes les routes d'administration identifient le restaurant via la session de connexion (cookie signé), jamais via un identifiant fourni par le client — un restaurateur ne peut donc jamais agir sur les données d'un autre, même en modifiant l'adresse dans son navigateur. C'est vérifié par un test d'isolation (deux restaurants créés, commande de l'un testée injoignable par l'autre via trois angles différents : liste des commandes, accès direct par identifiant, changement de statut).

## Les quatre parcours

### 1. Le client (public)

| Page | Rôle |
| --- | --- |
| `/r/<slug>/table/[id]` | Menu avec la table déjà sélectionnée — c'est la cible des QR codes |
| `/r/<slug>/menu` | Même menu, sans table (vente à emporter / comptoir) |
| `/r/<slug>/commande/[id]` | Suivi en direct : reçue → en préparation → prête → servie |

Le panier permet d'ajuster les quantités et d'ajouter une précision pour la cuisine (allergies, cuisson). Les prix sont recalculés côté serveur à la validation, jamais repris du navigateur.

### 2. La cuisine (`/r/<slug>/admin/cuisine`)

Les commandes en cours s'affichent avec la table, l'heure, le détail des plats et la note du client. Un bouton fait avancer la commande d'un statut au suivant. La liste se rafraîchit toute seule toutes les 5 secondes.

### 3. La gestion (`/r/<slug>/admin`)

- `.../menu` — ajouter/modifier/supprimer des plats et des catégories, signaler une rupture en un clic
- `.../tables` — créer les tables, **générer et imprimer un QR code par table**

### 4. L'inscription (`/signup`, `/login`)

Créer un compte crée aussi le restaurant associé (nom, slug unique, menu de démarrage). La connexion se fait par email/mot de passe (mot de passe haché avec scrypt, jamais stocké en clair).

## Les QR codes

Sur `.../admin/tables`, chaque table affiche son QR code, généré côté serveur en PNG, pointant vers `/r/<slug>/table/<id>`. Le champ « Adresse publique du site » définit l'URL encodée : mettez-y le domaine réel avant d'imprimer, sinon les QR pointeront vers l'adresse depuis laquelle vous consultez la page.

Le bouton **Imprimer les QR codes** ouvre une mise en page épurée (2 QR codes par ligne, sans la navigation) à découper et poser sur les tables.

Pour figer l'adresse une fois pour toutes, définissez `NEXT_PUBLIC_BASE_URL`.

## Authentification

- **Restaurateurs** : compte email/mot de passe, session en cookie signé (JWT, `jose`) valable 30 jours. `src/proxy.ts` vérifie la session sur toutes les routes `/r/<slug>/admin/*` (redirection vers `/login` si absente, vers le bon restaurant si le slug de l'URL ne correspond pas à la session) et sur `/api/admin/*`.
- **Mots de passe** : hachés avec `scrypt` (`node:crypto`, sans dépendance native) et comparés en temps constant.
- **Identifiants** (`createId`) : tirés de `randomBytes`, 96 bits d'entropie. Important car l'identifiant d'une commande sert de jeton d'accès à sa page de suivi.
- **Limitation de débit** (`src/lib/rate-limit.ts`, en mémoire) : 5 tentatives de connexion par minute et par IP contre la force brute ; 30 commandes par minute et par IP, volontairement large car tous les clients du wifi d'une salle partagent la même adresse — un coup de feu doit passer, seul l'abus automatisé est arrêté.
- Pas encore de réinitialisation de mot de passe, de vérification d'email, ni de comptes multiples par restaurant (un seul propriétaire) — à ajouter si le besoin se présente.

## Données

Schéma relationnel Postgres, chaque table rattachée à `restaurant_id` : `restaurants`, `restaurant_owners`, `categories`, `menu_items`, `restaurant_tables`, `orders`. Créé automatiquement au premier démarrage (`src/lib/db.ts`).

**Obtenir une base gratuite (recommandé : [Neon](https://neon.tech))** :
1. Créez un compte (connexion GitHub possible) et un projet.
2. Copiez la chaîne de connexion fournie dans `DATABASE_URL` (`.env.local` en local, variable d'environnement du service en production — sur Render : *Settings → Environment*).

Toute base Postgres standard fonctionne (Render Postgres, Supabase, un VPS avec Postgres installé...).

La numérotation des commandes (n° 001, 002...) est propre à chaque restaurant et protégée par un verrou consultatif (`pg_advisory_xact_lock`) scopé à son `restaurant_id` : deux commandes du même restaurant ne reçoivent jamais le même numéro, sans bloquer les autres restaurants entre eux. Les données survivent aux redéploiements, contrairement à un stockage sur fichier local.

## Structure

```
src/
  app/
    page.tsx              page d'accueil (marketing, inscription/connexion)
    signup/, login/        inscription et connexion
    r/[slug]/
      table/[id]/, menu/   menu client via QR code ou sans table
      commande/[id]/       suivi de commande
      admin/                cuisine, menu, tables (protégé, scopé par session)
    api/
      auth/                signup, login, logout
      r/[slug]/orders/     commandes publiques (passer, suivre) — scopées par slug
      admin/                menu, catégories, tables, QR, statuts — scopées par session
  components/              OrderBoard, OrderTracker, KitchenBoard, MenuManager, TablesManager,
                           SignupForm, LoginForm, LogoutButton
  lib/
    db.ts                  client Postgres + schéma
    repo.ts                toutes les requêtes métier (scopées par restaurant_id)
    auth.ts, password.ts, session.ts   comptes, hachage, cookies de session
    seed.ts                menu de démarrage pour un nouveau restaurant
    base-url.ts, types.ts, format.ts, client.ts, slug.ts
  proxy.ts                 vérifie la session sur /r/[slug]/admin/* et /api/admin/*
```

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
```
