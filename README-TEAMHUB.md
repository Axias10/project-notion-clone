# TeamHub - Gestion d'Équipe

Application de gestion d'équipe moderne construite avec React, TypeScript, Vite et Supabase.

## 🚀 Fonctionnalités

- **Dashboard** : Vue d'ensemble des projets, tâches et performance de l'équipe
- **Gestion des Tâches** : Système Kanban pour organiser et suivre les tâches
- **Projets** : Suivi de la progression des projets
- **OKRs** : Gestion des objectifs et résultats clés
- **Équipe** : Gestion des membres de l'équipe
- **Notifications** : Alertes en temps réel pour les tâches urgentes et deadlines

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, TypeScript, Vite
- **UI** : Tailwind CSS, shadcn/ui, Radix UI
- **Backend** : Supabase (PostgreSQL)
- **Routing** : React Router v6
- **State Management** : React Query (TanStack Query)

## 📦 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone <votre-repo>
   cd project-notion-clone
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir l'application**
   - L'application sera accessible à : http://localhost:8080

## 🗄️ Configuration Supabase

L'application est configurée pour se connecter à Supabase. Les credentials sont dans `src/lib/supabase.ts`.

### Tables Supabase requises

1. **tasks**
   ```sql
   CREATE TABLE tasks (
     id BIGINT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
     status TEXT CHECK (status IN ('todo', 'in-progress', 'done')),
     assignee TEXT,
     due_date DATE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **projects**
   ```sql
   CREATE TABLE projects (
     id BIGINT PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     status TEXT CHECK (status IN ('planning', 'active', 'completed')),
     progress INT DEFAULT 0,
     deadline DATE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **team**
   ```sql
   CREATE TABLE team (
     id BIGINT PRIMARY KEY,
     name TEXT NOT NULL,
     role TEXT NOT NULL,
     email TEXT,
     avatar TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **okrs**
   ```sql
   CREATE TABLE okrs (
     id BIGINT PRIMARY KEY,
     objective TEXT NOT NULL,
     key_results JSONB,
     status TEXT CHECK (status IN ('on-track', 'at-risk', 'off-track')),
     quarter TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

## 📂 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI (shadcn)
│   ├── AppSidebar.tsx  # Barre latérale de navigation
│   └── theme-provider.tsx
├── lib/
│   ├── supabase.ts     # Configuration Supabase et types
│   └── utils.ts
├── pages/              # Pages de l'application
│   ├── Dashboard.tsx   # Page d'accueil / dashboard
│   ├── Tasks.tsx       # Gestion des tâches
│   └── ...
├── services/           # Services pour l'API Supabase
│   ├── taskService.ts
│   ├── projectService.ts
│   ├── teamService.ts
│   ├── okrService.ts
│   └── notificationService.ts
├── App.tsx            # Composant principal
└── main.tsx           # Point d'entrée
```

## 🎨 Thème et Design

L'application utilise un **thème dark moderne** inspiré de GitHub et Linear, avec :
- Palette de couleurs sombre élégante
- Animations fluides et transitions
- Design responsive
- Composants UI modernes avec shadcn/ui

## 📝 Scripts Disponibles

```bash
# Démarrer en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build de production
npm run preview

# Linter
npm run lint
```

## 🔒 Sécurité

**Important** : Les clés Supabase actuelles dans le code sont des clés publiques (anon key). Pour la production, assurez-vous de :
- Utiliser des variables d'environnement (`.env`)
- Activer Row Level Security (RLS) sur Supabase
- Configurer les politiques d'accès appropriées

### Configuration avec variables d'environnement

Créez un fichier `.env` :
```env
VITE_SUPABASE_URL=votre_url
VITE_SUPABASE_ANON_KEY=votre_clé
```

Et modifiez `src/lib/supabase.ts` :
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 🚧 Prochaines Fonctionnalités

- [ ] Pages Projets, OKRs, Équipe complètes
- [ ] Authentification utilisateur
- [ ] Upload d'avatars
- [ ] Filtres avancés et recherche
- [ ] Export de données (CSV, PDF)
- [ ] Mode collaboratif en temps réel
- [ ] Intégrations (Slack, GitHub, etc.)

## 📄 Licence

MIT

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Propulsé par Supabase** ☁️
