# MonKeypad Beta - Production-ready package

This is a clean React + Vite project for MonKeypad Beta.

Quick start (local):

```bash
npm install
npm run dev
```

Deploying to Vercel:
1. Push the project to GitHub (repo root must contain package.json).
2. In Vercel import the repo, select Framework: Vite.
3. Build command: `npm run build` and Output: `dist`.

Notes:
- Wallet connect uses injected provider (MetaMask/Coinbase/Rabby/OKX). No on-chain payments in Beta.
- Local leaderboard and profile data stored in localStorage.
