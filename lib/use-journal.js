'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { JOURNAL_KEY } from 'lib/journal';

// Journal entries keyed by date, persisted to localStorage (same pattern as the
// other stores: useSyncExternalStore keeps SSR hydration correct).
const EMPTY = {};
const listeners = new Set();
let snapshot = EMPTY;
let loaded = false;

function readStorage() {
    try {
        const raw = localStorage.getItem(JOURNAL_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && parsed.entries && typeof parsed.entries === 'object') return parsed.entries;
    } catch {
        // ignore
    }
    return EMPTY;
}

function ensureLoaded() {
    if (!loaded) {
        snapshot = readStorage();
        loaded = true;
    }
}

function getSnapshot() {
    ensureLoaded();
    return snapshot;
}

function getServerSnapshot() {
    return EMPTY;
}

function emit() {
    for (const l of listeners) l();
}

function update(updater) {
    ensureLoaded();
    snapshot = updater(snapshot);
    try {
        localStorage.setItem(JOURNAL_KEY, JSON.stringify({ entries: snapshot, updatedAt: Date.now() }));
    } catch {
        // ignore
    }
    emit();
}

function subscribe(listener) {
    listeners.add(listener);
    const onStorage = (e) => {
        if (e.key === JOURNAL_KEY) {
            snapshot = readStorage();
            emit();
        }
    };
    window.addEventListener('storage', onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
    };
}

const subscribeReady = () => () => {};
const getReady = () => true;
const getReadyServer = () => false;

export function useJournal() {
    const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const ready = useSyncExternalStore(subscribeReady, getReady, getReadyServer);

    const saveEntry = useCallback((date, data) => {
        update((prev) => ({ ...prev, [date]: { ...prev[date], ...data, date } }));
    }, []);

    const removeEntry = useCallback((date) => {
        update((prev) => {
            const next = { ...prev };
            delete next[date];
            return next;
        });
    }, []);

    return { entries, ready, saveEntry, removeEntry };
}
