# Frontend — Kasa

Application frontend de location de logements développée avec **Next.js**, **React** et **TypeScript**.

Le projet permet notamment de consulter des logements, de gérer des favoris, de créer un compte, de publier un logement et d'échanger avec d'autres utilisateurs via une messagerie.

---

## 🚀 Technologies

* [Next.js](https://nextjs.org/) 16
* [React](https://react.dev/) 19
* TypeScript
* CSS Modules
* Tailwind CSS
* Zod
* Zustand
* Jest
* React Testing Library
* ESLint

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

* Node.js `>= 20`
* npm, yarn ou pnpm

Vérifier les versions installées :

```bash
node -v
npm -v
```

---

## ⚙️ Installation

Cloner le repository :

```bash
git clone <URL_DU_REPOSITORY>
cd <NOM_DU_PROJET>
```

Installer les dépendances :

```bash
npm install
```

---

## 🔐 Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

`NEXT_PUBLIC_API_URL` correspond à l'URL de base de l'API backend utilisée par l'application.

---

## 🏃 Lancer le projet

### Développement

```bash
npm run dev
```

L'application sera disponible à l'adresse :

```text
http://localhost:3000
```

### Production

Construire l'application :

```bash
npm run build
```

Lancer l'application :

```bash
npm run start
```

---

## 🧹 Lint

Vérifier les erreurs ESLint :

```bash
npm run lint
```

---

## 📁 Architecture

L'application utilise l'**App Router de Next.js**.

```text
src/
└── app/
    ├── ajouter-une-propriete/
    │   ├── page.tsx
    │   ├── page.module.css
    │   └── page.test.tsx
    │
    ├── a-propos/
    │   ├── page.tsx
    │   └── page.module.css
    │
    ├── connexion/
    │   ├── page.tsx
    │   ├── page.module.css
    │   └── page.test.tsx
    │
    ├── inscription/
    │   ├── page.tsx
    │   ├── page.module.css
    │   └── page.test.tsx
    │
    ├── logement/
    │   └── [id]/
    │       ├── page.tsx
    │       ├── PropertyContent.tsx
    │       ├── page.module.css
    │       ├── not-found.tsx
    │       └── not-found.module.css
    │
    ├── mes-favoris/
    │   ├── page.tsx
    │   └── page.module.css
    │
    ├── messagerie/
    │   ├── page.tsx
    │   ├── Messagerie.tsx
    │   └── page.module.css
    │
    ├── components/
    │   ├── ConversationTile/
    │   ├── FlashMessage/
    │   ├── Footer/
    │   ├── Header/
    │   ├── JsonLd/
    │   ├── Loader/
    │   ├── MessageTile/
    │   ├── PropertyCard/
    │   ├── Tag/
    │   └── Tile/
    │
    ├── context/
    │   ├── AuthContext.tsx
    │   └── FavoritesContext.tsx
    │
    ├── data/
    │   └── equipments.ts
    │
    ├── mock/
    │   └── favorites-mock.json
    │
    ├── store/
    │   └── messageStore.ts
    │
    ├── types/
    │   ├── schemas/
    │   │   ├── authSchema.ts
    │   │   ├── newPropertySchema.ts
    │   │   └── registerSchema.ts
    │   └── types.ts
    │
    ├── utils/
    │   ├── api.ts
    │   ├── deleteRequest.ts
    │   ├── formatDate.ts
    │   ├── formatHour.ts
    │   ├── formatUrl.ts
    │   ├── getFocusableElements.ts
    │   ├── getPictureUrls.ts
    │   ├── getRequest.ts
    │   ├── patchRequest.ts
    │   ├── postFileRequest.ts
    │   └── postRequest.ts
    │
    ├── globals.css
    ├── layout.tsx
    ├── page.tsx
    ├── HomeContent.tsx
    ├── not-found.tsx
    ├── not-found.module.css
    ├── robots.ts
    └── sitemap.ts
```

### `app/`

Contient les différentes routes de l'application ainsi que les fonctionnalités propres à Next.js.

### `components/`

Contient les composants React réutilisables de l'application : cartes de logements, en-tête, pied de page, messages, tags, loaders, etc.

### `context/`

Contient les Context Providers React utilisés pour partager certains états dans l'application.

* `AuthContext` : gestion de l'utilisateur connecté et de l'authentification.
* `FavoritesContext` : gestion des logements ajoutés aux favoris.

### `data/`

Contient les données statiques utilisées par l'application, notamment la liste des équipements disponibles.

### `mock/`

Contient les données mock utilisées par l'application.

### `store/`

Contient les stores Zustand utilisés pour gérer certains états applicatifs, notamment la messagerie.

### `types/`

Contient les types TypeScript ainsi que les schémas de validation Zod utilisés par les formulaires.

### `utils/`

Contient les fonctions utilitaires et les fonctions permettant de communiquer avec l'API backend.

---

## 🧭 Navigation

Principales routes de l'application :

| Route                    | Description                         |
| ------------------------ | ----------------------------------- |
| `/`                      | Page d'accueil                      |
| `/inscription`           | Création d'un compte utilisateur    |
| `/connexion`             | Connexion à l'application           |
| `/a-propos`              | Présentation de l'application       |
| `/logement/[id]`         | Détail d'un logement                |
| `/mes-favoris`           | Liste des logements favoris         |
| `/messagerie`            | Liste des conversations et messages |
| `/ajouter-une-propriete` | Création d'un logement              |

---

## 🔐 Authentification

L'authentification repose sur un token stocké dans un cookie et géré côté frontend par `AuthContext`.

Le contexte permet notamment de :

* récupérer les informations de l'utilisateur connecté ;
* gérer la connexion ;
* gérer la déconnexion ;
* partager l'état d'authentification avec les composants nécessitant ces informations.

Certaines fonctionnalités sont réservées aux utilisateurs connectés, notamment :

* l'ajout d'un logement ;
* la gestion des favoris ;
* la messagerie.

---

## ❤️ Gestion des favoris

Les logements favoris sont gérés via `FavoritesContext`.

Le contexte permet notamment :

* de récupérer les logements favoris de l'utilisateur ;
* d'ajouter un logement aux favoris ;
* de retirer un logement des favoris ;
* de partager l'état des favoris entre les différents composants.

Les cartes de logements permettent de modifier directement l'état d'un favori.

---

## 💬 Messagerie

L'application propose une messagerie permettant aux utilisateurs d'échanger autour des logements.

Elle permet notamment :

* d'afficher les conversations ;
* d'afficher les messages d'une conversation ;
* d'envoyer de nouveaux messages ;
* d'identifier les messages lus et non lus ;
* d'associer une conversation à un logement.

La gestion d'une partie de l'état de la messagerie est réalisée avec **Zustand**.

---

## 🏠 Gestion des logements

Les utilisateurs peuvent consulter les logements et, lorsqu'ils disposent des droits nécessaires, en créer de nouveaux.

Un logement peut notamment contenir :

* un titre ;
* une description ;
* une localisation ;
* un prix par nuit ;
* une photo de couverture ;
* plusieurs photos ;
* des équipements ;
* des tags ;
* les informations de son propriétaire.

La création d'un logement utilise des formulaires validés avec **Zod**.

---

## 🖼️ Gestion des images

Les fichiers sont envoyés au backend via des requêtes `multipart/form-data`.

La logique d'envoi des fichiers est centralisée dans les utilitaires :

```text
src/app/utils/postFileRequest.ts
src/app/utils/getPictureUrls.ts
```

Cette organisation permet de séparer la gestion des fichiers de la logique métier des composants.

---

## 🔌 Communication avec l'API

Les communications avec le backend sont centralisées dans :

```text
src/app/utils/
```

Les fonctions disponibles permettent notamment d'effectuer :

* des requêtes `GET` ;
* des requêtes `POST` ;
* des requêtes `PATCH` ;
* des requêtes `DELETE` ;
* l'envoi de fichiers via `multipart/form-data`.

Les fonctions `getRequest`, `postRequest`, `patchRequest`, `deleteRequest` et `postFileRequest` permettent de centraliser la logique commune aux appels API et d'éviter sa duplication dans les composants.

L'URL de base de l'API est définie par la variable d'environnement `NEXT_PUBLIC_API_URL`.

---

## ✅ Validation des formulaires

Les données saisies dans les formulaires sont validées avec **Zod**.

Les schémas sont regroupés dans :

```text
src/app/types/schemas/
```

Ils permettent notamment de valider :

* les données de connexion ;
* les données d'inscription ;
* les données nécessaires à la création d'un logement.

---

## ♿ Accessibilité

Une attention particulière est portée à l'accessibilité de l'interface.

Le projet intègre notamment :

* la navigation au clavier ;
* la gestion du focus ;
* des attributs ARIA pour les éléments interactifs ;
* la gestion des états `aria-expanded` et `aria-pressed` ;
* des annonces accessibles pour les messages de statut et d'erreur ;
* des textes alternatifs pour les images.

---

## 🔎 SEO

Le projet intègre plusieurs fonctionnalités dédiées au référencement :

* génération du sitemap via `sitemap.ts` ;
* génération du fichier `robots.txt` via `robots.ts` ;
* génération de métadonnées avec les fonctionnalités de Next.js ;
* données structurées JSON-LD pour certaines pages.

---

## ❌ Gestion des pages inexistantes

Deux niveaux de gestion des pages inexistantes sont utilisés.

### Page globale

```text
src/app/not-found.tsx
```

Cette page gère les routes ou ressources inexistantes au niveau général de l'application.

### Page d'un logement inexistant

```text
src/app/logement/[id]/not-found.tsx
```

Cette page est utilisée lorsqu'un logement demandé n'existe pas.

---

## 🧪 Tests

Les tests sont réalisés avec **Jest** et **React Testing Library**.

Ils couvrent notamment :

* la connexion ;
* l'inscription ;
* l'ajout d'un logement ;
* la gestion des favoris.

Les tests sont répartis directement dans les dossiers des fonctionnalités concernées.

### Commandes disponibles

Lancer les tests :

```bash
npm run test
```

Lancer les tests en mode watch :

```bash
npm run test:watch
```

Générer un rapport de couverture :

```bash
npm run test:coverage
```

Exécuter les tests en mode CI :

```bash
npm run test:ci
```

---

## 🧩 Conventions

### Composants

Les composants React sont écrits en **TypeScript** et utilisent des fichiers `.tsx`.

```tsx
export default function MyComponent() {
  return (
    <div>
      ...
    </div>
  );
}
```

### Styles

Les styles spécifiques aux composants et aux pages utilisent principalement les **CSS Modules**.

```text
page.tsx
page.module.css
```

Puis :

```tsx
import styles from "./page.module.css";

export default function Page() {
  return <div className={styles.container}>...</div>;
}
```

Tailwind CSS est également utilisé ponctuellement lorsque cela est pertinent.

### Nommage

* Composants : `PascalCase`
* Fonctions : `camelCase`
* Variables : `camelCase`
* Fichiers de composants : `PascalCase.tsx`
* Fichiers utilitaires : `camelCase.ts`
* CSS Modules : `*.module.css`

---

## 🏗️ Organisation du code

L'organisation du frontend repose sur une séparation des responsabilités :

* `app/` gère les routes et les pages avec l'App Router de Next.js ;
* `components/` regroupe les composants réutilisables ;
* `context/` centralise certains états partagés ;
* `store/` gère les états utilisant Zustand ;
* `types/` centralise les types et les schémas de validation ;
* `utils/` regroupe les fonctions utilitaires et les appels API ;
* `data/` contient les données statiques ;
* `mock/` contient les données mock.

Cette organisation permet de limiter la duplication de code et de séparer les différentes responsabilités de l'application.

---

## 👥 Équipe

Projet développé par :

**Sébastien VIOLANTE**

Projet réalisé dans le cadre du **Projet 12 de la formation Concepteur d'application React d'OpenClassrooms**.
