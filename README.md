# KuakuMarket — Storefront Next.js

Vitrine (accueil, catalogue, fiche produit, panier, compte) branchée sur
le backend Medusa (`backuak/apps/backend`), avec le design validé et des
animations partout où c'était demandé : transitions, hover, bannière
défilante, carrousel, glassmorphisme.

## Où est le glassmorphisme

Plusieurs endroits volontairement choisis plutôt que dilué partout (voir
la note dans `globals.css`) :
- Le header en `sticky`, qui devient flou/translucide (`.glass`) dès qu'on
  scrolle
- Les cartes produit (`glass-teal`) et les lignes du panier
- Le voile qui apparaît sur une carte produit au survol
- Les boutons flèche du carrousel et la carte du formulaire compte

## Où sont les autres animations

- **Bannière défilante** : `components/ScrollingBanner.tsx`, boucle CSS
  infinie, pause au survol
- **Carrousel** : `components/Carousel.tsx` (Embla + autoplay + flèches),
  utilisé pour le héros (6 slides), la ligne "meilleures ventes" et le
  bloc promotions (plusieurs promos, pas une seule bannière fixe)
- **Hover** : cartes produit (zoom image + léger soulèvement), pastilles
  de zone, boutons, liens de nav (soulignement animé) — en bleu (teal)
  pour équilibrer le rose dominant, voir la note dans `globals.css`
- **Transitions d'apparition** : sections qui apparaissent au scroll
  (`whileInView`), échelonnées plutôt que toutes en même temps
- **Onglets fiche produit** : soulignement qui glisse d'un onglet à
  l'autre (`layoutId` Framer Motion)

## Pages disponibles

| Route | Contenu |
|---|---|
| `/` | Accueil |
| `/catalogue` | Catalogue filtrable (catégorie via l'URL) |
| `/produit/[handle]` | Fiche produit |
| `/panier` | Panier réel (Medusa), quantités modifiables, suppression |
| `/compte` | Connexion / inscription (compte obligatoire pour commander) |
| `/commande` | Stub temporaire — le vrai tunnel de commande est l'Étape 2 |

## Installation

1. Depuis ce dossier :
   ```bash
   npm install
   ```
2. Copier `.env.local.example` en `.env.local`, puis remplir
   `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` : dans le dashboard admin, **Settings
   → Developer → Publishable API Keys → Create**, copier la clé générée.
   Attacher aussi cette clé à votre "Sales Channel" par défaut si demandé.
3. **Copier la route store manquante** (si ce n'est pas déjà fait) :
   `backend-addition/src/api/store/products/[id]/beauty-attributes/route.ts`
   vers `backuak/apps/backend/src/api/store/products/[id]/beauty-attributes/route.ts`.
   Sans ce fichier, la fiche produit fonctionne mais n'affiche pas les
   attributs beauté (zone, moment, mode).
4. Redémarrer le backend (`npx medusa develop` depuis `apps/backend`) pour
   que la nouvelle route store soit prise en compte.
5. Lancer le storefront :
   ```bash
   npm run dev
   ```
   Ouvrir `http://localhost:3000` (le backend doit tourner en parallèle
   sur le port 9000).

## Ce qui est branché sur de vraies données Medusa

- **Accueil** : "meilleures ventes" = les 8 premiers produits du catalogue
  (à affiner plus tard avec un vrai critère de popularité)
- **Catalogue** : liste réelle, filtrée par catégorie via l'URL
  (`?categorie=Visage`), pagination par "Voir plus"
- **Fiche produit** : données natives + attributs beauté via la route
  store custom
- **Panier** : panier Medusa réel — création, ajout, modification de
  quantité, suppression d'article
- **Compte** : inscription et connexion réelles (`sdk.auth.register`,
  `sdk.auth.login`, `sdk.store.customer.create`)

## Ce qui n'est PAS encore branché (attendu, voir la spec technique)

- **Filtres marque / type de peau / moment d'utilisation** sur le
  catalogue : affichés visuellement mais pas encore connectés à une
  vraie requête — dépendent des attributs beauté, prévu avec Meilisearch
  à l'Étape 3.
- **Tunnel de commande** (`/commande`) : page stub uniquement pour
  l'instant. Informations client → livraison → paiement → confirmation,
  c'est le périmètre de l'Étape 2.
- **Pages À propos et Contact** : liées dans le header/footer mais pas
  encore construites.

## Points à vérifier une fois lancé

- Si les images ne s'affichent pas : vérifier que `next.config.js`
  autorise bien le domaine où sont hébergées vos images.
- Si le catalogue reste vide : vérifier qu'au moins un produit est
  "Published" et rattaché au "Default Sales Channel".
- Le `formatFCFA` suppose que Medusa stocke les prix en centimes. Si les
  prix affichés semblent 100× trop élevés ou trop bas, ajuster
  `lib/format.ts`.
- `npm run build` doit passer sans erreur avant toute mise en ligne —
  `next dev` est plus permissif et peut cacher des erreurs (comme celle
  du Suspense corrigée dans cette version) qui ne se révèlent qu'au build
  de production.
