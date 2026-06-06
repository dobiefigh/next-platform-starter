'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIkigai } from 'lib/use-ikigai';
import { useFollow } from 'lib/use-follow';
import { missingDims, summarize } from 'lib/ikigai';
import { IconPlus, IconX } from 'components/icons';

export function NewGoalForm() {
    const router = useRouter();
    const params = useSearchParams();
    const prefilledId = params.get('activityId');

    const { activities, ready: mapReady } = useIkigai();
    const { addGoal, ready: followReady } = useFollow();

    // Step 1: pick activity; step 2: name goal; step 3: habits.
    const preActivity = activities.find((a) => a.id === prefilledId) ?? null;
    const [step, setStep] = useState(preActivity ? 2 : 1);
    const [activity, setActivity] = useState(preActivity);
    const [title, setTitle] = useState('');
    const [habits, setHabits] = useState([{ title: '', frequency: 'daily' }]);

    if (!mapReady || !followReady) return <p className="py-16 text-center text-white/65">Loading…</p>;

    // --- Step 1: pick activity ---
    if (step === 1) {
        const groups = summarize(activities);
        const ordered = [
            ...groups.ikigai,
            ...groups.almost,
            ...groups.overlap,
            ...groups.single,
            ...groups.none
        ];
        return (
            <div className="flex flex-col gap-6 py-4">
                <WizardSteps current={1} />
                <header>
                    <h1>Which activity?</h1>
                    <p className="text-white/70 mt-1">Choose from your map — or type a new one.</p>
                </header>

                {ordered.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                        {ordered.map((a) => (
                            <li key={a.id}>
                                <button
                                    type="button"
                                    onClick={() => { setActivity(a); setStep(2); }}
                                    className="w-full flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-left ring-1 ring-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <span className="font-medium">{a.name}</span>
                                    <span className="text-xs text-white/65 shrink-0">{a.region.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="surface text-center text-white/65 text-sm">
                        No activities on your map yet.{' '}
                        <a href="/discover" className="text-primary">Add some first</a>.
                    </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                    <p className="text-xs text-white/60 text-center">— or type a custom activity —</p>
                    <CustomActivityInput
                        onSubmit={(name) => {
                            setActivity({ id: null, name });
                            setStep(2);
                        }}
                    />
                </div>
            </div>
        );
    }

    // --- Step 2: name the goal ---
    if (step === 2) {
        return (
            <div className="flex flex-col gap-6 py-4">
                <WizardSteps current={2} />
                <header>
                    <h1>Name your goal</h1>
                    <p className="text-white/70 mt-1">
                        What do you want to achieve with <span className="font-semibold text-white">{activity?.name}</span>?
                    </p>
                </header>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (title.trim()) setStep(3);
                    }}
                    className="flex flex-col gap-4"
                >
                    <input
                        className="input"
                        placeholder="e.g. Publish my first article, Run a 5K…"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        aria-label="Goal title"
                    />
                    <div className="flex gap-3">
                        <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                            Back
                        </button>
                        <button type="submit" className="btn btn-lg grow" disabled={!title.trim()}>
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // --- Step 3: add habits ---
    function updateHabit(i, field, value) {
        setHabits((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)));
    }

    function removeHabit(i) {
        setHabits((prev) => prev.filter((_, idx) => idx !== i));
    }

    function addHabit() {
        setHabits((prev) => [...prev, { title: '', frequency: 'daily' }]);
    }

    function addSuggested(title) {
        setHabits((prev) => {
            const emptyIdx = prev.findIndex((h) => !h.title.trim());
            if (emptyIdx >= 0) return prev.map((h, i) => (i === emptyIdx ? { ...h, title } : h));
            if (prev.length >= 5) return prev;
            return [...prev, { title, frequency: 'daily' }];
        });
    }

    function save() {
        const validHabits = habits.filter((h) => h.title.trim());
        if (validHabits.length === 0) return;
        addGoal(activity?.id ?? null, activity?.name ?? '', title.trim(), validHabits);
        router.push('/follow');
    }

    const canSave = habits.some((h) => h.title.trim());
    const suggestions = suggestedHabits(activity);

    return (
        <div className="flex flex-col gap-6 py-4">
            <WizardSteps current={3} />
            <header>
                <h1>Add habits</h1>
                <p className="text-white/70 mt-1">
                    Small, repeatable actions that move you toward{' '}
                    <span className="font-semibold text-white">{title}</span>.
                </p>
            </header>

            {suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-white/65">{suggestions.gapBased ? 'Ideas to close your gaps:' : 'Need ideas?'}</span>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                            <button key={s} type="button" className="chip text-left hover:bg-white/15" onClick={() => addSuggested(s)}>
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ul className="flex flex-col gap-3">
                {habits.map((habit, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <input
                            className="input bg-white grow"
                            placeholder={`e.g. ${defaultHabitPlaceholder(i)}`}
                            value={habit.title}
                            onChange={(e) => updateHabit(i, 'title', e.target.value)}
                            aria-label={`Habit ${i + 1} title`}
                        />
                        <FreqToggle
                            value={habit.frequency}
                            onChange={(v) => updateHabit(i, 'frequency', v)}
                        />
                        {habits.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeHabit(i)}
                                aria-label="Remove habit"
                                className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg text-white/45 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {habits.length < 5 && (
                <button type="button" onClick={addHabit} className="inline-flex items-center gap-1 text-sm text-primary hover:opacity-80 self-start no-underline">
                    <IconPlus className="w-4 h-4" /> Add another habit
                </button>
            )}

            <div className="flex gap-3 pt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
                    Back
                </button>
                <button type="button" className="btn btn-lg grow" onClick={save} disabled={!canSave}>
                    Save goal
                </button>
            </div>
        </div>
    );
}

function CustomActivityInput({ onSubmit }) {
    const [value, setValue] = useState('');
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) onSubmit(value.trim());
            }}
            className="flex gap-2"
        >
            <input
                className="input grow bg-white"
                placeholder="Type an activity…"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label="Custom activity"
            />
            <button type="submit" className="btn" disabled={!value.trim()}>
                Use this
            </button>
        </form>
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
                    className={[
                        'px-2.5 py-2 transition-colors capitalize',
                        value === f ? 'bg-primary text-primary-content' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    ].join(' ')}
                >
                    {f}
                </button>
            ))}
        </div>
    );
}

function WizardSteps({ current }) {
    const labels = ['Activity', 'Goal', 'Habits'];
    return (
        <ol className="flex items-center gap-2 text-xs">
            {labels.map((label, i) => {
                const n = i + 1;
                const active = n <= current;
                return (
                    <li key={label} className="flex items-center gap-2">
                        <span className={['flex items-center justify-center w-5 h-5 rounded-full font-bold', active ? 'bg-primary text-primary-content' : 'bg-white/10 text-white/65'].join(' ')}>
                            {n}
                        </span>
                        <span className={active ? 'text-white' : 'text-white/60'}>{label}</span>
                        {n < labels.length && <span className="text-white/20">—</span>}
                    </li>
                );
            })}
        </ol>
    );
}

const PLACEHOLDERS = ['Write for 20 minutes', 'Practice for 30 minutes', 'Review one lesson', 'Take one small step'];
function defaultHabitPlaceholder(i) {
    return PLACEHOLDERS[i % PLACEHOLDERS.length];
}

// Habit ideas tailored to the dimensions an activity is missing.
const GAP_HABITS = {
    love: (n) => `Spend 15 minutes enjoying ${n}`,
    skill: (n) => `Practice ${n} for 20 minutes`,
    need: (n) => `Find one person who benefits from ${n}`,
    pay: (n) => `Research one way to earn from ${n}`
};

function genericHabits(n) {
    return [`Work on ${n} for 25 minutes`, `Reflect on ${n} once a week`, `Take one small step on ${n}`];
}

function suggestedHabits(activity) {
    if (!activity) return Object.assign([], { gapBased: false });
    const missing = missingDims(activity);
    if (missing.length > 0 && missing.length < 4) {
        return Object.assign(missing.map((d) => GAP_HABITS[d.key](activity.name)), { gapBased: true });
    }
    return Object.assign(genericHabits(activity.name), { gapBased: false });
}
