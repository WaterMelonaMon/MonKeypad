# MonKeypad Beta - Ready for Vercel

This is a React + Vite project for MonKeypad Beta — training Web3 users to type faster.

Features:
- Home page with pitch and Start Training button
- Practice & Test modes
- Optional wallet connect (injected wallets only for now)
- Local leaderboard, XP, streak stored in localStorage
- Downloadable printable certificate (open print dialog)
- Share to X (tweet) button

## How to run locally
1. unzip the project
2. npm install
3. npm run dev
4. Open http://localhost:5173

## Deploy to Vercel
1. Push this folder to GitHub
2. Create project on Vercel -> Import Git Repository
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
