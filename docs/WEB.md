
# AREA Project

## Overview
AREA is a web application built with ReactJS. It leverages modern libraries and frameworks to deliver a seamless and responsive user experience.

## Technologies Used
(more documentation can on this subject can be found in the [docs](../docs) folder)
- **Languages:**
  ![ReactJS](https://skillicons.dev/icons?i=react)
- **Libraries:**
  ![Shadcn UI](https://skillicons.dev/icons?i=tailwind)
  ![React Router](https://skillicons.dev/icons?i=react)
  ![React Toastify](https://skillicons.dev/icons?i=react)
  ![Tailwind CSS](https://skillicons.dev/icons?i=tailwind)
  ![Vite](https://skillicons.dev/icons?i=vite)

## How to Run the Project
1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to [http://localhost:8081](http://localhost:8081).

## NPM Scripts
```json
"scripts": {
  "dev": "vite --port 8081",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Project Structure
```
AREA/
├── README.md
├── eslint.config.js
├── node_modules
├── package.json
├── public
├── tailwind.config.js
├── tsconfig.json
├── vite.config.js
├── components.json
├── index.html
├── package-lock.json
├── postcss.config.js
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── app
│   │   ├── APIClient.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── Routes.jsx
│   │   └── index.css
│   ├── assets
│   │   ├── AREA.png
│   │   ├── google.png
│   │   ├── react.svg
│   │   └── services
│   │       ├── Discord.png
│   │       ├── Github.png
│   │       ├── Gmail.png
│   │       ├── Instagram.png
│   │       ├── Onedrive.png
│   │       └── Spotify.png
│   ├── common
│   │   ├── client
│   │   │   └── APIClient.js
│   │   └── constants
│   │       └── auth.js
│   ├── components
│   │   └── ui
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── features
│   │   ├── PAGES
│   └── lib
│       └── utils.ts
```

## Contributors
- [Baptiste Moreau](https://github.com/BxptisteM)
- [Klayni Milandou](https://github.com/Klayni)
