import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";
import { DrawState, TeamResult } from "@/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

function getDB(): Firestore {
  if (!_db) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    _db = getFirestore(_app);
  }
  return _db;
}

const drawDoc = () => doc(getDB(), "draws", "current");

export async function startDraw(
  results: Record<string, TeamResult>,
  revealOrder: string[]
): Promise<void> {
  await setDoc(drawDoc(), {
    status: "running",
    currentRevealIndex: -1,
    revealOrder,
    results,
  });
}

export async function advanceReveal(nextIndex: number): Promise<void> {
  await updateDoc(drawDoc(), { currentRevealIndex: nextIndex });
}

export async function completeDraw(): Promise<void> {
  await updateDoc(drawDoc(), { status: "complete" });
}

export async function resetDraw(): Promise<void> {
  await deleteDoc(drawDoc());
}

export function subscribeToDrawState(
  callback: (state: DrawState | null) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    drawDoc(),
    (snapshot) => {
      callback(snapshot.exists() ? (snapshot.data() as DrawState) : null);
    },
    (err) => {
      console.error("Firestore error:", err);
      onError?.(err);
    }
  );
}

// ─── Presence / viewer count ──────────────────────────────────────────────────

const presenceDoc = (id: string) => doc(getDB(), "presence", id);
const presenceCollection = () => collection(getDB(), "presence");

// Heartbeat interval — keeps the presence doc fresh
const HEARTBEAT_MS = 30_000;

export async function joinPresence(sessionId: string): Promise<void> {
  await setDoc(presenceDoc(sessionId), { lastSeen: serverTimestamp() });
}

export async function leavePresence(sessionId: string): Promise<void> {
  await deleteDoc(presenceDoc(sessionId));
}

export function startPresenceHeartbeat(sessionId: string): () => void {
  const interval = setInterval(() => {
    setDoc(presenceDoc(sessionId), { lastSeen: serverTimestamp() }).catch(() => {});
  }, HEARTBEAT_MS);
  return () => clearInterval(interval);
}

export function subscribeToViewerCount(callback: (count: number) => void): () => void {
  return onSnapshot(
    presenceCollection(),
    (snapshot) => callback(snapshot.size),
    (err) => console.error("Presence snapshot error:", err)
  );
}
