# CraftCrops Launcher

A premium, modern React application designed as a conceptual launcher interface for 'CraftCrops' instances. Built with performance and aesthetics in mind, utilizing **React**, **Vite**, and **TailwindCSS**.

## 🚀 Features

*   **Dynamic Home Dashboard**: Immersive background effects that change based on the selected instance.
*   **Instance Management**: Create, edit, and delete instance configurations ("Crops") with version and loader management.
*   **Console Simulation**: Realistic scrolling terminal output simulation during game launch.
*   **Wardrobe System**: Interactive skin preview and library management.
*   **Quick Switcher**: Carousel-style navigation for rapid instance selection.
*   **Mock Identity System**: Support for multiple user accounts (Microsoft/Mojang/Offline).

## 🛠️ Technology Stack

*   **Core**: React 18, Vite
*   **Styling**: TailwindCSS (with custom animations and utility classes)
*   **Icons**: Lucide React

## 📂 Project Structure

```text
src/
├── components/
│   ├── common/       # Reusable UI atoms (Console, Cards, Ads)
│   ├── layout/       # App shell, Sidebar
│   └── modals/       # Dialogs for Login and Creation
├── data/             # Mock data sources
├── views/            # Main page content (Home, Instances, Wardrobe, etc.)
├── App.jsx           # Main application state and routing
└── index.css         # Tailwind directives and custom scrollbar styles
```

## ⚡ Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

## 🎨 Customizing

*   **Colors & Themes**: Configuration is handled in `tailwind.config.js` and `src/data/mockData.js`.
*   **Assets**: Place static assets in the `public` directory.

## 📄 License

This software is free to use and compile but **proprietary**.

*   ✅ **Allowed**: Download, Use, Compile.
*   ❌ **Prohibited**: Modification, Selling, Commercial Distribution.

See the [LICENSE](./LICENSE) file for full details.
