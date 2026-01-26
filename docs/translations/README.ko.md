<div id="top"></div>

> ⚠️ **이 문서는 영문 README.md의 번역본입니다.**  
> 최신 정보 및 공식 내용은 항상 **[English README](../../README.md)** 를 확인해 주세요.  
> 번역이 최신 상태를 반영하지 않을 수 있습니다.

# KanaDojo かな道場

<div align="center">

![KanaDojo Banner](https://github.com/user-attachments/assets/56716ee9-9347-4224-9fe2-ef1beb93e286)

**Monkeytype에서 영감을 받은 아름답고 미니멀하며 고도로 커스터마이징 가능한 일본어 학습 플랫폼**

[![Live Demo](https://img.shields.io/badge/demo-kanadojo.com-blue?style=for-the-badge)](https://kanadojo.com)
[![DeepWiki](https://img.shields.io/badge/docs-DeepWiki-purple?style=for-the-badge)](https://deepwiki.com/lingdojo/kana-dojo)
[![Good First Issues](https://img.shields.io/github/issues-search/lingdojo/kana-dojo?query=is%3Aissue+is%3Aopen+label%3A%22good%20first%20issue%22&style=for-the-badge&label=good%20first%20issues&color=brightgreen)](https://github.com/lingdojo/kana-dojo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good%20first%20issue%22)
[![License](https://img.shields.io/badge/license-AGPL--v3-blue?style=for-the-badge)](../../LICENSE.md)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow?style=for-the-badge)](https://vitest.dev/)
[![AGPL-3.0](https://img.shields.io/badge/open-source-green?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)

---

## 소개

KanaDojo는 히라가나, 가타카나, 한자, 어휘를 재미있고 직관적으로 마스터할 수 있도록 돕는 매력적인 웹 기반 일본어 학습 플랫폼입니다. 미학, 커스터마이징, 효과적인 학습에 중점을 두고 구축되어 모든 수준의 일본어 학습자를 위한 몰입형 훈련 환경을 제공합니다.

## 기여하기

### 처음 기여하시는 분들을 위한 가이드

[초보자 기여 가이드](../CONTRIBUTING-BEGINNERS.md)부터 시작하세요. GitHub 계정 생성부터 첫 PR 열기까지 단계별로 설명하는 가이드입니다.

### 초보자가 아니신가요?

모든 기여를 환영합니다! 버그 수정, 기능 추가, 문서 개선, 번역 등 어떤 형태든 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 확인하여 시작하세요.

[라이브 데모](https://kanadojo.com) · [문서](../)

</div>

## 주요 기능

- **세 가지 훈련 도장** — 가나(히라가나/가타카나), 한자(JLPT N5-N1), 어휘
- **네 가지 게임 모드** — 선택, 역선택, 입력, 역입력으로 다양한 연습
- **100개 이상의 테마** — 28개의 일본어 폰트와 아름다운 라이트/다크 테마
- **진행 상황 추적** — 통계, 연속 학습 일수, 80개 이상의 업적
- **완전 반응형** — 데스크톱, 태블릿, 모바일에서 원활하게 작동

## 빠른 시작

```bash
git clone https://github.com/lingdojo/kanadojo.git
cd kanadojo
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)을 열어 학습을 시작하세요.

PR을 열기 전에 변경사항을 검증하려면:

```bash
npm run check
```

> **문제가 발생하셨나요?** [문제 해결 가이드](../TROUBLESHOOTING.md)를 참조하세요.

## 스크린샷

<div align="center">

### 홈 페이지
<!--
![Home](https://github.com/user-attachments/assets/cac78e72-4d31-43e8-8160-104c431e55be)
-->
### 훈련 화면

![Training](https://github.com/user-attachments/assets/d491708f-2ad3-41c7-9717-dec8a90afd03)

### 테마 및 커스터마이징

![Themes](https://github.com/user-attachments/assets/f664a280-0344-4ff9-8639-83f9c1c4223b)

</div>

## 문서

| 문서                                                  | 설명                                    |
| ----------------------------------------------------- | --------------------------------------- |
| [아키텍처](../ARCHITECTURE.md)                        | 프로젝트 구조, 패턴, 컨벤션             |
| [UI 디자인](../UI_DESIGN.md)                          | 테마, 스타일링, 컴포넌트 가이드라인     |
| [번역 가이드](../TRANSLATION_GUIDE.md)                | 앱 번역 방법                             |
| [문제 해결](../TROUBLESHOOTING.md)                    | 일반적인 문제와 해결 방법                |
| [초보자 기여 가이드](../CONTRIBUTING-BEGINNERS.md)     | 처음 기여하는 분들을 위한 단계별 가이드  |
| [전체 문서](../)                                      | 전체 문서 인덱스                         |

## 기술 스택

Next.js 15 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · Framer Motion

> 전체 기술 세부사항은 [아키텍처 문서](../ARCHITECTURE.md)를 참조하세요.

## 스타 히스토리

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=lingdojo/kana-dojo&type=Date)](https://star-history.com/#lingdojo/kana-dojo&Date)

</div>

## 라이선스

이 프로젝트는 AGPL 3.0 라이선스 하에 제공됩니다. 자세한 내용은 [LICENSE.md](../../LICENSE.md)를 참조하세요.

## 연락처

- **Discord**: https://discord.gg/CyvBNNrSmb
- **이메일**: dev@kanadojo.com

---

<div align="center">

**전 세계 일본어 학습자를 위해 ❤️를 담아 제작했습니다**

がんばって！ (Ganbatte! — 최선을 다하세요!)

[⬆ 맨 위로](#top)

</div>
