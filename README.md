# FitFlow OS

FitFlow OS is a mobile-first Personal Fitness Command Center built with React, Tailwind CSS, and Supabase.

## Features

- **Dashboard:** Quick access to external fitness apps and shortcuts.
- **Workout Mode:** dedicated interface for tracking workouts.
- **Habit Tracking:** Monitor daily habits and streaks.
- **Gamification:** XP and leveling system to keep you motivated.
- **PWA Support:** Installable on mobile devices.

## Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```

## Deployment to GitHub Pages

This repository is configured to deploy automatically via GitHub Actions.

### Setup Instructions

1.  **Push the code to GitHub**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

2.  **Enable GitHub Actions Deployment**:
    *   Go to your GitHub repository.
    *   Navigate to **Settings** > **Pages**.
    *   Under **Build and deployment** > **Source**, select **GitHub Actions**.
    *   No further configuration is needed. The pre-configured workflow (`.github/workflows/deploy.yml`) will handle the build and deployment.

3.  **Trigger Deployment**:
    *   The deployment triggers automatically on every push to the `main` branch.
    *   You can also manually trigger it from the **Actions** tab in your repository.

Your app will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`.
