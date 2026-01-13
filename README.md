<div id="top"></div>

**KanaDojo is available in multiple languages thanks to community contributions:**

<details>
<summary>English README (default)</summary>

- [Español](./docs/translations/README.es.md)
- [Français](./docs/translations/README.fr.md)
- [Deutsch](./docs/translations/README.de.md)
- [Português (pt-BR)](./docs/translations/README.pt-br.md)
- [Italiano](./docs/translations//README.it.md)
- [Русский](./docs/translations/README.ru.md)
- [Türkçe](./docs/translations/README.tr.md)
- [Tiếng Việt](./docs/translations/README.vi.md)
- [Bahasa Indonesia](./docs/translations/README.id.md)
- [中文（简体）](./docs/translations/README.zh-CN.md)
- [中文（繁體）](./docs/translations/README.zh-tw.md)

</details>

<a href="#about-kanadojo">About KanaDojo</a> | <a href="#screenshots">Screenshots</a> | <a href="#ui-design-philosophy">UI &amp; Design Philosophy</a> | <a href="#tech-stack">Tech Stack</a> | <a href="#getting-started">Getting Started</a> | <a href="#project-structure">Project Structure</a> | <a href="#contributing">Contributing</a> | <a href="#license">License</a> | <a href="#acknowledgments">Acknowledgments</a> | <a href="#contact-links">Contact &amp; Links</a>

# KanaDojo かな道場

<div align="center">

![KanaDojo Banner](https://github.com/user-attachments/assets/b7931764-be5e-43c7-b1b3-9d2568b2fecf)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lingdojo/kana-dojo&type=date&legend=top-left)](https://www.star-history.com/#lingdojo/kana-dojo&type=date&legend=top-left)

**An aesthetic, minimalist and highly customizable platform for mastering Japanese inspired by Monkeytype**

[![Live Demo](https://img.shields.io/badge/demo-kanadojo.com-blue?style=for-the-badge)](https://kanadojo.com)
[![DeepWiki](https://img.shields.io/badge/docs-DeepWiki-purple?style=for-the-badge)](https://deepwiki.com/lingdojo/kana-dojo)
[![License](https://img.shields.io/badge/license-AGPL--v3-blue?style=for-the-badge)](LICENSE.md)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</div>

<a id="about-kanadojo"></a>

## 📖 About KanaDojo

KanaDojo is an engaging web-based Japanese learning platform that makes mastering Hiragana, Katakana, Kanji, and Vocabulary fun and intuitive. Built with a focus on aesthetics, customization, and effective learning, KanaDojo provides an immersive training environment for Japanese language learners at all levels.

Whether you're just starting with the basic kana syllabaries or preparing for the JLPT exams with advanced kanji and vocabulary, KanaDojo offers a streamlined, distraction-free learning experience that adapts to your preferences and learning style.

### ✨ Key Features

#### 🎯 **Three Training Dojos**

- **Kana Dojo** - Master Hiragana and Katakana syllabaries with base, dakuon, yoon, and foreign sound groups
- **Kanji Dojo** - Learn essential kanji characters organized by JLPT levels (N5, N4, N3, N2)
- **Vocabulary Dojo** - Build your Japanese vocabulary with curated word collections by proficiency level

#### 🎮 **Four Dynamic Game Modes**

Each dojo supports four engaging training modes to reinforce learning:

1. **Pick** - Multiple choice: Select the correct romanization/translation for the shown character
2. **Reverse-Pick** - Reverse multiple choice: Select the correct character for the given romanization/translation
3. **Input** - Text input: Type the correct romanization/translation
4. **Reverse-Input** - Reverse text input: Type the correct character

#### 🎨 **Extensive Customization**

- **100+ Themes** - Choose from a vast collection of beautiful light and dark themes, or use the random theme feature
- **28 Japanese Fonts** - Select from a variety of authentic Japanese typefaces to suit your aesthetic preferences
- **Sound Effects** - Enjoy satisfying UI feedback sounds that can be toggled on/off
- **Display Options** - Toggle between Romaji/English and Kana/Kanji displays in selection menus
- **Hotkeys** - Keyboard shortcuts for efficient training (can be disabled)

#### 📊 **Progress Tracking**

- Real-time feedback with correct/incorrect counters
- Streak tracking to maintain motivation
- Statistics to monitor your learning progress

#### 🌐 **Modern Web Experience**

- Fully responsive design that works on desktop, tablet, and mobile
- No installation required - train anywhere with an internet connection
- Clean, minimalist interface that keeps you focused on learning
- Smooth animations and transitions powered by Framer Motion

<a id="screenshots"></a>

## 🖼️ Screenshots

<div align="center">

### Home Page

![Home](https://github.com/user-attachments/assets/cac78e72-4d31-43e8-8160-104c431e55be)

### Kanji Selection Menu

![Kanji Selection Menu](https://github.com/user-attachments/assets/a3c591ca-125a-4f79-b758-fb6423f7ec12)

### Training Page

![Training](https://github.com/user-attachments/assets/053020ef-77c7-492b-b8db-c381d1ec7db8)

### Customization & Themes

![Themes](https://github.com/user-attachments/assets/f664a280-0344-4ff9-8639-83f9c1c4223b)

![Fonts](https://github.com/user-attachments/assets/cf0be4c6-7d43-46e4-8939-0df6c40b83d9)

</div>

<a id="ui-design-philosophy"></a>

## 🎨 UI & Design Philosophy

KanaDojo embraces a **minimalist aesthetic** combined with **maximum flexibility**. The design philosophy centers around:

### Minimalism First

- Clean interfaces with minimal distractions
- Focus on the learning content
- Intuitive navigation and clear information hierarchy
- Purposeful use of whitespace

### Aesthetic Customization

- Extensive theme library (100+ options) ranging from soft pastels to vibrant neons
- Support for both light and dark modes
- Carefully curated color palettes that are easy on the eyes during extended study sessions
- Seamless theme transitions

### User Experience

- Smooth animations and micro-interactions for delightful feedback
- Responsive design that adapts beautifully to any screen size
- Audio feedback for interactions (optional)
- Consistent visual language across all sections

### Japanese Typography

- 28 authentic Japanese fonts covering various styles
- Proper rendering of complex kanji characters
- Clear distinction between similar-looking characters
- Font previews with real Japanese text samples

<a id="tech-stack"></a>

## 🛠️ Tech Stack

KanaDojo is built with modern web technologies for optimal performance and developer experience:

### Core Framework

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router for server-side rendering and optimal performance
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, accessible component library
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations and transitions
- **[Lucide React](https://lucide.dev/)** - Beautiful, consistent icon library
- **[FontAwesome](https://fontawesome.com/)** - Additional icon support

### State Management

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management with minimal boilerplate
- **Zustand Persist** - Local storage persistence for user preferences

### Utilities & Features

- **[use-sound](https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/)** - Audio feedback system
- **[canvas-confetti](https://www.npmjs.com/package/canvas-confetti)** - Celebration effects
- **[react-timer-hook](https://www.npmjs.com/package/react-timer-hook)** - Timer functionality
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - Markdown rendering for educational content
- **[random-js](https://www.npmjs.com/package/random-js)** - Cryptographically strong random number generation
- **[clsx](https://www.npmjs.com/package/clsx) + [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)** - Conditional styling utilities

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[next-sitemap](https://www.npmjs.com/package/next-sitemap)** - Automatic sitemap generation

### Analytics & Performance

- **[@vercel/analytics](https://vercel.com/analytics)** - Web analytics
- **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** - Performance monitoring

<a id="architecture"></a>

## 🏗️ Architecture

KanaDojo follows a **feature-based architecture** that organizes code by functionality rather than by file type. This modular approach improves maintainability, scalability, and developer experience.

### Main Structure

- **`features/`** - Self-contained modules by functionality (kana, kanji, vocabulary, statistics, achievements, themes, academy, cloze)
- **`shared/`** - Reusable components, hooks, utilities, and types shared across features
- **`core/`** - Fundamental infrastructure (i18n, analytics)
- **`app/`** - Next.js App Router with pages and layouts

Each feature contains its own components, stores, data, types, and business logic, enabling independent development and easier code understanding. For detailed architecture information, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

<a id="getting-started"></a>

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 10.x or higher (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lingdojo/kanadojo.git
   cd kanadojo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

### Other Commands

```bash
# Run ESLint
npm run lint

# Generate sitemap (runs automatically after build)
npm run postbuild
```

### Troubleshooting

If you encounter issues during development, try these solutions:

> **📘 For detailed troubleshooting, especially for Windows setup issues, see our [Troubleshooting Guide](./TROUBLESHOOTING.md)**

#### Clear Next.js Cache

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

#### Clear Node Modules and Reinstall

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

#### Clear All Caches (Nuclear Option)

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

#### Port Already in Use

If port 3000 is already in use:

**macOS/Linux:**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

**Windows (PowerShell/Command Prompt):**

```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID PID /F
```

Or simply run on a different port:

```bash
# macOS/Linux/Windows
PORT=3001 npm run dev
```

<a id="project-structure"></a>

## 📁 Project Structure

```
kanadojo/
├── app/                        # Next.js App Router
│   ├── [locale]/               # Internationalized routes
│   │   ├── kana/               # Kana dojo pages
│   │   ├── kanji/              # Kanji dojo pages
│   │   ├── vocabulary/         # Vocabulary dojo pages
│   │   ├── preferences/        # Settings page
│   │   ├── academy/            # Educational content
│   │   ├── achievements/       # Achievements page
│   │   ├── progress/           # Progress tracking
│   │   └── ...
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── features/                   # Feature-based modules
│   ├── kana/                   # Kana learning feature
│   │   ├── components/         # Kana-specific components
│   │   ├── data/               # Kana character data
│   │   ├── lib/                # Kana utilities
│   │   ├── store/              # Kana state management
│   │   └── index.ts            # Barrel exports
│   ├── kanji/                  # Kanji learning feature
│   ├── vocabulary/             # Vocabulary learning feature
│   ├── statistics/             # Progress tracking feature
│   ├── achievements/           # Achievements system
│   ├── themes/                 # Theme & preferences
│   ├── academy/                # Educational content
│   └── cloze/                  # Cloze test feature
│
├── shared/                     # Shared resources
│   ├── components/             # Reusable components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Shared utilities
│   ├── store/                  # Shared state stores
│   └── types/                  # TypeScript types
│
├── core/                       # Core infrastructure
│   ├── i18n/                   # Internationalization
│   │   ├── config.ts           # i18n configuration
│   │   ├── routing.ts          # Route localization
│   │   └── locales/            # Translation files
│   │       ├── en.json         # English
│   │       ├── es.json         # Spanish
│   │       └── ...
│   └── analytics/              # Analytics providers
│
├── public/                     # Static assets
│   ├── sounds/                 # Audio files
│   ├── wallpapers/             # Background images
│   ├── kanji/                  # Kanji JSON data
│   └── vocab/                  # Vocabulary JSON data
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # Architecture guide
│   ├── TRANSLATING.md          # Translation guide
│   └── ...
│
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

### Key Concepts

---

#### Feature-Based Architecture

KanaDojo uses a modular architecture pattern where each functionality is independent:

- **Encapsulation**: Each feature contains everything it needs (components, state, data, logic)
- **Barrel Exports**: Each module exports its public API through `index.ts`
- **Type Safety**: TypeScript with path aliases (`@/features/*`, `@/shared/*`, `@/core/*`)
- **Separation of Concerns**: Isolated features, reusable shared code, fundamental core

#### State Management Flow

1. User selects content in menu components
2. Selections stored in Zustand stores (feature-specific stores)
3. Training components read from stores to generate questions
4. Stats tracked and persisted in `features/statistics/store`
5. User preferences saved in `features/themes/store` with localStorage persistence

#### Component Architecture

- **Feature Components**: Specific to each functionality (kana, kanji, vocabulary)
- **Shared Components**: Reusable UI across features (Game, Modals, AudioButton)
- **Layout Components**: Navigation, main menu, page structures

#### Data Organization

- **Kana**: Organized by type (hiragana/katakana) and groups (base, dakuon, yoon, foreign)
- **Kanji**: Organized by JLPT level (N5-N2), with readings and meanings
- **Vocabulary**: Organized by JLPT level and word type (nouns, verbs, etc.)

#### Game Mode Implementation

Each game mode is a dynamic route (`/[contentType]/train/[gameMode]`) that:

1. Reads selected content from the appropriate store
2. Generates random questions from the selection
3. Provides immediate feedback
4. Tracks statistics (correct, incorrect, streak)

<a id="contributing"></a>

## 🤝 Contributing

Contributions are welcome! KanaDojo is an open-source project built by the community, for the community. Check out [CONTRIBUTING.md](CONTRIBUTING.md) for more detailed information on how to contribute.

### 🌍 Translation Contributions

We're actively working on making KanaDojo available in multiple languages! If you'd like to help translate:

1. **Read the guide**: Review [docs/TRANSLATION_GUIDE.md](docs/TRANSLATION_GUIDE.md)
2. **Edit translations**: Modify JSON files in `core/i18n/locales/{lang}/`
3. **Validate**: Run `npm run i18n:validate` to check your work
4. **Submit PR**: Open a pull request with your translations

**Currently supported**: English 🇬🇧, Spanish 🇪🇸, Japanese 🇯🇵
**Planned**: Portuguese, French, German, Italian, Chinese, Korean, Russian, Arabic

#### 📊 i18n System Status

**Infrastructure**: ✅ Complete (100%)

- Namespace-based translation system using next-intl
- 9 namespaces organized by feature: `common`, `navigation`, `kana`, `kanji`, `vocabulary`, `achievements`, `statistics`, `settings`, `errors`
- Automated validation and TypeScript type generation
- 345 translation keys across 3 languages

**Translation Progress**: 🚧 In Progress (~43%)

- ✅ Base UI elements translated (buttons, messages, navigation)
- ✅ Core feature metadata (kana, kanji, vocabulary pages)
- 🚧 Remaining: ~464 UI strings to add
- 🚧 Component migration: 2/90 files using translations

**How It Works**:

```tsx
// Components use the useTranslations hook
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('buttons.submit')}</button>;
}
```

**Translation Files Structure**:

```
core/i18n/locales/
├── en/  # English (reference language)
│   ├── common.json        # Buttons, messages, UI elements
│   ├── navigation.json    # Menu, breadcrumbs, footer
│   ├── kana.json         # Kana feature translations
│   ├── kanji.json        # Kanji feature translations
│   ├── vocabulary.json   # Vocabulary translations
│   ├── achievements.json # Achievement system
│   ├── statistics.json   # Progress tracking
│   ├── settings.json     # User preferences
│   └── errors.json       # Error messages
├── es/  # Spanish (same structure)
└── ja/  # Japanese (same structure)
```

**Available Commands**:

- `npm run i18n:validate` - Verify all translation keys match across languages
- `npm run i18n:generate-types` - Generate TypeScript autocomplete
- `npm run i18n:check` - Run both validation and type generation

**What's Next**:

1. Add remaining ~464 UI strings to namespace files
2. Migrate 88 remaining components to use translation hooks
3. Expand to 8+ additional languages
4. Setup CI/CD validation in GitHub Actions

#### 🌐 Language Expansion for SEO

Want to help expand KanaDojo to new languages for better global SEO visibility?

**Infrastructure**: ✅ Complete
- Centralized metadata system with locale-specific files
- Automatic OG image generation per language
- Automated sitemap with hreflang tags
- No code changes needed - just translate metadata!

**Current Languages**:
- ✅ English (en) - Primary
- ✅ Spanish (es) - Fully localized
- ✅ Japanese (ja) - Fully localized
- 📝 French (fr) - Template/Example included
- 📝 German (de) - Template/Example included

**How to Add a New Language**:

1. Read the comprehensive guide: [docs/ADDING_LANGUAGES.md](docs/ADDING_LANGUAGES.md)
2. Create metadata file: `core/i18n/locales/{locale}/metadata.json`
3. Translate all metadata sections (see French/German examples)
4. Add locale to `core/i18n/routing.ts`
5. Test locally and submit PR

**SEO Impact per Language**:
- 90+ indexed pages
- 50+ kana subset pages with full SEO
- Estimated +200-400 monthly visits per language

**Recommended Priority Languages**:
1. Portuguese (pt) - Brazil market (~200M speakers)
2. French (fr) - France, Canada, Africa (~280M speakers)
3. German (de) - Germany, Austria, Switzerland (~100M speakers)
4. Italian (it) - Italy market (~85M speakers)
5. Korean (ko), Chinese (zh), Russian (ru), Indonesian (id)

**Performance**: Zero dev server impact, ~30-60 sec build time per language

See [docs/ADDING_LANGUAGES.md](docs/ADDING_LANGUAGES.md) for complete instructions, SEO best practices, and troubleshooting.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Use TypeScript for type safety
- Test your changes thoroughly
- Update documentation as needed
- Keep components focused and reusable

<a id="license"></a>

## 📄 License

This project is licensed under the AGPL 3.0 License - see the [LICENSE.md](LICENSE.md) file for details.

<a id="acknowledgments"></a>

## 🙏 Acknowledgments

- Japanese language data and character information
- Open-source community for the amazing tools and libraries
- All contributors who help make KanaDojo better

<a id="contact-links"></a>

## 📞 Contact & Links

- **Website**: [kanadojo.com](https://kanadojo.com)
- **Repository**: [github.com/lingdojo/kanadojo](https://github.com/lingdojo/kanadojo)
- **Email**: dev@kanadojo.com

---

<div align="center">

**Made with ❤️ for Japanese language learners worldwide**

がんばって！ (Ganbatte! - Do your best!)

[⬆ Back to top](#top)

</div>

<!-- Build trigger: 2025-12-31-19-24-10 -->
