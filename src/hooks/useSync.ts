import { useState, useEffect, useRef, useCallback } from "react";
import type { TaggedItem, Combo, CostsMap, ExcludedPart, ManualPart } from "../data/types";
import {
  auth,
  db,
  signInAnonymously,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "../lib/firebase";
import type { Unsubscribe } from "../lib/firebase";

// ---------------------------------------------------------------------------
// Sync Code generation
// ---------------------------------------------------------------------------

/** 31-character alphabet: A-Z and 2-9 (excludes ambiguous 0/O/1/I/L) */
const SYNC_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const SYNC_CODE_REGEX = /^BEY-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const MAX_COLLISION_RETRIES = 5;

/**
 * Generate a random 4-character segment using the sync alphabet.
 * ~852M namespace (31^8), birthday-paradox safe for millions of rooms.
 */
function randomSegment(): string {
  let result = "";
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * SYNC_ALPHABET.length);
    result += SYNC_ALPHABET[idx];
  }
  return result;
}

/** Generate a full sync code: BEY-{A4}-{B4} */
function generateSyncCode(): string {
  return `BEY-${randomSegment()}-${randomSegment()}`;
}

/** Validate sync code format: BEY-{A4}-{B4} */
export function isValidSyncCode(code: string): boolean {
  return SYNC_CODE_REGEX.test(code);
}

// ---------------------------------------------------------------------------
// Firestore room document shape
// ---------------------------------------------------------------------------

interface RoomData {
  tags: TaggedItem[];
  combos: Combo[];
  costs: CostsMap;
  currency: string;
  excludedParts: ExcludedPart[];
  manualParts: ManualPart[];
  weights: Record<string, number>;
  updatedAt: number; // Date.now() for comparison
  createdBy: string; // uid from anonymous auth
}

// ---------------------------------------------------------------------------
// Hook options — decouples useSync from useInventory internals
// ---------------------------------------------------------------------------

export interface UseSyncOptions {
  /** Get current tags from local state */
  getTags: () => TaggedItem[];
  /** Get current combos from local state */
  getCombos: () => Combo[];
  /** Get current costs map from local state */
  getCosts: () => CostsMap;
  /** Get current currency from local state */
  getCurrency: () => string;
  /** Get current excludedParts from local state */
  getExcludedParts: () => ExcludedPart[];
  /** Get current manualParts from local state */
  getManualParts: () => ManualPart[];
  /** Get current weights from local state */
  getWeights: () => Record<string, number>;
  /** Called when remote data arrives — merge into local state */
  onRemoteData: (data: { tags: TaggedItem[]; combos: Combo[]; costs: CostsMap; currency: string; excludedParts: ExcludedPart[]; manualParts: ManualPart[]; weights: Record<string, number> }) => void;
  /** Store sync code in app data */
  setSyncCode: (code: string | null) => void;
  /** Store uid in app data */
  setUid: (uid: string | null) => void;
  /** Get the current lastCloudSync timestamp */
  getLastCloudSync: () => string | null;
  /** Update lastCloudSync timestamp */
  setLastCloudSync: (ts: string | null) => void;
  /** Get persisted sync code (for reconnect on refresh) */
  getSyncCode: () => string;
  /** Get persisted uid (for reconnect on refresh) */
  getUid: () => string;
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type SyncStatus = "disconnected" | "connecting" | "connected" | "error";

// ---------------------------------------------------------------------------
// useSync hook
// ---------------------------------------------------------------------------

export function useSync(opts: UseSyncOptions): {
  status: SyncStatus;
  syncCode: string | null;
  generateCode: () => Promise<void>;
  enterCode: (code: string) => Promise<void>;
  disconnect: () => void;
  error: string | null;
} {
  // Initialize syncCode from persisted AppData so we can reconnect on refresh
  const persistedCode = opts.getSyncCode();
  const [status, setStatus] = useState<SyncStatus>(persistedCode ? "connecting" : "disconnected");
  const [syncCode, setSyncCodeInternal] = useState<string | null>(persistedCode || null);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const uidRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const syncCodeRef = useRef<string | null>(null);

  // Track whether we're currently writing to avoid echo loops
  const writingRef = useRef(false);

  // Debounce timer ref for writes
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a stable ref to opts so callbacks don't go stale
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  // Keep syncCode in a ref for the debounced write closure
  useEffect(() => {
    syncCodeRef.current = syncCode;
  }, [syncCode]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (writeTimerRef.current) {
        clearTimeout(writeTimerRef.current);
      }
    };
  }, []);

  // -----------------------------------------------------------------------
  // Subscribe to a room document
  // -----------------------------------------------------------------------
  const subscribeToRoom = useCallback((code: string) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const roomRef = doc(db, "rooms", code);

    unsubscribeRef.current = onSnapshot(roomRef, (snap) => {
      if (!mountedRef.current) return;
      if (writingRef.current) return;

      const data = snap.data() as RoomData | undefined;
      if (!data) return;

      const localLastSync = optsRef.current.getLastCloudSync();
      const remoteUpdated = data.updatedAt;

      if (localLastSync && Number(localLastSync) >= remoteUpdated) return;

      optsRef.current.onRemoteData({ tags: data.tags, combos: data.combos, costs: data.costs ?? {}, currency: data.currency ?? "HKD", excludedParts: data.excludedParts ?? [], manualParts: data.manualParts ?? [], weights: data.weights ?? {} });
      dataHashRef.current = JSON.stringify({ t: data.tags, c: data.combos, costs: data.costs, currency: data.currency, excl: data.excludedParts, man: data.manualParts, w: data.weights });
      optsRef.current.setLastCloudSync(String(remoteUpdated));
    });
  }, []);

  // -----------------------------------------------------------------------
  // Flush pending writes before page unload (prevents data loss on tab close)
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (writeTimerRef.current && syncCodeRef.current && uidRef.current) {
        // Cancel the debounce timer and flush immediately
        clearTimeout(writeTimerRef.current);
        writeTimerRef.current = null;

        const tags = optsRef.current.getTags();
        const combos = optsRef.current.getCombos();
        const costs = optsRef.current.getCosts();
        const currency = optsRef.current.getCurrency();
        const excludedParts = optsRef.current.getExcludedParts();
        const manualParts = optsRef.current.getManualParts();
        const weights = optsRef.current.getWeights();
        // Always write if we have a sync room — costs/currency may be the only data
        if (tags.length > 0 || combos.length > 0 || Object.keys(costs).length > 0 || excludedParts.length > 0 || manualParts.length > 0 || Object.keys(weights).length > 0) {
          const roomData: RoomData = {
            tags,
            combos,
            costs,
            currency,
            excludedParts,
            manualParts,
            weights,
            updatedAt: Date.now(),
            createdBy: uidRef.current,
          };
          const roomRef = doc(db, "rooms", syncCodeRef.current);
          setDoc(roomRef, roomData).catch(() => {
            // Best-effort write — if it fails, localStorage has the data
          });
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // -----------------------------------------------------------------------
  // Auto-reconnect on mount if we have a persisted sync code
  // -----------------------------------------------------------------------
  useEffect(() => {
    const code = optsRef.current.getSyncCode();
    if (!code) return;

    // We have a persisted code — reconnect
    setStatus("connecting");

    (async () => {
      try {
        // Re-authenticate (anonymous — new session but same room)
        const cred = await signInAnonymously(auth);
        uidRef.current = cred.user.uid;
        syncCodeRef.current = code;
        optsRef.current.setUid(cred.user.uid);

        // Fetch current room data
        const roomRef = doc(db, "rooms", code);
        const snap = await getDoc(roomRef);

        if (!snap.exists()) {
          // Room was deleted — clear sync state
          setError("Sync room no longer exists.");
          setStatus("error");
          optsRef.current.setSyncCode(null);
          optsRef.current.setUid(null);
          optsRef.current.setLastCloudSync(null);
          setSyncCodeInternal(null);
          syncCodeRef.current = null;
          return;
        }

        // Room exists — reconnect
        setSyncCodeInternal(code);
        setStatus("connected");

        // Merge remote data (always merge on reconnect to pick up new fields like costs)
        const remoteData = snap.data() as RoomData;
        optsRef.current.onRemoteData({
          tags: remoteData.tags,
          combos: remoteData.combos,
          costs: remoteData.costs ?? {},
          currency: remoteData.currency ?? "HKD",
          excludedParts: remoteData.excludedParts ?? [],
          manualParts: remoteData.manualParts ?? [],
          weights: remoteData.weights ?? {},
        });
        dataHashRef.current = JSON.stringify({ t: remoteData.tags, c: remoteData.combos, costs: remoteData.costs, currency: remoteData.currency, excl: remoteData.excludedParts, man: remoteData.manualParts, w: remoteData.weights });
        optsRef.current.setLastCloudSync(String(remoteData.updatedAt));

        // Subscribe to real-time updates
        subscribeToRoom(code);
      } catch (err) {
        console.error("[useSync] auto-reconnect error:", err);
        setError("Failed to reconnect. Please try again.");
        setStatus("error");
      }
    })();
  }, [subscribeToRoom]);

  // -----------------------------------------------------------------------
  // Write local data to Firestore (debounced 3s)
  // -----------------------------------------------------------------------
  const flushToFirestore = useCallback(async () => {
    const code = syncCodeRef.current;
    const uid = uidRef.current;
    if (!code || !uid) return;

    const tags = optsRef.current.getTags();
    const combos = optsRef.current.getCombos();
    const costs = optsRef.current.getCosts();
    const currency = optsRef.current.getCurrency();
    const excludedParts = optsRef.current.getExcludedParts();
    const manualParts = optsRef.current.getManualParts();
    const weights = optsRef.current.getWeights();

    const roomData: RoomData = {
      tags,
      combos,
      costs,
      currency,
      excludedParts,
      manualParts,
      weights,
      updatedAt: Date.now(),
      createdBy: uid,
    };

    writingRef.current = true;
    try {
      // Use setDoc WITHOUT merge — we want to replace the entire document
      // so that deletions (items removed from tags/combos) are synced too.
      const roomRef = doc(db, "rooms", code);
      await setDoc(roomRef, roomData);
      optsRef.current.setLastCloudSync(String(roomData.updatedAt));
    } catch (err) {
      console.error("[useSync] write error:", err);
    } finally {
      // Delay resetting writingRef to avoid processing our own onSnapshot echo
      setTimeout(() => {
        writingRef.current = false;
      }, 1000);
    }
  }, []);

  const scheduleWrite = useCallback(() => {
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(() => {
      writeTimerRef.current = null;
      flushToFirestore();
    }, 3000);
  }, [flushToFirestore]);

  // Cancel any pending write
  const cancelWrite = useCallback(() => {
    if (writeTimerRef.current) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
  }, []);

  // -----------------------------------------------------------------------
  // Subscribe to a room document
  // -----------------------------------------------------------------------
  // We use a serialized hash of tags+combos to detect actual changes,
  // avoiding infinite loops from referential inequality.
  const tags = opts.getTags();
  const combos = opts.getCombos();
  const costs = opts.getCosts();
  const currency = opts.getCurrency();
  const excludedParts = opts.getExcludedParts();
  const manualParts = opts.getManualParts();
  const dataHash = JSON.stringify({ t: tags, c: combos, costs, currency, excl: excludedParts, man: manualParts, w: opts.getWeights() });
  const dataHashRef = useRef(dataHash);

  useEffect(() => {
    // Only write if we're connected
    if (status !== "connected" || !syncCode) return;
    // Only write if data actually changed
    if (dataHash === dataHashRef.current) return;
    // Don't write if we're still processing a remote update —
    // writingRef guards against onSnapshot echo, but also prevents
    // stale local state from overwriting remote data before React re-renders
    if (writingRef.current) return;

    dataHashRef.current = dataHash;
    scheduleWrite();
  }, [dataHash, status, syncCode, scheduleWrite]);

  // -----------------------------------------------------------------------
  // enterCode(code) — join an existing room
  // -----------------------------------------------------------------------
  const enterCode = useCallback(
    async (code: string) => {
      // Reset state
      setError(null);

      // Validate format
      const normalized = code.toUpperCase().trim();
      if (!isValidSyncCode(normalized)) {
        setError("Invalid sync code format. Expected: BEY-XXXX-XXXX");
        return;
      }

      setStatus("connecting");

      try {
        // Authenticate anonymously
        const cred = await signInAnonymously(auth);
        const uid = cred.user.uid;
        uidRef.current = uid;
        optsRef.current.setUid(uid);

        // Check if room exists
        const roomRef = doc(db, "rooms", normalized);
        const snap = await getDoc(roomRef);

        if (!snap.exists()) {
          setError("Room not found. Check the code and try again.");
          setStatus("error");
          return;
        }

        // Room exists — set sync code and subscribe
        setSyncCodeInternal(normalized);
        syncCodeRef.current = normalized;
        optsRef.current.setSyncCode(normalized);
        setStatus("connected");

        // Merge remote data into local
        const remoteData = snap.data() as RoomData;
        optsRef.current.onRemoteData({ tags: remoteData.tags, combos: remoteData.combos, costs: remoteData.costs ?? {}, currency: remoteData.currency ?? "HKD", excludedParts: remoteData.excludedParts ?? [], manualParts: remoteData.manualParts ?? [], weights: remoteData.weights ?? {} });
        dataHashRef.current = JSON.stringify({ t: remoteData.tags, c: remoteData.combos, costs: remoteData.costs, currency: remoteData.currency, excl: remoteData.excludedParts, man: remoteData.manualParts, w: remoteData.weights });
        optsRef.current.setLastCloudSync(String(remoteData.updatedAt));

        // Subscribe to real-time updates
        subscribeToRoom(normalized);
      } catch (err) {
        console.error("[useSync] enterCode error:", err);
        setError("Failed to connect. Please try again.");
        setStatus("error");
      }
    },
    [subscribeToRoom]
  );

  // -----------------------------------------------------------------------
  // generateCode() — create a new room
  // -----------------------------------------------------------------------
  const generateCode = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      // Authenticate anonymously
      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;
      uidRef.current = uid;
      optsRef.current.setUid(uid);

      // Try generating codes with collision retry
      let code = generateSyncCode();
      let attempts = 0;

      while (attempts < MAX_COLLISION_RETRIES) {
        const roomRef = doc(db, "rooms", code);
        const snap = await getDoc(roomRef);

        if (!snap.exists()) {
          // Room is free — create it
          const tags = optsRef.current.getTags();
          const combos = optsRef.current.getCombos();
          const costs = optsRef.current.getCosts();
          const currency = optsRef.current.getCurrency();
          const excludedParts = optsRef.current.getExcludedParts();
          const manualParts = optsRef.current.getManualParts();
          const weights = optsRef.current.getWeights();
          const roomData: RoomData = {
            tags,
            combos,
            costs,
            currency,
            excludedParts,
            manualParts,
            weights,
            updatedAt: Date.now(),
            createdBy: uid,
          };
          await setDoc(roomRef, roomData);

          // Set sync code and subscribe
          setSyncCodeInternal(code);
          syncCodeRef.current = code;
          optsRef.current.setSyncCode(code);
          optsRef.current.setLastCloudSync(String(roomData.updatedAt));
          setStatus("connected");

          // Update our hash tracker so we don't immediately schedule a write
          dataHashRef.current = JSON.stringify({ t: tags, c: combos, costs, currency, excl: excludedParts, man: manualParts, w: weights });

          // Mark as writing to ignore the initial onSnapshot echo
          writingRef.current = true;
          setTimeout(() => {
            writingRef.current = false;
          }, 2000);

          subscribeToRoom(code);
          return;
        }

        // Collision — try again
        attempts++;
        code = generateSyncCode();
      }

      // All retries exhausted
      setError("Could not generate a unique code. Please try again.");
      setStatus("error");
    } catch (err) {
      console.error("[useSync] generateCode error:", err);
      setError("Failed to generate code. Please try again.");
      setStatus("error");
    }
  }, [subscribeToRoom]);

  // -----------------------------------------------------------------------
  // disconnect() — leave the room
  // -----------------------------------------------------------------------
  const disconnect = useCallback(() => {
    // Unsubscribe from Firestore
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Cancel any pending writes
    cancelWrite();

    // Clear local state
    setSyncCodeInternal(null);
    syncCodeRef.current = null;
    uidRef.current = null;
    setStatus("disconnected");
    setError(null);

    // Clear persisted sync state
    optsRef.current.setSyncCode(null);
    optsRef.current.setUid(null);
    optsRef.current.setLastCloudSync(null);
  }, [cancelWrite]);

  return {
    status,
    syncCode,
    generateCode,
    enterCode,
    disconnect,
    error,
  };
}