# Level Up 45

A responsive React + Vite + Tailwind habit tracker for a 45-day personal challenge.

## Features
- Overview dashboard with challenge day, today's completion, streak and overall progress
- Daily habit check-ins and optional notes
- Weekly completion chart and per-week summaries
- 45-day calendar
- Editable challenge start date
- LocalStorage persistence
- JSON backup and restore
- Responsive laptop and mobile layout

## Requirements
- Node.js 18+ (Node.js 20 LTS recommended)
- npm

## Run locally

1. Extract the ZIP.
2. Open the `level-up-45` folder in VS Code.
3. Open Terminal in that folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Start your own Day 1
Open **Settings → Challenge start date** and choose the date you want to begin. The default is the current date when the app is first opened.

## Data and privacy
Entries are saved in LocalStorage in the browser on that device. They are not synced between devices. Use **Settings → Download my backup** regularly if you want a copy, and **Restore backup** to bring it back.

## Build for deployment

```bash
npm run build
```

The production site is generated in `dist/`. You can deploy this folder to Vercel or connect the project repository to Vercel. For Vercel, the framework preset is Vite, build command is `npm run build`, and output directory is `dist`.

## Notes
- This starter intentionally does not include weight, calorie, body-measurement or restrictive diet tracking.
- The six habits are editable in `src/App.jsx` in the `HABITS` array.
