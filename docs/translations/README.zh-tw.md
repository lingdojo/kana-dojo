<div id="top"></div>

<a href="#about-kanadojo">關於 KanaDojo</a> | <a href="#screenshots">介面展示</a> | <a href="#ui-design-philosophy">UI 與設計理念</a> | <a href="#tech-stack">技術棧</a> | <a href="#getting-started">快速開始</a> | <a href="#project-structure">專案結構</a> | <a href="#contributing">參與貢獻</a> | <a href="#license">許可證</a> | <a href="#acknowledgments">致謝</a> | <a href="#contact-links">聯絡與連結</a>

# KanaDojo かな道場

<div align="center">

![KanaDojo Banner](https://github.com/user-attachments/assets/b7931764-be5e-43c7-b1b3-9d2568b2fecf)

**美學極簡、高度自訂化的日語精通平台**

[![Live Demo](https://img.shields.io/badge/demo-kanadojo.com-blue?style=for-the-badge)](https://kanadojo.com)
[![License](https://img.shields.io/badge/license-AGPL--v3-blue)](LICENSE.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

<a id="about-kanadojo"></a>

## 📖 關於 KanaDojo

KanaDojo 是一個互動式網頁版的日語學習平台，讓您能以有趣且直覺的方式學習平假名、片假名、漢字和詞彙。KanaDojo 專注於美學設計、豐富自訂與高效學習，為所有程度的日語學習者提供一個沉浸式的訓練環境。

無論您是剛開始學習基礎的假名表，還是準備 JLPT 考試需要的進階漢字與詞彙學習，KanaDojo 提供簡潔流暢、免受干擾的學習體驗，以適應您的個人學習偏好。

### ✨ 主要功能

#### 🎯 **三個訓練道場**

- **Kana Dojo 假名道場** - 透過清音、濁音、拗音和外來音組掌握平假名和片假名
- **Kanji Dojo 漢字道場** - 學習 JLPT 級別（N5、N4、N3 與 N2）分組排列的必備漢字
- **Vocabulary Dojo 詞彙道場** - 透過各級別精選詞彙建立您的日語詞彙集

#### 🎮 **四種練習模式**

每個道場都支援四種互動式練習模式以提升學習成效：

1. **Pick** - 選擇題：為顯示的字詞選擇正確的羅馬拼音或英文翻譯
2. **Reverse-Pick** - 反向選擇題：由顯示的羅馬拼音或英文翻譯，選擇正確的字詞
3. **Input** - 填空題：為顯示的字詞輸入正確的羅馬拼音或英文翻譯
4. **Reverse-Input** - 反向填空題：由顯示的羅馬拼音或英文輸入正確的字詞

#### 🎨 **高度自訂化**

- **100+ 種主題** - 有眾多精美淺色與深色主題供選擇，或使用隨機主題
- **28 種日文字體** - 從多種道地的日文字型中選擇以符合您的美學偏好
- **音效** - 享受療癒的使用者介面回饋音效，並可隨時開啟與關閉
- **顯示選項** - 在選單中可切換羅馬拼音/英文和假名/漢字的顯示
- **快捷鍵** - 鍵盤快捷鍵有助於提升訓練效率（可停用）

#### 📊 **學習進度追蹤**

- 可即時回饋的正確/錯誤計數器
- 連勝紀錄追蹤以保持學習動力
- 透過統計資料監控您的學習進度

#### 🌐 **現代化網頁體驗**

- 適用於桌面、平板電腦和行動裝置的完整響應式設計
- 無需安裝，只要有網路皆可隨時隨地訓練
- 乾淨和極簡的介面，讓您專注於學習
- 由 Framer Motion 驅動的流暢動畫與轉場效果

---

<a id="screenshots"></a>

## 🖼️ 介面展示

<div align="center">

### 首頁

![Home](https://github.com/user-attachments/assets/8a912762-f5f3-4520-a75c-d145cac0da62)

### 假名選擇

![Kana Selection](https://github.com/user-attachments/assets/294e2913-6909-4a84-8311-f934120247f2)

### 練習模式

![Training](https://github.com/user-attachments/assets/053020ef-77c7-492b-b8db-c381d1ec7db8)

### 自訂與主題

![Preferences](https://github.com/user-attachments/assets/f664a280-0344-4ff9-8639-83f9c1c4223b)

</div>

---

<a id="ui-design-philosophy"></a>

## 🎨 使用者介面與設計理念

KanaDojo 秉持結合**極簡美學**與**最大彈性**的理念，其核心設計理念如下：

### 極簡優先

- 介面乾淨，將干擾降到最低
- 專注於學習內容
- 直覺式導覽與清楚的資訊結構
- 充分的視覺留白

### 視覺自訂

- 豐富的主題庫（100+ 種選項），風格從柔和的粉彩色調到鮮豔的螢光色系
- 支援淺色與深色模式
- 精心設計的配色方案，長時間學習也能保護視力
- 流暢的主題切換

### 使用者體驗

- 流暢動畫與細緻互動回饋
- 響應式設計，完美適應任何螢幕尺寸
- 互動音效（可選）
- 所有頁面皆採用一致的視覺風格

### 日文字體

- 28 種涵蓋多樣風格的道地日文字型
- 準確呈現複雜的日文漢字
- 清晰區分外型相似的文字
- 提供真實日文範例的字型預覽

---

<a id="tech-stack"></a>

## 🛠️ 技術棧

KanaDojo 採現代化網頁技術打造，以提供最佳效能與開發者體驗：

### 核心框架

- **[Next.js 16](https://nextjs.org/)** - 基於 React 的框架，透過 App Router 提供伺服器端渲染與最佳效能
- **[React 19](https://react.dev/)** - 最新版 React，具備並行功能
- **[TypeScript](https://www.typescriptlang.org/)** - 型別安全開發

### 樣式與使用者介面

- **[Tailwind CSS](https://tailwindcss.com/)** - 工具類 CSS 框架
- **[shadcn/ui](https://ui.shadcn.com/)** - 高品質、無障礙的元件庫
- **[Framer Motion](https://www.framer.com/motion/)** - 流暢的動畫與轉場效果
- **[Lucide React](https://lucide.dev/)** - 美觀且風格一致的圖示庫
- **[FontAwesome](https://fontawesome.com/)** - 額外的圖示支援

### 狀態管理

- **[Zustand](https://zustand-demo.pmnd.rs/)** - 輕量級的狀態管理，極簡的樣板程式碼
- **Zustand Persist** - 將使用者偏好持久化儲存於本地

### 工具與功能

- **[use-sound](https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/)** - 音效回饋系統
- **[canvas-confetti](https://www.npmjs.com/package/canvas-confetti)** - 慶祝動畫效果
- **[react-timer-hook](https://www.npmjs.com/package/react-timer-hook)** - 計時器功能
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - 教學內容的 Markdown 渲染
- **[random-js](https://www.npmjs.com/package/random-js)** - 密碼學等級的亂數產生器
- **[clsx](https://www.npmjs.com/package/clsx) + [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)** - 條件式樣式工具

### 開發工具

- **[ESLint](https://eslint.org/)** - 程式碼檢查
- **[next-sitemap](https://www.npmjs.com/package/next-sitemap)** - 自動產生網站地圖

### 分析與效能

- **[@vercel/analytics](https://vercel.com/analytics)** - 網站分析
- **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** - 效能監控

---

<a id="getting-started"></a>

## 🚀 開始使用

### 環境需求

- **Node.js** 24 LTS（建議使用）
- **npm** 10.x 或更高版本（隨附於 Node.js）

### 安裝步驟

1. **Clone 專案**

   ```bash
   git clone https://github.com/lingdojo/kanadojo.git
   cd kanadojo
   ```

2. **安裝相依套件**

   ```bash
   npm install
   ```

3. **執行開發伺服器**

   ```bash
   npm run dev
   ```

4. **開啟瀏覽器**
   前往 [http://localhost:3000](http://localhost:3000)

### 正式環境建置

```bash
# 產生最佳化的正式版本
npm run build

# 啟動正式環境伺服器
npm start
```

### 其他指令

```bash
# 執行 ESLint
npm run lint

# 產生網站地圖（建置後自動執行）
npm run postbuild
```

### 問題排除

如果您在開發過程中遇到問題，請嘗試以下解決方案：

#### 清除 Next.js 快取

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

#### 清除 Node Modules 並重新安裝

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

#### 清除所有快取（最終手段）

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

#### 連接埠已被佔用

如果連接埠 3000 已被佔用：

**macOS/Linux:**

```bash
# 尋找使用連接埠 3000 的程序
lsof -i :3000

# 終止程序（將 PID 替換為實際程序 ID）
kill -9 PID
```

**Windows (PowerShell/Command Prompt):**

```cmd
# 尋找使用連接埠 3000 的程序
netstat -ano | findstr :3000

# 終止程序（將 PID 替換為實際程序 ID）
taskkill /PID PID /F
```

或直接在不同連接埠執行：

```bash
# macOS/Linux/Windows
PORT=3001 npm run dev
```

<a id="project-structure"></a>

## 📁 專案架構

```
kanadojo/
├── app/                        # Next.js App Router 頁
│   ├── kana/                   # 假名道場頁面
│   │   └── train/[gameMode]/   # 各練習模式的訓練頁面
│   ├── kanji/                  # 漢字道場頁面
│   │   └── train/[gameMode]/
│   ├── vocabulary/             # 詞彙道場頁面
│   │   └── train/[gameMode]/
│   ├── preferences/            # 設定與自訂頁面
│   ├── academy/                # 教育內容
│   ├── layout.tsx              # 排版與 Providers
│   └── page.tsx                # 首頁
│
├── components/                 # React 元件
│   ├── Dojo/                   # 訓練相關元件
│   │   ├── Kana/               # 假名選擇和卡片
│   │   ├── Kanji/              # 漢字選擇和卡片
│   │   └── Vocab/              # 詞彙選擇和卡片
│   ├── reusable/               # 複用元件
│   │   ├── Menu/               # 導覽與選單元件
│   │   └── ...                 # 其他共用元件
│   ├── Settings/               # 偏好元件
│   └── ui/                     # shadcn/ui 元件
│
├── lib/                        # 工具和輔助函式
│   ├── hooks/                  # 自訂 React hooks
│   │   ├── useAudio.ts         # 音效回饋 hooks
│   │   └── ...
│   ├── interfaces.ts           # TypeScript 介面
│   └── utils.ts                # 工具函式
│
├── store/                      # Zustand 狀態管理
│   ├── useKanaKanjiStore.ts    # 假名/漢字選擇狀態
│   ├── useVocabStore.ts        # 詞彙選擇狀態
│   ├── useStatsStore.ts        # 統計與進度
│   └── useThemeStore.ts        # 主題與偏好
│
├── static/                     # 靜態資料與設定
│   ├── kana.ts                 # 假名字元資料
│   ├── kanji/                  # 各 JLPT 級別的漢字資料
│   ├── vocab/                  # 詞彙資料
│   ├── themes.ts               # 主題定義
│   ├── fonts.ts                # 字型設定
│   └── info.tsx                # 資訊內容
│
├── public/                     # 靜態資源
│   ├── sounds/                 # 音效檔案
│   └── wallpapers/             # 背景圖片
```

### 核心概念

#### 狀態管理流程

1. 使用者在選單元件中選取內容
2. 所選內容儲存於 Zustand stores (`useKanaKanjiStore`, `useVocabStore`)
3. 訓練元件從 store 中讀取資料來生成題目
4. 統計資料在 `useStatsStore` 中被追蹤並持久化
5. 使用者偏好透過 localStorage 持久化儲存於 `useThemeStore`

#### 元件架構

- **Dojo Components**：處理各內容類型的字元或詞彙選擇
- **Training Components**：渲染練習模式並處理使用者互動
- **Reusable Components**：共用使用者介面元件（按鈕、卡片、對話框等）
- **Menu Components**：導覽、資訊區與道場選擇

#### 資料組織

- **假名**：依類型（平假名/片假名）和組別（清音、濁音、拗音、外來音）分類
- **漢字**：依 JLPT 級別（N5-N2）分類，包含讀音與意義
- **詞彙**：依 JLPT 級別和詞性（名詞、動詞等）分類

#### 練習模式實作

每個練習模式都是一個動態路由 (`/[contentType]/train/[gameMode]`)，負責：

1. 從相應的 store 讀取選定內容
2. 從所選內容生成隨機題目
3. 提供立即回饋
4. 追蹤統計資料（答對數、答錯數、連勝紀錄）

---

<a id="contributing"></a>

## 🤝 貢獻

歡迎貢獻！KanaDojo 是一個開放原始碼專案，由社群打造、為社群服務，更多貢獻資訊請參考 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 如何貢獻

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送至分支 (`git push origin feature/AmazingFeature`)
5. 建立 Pull Request

### 開發指南

- 遵循目前程式碼風格與規範
- 使用 TypeScript 以確保型別安全
- 完整地測試您的變更
- 依需求更新文件
- 保持元件的專一與複用性

---

<a id="license"></a>

## 📄 授權條款

此專案採用 AGPL 3.0 授權，詳情請見 [LICENSE.md](LICENSE.md) 檔案。

---

<a id="acknowledgments"></a>

## 🙏 致謝

- 日文語言資料與字元資訊的來源
- 開源社群提供的優秀工具與函式庫
- 所有讓 KanaDojo 變得更好的貢獻者

---

<a id="contact-links"></a>

## 📞 聯絡資訊與鏈結

- **網站**：[kanadojo.com](https://kanadojo.com)
- **儲存庫**：[github.com/lingdojo/kanadojo](https://github.com/lingdojo/kanadojo)
- **電子郵件**: dev@kanadojo.com

---

<div align="center">

**為全世界的日語學習者用 ❤️ 打造**

がんばって！ (加油! - 全力以赴!)

[⬆ 返回頂部](#top)

</div>
