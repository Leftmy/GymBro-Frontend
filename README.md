# GymBro Frontend ⚛️🏋️‍♀️

Welcome to the **GymBro Frontend**! This repository contains the Single Page Application (SPA) for the GymBro app—an interactive, highly aesthetic, and feature-rich fitness companion. 

Designed with a premium dark mode layout, smooth transitions, and multi-language support, GymBro is built using React, Vite, and TailwindCSS 4, making it highly performant, responsive, and engaging.

---

## 🌟 Visual & Interactive Features

*   **⚡ Modern Dark Mode Dashboard:** A stunning, premium dark interface leveraging curated HSL palettes, smooth micro-animations, and clean typography.
*   **🧠 Gym Bro IQ (Interactive Anatomical Muscle Map):**
    *   Features a responsive, clickable anatomical SVG map (front and back views) mapping human muscle groups.
    *   Clicking a muscle highlights it in real-time and displays a list of targeting exercises.
    *   Includes a full search and filter directory for workouts and exercises.
*   **📋 Custom Workout Builder & Sessions:**
    *   Build personal routines by setting exercises, target reps, sets, and weights.
    *   **Active Workout Session Tracker:** Start a live gym session with an interactive, focused UI.
    *   **Gamified Success celebration:** Completion triggers a beautiful, interactive confetti burst (via `canvas-confetti`)!
*   **🤝 Gym Bros (Social Network & Sharing):**
    *   Send and receive "Bro Requests", manage active friends, and search user profiles.
    *   Directly assign workouts or routines to your bros to train together.
*   **🌐 Fully Internationalized (i18n):**
    *   Complete language switcher and browser language detection.
    *   Supports **English (EN)**, **Spanish (ES)**, and **Ukrainian (UK)** out of the box.
*   **📰 Fitness Blog:** Explore high-quality articles and educational posts about diet, routines, and training science.

---

## 🛠️ Technology Stack

*   **Core Library:** [React](https://react.dev/) 18 (TypeScript)
*   **Build Tooling & Bundler:** [Vite](https://vitejs.dev/) 6
*   **Routing:** [React Router](https://reactrouter.com/) 7
*   **Styling (CSS):** [TailwindCSS](https://tailwindcss.com/) 4.1.12 with advanced CSS nesting, and [Emotion](https://emotion.sh/)
*   **Icons & Components:** [Lucide Icons](https://lucide.dev/), [MUI Icons/Material](https://mui.com/), and [Radix UI Primatives](https://www.radix-ui.com/)
*   **Animations:** [Motion](https://motion.dev/) (Framer Motion)
*   **Analytics / Charts:** [Recharts](https://recharts.org/) (for weight/progress data visualizers)
*   **Effects:** `canvas-confetti` (for celebration states)
*   **Localization (i18n):** [i18next](https://www.i18next.com/) & `react-i18next`

---

## 📁 Repository Structure

```directory
GymBro-Frontend/
├── docs/                 # Documentation assets
├── src/
│   ├── app/              # Core Application Layer
│   │   ├── components/   # App-wide UI structures
│   │   ├── features/     # Feature-scoped modules
│   │   │   ├── auth/     # Signup, login, auth context, gate guards
│   │   │   ├── blog/     # Articles lists and post details
│   │   │   ├── bros/     # Friends, pending invitations, search
│   │   │   ├── gym/      # Workouts, custom creator, sessions
│   │   │   ├── iq/       # Anatomical maps (MusclesPage, ExercisesPage)
│   │   │   ├── messaging/# Social messenger components
│   │   │   └── user/     # User profile and stats settings
│   │   ├── pages/        # Route-level Page layouts
│   │   ├── services/     # Global API service requests
│   │   └── shared/       # Shared utils, hooks, i18n configurations, and types
│   ├── imports/          # SVGs, muscle-map visuals, and images
│   ├── styles/           # Global styles and tailwind settings
│   └── main.tsx          # React application entry point
├── index.html            # Main HTML document template
├── package.json          # Dependency packages
├── vite.config.ts        # Vite custom configurations
└── default_shadcn_theme.css # Shadcn preset configuration styles
```

---

## ⚡ Quick Start Guide

### Prerequisites

Make sure you have **Node.js (v18+)** installed. The project is pre-configured to build efficiently using either `npm` or `pnpm`.

### Installation Steps

1.  **Clone or navigate to the frontend folder:**
    ```bash
    cd GymBro-Frontend
    ```

2.  **Create a `.env` configuration file:**
    Create a `.env` file in the root of the folder and configure the API endpoint pointing to your local or deployed Django server:
    ```env
    VITE_API_URL=http://localhost:8000/api
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # Or if you use pnpm:
    pnpm install
    ```

4.  **Start the local development server:**
    ```bash
    npm run dev
    # Or if you use pnpm:
    pnpm dev
    ```
    The site will start instantly at `http://localhost:5173`. Open this URL in your browser to experience GymBro!

5.  **Build for Production:**
    To generate highly optimized build assets:
    ```bash
    npm run build
    # Or:
    pnpm build
    ```
    The static build outputs will be saved inside the `dist/` directory, ready to be hosted by Nginx or static host providers.

---

## 🎨 Theme & Customization

The project uses a custom UI palette focusing on a clean, professional aesthetic:
*   **Backgrounds:** HSL dark values (`#09090b` base) representing a premium midnight canvas.
*   **Accents:** Vibrantly balanced gradients and active highlighting borders.
*   **Typography:** Accessible and modern sans-serif typography.

Custom Tailwind directives can be configured directly inside `src/styles/` or the root `default_shadcn_theme.css` file.

Let's lift heavy and build together! ⚛️🏋️‍♀️
