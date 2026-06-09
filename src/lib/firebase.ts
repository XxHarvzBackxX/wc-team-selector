import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  remove,
  Database,
} from "firebase/database";
import { DrawState, TeamResult } from "@/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _db: Database | null = null;

function getDB(): Database {
  if (!_db) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    _db = getDatabase(_app);
  }
  return _db;
}

const DRAW_REF = "draw";

export async function startDraw(
  results: Record<string, TeamResult>,
  revealOrder: string[]
): Promise<void> {
  await set(ref(getDB(), DRAW_REF), {
    status: "running",
    currentRevealIndex: -1,
    revealOrder,
    results,
  });
}

export async function advanceReveal(nextIndex: number): Promise<void> {
  await update(ref(getDB(), DRAW_REF), { currentRevealIndex: nextIndex });
}

export async function completeDraw(): Promise<void> {
  await update(ref(getDB(), DRAW_REF), { status: "complete" });
}

export async function resetDraw(): Promise<void> {
  await remove(ref(getDB(), DRAW_REF));
}

export function subscribeToDrawState(
  callback: (state: DrawState | null) => void,
  onError?: (err: Error) => void
): () => void {
  const drawRef = ref(getDB(), DRAW_REF);
  // onValue returns the unsubscribe fn directly in Firebase v9+ modular API
  const unsubscribe = onValue(
    drawRef,
    (snapshot) => {
      callback(snapshot.exists() ? (snapshot.val() as DrawState) : null);
    },
    (err) => {
      console.error("Firebase subscription error:", err);
      onError?.(err);
    }
  );
  return unsubscribe;
}
