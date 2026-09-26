```text
 ___   ____  ________    ______   ________
|   | /   / |   __   |  |   ___| |   __   |
|   |/   /  |  |__|  |  |  |___  |  |__|  |
|   /   /   |   __   |  |___   | |   __   |
|   \   \   |  |  |  |      |  | |  |  |  |
|   |\   \  |  |  |  |   ___|  | |  |  |  |
|___| \___\ |__|  |__|  |______| |__|  |__|  BY SEB !
   
```


# Frontend — Kasa

Application frontend développée avec **Next.js**, **React** et **TypeScript**.

## 🚀 Technologies

* [Next.js](https://nextjs.org/)
* [React](https://react.dev/)
* TypeScript
* CSS Modules
* ESLint
* Zod
* Zustand
* Tailwind

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

* Node.js `>= 20`
* npm ou yarn ou pnpm

Vérifier les versions :

```bash
node -v
npm -v
```

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

## 🏃 Lancer le projet

### Développement

```bash
npm run dev
```

L'application sera disponible sur :

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

## 🧹 Lint

Vérifier les erreurs ESLint :

```bash
npm run lint
```

## 📁 Architecture

```text
src/
├── app/
│   ├── ├── a-propos
│   │   ├── ajouter-une-propriete
│   │   ├── connexion
│   │   ├── inscription
│   │   ├── mes-favoris
│   │   ├── messagerie
│   │   ├── connexion
│   │   ├── logement/
│   │   │   └── [id]/
│   │   └── not-found.tsx
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── not-found.tsx
│
├── components/
│   └── ...
│
├── context/
│   └── authContext
│   └── favoritesContext
│
└── utils/
    ├── api.ts
    ├── formatDate.ts
    ├── formatHour.ts
    ├── formatUrl.ts
    ├── postRequest.ts
    ├── getRequest.ts
    ├── deleteRequest.ts
    ├── patchRequest.ts
    ├── portFileRequest.ts


    
```

### `app/`

Contient les différentes routes de l'application et les layouts Next.js.

### `components/`

Contient les composants React réutilisables.

### `context/`

Contient les Context Providers utilisés pour partager des données ou de l'état dans l'application, et en l'occurrence un provider pour l'utilisateur connecté et un autre pour les favoris

### `utils/`

Contient les fonctions utilitaires, notamment les fonctions permettant de communiquer avec l'API.

## 🧭 Navigation

L'application utilise l'**App Router** de Next.js.

Principales routes :

| Route                     | Description                         |
| ------------------------- | ----------------------------------- |
| `/`                       | Page d'accueil                      |
| `/enregistrement`         | Création d'un compte utilisateur    |
| `/connexion`              | Connexion à l'application           |
| `/a-propos`               | A propos de l'application           |
| `/logement/[id]`          | Détail d'un logement                |
| `/messagerie`             | Liste des conversations et messages |
| `/ajouter-une-propriété`  | Ajout d'un logement sur le site     |



## ❌ Gestion des pages inexistantes

Deux niveaux de `not-found.tsx` sont utilisés dans l'application :

```text
src/app/not-found.tsx
src/app/logements/not-found.tsx
```

La page `not-found.tsx` globale gère les pages inexistantes au niveau général.
La page `not-found.tsx` du groupe `logement` permet de gérer les erreurs liées à l'identification d'un logement

## 🔌 Communication avec l'API

Les appels à l'API sont centralisés dans le dossier :

```text
src/utils/
```

Fonctions disponibles :

```text
getRequest.ts
postRequest.ts
postFileRequest.ts
putRequest.ts
deleteRequest.ts
```

Cela permet d'éviter de dupliquer la logique de communication avec le backend dans les différents composants mais aussi de garder de la lisibilité sur le rôle de la requête.

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

Les styles spécifiques aux composants/pages utilisent de préférence les **CSS Modules** :

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

### Nommage

* Composants : `PascalCase`
* Fonctions : `camelCase`
* Variables : `camelCase`
* Fichiers de composants : `PascalCase.tsx`
* Fichiers utilitaires : `camelCase.ts`
* CSS Modules : `*.module.css`

## 👥 Équipe

Projet développé par :

* Sébastien VIOLANTE

dans le cadre du projet 12 de la formation Concepteur d'application React d'OpenClassrooms
