# Pantheon Capital Management

Application de gestion de projets, tâches, notes et OKR construite avec React, TypeScript, Vite, Tailwind CSS et Supabase.

## Développement local

Prérequis : Node.js 18 ou supérieur et un projet Supabase.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Renseignez ces deux variables dans `.env.local` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-ou-publishable
```

La clé `anon`/`publishable` est conçue pour être utilisée dans le navigateur avec RLS. Ne placez jamais une clé `service_role` dans une variable `VITE_*`.

## Activer l’authentification Supabase

Le plan gratuit Supabase suffit pour cette version. Le modèle actuel crée un espace privé par compte : un utilisateur ne peut lire ou modifier que ses propres lignes.

### 1. Créer le premier compte

Dans Supabase :

1. Ouvrez **Authentication > Providers > Email** et laissez le fournisseur Email activé.
2. Ouvrez **Authentication > Users > Add user**.
3. Créez le premier compte et copiez son UUID.

L’inscription reste ouverte dans l’application pour les comptes suivants. En production, gardez la confirmation d’email activée.

### 2. Sécuriser les tables

Dans **SQL Editor**, exécutez le fichier [`supabase-auth-migration.sql`](./supabase-auth-migration.sql). Il :

- ajoute `owner_id` à `team`, `tasks`, `projects`, `okrs` et `notes` ;
- retire les anciennes politiques publiques ;
- active des politiques RLS privées pour les utilisateurs authentifiés ;
- ajoute les index nécessaires.

Les anciennes données deviennent temporairement invisibles, mais ne sont pas supprimées.

### 3. Rattacher les données existantes

Exécutez [`supabase-claim-existing-data.sql`](./supabase-claim-existing-data.sql) dans **SQL Editor**. S’il n’existe qu’un utilisateur, le script le détecte automatiquement. S’il en existe plusieurs, renseignez son UUID dans :

```sql
target_user_id UUID := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

Le script rattache seulement les lignes sans propriétaire et rend `owner_id` obligatoire.

### 4. Configurer les redirections

Dans **Authentication > URL Configuration** :

- **Site URL** : l’URL Vercel de production ;
- **Redirect URLs** : `http://localhost:5173/auth`, `http://localhost:5173/auth/reset`, puis les deux URLs équivalentes sur Vercel.

Ces URLs sont utilisées pour la confirmation d’email et la réinitialisation du mot de passe.

## Déploiement Vercel

Ajoutez dans **Vercel > Project Settings > Environment Variables** :

| Variable | Environnements |
|---|---|
| `VITE_SUPABASE_URL` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development |

Puis déployez :

```powershell
vercel --prod
```

Le fichier `vercel.json` redirige les routes React vers `index.html`, y compris `/auth` et `/auth/reset`.

## Scripts

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

## Structure utile

```text
src/
├── components/        contrôles partagés et composants shadcn/ui
├── contexts/          module d’authentification
├── lib/               client Supabase et types
├── pages/             écrans de l’application
└── services/          accès aux tables Supabase
```
