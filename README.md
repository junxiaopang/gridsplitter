# Gridsplitter

Gridsplitter 是一个强大的图片分割与 AI 提示词辅助工具，专为社交媒体创作者设计。它可以帮助你轻松将图片切割成九宫格（3x3）、4x6 等多种网格形式，完美适配朋友圈、Instagram 等平台。同时，它还集成了 AI 提示词，助你快速创作。

简体中文版 ｜ [English](README_en.md)

演示地址：[https://cut.kkkm.cn](https://cut.kkkm.cn)

## ✨ 主要功能

- **智能图片分割**：

  - 支持多种网格布局：3x3 (九宫格), 4x4, 4x6, 3x8 等。
  - 自定义行列数，灵活调整。
  - 实时预览分割效果。

- **图片编辑与处理**：

  - **裁剪工具**：内置图片裁剪功能，自由调整构图。
  - **独立调整**：支持对分割后的每一张小图进行单独编辑、缩放和移动。

- **AI 辅助创作**：

  - 集成 Prompt 生成器，辅助生成绘画或文案提示词。
  - 预设多种大模型和工具链接 (Gemini, Midjourney 等)。

- **便捷导出**：

  - 一键打包下载所有切片图片 (ZIP 格式)。
  - 高清无损导出。

- **用户体验**：
  - **深色/浅色模式**：自动或手动切换，舒适护眼。
  - **多语言支持**：支持中文和英文界面。
  - 响应式设计，完美适配桌面和移动端。

## 🛠 技术栈

本项目基于现代前端技术栈构建：

- [React 19](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [Vite](https://vitejs.dev/) - 极速的前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - 提供静态类型检查
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide React](https://lucide.dev/) -由于美观一致的图标库
- [JSZip](https://stuk.github.io/jszip/) - 用于打包下载图片

## 🚀 快速开始

### 环境要求

- Node.js (推荐 v18 或更高版本)
- pnpm (推荐) 或 npm/yarn

### 安装

1. 克隆项目到本地：

   ```bash
   git clone https://github.com/junxiaopang/gridsplitter.git
   cd gridsplitter
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

### 运行开发服务器

```bash
pnpm dev
```

运行成功后，在浏览器访问 `http://localhost:3000` 即可开始使用。

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

## 📄 许可证

[MIT License](LICENSE)
