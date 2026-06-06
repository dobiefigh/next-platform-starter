// Follow phase: goals, habits, check-ins. Pure functions — safe to import anywhere.

export const FOLLOW_KEY = 'ikigai.follow.v1';

// Returns today's date string 'YYYY-MM-DD' in local time.
export function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Returns ISO week key 'YYYY-Www' for a given date string (or today).
export function weekKey(dateStr) {
    const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    d.setHours(0, 0, 0, 0);
    // Shift to nearest Thursday (ISO week anchor).
    const thursday = new Date(d);
    thursday.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(thursday.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((thursday - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// The key used to record a check-in for a given habit frequency.
export function periodKey(frequency) {
    return frequency === 'weekly' ? weekKey() : todayKey();
}

function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prevWeekKey(wk) {
    // 'YYYY-Www' → date in that week → subtract 7 days → weekKey
    const [year, weekStr] = wk.split('-W');
    const week = Number(weekStr);
    const jan4 = new Date(Number(year), 0, 4);
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const targetMonday = new Date(startOfWeek1.getTime() + (week - 1) * 7 * 86400000);
    const prevMonday = new Date(targetMonday.getTime() - 7 * 86400000);
    const ds = `${prevMonday.getFullYear()}-${String(prevMonday.getMonth() + 1).padStart(2, '0')}-${String(prevMonday.getDate()).padStart(2, '0')}`;
    return weekKey(ds);
}

export function prevPeriod(key, frequency) {
    return frequency === 'weekly' ? prevWeekKey(key) : addDays(key, -1);
}

export function isDone(habitId, frequency, checkins) {
    const key = periodKey(frequency);
    return checkins.some((c) => c.habitId === habitId && c.date === key);
}

// Consecutive completed periods ending with today/this-week, counting back.
export function streakFor(habitId, frequency, checkins) {
    const done = new Set(checkins.filter((c) => c.habitId === habitId).map((c) => c.date));
    let streak = 0;
    let period = periodKey(frequency);
    while (done.has(period)) {
        streak++;
        period = prevPeriod(period, frequency);
    }
    return streak;
}

export function habitsForGoal(goalId, habits) {
    return habits.filter((h) => h.goalId === goalId);
}

export function goalProgressToday(goalId, habits, checkins) {
    const hs = habitsForGoal(goalId, habits);
    if (hs.length === 0) return { done: 0, total: 0 };
    const done = hs.filter((h) => isDone(h.id, h.frequency, checkins)).length;
    return { done, total: hs.length };
}

// A goal's streak = consecutive periods (ending now) in which every habit of the
// goal's primary cadence was completed. Daily habits define the cadence when
// present, otherwise weekly — so days and weeks are never mixed into one number.
export function goalStreak(goalId, habits, checkins) {
    const hs = habitsForGoal(goalId, habits);
    if (hs.length === 0) return 0;
    const cadence = hs.some((h) => h.frequency !== 'weekly') ? 'daily' : 'weekly';
    const relevant = hs.filter((h) => (cadence === 'daily' ? h.frequency !== 'weekly' : true));
    const allDone = (period) => relevant.every((h) => checkins.some((c) => c.habitId === h.id && c.date === period));

    let streak = 0;
    let period = periodKey(cadence);
    while (allDone(period)) {
        streak++;
        period = prevPeriod(period, cadence);
    }
    return streak;
}

function uuid() {
    return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : 'f' + Math.random().toString(36).slice(2);
}

export function newGoal({ activityId, activityName, title }) {
    return { id: uuid(), activityId, activityName, title, createdAt: Date.now() };
}

export function newHabit({ goalId, title, frequency = 'daily' }) {
    return { id: uuid(), goalId, title, frequency, createdAt: Date.now() };
}
