# FIFA World Cup 2026 Sweepstakes

A live sweepstakes draw app built with **Next.js** + **Firebase Realtime Database**, deployed to **Vercel**.

Each company team is randomly assigned one **major** FIFA nation and one **minor** FIFA nation, keeping results fair. The draw is revealed live with a slot-machine animation that all viewers see simultaneously.

---

## Setup

### 1. Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Realtime Database** (start in test mode, then lock down rules — see below).
3. In **Project Settings → Your apps**, register a Web app and copy the config values.

**Recommended Realtime Database rules** (allow public reads, restrict writes):
```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "draw": {
      ".write": true
    }
  }
}
```
> For production, restrict writes further using a secret or Firebase Auth.

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime Database URL |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_ADMIN_SECRET` | Secret for the admin panel URL |

### 3. Customise teams

Edit **`src/lib/teams.ts`** to set your actual company team names and FIFA WC 2026 nation lists:

```ts
export const COMPANY_TEAMS = ["Alice", "Bob", "Charlie", ...];
export const MAJOR_TEAMS   = ["Brazil", "Argentina", ...];
export const MINOR_TEAMS   = ["Morocco", "Japan", ...];
```

All three arrays **must be the same length** (up to 16 entries).

### 4. Run locally

```bash
npm install
npm run dev
```

### 5. Deploy to Vercel

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com/).
3. Add all `NEXT_PUBLIC_*` environment variables in Vercel project settings.
4. Deploy!

---

## Usage

| Role | URL |
|---|---|
| Viewer | `https://your-app.vercel.app/` |
| Admin | `https://your-app.vercel.app/?admin=<NEXT_PUBLIC_ADMIN_SECRET>` |

The **admin** sees a panel to **Start Draw** or **Reset**. All other viewers see the live slot-machine reveal in real time via Firebase.
