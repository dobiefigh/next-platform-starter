'use client';

import Link from 'next/link';
import { useFollow } from 'lib/use-follow';
import { goalProgressToday, goalStreak, habitsForGoal, isDone, todayKey } from 'lib/follow';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function todayLabel() {
    const d = new Date();
    return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export default function FollowPage() {
    const { goals, habits, checkins, ready, toggleCheckin, removeGoal } = useFollow();

    if (!ready) return <p className="py-16 text-center text-white/50">Loading…</p>;

    if (goals.length === 0) {
        return (
            <div className="flex flex-col items-center gap-5 py-16 text-center">
                <div className="text-5xl">🎯</div>
                <h1>Nothing to follow yet</h1>
                <p className="max-w-sm text-white/70">
                    Turn activities from your map into goals and daily habits. Small, consistent actions are how ikigai becomes real.
                </p>
                <Link href="/follow/new" className="btn btn-lg">
                    Create your first goal
                </Link>
            </div>
        );
    }

    // All habits across all goals.
    const allHabits = goals.flatMap((g) => habitsForGoal(g.id, habits));
    const totalToday = allHabits.length;
    const doneToday = allHabits.filter((h) => isDone(h.id, h.frequency, checkins)).length;
    const allDone = totalToday > 0 && doneToday === totalToday;

    return (
        <div className="flex flex-col gap-8 py-4">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1>Today</h1>
                    <p className="text-white/50">{todayLabel()}</p>
                </div>
                <Link href="/follow/new" className="btn shrink-0">
                    + New goal
                </Link>
            </header>

            {/* Daily check-in panel */}
            {totalToday > 0 && (
                <section className="surface flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">
                            {allDone ? '🎉 All done!' : "Today's habits"}
                        </h2>
                        <span className="text-sm text-white/50">
                            {doneToday}/{totalToday}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${totalToday ? Math.round((doneToday / totalToday) * 100) : 0}%` }}
                        />
                    </div>

                    <ul className="flex flex-col gap-2">
                        {goals.map((goal) => {
                            const goalHabits = habitsForGoal(goal.id, habits);
                            if (goalHabits.length === 0) return null;
                            return goalHabits.map((habit) => (
                                <HabitCheckbox
                                    key={habit.id}
                                    habit={habit}
                                    goalTitle={goal.title}
                                    checkins={checkins}
                                    onToggle={() => toggleCheckin(habit.id, habit.frequency)}
                                />
                            ));
                        })}
                    </ul>
                </section>
            )}

            {/* Goals list */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl">Your goals</h2>
                <ul className="flex flex-col gap-3">
                    {goals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            habits={habits}
                            checkins={checkins}
                            onRemove={() => {
                                if (window.confirm(`Remove goal "${goal.title}"? This cannot be undone.`)) {
                                    removeGoal(goal.id);
                                }
                            }}
                        />
                    ))}
                </ul>
            </section>
        </div>
    );
}

function HabitCheckbox({ habit, goalTitle, checkins, onToggle }) {
    const done = isDone(habit.id, habit.frequency, checkins);
    return (
        <li>
            <button
                type="button"
                onClick={onToggle}
                aria-pressed={done}
                className={[
                    'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ring-1',
                    done ? 'bg-primary/15 ring-primary/40' : 'bg-white/5 ring-white/10 hover:bg-white/10'
                ].join(' ')}
            >
                <span
                    className={[
                        'flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors text-xs font-bold',
                        done ? 'border-primary bg-primary text-primary-content' : 'border-white/30'
                    ].join(' ')}
                    aria-hidden="true"
                >
                    {done ? '✓' : ''}
                </span>
                <span className="flex flex-col min-w-0">
                    <span className={['font-medium truncate', done ? 'line-through text-white/50' : ''].join(' ')}>
                        {habit.title}
                    </span>
                    <span className="text-xs text-white/40">{goalTitle} · {habit.frequency}</span>
                </span>
                {done && <StreakBadge n={streakCount(habit, checkins)} />}
            </button>
        </li>
    );
}

import { streakFor } from 'lib/follow';

function streakCount(habit, checkins) {
    return streakFor(habit.id, habit.frequency, checkins);
}

function StreakBadge({ n }) {
    if (n < 2) return null;
    return (
        <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-orange-400 shrink-0">
            🔥 {n}
        </span>
    );
}

function GoalCard({ goal, habits, checkins, onRemove }) {
    const { done, total } = goalProgressToday(goal.id, habits, checkins);
    const streak = goalStreak(goal.id, habits, checkins);
    const complete = total > 0 && done === total;

    return (
        <li className={['surface flex flex-col gap-3', complete ? 'ring-primary/30' : ''].join(' ')}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{goal.title}</span>
                    <span className="text-xs text-white/50">{goal.activityName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {streak >= 2 && (
                        <span className="text-xs font-semibold text-orange-400">🔥 {streak}</span>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={`Remove goal ${goal.title}`}
                        className="text-white/30 hover:text-white/70 text-sm transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {total > 0 ? (
                <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>{total} {total === 1 ? 'habit' : 'habits'}</span>
                    <span>·</span>
                    <span className={complete ? 'text-primary font-semibold' : ''}>
                        {done}/{total} today
                    </span>
                </div>
            ) : (
                <p className="text-sm text-white/40">No habits yet.</p>
            )}
        </li>
    );
}
