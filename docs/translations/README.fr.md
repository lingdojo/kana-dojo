<div id="top"></div>

<a href="#about-kanadojo">À propos de KanaDojo</a> | <a href="#screenshots">Captures d'écran</a> | <a href="#ui-design-philosophy">Philosophie UI &amp; Design</a> | <a href="#tech-stack">Stack Technique</a> | <a href="#getting-started">Démarrage</a> | <a href="#project-structure">Structure du Project</a> | <a href="#contributing">Contribuer</a> | <a href="#license">Licence</a> | <a href="#acknowledgments">Remerciements</a> | <a href="#contact-links">Contact &amp; Lines</a>

# KanaDojo かな道場

<div align="center">

![KanaDojo Banner](https://github.com/user-attachments/assets/b7931764-be5e-43c7-b1b3-9d2568b2fecf)

**Une plateforme esthétique, minimaliste et hautement personnalisable pour maîtriser le japonais**

[![Live Demo](https://img.shields.io/badge/demo-kanadojo.com-blue?style=for-the-badge)](https://kanadojo.com)
[![License](https://img.shields.io/badge/license-AGPL--v3-blue)](LICENSE.md)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</div>

<a id="about-kanadojo"></a>

## 📖 À propos de KanaDojo

KanaDojo est une plateforme web d'apprentissage du japonais qui rend l'apprentissage des Hiragana, Katakana, Kanji et du vocabulaire amusant et intuitif. Construit avec un accent sur l'esthétique, la personnalisation et l'apprentissage efficace, KanaDojo offre un environment d'entraînement immersif pour les apprenants de la langue japonaise de tous niveaux.

Que vous commenciez avec les syllabaires kana de base ou que vous vous prépariez aux examens JLPT avec des kanji et du vocabulaire avancés, KanaDojo offre une expérience d'apprentissage rationalisée et sans distraction qui s'adapte à vos préférences et à votre style d'apprentissage.

### ✨ Caractéristiques Principales

#### 🎯 **Trois Dojos d'Entraînement**

- **Dojo Kana** - Maîtrisez les syllabaires Hiragana et Katakana avec les groupes de sons de base, dakuon, yoon et étrangers
- **Dojo Kanji** - Apprenez les caractères kanji essentiels organisés par niveaux JLPT (N5, N4, N3, N2)
- **Dojo Vocabulaire** - Développez votre vocabulaire japonais avec des collections de mots organisées par niveau de compétence

#### 🎮 **Quatre Modes de Jeu Dynamiques**

Chaque dojo propose quatre modes d'entraînement engageants pour renforcer l'apprentissage :

1. **Choix** - Choix multiple : Sélectionnez la bonne romanisation/traduction pour le caractère affiché
2. **Choix Inverse** - Choix multiple inversé : Sélectionnez le bon caractère pour la romanisation/traduction donnée
3. **Saisie** - Saisie de texte : Tapez la bonne romanisation/traduction
4. **Saisie Inverse** - Saisie de texte inversée : Tapez le bon caractère

#### 🎨 **Personnalisation Extensive**

- **100+ Thèmes** - Choisissez parmi une vaste collection de beaux thèmes clairs et sombres, ou utilisez la function de thème aléatoire
- **28 Polices Japonaises** - Sélectionnez parmi une variété de polices japonaises authentiques selon vos préférences esthétiques
- **Effets Sonores** - Profitez de sons de retour d'interface satisfaisants qui peuvent être activés/désactivés
- **Options d'Affichage** - Basculez entre les affichages Romaji/Anglais et Kana/Kanji dans les menus de sélection
- **Raccourcis** - Raccourcis clavier pour un entraînement efficace (peuvent être désactivés)

#### 📊 **Suivi des Progrès**

- Retour en temps réel avec compteurs correct/incorrect
- Suivi des séries pour maintenir la motivation
- Statistiques pour suivre votre progression

#### 🌐 **Expérience Web Moderne**

- Design totalement responsive qui fonctionne sur ordinateur, tablette et mobile
- Aucune installation requise - entraînez-vous n'importe où avec une connection internet
- Interface propre et minimaliste qui vous garde concentré sur l'apprentissage
- Animations et transitions fluides propulsées par Framer Motion

<a id="screenshots"></a>

## 🖼️ Captures d'écran

<div align="center">

### Page d'Accueil

![Accueil](https://github.com/user-attachments/assets/8a912762-f5f3-4520-a75c-d145cac0da62)

### Sélection de Kana

![Sélection de Kana](https://github.com/user-attachments/assets/294e2913-6909-4a84-8311-f934120247f2)

### Mode Entraînement

![Entraînement](https://github.com/user-attachments/assets/053020ef-77c7-492b-b8db-c381d1ec7db8)

### Personnalisation & Thèmes

![Préférences](https://github.com/user-attachments/assets/f664a280-0344-4ff9-8639-83f9c1c4223b)

</div>

<a id="ui-design-philosophy"></a>

## 🎨 Philosophie UI & Design

KanaDojo adopte une **esthétique minimaliste** combinée à une **flexibilité maximale**. La philosophie de design se centre sur :

### Le Minimalisme Avant Tout

- Interfaces épurées avec des distractions minimales
- Focus sur le contenu d'apprentissage
- Navigation intuitive et hiérarchie claire de l'information
- Utilisation réfléchie des escapes blancs

### Personnalisation Esthétique

- Bibliothèque de thèmes extensive (100+ options) allant des pastels doux aux néons vibrants
- Support des modes clair et sombre
- Palettes de couleurs soigneusement sélectionnées pour le comfort visuel pendant les longues sessions d'étude
- Transitions de thèmes fluides

### Expérience Utilisateur

- Animations fluides et micro-interactions pour un retour agréable
- Design responsive qui s'adapte magnifiquement à toutes les tailles d'écran
- Retour audio pour les interactions (optionnel)
- Language visuel cohérent dans toutes les sections

### Typographie Japonaise

- 28 polices japonaises authentiques couvrant différents styles
- Rendu approprié des caractères kanji complexes
- Distinction claire entre les caractères similaires
- Aperçus des polices avec des examples de texte japonais réels

<a id="tech-stack"></a>

## 🛠️ Stack Technique

KanaDojo est construit avec des technologies web modernes pour une performance et une expérience développeur optimales :

### Framework Principal

- **[Next.js 15](https://nextjs.org/)** - Framework React avec App Router pour le rendu côté serveur et une performance optimale
- **[React 19](https://react.dev/)** - Dernière version de React avec fonctionnalités concurrentes
- **[TypeScript](https://www.typescriptlang.org/)** - Développement sécurisé avec typage

### Style & UI

- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[shadcn/ui](https://ui.shadcn.com/)** - Bibliothèque de composants accessible et de haute qualité
- **[Framer Motion](https://www.framer.com/motion/)** - Animations et transitions fluides
- **[Lucide React](https://lucide.dev/)** - Bibliothèque d'icônes belle et cohérente
- **[FontAwesome](https://fontawesome.com/)** - Support d'icônes supplémentaire

### Gestion d'État

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gestion d'état légère avec un minimum de code
- **Zustand Persist** - Persistence dans le stockage local pour les préférences utilisateur

### Utilitaires & Fonctionnalités

- **[use-sound](https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/)** - Système de retour audio
- **[canvas-confetti](https://www.npmjs.com/package/canvas-confetti)** - Effets de célébration
- **[react-timer-hook](https://www.npmjs.com/package/react-timer-hook)** - Fonctionnalité de minuterie
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - Rendu Markdown pour le contenu éducatif
- **[random-js](https://www.npmjs.com/package/random-js)** - Génération de nombres aléatoires cryptographiquement sûre
- **[clsx](https://www.npmjs.com/package/clsx) + [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)** - Utilitaires de style conditionnel

### Outils de Développement

- **[ESLint](https://eslint.org/)** - Linting de code
- **[next-sitemap](https://www.npmjs.com/package/next-sitemap)** - Génération automatique de sitemap

### Analytics & Performance

- **[@vercel/analytics](https://vercel.com/analytics)** - Analytics web
- **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** - Monitoring de performance

<a id="getting-started"></a>

## 🚀 Démarrage

### Prérequis

- **Node.js** 18.x ou supérieur
- **npm** 10.x ou supérieur (inclus avec Node.js)

### Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/lingdojo/kanadojo.git
   cd kanadojo
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**

   ```bash
   npm run dev
   ```

4. **Ouvrir votre navigateur**
   Naviguez vers [http://localhost:3000](http://localhost:3000)

### Build pour la Production

---

```bash
# Créer un build optimisé pour la production
npm run build

# Démarrer le serveur de production
npm start
```

### Autres Commandes

```bash
# Lancer ESLint
npm run lint

# Générer le sitemap (s'exécute automatiquement après le build)
npm run postbuild
```

### Dépannage

Si vous rencontrez des problèmes pendant le développement, essayez ces solutions :

#### Vider le Cache Next.js

**macOS/Linux:**

```bash
rm -rf .next
npm run dev
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

**Windows (Command Prompt):**

```cmd
rmdir /s /q .next
npm run dev
```

#### Supprimer Node Modules et Réinstaller

**macOS/Linux:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

**Windows (Command Prompt):**

```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

#### Vider Tous les Caches (Option Nucléaire)

**macOS/Linux:**

```bash
rm -rf .next node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force .next, node_modules, package-lock.json
npm cache clean --force
npm install
npm run dev
```

**Windows (Command Prompt):**

```cmd
rmdir /s /q .next
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
npm run dev
```

#### Port Déjà Utilisé

Si le port 3000 est déjà utilisé :

**macOS/Linux:**

```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000

# Terminer le processus (remplacer PID par l'ID du processus)
kill -9 PID
```

**Windows (PowerShell/Command Prompt):**

```cmd
# Trouver le processus utilisant le port 3000
netstat -ano | findstr :3000

# Terminer le processus (remplacer PID par l'ID du processus)
taskkill /PID PID /F
```

Ou simplement exécuter sur un port différent :

```bash
# macOS/Linux/Windows
PORT=3001 npm run dev
```

<a id="project-structure"></a>

## 📁 Structure du Project

```
kanadojo/
├── app/                        # Pages Next.js App Router
│   ├── kana/                   # Pages du dojo Kana
│   │   └── train/[gameMode]/   # Pages d'entraînement pour chaque mode
│   ├── kanji/                  # Pages du dojo Kanji
│   │   └── train/[gameMode]/
│   ├── vocabulary/             # Pages du dojo Vocabulaire
│   │   └── train/[gameMode]/
│   ├── preferences/            # Page de paramètres et personnalisation
│   ├── academy/                # Contenu éducatif
│   ├── layout.tsx              # Layout racine avec providers
│   └── page.tsx                # Page d'accueil
│
├── components/                 # Composants React
│   ├── Dojo/                   # Composants spécifiques à l'entraînement
│   │   ├── Kana/               # Sélection et cartes Kana
│   │   ├── Kanji/              # Sélection et cartes Kanji
│   │   └── Vocab/              # Sélection et cartes Vocabulaire
│   ├── reusable/               # Composants partagés
│   │   ├── Menu/               # Composants de navigation et menu
│   │   └── ...                 # Autres composants réutilisables
│   ├── Settings/               # Composants de préférences
│   └── ui/                     # Composants shadcn/ui
│
├── lib/                        # Utilitaires et functions helper
│   ├── hooks/                  # Hooks React personnalisés
│   │   ├── useAudio.ts         # Hooks de retour audio
│   │   └── ...
│   ├── interfaces.ts           # Interfaces TypeScript
│   └── utils.ts                # Functions utilitaires
│
├── store/                      # Gestion d'état Zustand
│   ├── useKanaKanjiStore.ts    # État de sélection Kana/Kanji
│   ├── useVocabStore.ts        # État de sélection Vocabulaire
│   ├── useStatsStore.ts        # Statistiques et progression
│   └── useThemeStore.ts        # Thème et préférences
│
├── static/                     # Données et configuration statiques
│   ├── kana.ts                 # Données des caractères Kana
│   ├── kanji/                  # Données Kanji par niveau JLPT
│   ├── vocab/                  # Données de vocabulaire
│   ├── themes.ts               # Définitions des thèmes
│   ├── fonts.ts                # Configurations des polices
│   └── info.tsx                # Contenu informatif
│
├── public/                     # Assets statiques
│   ├── sounds/                 # Fichiers audio
│   └── wallpapers/             # Images de fond
```

### Concepts Clés

---

#### Flux de Gestion d'État

1. L'utilisateur sélectionne du contenu dans les composants menu
2. Les sélections sont stockées dans les stores Zustand (`useKanaKanjiStore`, `useVocabStore`)
3. Les composants d'entraînement lisent les stores pour générer des questions
4. Les statistiques sont suivies et persistées dans `useStatsStore`
5. Les préférences utilisateur sont sauvegardées dans `useThemeStore` avec persistence localStorage

<a id="contributing"></a>

## 🤝 Contribuer

Les contributions sont les bienvenues ! KanaDojo est un project open-source construit par la communauté, pour la communauté. Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour plus d'informations détaillées sur la façon de contribuer.

### Comment Contribuer

1. Forkez le dépôt
2. Créez une branche de fonctionnalité (`git checkout -b feature/SuperFonctionnalité`)
3. Committez vos changements (`git commit -m 'Ajout d'une super fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/SuperFonctionnalité`)
5. Ouvrez une Pull Request

### Lignes Directrices de Développement

- Suivez le style de code et les conventions existants
- Utilisez TypeScript pour la sécurité du typage
- Testez vos changements en profondeur
- Mettez à jour la documentation si nécessaire
- Gardez les composants concentrés et réutilisables

<a id="license"></a>

## 📄 Licence

Ce project est sous licence AGPL 3.0 - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.

<a id="acknowledgments"></a>

## 🙏 Remerciements

- Données de langue japonaise et information sur les caractères
- Communauté open-source pour les outils et bibliothèques incroyables
- Tous les contributeurs qui aident à améliorer KanaDojo

<a id="contact-links"></a>

## 📞 Contact & Lines

- **Site Web** : [kanadojo.com](https://kanadojo.com)
- **Dépôt** : [github.com/lingdojo/kanadojo](https://github.com/lingdojo/kanadojo)
- **Email** : dev@kanadojo.com

---

<div align="center">

**Fait avec ❤️ pour les apprenants de japonais du monde entier**

がんばって！ (Ganbatte ! - Faites de votre mieux !)

[⬆ Retour en haut](#top)

</div>
