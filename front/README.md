
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
4. Setup your environment variables:
   - Create a `.env` file in the root of the project.
   - Add the following environment variables:
     ```env
        VITE_BACKEND_URL=

        VITE_DISCORD_CLIENT_ID=
        VITE_DISCORD_REDIRECT_URI=
        VITE_DISCORD_AUTH_URL=
        VITE_BACKEND_CALLBACK_DISCORD_URL=
        VITE_DISCORD_SERVERS_FETCH_URL=
        VITE_DISCORD_CHANNELS_FETCH_URL=
        VITE_DISCORD_FETCH_USERID_URL=

        VITE_GITHUB_CLIENT_ID=
        VITE_GITHUB_REDIRECT_URI=
        VITE_BACKEND_GITHUB_CALLBACK_URL=
        VITE_GITHUB_PR_FETCH_URL=

        VITE_GOOGLE_CLIENT_ID=

        VITE_SPOTIFY_CLIENT_ID=
        VITE_SPOTIFY_REDIRECT_URI=
        VITE_BACKEND_SPOTIFY_CALLBACK_URL=

        VITE_TWITCH_CLIENT_ID=
        VITE_TWITCH_REDIRECT_URI=
        VITE_BACKEND_TWITCH_CALLBACK_URL=
     ```
5. Start the development server:
   ```bash
   npm run dev 
   ```
   OR
   ```bash
   npm start
   ```
   OR if you want to use docker go at the root of the repository and execute the following command :
   ```bash
   docker compose up
   ```
6. Open your browser and navigate to [http://localhost:8081](http://localhost:8081).

## NPM Scripts
```json
"scripts": {
  "start": "vite --port 8081",
  "dev": "vite --port 8081",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "mocha",
  "test-react": "mocha --require jsdom-global/register --require @babel/register --extensions js,jsx 'test/**/*.jsx'"
}
```

## Project Structure
```
AREA/front/
├── Dockerfile
├── README.md
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── public
│   ├── area.svg
│   └── vite.svg
├── src
│   ├── AREA.json
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
│   │       ├── Spotify.png
│   │       ├── Twitch.png
│   │       └── Weather.png
│   ├── common
│   │   ├── client
│   │   │   └── APIClient.js
│   │   └── constants
│   │       └── auth.js
│   ├── components
│   │   └── ui
│   │       └── SOME REACT COMPONENTS
│   ├── features
│   │   └── PAGES AND CUSTOM COMPONENTS
|   |
│   ├── hooks
│   │   └── use-toast.ts
│   ├── lib
│   │   └── utils.ts
│   └── main.jsx
├── tailwind.config.js
├── test
│   └── SOME TESTS
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.js
```

## Contributors
- [Baptiste Moreau](https://github.com/BxptisteM)
- [Klayni Milandou](https://github.com/Klayni)
