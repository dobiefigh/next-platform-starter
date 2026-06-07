'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFollow } from 'lib/use-follow';
import { goalProgressToday, goalStreak, habitsForGoal, isDone, streakFor } from 'lib/follow';
import { IconCheck, IconFlame, IconPencil, IconPlus, IconX } from 'components/icons';
import { HistoryHeatmap } from 'components/follow/history-heatmap';
import { DailyReflection } from 'components/follow/daily-reflection';
import { RecentReflections } from 'components/follow/recent-reflections';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function todayLabel() {
    const d = new Date();
    return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export default function FollowPage() {
    const { goals, habits, checkins, ready, toggleCheckin, removeGoal } = useFollow();

    if (!ready) return <FollowSkeleton />;

    if (goals.length === 0) {
        return (
            <div className="flex flex-col gap-8 py-4">
                <header>
                    <h1>Today</h1>
                    <p className="text-white/60">{todayLabel()}</p>
                </header>

                <DailyReflection />

                <div className="surface flex flex-col items-center gap-4 text-center py-8">
                    <EmptyGlyph />
                    <div>
                        <h2 className="text-xl">Set your first goal</h2>
                        <p className="max-w-sm mt-1 text-white/65">
                            Turn activities from your map into goals and daily habits. Small, consistent actions are how ikigai becomes real.
                        </p>
                    </div>
                    <Link href="/follow/new" className="btn btn-lg">
                        Create a goal
                    </Link>
                </div>

                <RecentReflections />
            </div>
        );
    }

    const allHabits = goals.flatMap((g) => habitsForGoal(g.id, habits));
    const totalToday = allHabits.length;
    const doneToday = allHabits.filter((h) => isDone(h.id, h.frequency, checkins)).length;
    const allDone = totalToday > 0 && doneToday === totalToday;

    return (
        <div className="flex flex-col gap-8 py-4">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1>Today</h1>
                    <p className="text-white/60">{todayLabel()}</p>
                </div>
                <Link href="/follow/new" className="btn shrink-0">
                    <IconPlus className="w-4 h-4" /> New goal
                </Link>
            </header>

            <DailyReflection />

            {totalToday > 0 && (
                <section className="surface flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">{allDone ? '🎉 All done today!' : "Today's habits"}</h2>
                        <span className="text-sm text-white/60">
                            {doneToday}/{totalToday}
                        </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${totalToday ? Math.round((doneToday / totalToday) * 100) : 0}%` }}
                        />
                    </div>

                    <ul className="flex flex-col gap-2">
                        {goals.map((goal) =>
                            habitsForGoal(goal.id, habits).map((habit) => (
                                <HabitCheckbox
                                    key={habit.id}
                                    habit={habit}
                                    goalTitle={goal.title}
                                    checkins={checkins}
                                    onToggle={() => toggleCheckin(habit.id, habit.frequency)}
                                />
                            ))
                        )}
                    </ul>
                </section>
            )}

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

            {checkins.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-xl">Consistency</h2>
                    <div className="surface">
                        <HistoryHeatmap checkins={checkins} />
                    </div>
                    <p className="text-xs text-white/55">Daily habit check-ins over the last 12 weeks.</p>
                </section>
            )}

            <RecentReflections />
        </div>
    );
}

function HabitCheckbox({ habit, goalTitle, checkins, onToggle }) {
    const done = isDone(habit.id, habit.frequency, checkins);
    const streak = streakFor(habit.id, habit.frequency, checkins);
    return (
        <li>
            <button
                type="button"
                onClick={onToggle}
                aria-pressed={done}
                className={[
                    'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ring-1 min-h-touch',
                    done ? 'bg-primary/15 ring-primary/40' : 'bg-white/5 ring-white/10 hover:bg-white/10'
                ].join(' ')}
            >
                <span
                    className={[
                        'flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-colors',
                        done ? 'border-primary bg-primary text-primary-content' : 'border-white/30'
                    ].join(' ')}
                    aria-hidden="true"
                >
                    {done && <IconCheck className="w-4 h-4 animate-pop" />}
                </span>
                <span className="flex flex-col min-w-0">
                    <span className={['font-medium truncate', done ? 'line-through text-white/55' : ''].join(' ')}>{habit.title}</span>
                    <span className="text-xs text-white/55">
                        {goalTitle} · {habit.frequency}
                    </span>
                </span>
                {done && streak >= 2 && (
                    <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-orange-400 shrink-0">
                        <IconFlame className="w-3.5 h-3.5" /> {streak}
                    </span>
                )}
            </button>
        </li>
    );
}

function GoalCard({ goal, habits, checkins, onRemove }) {
    const { renameGoal, addHabit, updateHabit, removeHabit } = useFollow();
    const [editing, setEditing] = useState(false);
    const goalHabits = habitsForGoal(goal.id, habits);

    if (editing) {
        return (
            <li className="surface flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-white/65">Goal</span>
                    <input
                        className="input"
                        value={goal.title}
                        onChange={(e) => renameGoal(goal.id, e.target.value)}
                        aria-label="Goal title"
                    />
                </label>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white/65">Habits</span>
                    {goalHabits.map((h) => (
                        <div key={h.id} className="flex items-center gap-2">
                            <input
                                className="input grow"
                                value={h.title}
                                onChange={(e) => updateHabit(h.id, { title: e.target.value })}
                                aria-label="Habit title"
                            />
                            <FreqToggle value={h.frequency} onChange={(v) => updateHabit(h.id, { frequency: v })} />
                            <button
                                type="button"
                                onClick={() => removeHabit(h.id)}
                                aria-label="Remove habit"
                                className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <AddHabitInline onAdd={(t) => addHabit(goal.id, t)} />
                </div>

                <div className="flex items-center justify-between gap-2">
                    <button type="button" className="btn btn-ghost bg-love/15 hover:bg-love/25" onClick={onRemove}>
                        Delete goal
                    </button>
                    <button type="button" className="btn" onClick={() => setEditing(false)}>
                        Done
                    </button>
                </div>
            </li>
        );
    }

    const { done, total } = goalProgressToday(goal.id, habits, checkins);
    const streak = goalStreak(goal.id, habits, checkins);
    const complete = total > 0 && done === total;

    return (
        <li className={['surface flex flex-col gap-3', complete ? 'ring-primary/30' : ''].join(' ')}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{goal.title}</span>
                    <span className="text-xs text-white/55">{goal.activityName}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {streak >= 2 && (
                        <span className="flex items-center gap-0.5 mr-1 text-xs font-semibold text-orange-400">
                            <IconFlame className="w-3.5 h-3.5" /> {streak}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        aria-label={`Edit goal ${goal.title}`}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <IconPencil className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {total > 0 ? (
                <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>
                        {total} {total === 1 ? 'habit' : 'habits'}
                    </span>
                    <span>·</span>
                    <span className={complete ? 'text-primary font-semibold' : ''}>
                        {done}/{total} today
                    </span>
                </div>
            ) : (
                <p className="text-sm text-white/55">No habits yet.</p>
            )}
        </li>
    );
}

function FreqToggle({ value, onChange }) {
    return (
        <div className="flex rounded-lg overflow-hidden ring-1 ring-white/20 shrink-0 text-xs font-semibold">
            {['daily', 'weekly'].map((f) => (
                <button
                    key={f}
                    type="button"
                    onClick={() => onChange(f)}
                    aria-pressed={value === f}
                    className={[
                        'px-2.5 py-2 capitalize transition-colors',
                        value === f ? 'bg-primary text-primary-content' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    ].join(' ')}
                >
                    {f}
                </button>
            ))}
        </div>
    );
}

function AddHabitInline({ onAdd }) {
    const [value, setValue] = useState('');
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) {
                    onAdd(value.trim());
                    setValue('');
                }
            }}
            className="flex items-center gap-2"
        >
            <input
                className="input grow"
                placeholder="Add a habit…"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label="New habit title"
            />
            <button type="submit" className="btn shrink-0" disabled={!value.trim()}>
                <IconPlus className="w-4 h-4" />
            </button>
        </form>
    );
}

function EmptyGlyph() {
    return (
        <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 ring-1 ring-white/10 text-3xl">🎯</span>
    );
}

function FollowSkeleton() {
    return (
        <div className="flex flex-col gap-8 py-4" aria-hidden="true">
            <div className="skeleton h-9 w-40" />
            <div className="skeleton h-40 w-full" />
            <div className="flex flex-col gap-3">
                <div className="skeleton h-24 w-full" />
                <div className="skeleton h-24 w-full" />
            </div>
        </div>
    );
}
