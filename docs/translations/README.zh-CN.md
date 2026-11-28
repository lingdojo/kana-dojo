<div id="top"></div>

<a href="#about-kanadojo">关于 KanaDojo</a> | <a href="#screenshots">截图</a> | <a href="#ui-design-philosophy">UI 与设计理念</a> | <a href="#tech-stack">技术栈</a> | <a href="#getting-started">快速开始</a> | <a href="#project-structure">项目结构</a> | <a href="#contributing">参与贡献</a> | <a href="#license">许可证</a> | <a href="#acknowledgments">致谢</a> | <a href="#contact-links">联系与链接</a>

**KanaDojo 支持多语言，感谢社区贡献：**

[English](../../README.md) **/** [Español](docs/translations/README.es.md) **/** [Français (in progress)](docs/translations/README.fr.md) **/** [Deutsch](docs/translations/README.de.md) **/** [Português](docs/translations/README.pt-br.md) **/** [Türkçe](docs/translations/README.tr.md) **/** 中文（简体）**/** [中文（繁體）](docs/translations/README.zh-tw.md) **/** [हिन्दी](docs/translations/README.hin.md) **/** <span dir="ltr">[العربية](docs/translations/README.ar.md)</span> **/** [Русский](docs/translations/README.ru.md)

# KanaDojo かな道場

<div align="center">

![KanaDojo Banner](https://github.com/user-attachments/assets/b7931764-be5e-43c7-b1b3-9d2568b2fecf)
![GitHub Stars](https://github.com/user-attachments/assets/7524bec9-5fa8-438e-8df6-ee9e3de5f2f9)

**一个美学化、极简且高度可定制的日语学习平台**

[![Live Demo](https://img.shields.io/badge/demo-kanadojo.com-blue?style=for-the-badge)](https://kanadojo.com)
[![License](https://img.shields.io/badge/license-AGPL--v3-blue)](LICENSE.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

<a id="about-kanadojo"></a>

## 📖 关于 KanaDojo

KanaDojo 是一款有趣的 Web 端日语学习平台，帮助你直观且高效地掌握平假名、片假名、汉字与词汇。它注重美观、可定制性与有效学习，致力于为各个水平的日语学习者提供沉浸式的训练体验。

无论你刚开始学习基础假名，还是在为 JLPT 考试做高级汉字与词汇的准备，KanaDojo 都能根据你的偏好与学习风格，提供简洁、无干扰且高度自适应的学习体验。

### ✨ 关键特性

#### 🎯 **三大训练道场**

- **假名道场（Kana Dojo）** - 掌握平假名与片假名：基础音、浊音、拗音与外来音
- **汉字道场（Kanji Dojo）** - 按 JLPT 等级（N5、N4、N3、N2）学习核心汉字
- **词汇道场（Vocabulary Dojo）** - 按熟练度分级的精选日语词汇

#### 🎮 **四种动态游戏模式**

每个道场均支持四种富有互动性的训练模式：

1. **选择（Pick）** - 多选题：为给定字符选择正确的罗马音/释义
2. **反向选择（Reverse-Pick）** - 反向多选：为给定罗马音/释义选择正确字符
3. **输入（Input）** - 文本输入：输入正确的罗马音/释义
4. **反向输入（Reverse-Input）** - 反向文本输入：输入正确的字符

#### 🎨 **丰富的自定义**

- **100+ 主题** - 从大量精美的明暗色主题中选择，或使用随机主题
- **28 款日文字体** - 多样、地道的日文字体以匹配你的审美偏好
- **音效** - 令人愉悦的界面反馈音效，可随时开关
- **显示选项** - 在选择菜单中切换 Romaji/英文 与 假名/汉字 显示
- **快捷键** - 高效训练的键盘快捷键（可禁用）

#### 📊 **进度追踪**

- 实时正确/错误计数
- 连击（Streak）追踪，保持学习动力
- 学习统计，监控你的进展

#### 🌐 **现代化的 Web 体验**

- 自适应响应式设计，桌面/平板/手机皆可流畅使用
- 无需安装——有网就能练
- 干净、极简的界面，让你专注于学习
- 由 Framer Motion 驱动的顺滑动画与过渡

---

<a id="screenshots"></a>

## 🖼️ 截图

<div align="center">

### 首页

![Home](https://github.com/user-attachments/assets/cac78e72-4d31-43e8-8160-104c431e55be)

### 汉字选择菜单

![Kanji Selection Menu](https://github.com/user-attachments/assets/a3c591ca-125a-4f79-b758-fb6423f7ec12)

### 训练页面

![Training](https://github.com/user-attachments/assets/053020ef-77c7-492b-b8db-c381d1ec7db8)

### 自定义与主题

![Themes](https://github.com/user-attachments/assets/f664a280-0344-4ff9-8639-83f9c1c4223b)

![Fonts](https://github.com/user-attachments/assets/cf0be4c6-7d43-46e4-8939-0df6c40b83d9)

</div>

---

<a id="ui-design-philosophy"></a>

## 🎨 UI 与设计理念

KanaDojo 结合了**极简美学**与**最大化的灵活性**。其设计理念包括：

### 极简优先

- 界面简洁，尽量减少干扰
- 聚焦学习内容
- 直观的导航与清晰的信息层级
- 合理利用留白

### 审美定制

- 丰富的主题库（100+），从清新淡雅到活力霓虹
- 支持明暗双模式
- 精心挑选的配色，长时间学习也不疲劳
- 无缝的主题切换

### 用户体验

- 顺滑的动效与微交互，提供愉悦反馈
- 自适应设计，任何屏幕尺寸都表现出色
- 交互音效可选
- 各部分保持一致的视觉语言

### 日文字体排印

- 28 款正宗日文字体，涵盖多种风格
- 正确渲染复杂汉字
- 清晰区分形近字符
- 真实日文文本的字体预览

---

<a id="tech-stack"></a>

## 🛠️ 技术栈

KanaDojo 采用现代 Web 技术，兼顾性能与开发体验：

### 核心框架

- **[Next.js 16](https://nextjs.org/)** - 基于 React 的框架，使用 App Router，支持服务端渲染与高性能
- **[React 19](https://react.dev/)** - 最新的并发特性
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的开发

### 样式与 UI

- **[Tailwind CSS](https://tailwindcss.com/)** - 实用类优先的 CSS 框架
- **[shadcn/ui](https://ui.shadcn.com/)** - 高质量、可访问的组件库
- **[Framer Motion](https://www.framer.com/motion/)** - 顺滑的动画与过渡
- **[Lucide React](https://lucide.dev/)** - 统一而优雅的图标库
- **[FontAwesome](https://fontawesome.com/)** - 其他图标支持

### 状态管理

- **[Zustand](https://zustand-demo.pmnd.rs/)** - 轻量、样板代码极少的状态管理
- **Zustand Persist** - 将用户偏好持久化到本地存储

### 实用工具与功能

- **[use-sound](https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/)** - 音频反馈系统
- **[canvas-confetti](https://www.npmjs.com/package/canvas-confetti)** - 庆祝效果
- **[react-timer-hook](https://www.npmjs.com/package/react-timer-hook)** - 计时器功能
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - 教学内容的 Markdown 渲染
- **[random-js](https://www.npmjs.com/package/random-js)** - 密码学强度的随机数
- **[clsx](https://www.npmjs.com/package/clsx) + [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)** - 条件样式工具

### 开发工具

- **[ESLint](https://eslint.org/)** - 代码检查
- **[next-sitemap](https://www.npmjs.com/package/next-sitemap)** - 自动站点地图生成

### 分析与性能

- **[@vercel/analytics](https://vercel.com/analytics)** - 网站分析
- **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** - 性能监测

---

<a id="getting-started"></a>

## 🚀 快速开始

### 前置条件

- **Node.js** 24 LTS（推荐）
- **npm** 10.x 或更高版本（随 Node.js 提供）

### 安装

1. 克隆仓库

   ```bash
   git clone https://github.com/lingdojo/kanadojo.git
   cd kanadojo
   ```

2. 安装依赖

   ```bash
   npm install
   ```

3. 启动开发服务器

   ```bash
   npm run dev
   ```

4. 打开浏览器

   访问 [http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
# 构建优化后的生产版本
npm run build

# 启动生产服务器
npm start
```

### 其他命令

```bash
# 运行 ESLint
npm run lint

# 生成站点地图（在构建后自动运行）
npm run postbuild
```

### 故障排除

如果在开发过程中遇到问题，请尝试以下解决方案：

#### 清除 Next.js 缓存

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

#### 清除 Node Modules 并重新安装

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

#### 清除所有缓存（核选项）

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

#### 端口已被占用

如果端口 3000 已被占用：

**macOS/Linux:**

```bash
# 查找使用端口 3000 的进程
lsof -i :3000

# 终止进程（将 PID 替换为实际进程 ID）
kill -9 PID
```

**Windows (PowerShell/Command Prompt):**

```cmd
# 查找使用端口 3000 的进程
netstat -ano | findstr :3000

# 终止进程（将 PID 替换为实际进程 ID）
taskkill /PID PID /F
```

或者直接在不同端口上运行：

```bash
# macOS/Linux/Windows
PORT=3001 npm run dev
```

<a id="project-structure"></a>

## 📁 项目结构

```
kanadojo/
├── app/                        # Next.js App Router 页面
│   ├── kana/                   # 假名道场页面
│   │   └── train/[gameMode]/   # 各游戏模式的训练页面
│   ├── kanji/                  # 汉字道场页面
│   │   └── train/[gameMode]/
│   ├── vocabulary/             # 词汇道场页面
│   │   └── train/[gameMode]/
│   ├── preferences/            # 设置与自定义页面
│   ├── academy/                # 教学内容
│   ├── layout.tsx              # 根布局与 Providers
│   └── page.tsx                # 首页
│
├── components/                 # React 组件
│   ├── Dojo/                   # 训练相关组件
│   │   ├── Kana/               # 假名选择与卡片
│   │   ├── Kanji/              # 汉字选择与卡片
│   │   └── Vocab/              # 词汇选择与卡片
│   ├── reusable/               # 可复用组件
│   │   ├── Menu/               # 导航与菜单组件
│   │   └── ...                 # 其他可复用组件
│   ├── Settings/               # 偏好设置组件
│   └── ui/                     # shadcn/ui 组件
│
├── lib/                        # 工具与辅助函数
│   ├── hooks/                  # 自定义 React Hooks
│   │   ├── useAudio.ts         # 音频反馈 Hooks
│   │   └── ...
│   ├── interfaces.ts           # TypeScript 接口
│   └── utils.ts                # 工具函数
│
├── i18n/                       # 文本翻译管理
│   └── request.ts              # 翻译获取辅助
│
├── store/                      # Zustand 状态管理
│   ├── useKanaKanjiStore.ts    # 假名/汉字选择状态
│   ├── useVocabStore.ts        # 词汇选择状态
│   ├── useStatsStore.ts        # 统计与进度
│   └── useThemeStore.ts        # 主题与偏好
│
├── static/                     # 静态数据与配置
│   ├── kana.ts                 # 假名数据
│   ├── kanji/                  # 按 JLPT 分类的汉字数据
│   ├── vocab/                  # 词汇数据
│   ├── themes.ts               # 主题定义
│   ├── fonts.ts                # 字体配置
│   └── info.tsx                # 信息内容
│
├── translations/               # 文本内容翻译
│   ├── en.json                 # 英文
│   └── es.json                 # 西班牙文
│
├── public/                     # 静态资源
│   ├── sounds/                 # 音频文件
│   └── wallpapers/             # 背景图片
│
├── CLAUDE.md                   # 开发者文档
├── next.config.ts              # Next.js 配置
├── tailwind.config.js          # Tailwind CSS 配置
└── tsconfig.json               # TypeScript 配置
```

### 关键概念

#### 状态管理流程

1. 用户在菜单组件中选择内容
2. 选择结果存储到 Zustand（`useKanaKanjiStore`, `useVocabStore`）
3. 训练组件从 Store 读取选择生成题目
4. 在 `useStatsStore` 中追踪并持久化统计数据
5. 用户偏好使用 `useThemeStore` 持久化到 localStorage

#### 组件架构

- **Dojo 组件**：处理各内容类型的选择
- **训练组件**：渲染游戏模式并处理交互
- **可复用组件**：通用 UI 元素（按钮、卡片、弹窗等）
- **菜单组件**：导航、信息部分与道场选择

#### 数据组织

- **假名**：按类型（平假名/片假名）与分组（基础、浊音、拗音、外来音）
- **汉字**：按 JLPT 等级（N5-N2），包含读音与含义
- **词汇**：按 JLPT 等级与词性（名词、动词等）

#### 游戏模式实现

每种游戏模式是一个动态路由（`/[contentType]/train/[gameMode]`）：

1. 从对应 Store 读取已选择的内容
2. 基于选择随机生成题目
3. 提供即时反馈
4. 追踪统计（正确、错误、连击）

---

<a id="contributing"></a>

## 🤝 参与贡献

欢迎贡献！KanaDojo 是由社区构建、服务社区的开源项目。查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解更多贡献指南。

### 如何贡献

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送分支（`git push origin feature/AmazingFeature`）
5. 发起 Pull Request

### 开发指南

- 遵循现有代码风格与约定
- 使用 TypeScript 保证类型安全
- 充分测试你的更改
- 需要时更新文档
- 组件应聚焦、可复用

---

<a id="license"></a>

## 📄 许可证

本项目基于 AGPL 3.0 许可协议开源——详见 [LICENSE.md](LICENSE.md)。

---

<a id="acknowledgments"></a>

## 🙏 致谢

- 日语语言数据与字符信息
- 开源社区提供的优秀工具与库
- 所有为 KanaDojo 贡献的伙伴

---

<a id="contact-links"></a>

## 📞 联系与链接

- **网站**： [kanadojo.com](https://kanadojo.com)
- **仓库**： [github.com/lingdojo/kanadojo](https://github.com/lingdojo/kanadojo)
- **邮箱**： dev@kanadojo.com

---

<div align="center">

**Made with ❤️ for Japanese language learners worldwide**

がんばって！ (Ganbatte! - Do your best!)

[⬆ 返回顶部](#top)

</div>
