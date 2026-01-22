
<div id="top"></div>

# KanaDojo かな道場

<div align="center">

![KanaDojo Banner](https://github.com/user-attachments/assets/b7931764-be5e-43c7-b1b3-9d2568b2fecf)

**Một nền tảng thẩm mỹ, tối giản và có tính tùy biến cao để làm chủ tiếng Nhật, lấy cảm hứng từ Monkeytype**

[![Live Demo](https://img.shields.io/badge/demo-kanadojo.com-blue?style=for-the-badge)](https://kanadojo.com)
[![DeepWiki](https://img.shields.io/badge/docs-DeepWiki-purple?style=for-the-badge)](https://deepwiki.com/lingdojo/kana-dojo)
[![Good First Issues](https://img.shields.io/github/issues-search/lingdojo/kana-dojo?query=is%3Aissue+is%3Aopen+label%3A%22good%20first%20issue%22&style=for-the-badge&label=good%20first%20issues&color=brightgreen)](https://github.com/lingdojo/kana-dojo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good%20first%20issue%22)
[![License](https://img.shields.io/badge/license-AGPL--v3-blue?style=for-the-badge)](LICENSE.md)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow?style=for-the-badge)](https://vitest.dev/)
[![AGPL-3.0](https://img.shields.io/badge/open-source-green?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)

---

## Huy hiệu (cho các bản fork)

Nếu bạn fork dự án này, hãy thêm các huy hiệu này vào README của bạn:

```markdown
[![CI](https://github.com/YOUR_USERNAME/kana-dojo/actions/workflows/pr-check.yml/badge.svg)](https://github.com/YOUR_USERNAME/kana-dojo/actions)
[![Issues](https://img.shields.io/github/issues/YOUR_USERNAME/kana-dojo)](https://github.com/YOUR_USERNAME/kana-dojo/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/YOUR_USERNAME/kana-dojo)](https://github.com/YOUR_USERNAME/kana-dojo/pulls)
[![Contributors](https://img.shields.io/github/contributors/YOUR_USERNAME/kana-dojo)](https://github.com/YOUR_USERNAME/kana-dojo/graphs/contributors)
```

[Demo Trực tiếp](https://kanadojo.com) · [Tài liệu](./docs/) · [Đóng góp](./CONTRIBUTING.md)

</div>

## Giới thiệu

KanaDojo là một nền tảng học tiếng Nhật trên web đầy lôi cuốn, giúp việc làm chủ Hiragana, Katakana, Kanji và Từ vựng trở nên thú vị và trực quan. Được xây dựng với trọng tâm vào tính thẩm mỹ, khả năng tùy biến và hiệu quả học tập, nó cung cấp một môi trường luyện tập nhập vai cho người học tiếng Nhật ở mọi trình độ.

## Liên kết nhanh

- **Ứng dụng**: https://kanadojo.com
- **Thực hành**: https://kanadojo.com/en/hiragana-practice · https://kanadojo.com/en/katakana-practice · https://kanadojo.com/en/kanji-practice
- **Tài liệu**: https://deepwiki.com/lingdojo/kana-dojo · ./docs/
- **Đóng góp**: ./CONTRIBUTING.md
- **Vấn đề tốt cho người mới**: https://github.com/lingdojo/kana-dojo/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22

## Tính năng chính

- **Ba Phòng Tập (Dojo)** — Kana (Hiragana/Katakana), Kanji (JLPT N5-N1), và Từ vựng
- **Bốn Chế độ Chơi** — Chọn, Chọn Ngược, Nhập liệu, và Nhập liệu Ngược để đa dạng hóa luyện tập
- **100+ Chủ đề** — Các chủ đề sáng và tối đẹp mắt với 28 phông chữ tiếng Nhật
- **Theo dõi Tiến độ** — Thống kê, chuỗi ngày liên tục (streaks), và hơn 80 thành tựu
- **Hoàn toàn Tương thích** — Hoạt động mượt mà trên máy tính để bàn, máy tính bảng và điện thoại di động

## Bắt đầu nhanh

```bash
git clone https://github.com/lingdojo/kanadojo.git
cd kanadojo
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để bắt đầu học.

Để kiểm tra các thay đổi trước khi mở PR:

```bash
npm run check
```

> **Gặp vấn đề?** Xem [Hướng dẫn Khắc phục sự cố](./docs/TROUBLESHOOTING.md)

## Ảnh chụp màn hình

<div align="center">

### Trang chủ

![Home](https://github.com/user-attachments/assets/cac78e72-4d31-43e8-8160-104c431e55be)

### Luyện tập

![Training](https://github.com/user-attachments/assets/053020ef-77c7-492b-b8db-c381d1ec7db8)

### Chủ đề & Tùy biến

![Themes](https://github.com/user-attachments/assets/f664a280-0344-4ff9-8639-83f9c1c4223b)

</div>

## Tài liệu

| Tài liệu                                         | Mô tả                                        |
| ------------------------------------------------ | -------------------------------------------- |
| [Kiến trúc](./docs/ARCHITECTURE.md)              | Cấu trúc dự án, mẫu thiết kế và quy ước      |
| [Thiết kế UI](./docs/UI_DESIGN.md)               | Chủ đề, kiểu dáng và hướng dẫn về component  |
| [Hướng dẫn Dịch thuật](./docs/TRANSLATION_GUIDE.md) | Cách dịch ứng dụng                        |
| [Khắc phục sự cố](./docs/TROUBLESHOOTING.md)     | Các vấn đề thường gặp và giải pháp           |
| [Tất cả Tài liệu](./docs/)                       | Mục lục tài liệu đầy đủ                      |

## Công nghệ sử dụng

Next.js 15 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Zustand · Framer Motion

> Xem [tài liệu Kiến trúc](./docs/ARCHITECTURE.md) để biết chi tiết kỹ thuật đầy đủ.

## Đóng góp

Hoan nghênh mọi đóng góp! Cho dù bạn đang sửa lỗi, thêm tính năng, cải thiện tài liệu hay dịch thuật — hãy xem [CONTRIBUTING.md](./CONTRIBUTING.md) để bắt đầu.

## Lịch sử Star

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=lingdojo/kana-dojo&type=Date)](https://star-history.com/#lingdojo/kana-dojo&Date)

</div>

## Giấy phép

Dự án này được cấp phép theo Giấy phép AGPL 3.0 — xem [LICENSE.md](./LICENSE.md) để biết chi tiết.

## Liên kết

- **Trang web**: [kanadojo.com](https://kanadojo.com)
- **Kho lưu trữ**: [github.com/lingdojo/kanadojo](https://github.com/lingdojo/kanadojo)
- **Email**: dev@kanadojo.com

---

<div align="center">

**Được thực hiện với ❤️ dành cho người học tiếng Nhật trên toàn thế giới**

がんばって！ (Ganbatte! — Cố gắng lên!)

[⬆ Về đầu trang](#top)

</div>
