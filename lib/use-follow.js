'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { FOLLOW_KEY, newGoal, newHabit, periodKey } from 'lib/follow';

const EMPTY = { goals: [], habits: [], checkins: [] };
const listeners = new Set();
let snapshot = EMPTY;
let loaded = false;

function readStorage() {
    try {
        const raw = localStorage.getItem(FOLLOW_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && Array.isArray(parsed.goals)) return parsed;
    } catch {}
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
        localStorage.setItem(FOLLOW_KEY, JSON.stringify(snapshot));
    } catch {}
    emit();
}

function subscribe(listener) {
    listeners.add(listener);
    const onStorage = (e) => {
        if (e.key === FOLLOW_KEY) {
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

export function useFollow() {
    const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const ready = useSyncExternalStore(subscribeReady, getReady, getReadyServer);

    // Returns the new goal id so callers can navigate to it.
    const addGoal = useCallback((activityId, activityName, title, habitDefs) => {
        const goal = newGoal({ activityId, activityName, title });
        const habits = habitDefs.map((h) => newHabit({ goalId: goal.id, title: h.title, frequency: h.frequency }));
        update((s) => ({ ...s, goals: [...s.goals, goal], habits: [...s.habits, ...habits] }));
        return goal.id;
    }, []);

    const renameGoal = useCallback((goalId, title) => {
        update((s) => ({ ...s, goals: s.goals.map((g) => (g.id === goalId ? { ...g, title } : g)) }));
    }, []);

    const addHabit = useCallback((goalId, title, frequency = 'daily') => {
        const t = title?.trim();
        if (!t) return;
        update((s) => ({ ...s, habits: [...s.habits, newHabit({ goalId, title: t, frequency })] }));
    }, []);

    const updateHabit = useCallback((habitId, fields) => {
        update((s) => ({ ...s, habits: s.habits.map((h) => (h.id === habitId ? { ...h, ...fields } : h)) }));
    }, []);

    const removeHabit = useCallback((habitId) => {
        update((s) => ({
            ...s,
            habits: s.habits.filter((h) => h.id !== habitId),
            checkins: s.checkins.filter((c) => c.habitId !== habitId)
        }));
    }, []);

    const removeGoal = useCallback((goalId) => {
        update((s) => {
            const goalHabitIds = new Set(s.habits.filter((h) => h.goalId === goalId).map((h) => h.id));
            return {
                ...s,
                goals: s.goals.filter((g) => g.id !== goalId),
                habits: s.habits.filter((h) => h.goalId !== goalId),
                checkins: s.checkins.filter((c) => !goalHabitIds.has(c.habitId))
            };
        });
    }, []);

    const toggleCheckin = useCallback((habitId, frequency) => {
        const key = periodKey(frequency);
        update((s) => {
            const exists = s.checkins.some((c) => c.habitId === habitId && c.date === key);
            return {
                ...s,
                checkins: exists
                    ? s.checkins.filter((c) => !(c.habitId === habitId && c.date === key))
                    : [...s.checkins, { habitId, date: key }]
            };
        });
    }, []);

    return { ...state, ready, addGoal, renameGoal, removeGoal, addHabit, updateHabit, removeHabit, toggleCheckin };
}
