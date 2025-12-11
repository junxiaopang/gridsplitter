# Gridsplitter

Gridsplitter is a powerful image splitting and AI prompt assistant tool designed for social media creators. It helps you easily slice images into various grid formats such as 3x3 (Nine-Grid), 4x6, and more, perfectly adapting to platforms like WeChat Moments, Instagram, etc. Additionally, it integrates AI prompt generation to help you create content quickly.

English ｜ [简体中文版](README.md)

## ✨ Key Features

- **Smart Image Splitting**:

  - Supports multiple grid layouts: 3x3 (Nine-Grid), 4x4, 4x6, 3x8, etc.
  - Customizable number of rows and columns for flexible adjustment.
  - Real-time preview of splitting effects.

- **Image Editing & Processing**:

  - **Crop Tool**: Built-in image cropping to freely adjust composition.
  - **Independent Adjustment**: Supports individual editing, scaling, and moving of each sliced image.

- **AI Creative Assistance**:

  - Integrated Prompt Generator to assist in creating painting or copywriting prompts.
  - Preset links to various large models and tools (Gemini, Midjourney, etc.).

- **Easy Export**:

  - One-click download of all slices as a ZIP package.
  - High-definition lossless export.

- **User Experience**:
  - **Dark/Light Mode**: Automatic or manual switching for eye comfort.
  - **Multi-language Support**: Supports both Chinese and English interfaces.
  - Responsive design, perfectly adapted for desktop and mobile.

## 🛠 Tech Stack

This project is built with a modern frontend technology stack:

- [React 19](https://react.dev/) - The library for web and native user interfaces
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icon library
- [JSZip](https://stuk.github.io/jszip/) - Create, read and edit .zip files with Javascript

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/junxiaopang/gridsplitter.git
   cd gridsplitter
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Run Development Server

```bash
pnpm dev
```

Once running, visit `http://localhost:3000` in your browser to start using it.

### Build for Production

```bash
pnpm build
```

The build artifacts will be output to the `dist` directory.

## 📄 License

[MIT License](LICENSE)
