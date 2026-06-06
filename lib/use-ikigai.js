'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { STORAGE_KEY, newActivity } from 'lib/ikigai';

// A tiny external store backed by localStorage. Using useSyncExternalStore keeps
// hydration correct (empty on the server, real data on the client) without
// calling setState inside an effect.
const EMPTY = [];
const listeners = new Set();
let snapshot = EMPTY; // current activities; reference only changes on real updates
let loaded = false;

function readStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return Array.isArray(parsed?.activities) ? parsed.activities : EMPTY;
    } catch {
        return EMPTY;
    }
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
    for (const listener of listeners) listener();
}

function update(updater) {
    ensureLoaded();
    snapshot = updater(snapshot);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: snapshot, updatedAt: Date.now() }));
    } catch {
        // Storage may be unavailable; the in-memory snapshot still drives the UI.
    }
    emit();
}

function subscribe(listener) {
    listeners.add(listener);
    const onStorage = (event) => {
        if (event.key === STORAGE_KEY) {
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

// Server renders "not ready"; the client flips to ready after hydration.
const subscribeReady = () => () => {};
const getReady = () => true;
const getReadyServer = () => false;

export function useIkigai() {
    const activities = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const ready = useSyncExternalStore(subscribeReady, getReady, getReadyServer);

    const addActivity = useCallback((name) => {
        const trimmed = name?.trim();
        if (!trimmed) return;
        update((prev) => [...prev, newActivity(trimmed)]);
    }, []);

    const removeActivity = useCallback((id) => {
        update((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const renameActivity = useCallback((id, name) => {
        update((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
    }, []);

    const toggleDim = useCallback((id, dim) => {
        update((prev) => prev.map((a) => (a.id === id ? { ...a, [dim]: !a[dim] } : a)));
    }, []);

    const reset = useCallback(() => update(() => EMPTY), []);

    return { activities, ready, addActivity, removeActivity, renameActivity, toggleDim, reset };
}
