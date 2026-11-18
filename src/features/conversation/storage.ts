import type { Artifact, Turn } from "@/shared/contracts";

export type LocalSession = { turns: Turn[]; artifacts: Artifact[]; locale: "en" | "fil" };
const dbName = "gigi-local";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("session");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSession(): Promise<LocalSession | null> {
  const db = await openDatabase();
  try { return await new Promise((resolve, reject) => { const tx = db.transaction("session", "readonly"); const req = tx.objectStore("session").get("current"); req.onsuccess = () => resolve((req.result as LocalSession) || null); req.onerror = () => reject(req.error); }); }
  finally { db.close(); }
}

export async function saveSession(session: LocalSession) {
  const db = await openDatabase();
  try { await new Promise<void>((resolve, reject) => { const tx = db.transaction("session", "readwrite"); tx.objectStore("session").put(session, "current"); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); }
  finally { db.close(); }
}

export async function clearSession() {
  const db = await openDatabase();
  try { await new Promise<void>((resolve, reject) => { const tx = db.transaction("session", "readwrite"); tx.objectStore("session").delete("current"); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); }
  finally { db.close(); }
}
