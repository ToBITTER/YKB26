# BALLER

> How well do you really know football?

BALLER is a mobile-first football knowledge game. Players can begin instantly as guests, play distinct challenges, earn XP, level up, build streaks, unlock badges and share results.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env` and set `DATABASE_URL` before using accounts.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Deploy on Vercel

Import the repository, select Next.js and use the repository root as the root directory. The standard `npm install` and `npm run build` commands work without environment variables or paid services.

BALLER stores guest progression in browser `localStorage` and registered identities/sessions in PostgreSQL. It deliberately does not present invented leaderboard users. Gameplay-stat synchronization can be added to the database adapter when cross-device progression is required.

## PostgreSQL accounts on Render

BALLER uses PostgreSQL for registered users and login sessions. Passwords are never encrypted or stored as plaintext: bcrypt stores a salted, one-way hash with work factor 12. Random session tokens are sent only through an HttpOnly cookie and only their SHA-256 hashes are retained in PostgreSQL.

1. In Render, create a PostgreSQL database.
2. Copy its **Internal Database URL**.
3. Open the BALLER Web Service → Environment and add `DATABASE_URL` with that URL.
4. Use `npm ci && npm run build` as the build command.
5. Use `npm start` as the start command. This runs `prisma migrate deploy` before starting Next.js.
6. Redeploy, then open `/account` to register.

For local development:

```bash
copy .env.example .env
npm run db:migrate
npm run dev
```

Replace the sample URL in `.env` with your real local or hosted PostgreSQL URL. Never commit `.env`.

## Implemented MVP

- Who’s That Baller
- Career Path
- Head-to-Head
- Football Connections
- Nigeria Mode
- Deterministic Daily Baller
- Lightweight The XI squad selection
- Club and competition challenge entry points
- XP, levels, daily/game streaks and badges
- Guest profile and Football DNA
- Honest device-local leaderboard
- Browser share/copy results
- Responsive desktop and native-style mobile navigation
- Reduced-motion and keyboard-focus accessibility

## Data

The main bank contains **3,125 questions generated from 315 player records** retrieved from TheSportsDB and verified on **2026-08-25**. Every generated question stores its source name, source URL, provider record ID and verification date. The manifest is in `data/question-bank-manifest.json`.

Refresh and rebuild the bank with:

```bash
npm run data:refresh
```

The refresh script respects the documented free-tier request limit, rejects incomplete records, deduplicates players and refuses to publish fewer than 2,000 valid questions. Current-club and squad-number questions explicitly include their verification date because those facts can change.
# Trivia attribution

Qetsiyah's private quiz includes data from [Open Trivia DB](https://opentdb.com/), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
