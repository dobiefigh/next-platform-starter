import { describe, it, expect } from 'vitest';
import { todayKey, weekKey, periodKey, prevPeriod, isDone, streakFor, goalStreak } from './follow';

// Build a local YYYY-MM-DD key offset from today, mirroring the app's logic.
function dayKey(offset) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('date keys', () => {
    it('todayKey is YYYY-MM-DD', () => {
        expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('weekKey is YYYY-Www', () => {
        expect(weekKey()).toMatch(/^\d{4}-W\d{2}$/);
    });

    it('periodKey switches on frequency', () => {
        expect(periodKey('daily')).toBe(todayKey());
        expect(periodKey('weekly')).toBe(weekKey());
    });

    it('prevPeriod steps back a day or a week', () => {
        expect(prevPeriod(todayKey(), 'daily')).toBe(dayKey(-1));
        expect(prevPeriod(weekKey(), 'weekly')).not.toBe(weekKey());
        expect(prevPeriod(weekKey(), 'weekly')).toMatch(/^\d{4}-W\d{2}$/);
    });
});

describe('isDone', () => {
    it('detects a check-in for the current period', () => {
        const checkins = [{ habitId: 'h1', date: todayKey() }];
        expect(isDone('h1', 'daily', checkins)).toBe(true);
        expect(isDone('h2', 'daily', checkins)).toBe(false);
    });
});

describe('streakFor', () => {
    it('counts consecutive days ending today', () => {
        const checkins = [
            { habitId: 'h1', date: dayKey(0) },
            { habitId: 'h1', date: dayKey(-1) },
            { habitId: 'h1', date: dayKey(-2) }
        ];
        expect(streakFor('h1', 'daily', checkins)).toBe(3);
    });

    it('is zero when today is missing', () => {
        const checkins = [{ habitId: 'h1', date: dayKey(-1) }];
        expect(streakFor('h1', 'daily', checkins)).toBe(0);
    });

    it('stops at the first gap', () => {
        const checkins = [
            { habitId: 'h1', date: dayKey(0) },
            { habitId: 'h1', date: dayKey(-2) }
        ];
        expect(streakFor('h1', 'daily', checkins)).toBe(1);
    });
});

describe('goalStreak', () => {
    const habits = [
        { id: 'a', goalId: 'g', frequency: 'daily' },
        { id: 'b', goalId: 'g', frequency: 'daily' }
    ];

    it('counts days where every daily habit was done', () => {
        const checkins = [
            { habitId: 'a', date: dayKey(0) },
            { habitId: 'b', date: dayKey(0) },
            { habitId: 'a', date: dayKey(-1) },
            { habitId: 'b', date: dayKey(-1) }
        ];
        expect(goalStreak('g', habits, checkins)).toBe(2);
    });

    it('is zero if any habit is incomplete today', () => {
        const checkins = [{ habitId: 'a', date: dayKey(0) }];
        expect(goalStreak('g', habits, checkins)).toBe(0);
    });

    it('does not mix daily and weekly units (weekly-only goal uses weeks)', () => {
        const weeklyHabits = [{ id: 'w', goalId: 'g2', frequency: 'weekly' }];
        const checkins = [{ habitId: 'w', date: weekKey() }];
        expect(goalStreak('g2', weeklyHabits, checkins)).toBe(1);
    });

    it('returns 0 for a goal with no habits', () => {
        expect(goalStreak('empty', [], [])).toBe(0);
    });
});
