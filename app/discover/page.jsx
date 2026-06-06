'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIkigai } from 'lib/use-ikigai';
import { DIMENSIONS, EXAMPLES, summarize } from 'lib/ikigai';

export default function DiscoverPage() {
    const { activities, ready, addActivity, removeActivity, toggleDim } = useIkigai();
    const [step, setStep] = useState('intro');
    const [rateIndex, setRateIndex] = useState(0);
    const [draft, setDraft] = useState('');

    if (!ready) {
        return <Loading />;
    }

    function submitDraft(event) {
        event.preventDefault();
        const value = draft.trim();
        if (!value) return;
        addActivity(value);
        setDraft('');
    }

    const effectiveStep = step === 'rate' && activities.length === 0 ? 'brainstorm' : step;

    if (effectiveStep === 'intro') {
        return <Intro hasData={activities.length > 0} onStart={() => setStep('brainstorm')} />;
    }

    if (effectiveStep === 'brainstorm') {
        const unusedExamples = EXAMPLES.filter(
            (ex) => !activities.some((a) => a.name.toLowerCase() === ex.toLowerCase())
        );
        return (
            <div className="flex flex-col gap-6 py-4">
                <Steps current={1} />
                <header className="flex flex-col gap-1">
                    <h1>Brainstorm</h1>
                    <p className="text-white/70">
                        {'List things you do — or would love to do. Hobbies, skills, work, causes. Aim for at least three; more is better.'}
                    </p>
                </header>

                <form onSubmit={submitDraft} className="flex gap-2">
                    <input
                        className="input grow bg-white"
                        placeholder="e.g. Teaching, Running, Designing…"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        aria-label="Add an activity"
                    />
                    <button type="submit" className="btn" disabled={!draft.trim()}>
                        Add
                    </button>
                </form>

                {unusedExamples.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="self-center text-sm text-white/40">Try:</span>
                        {unusedExamples.slice(0, 6).map((ex) => (
                            <button key={ex} type="button" className="chip hover:bg-white/15" onClick={() => addActivity(ex)}>
                                + {ex}
                            </button>
                        ))}
                    </div>
                )}

                {activities.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                        {activities.map((a) => (
                            <li key={a.id} className="chip">
                                <span>{a.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeActivity(a.id)}
                                    aria-label={`Remove ${a.name}`}
                                    className="text-white/50 hover:text-white"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-white/40">Nothing yet — add your first activity above.</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        className="btn btn-lg grow"
                        disabled={activities.length === 0}
                        onClick={() => {
                            setRateIndex(0);
                            setStep('rate');
                        }}
                    >
                        Continue ({activities.length})
                    </button>
                </div>
            </div>
        );
    }

    if (effectiveStep === 'rate') {
        const index = Math.min(rateIndex, activities.length - 1);
        const activity = activities[index];
        const isLast = index === activities.length - 1;

        return (
            <div className="flex flex-col gap-6 py-4">
                <Steps current={2} />
                <header className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm text-white/50">
                        <span>
                            Activity {index + 1} of {activities.length}
                        </span>
                        <button type="button" className="underline hover:opacity-80" onClick={() => setStep('brainstorm')}>
                            Edit list
                        </button>
                    </div>
                    <Progress value={index + 1} max={activities.length} />
                    <h1 className="pt-1">{activity.name}</h1>
                    <p className="text-white/70">Which of these are true? Tap all that apply.</p>
                </header>

                <div className="grid grid-cols-1 gap-3">
                    {DIMENSIONS.map((d) => {
                        const active = !!activity[d.key];
                        return (
                            <button
                                key={d.key}
                                type="button"
                                onClick={() => toggleDim(activity.id, d.key)}
                                aria-pressed={active}
                                className={[
                                    'flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition-colors ring-1',
                                    active ? 'ring-transparent' : 'bg-white/5 ring-white/10 hover:bg-white/10'
                                ].join(' ')}
                                style={active ? { backgroundColor: d.hex, color: '#0b1020' } : undefined}
                            >
                                <span className="text-2xl" aria-hidden="true">
                                    {d.emoji}
                                </span>
                                <span className="flex flex-col">
                                    <span className="font-semibold">{d.question}</span>
                                    <span className={active ? 'text-sm text-black/60' : 'text-sm text-white/50'}>{d.label}</span>
                                </span>
                                <span className="ml-auto text-lg">{active ? '✓' : ''}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                            if (index === 0) {
                                setStep('brainstorm');
                            } else {
                                setRateIndex(index - 1);
                            }
                        }}
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        className="btn btn-lg grow"
                        onClick={() => {
                            if (isLast) {
                                setStep('done');
                            } else {
                                setRateIndex(index + 1);
                            }
                        }}
                    >
                        {isLast ? 'See results' : 'Next'}
                    </button>
                </div>
            </div>
        );
    }

    // step === 'done'
    const groups = summarize(activities);
    const ikigaiCount = groups.ikigai.length;

    return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="text-5xl">{ikigaiCount > 0 ? '🎯' : '🌱'}</div>
            <h1>
                {ikigaiCount > 0
                    ? `You found ${ikigaiCount} ikigai ${ikigaiCount === 1 ? 'candidate' : 'candidates'}!`
                    : 'Your map is ready'}
            </h1>
            <p className="max-w-md text-white/70">
                {ikigaiCount > 0
                    ? 'These activities sit where all four circles meet. Your map shows the full picture.'
                    : 'Nothing hits all four circles yet — that is completely normal. Your map shows what is close and what is missing.'}
            </p>
            <div className="flex flex-col w-full max-w-xs gap-3">
                <Link href="/map" className="btn btn-lg">
                    See your full map
                </Link>
                <button type="button" className="btn btn-ghost" onClick={() => setStep('brainstorm')}>
                    Add more activities
                </button>
            </div>
        </div>
    );
}

function Intro({ hasData, onStart }) {
    return (
        <div className="flex flex-col gap-6 py-6">
            <header className="flex flex-col gap-2">
                <h1>How it works</h1>
                <p className="text-white/70">Three quick steps to map your ikigai.</p>
            </header>
            <ol className="flex flex-col gap-3">
                {[
                    { n: 1, t: 'Brainstorm', d: 'List activities you do or would like to do.' },
                    { n: 2, t: 'Rate', d: 'For each one, mark whether you love it, are good at it, the world needs it, and you can be paid for it.' },
                    { n: 3, t: 'Map', d: 'See where each activity lands — and spot your ikigai.' }
                ].map((s) => (
                    <li key={s.n} className="surface flex items-start gap-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-sm font-bold shrink-0">
                            {s.n}
                        </span>
                        <div>
                            <h3 className="text-base">{s.t}</h3>
                            <p className="text-sm text-white/60">{s.d}</p>
                        </div>
                    </li>
                ))}
            </ol>
            <div className="flex flex-col gap-3 pt-2">
                <button type="button" className="btn btn-lg" onClick={onStart}>
                    {hasData ? 'Continue' : 'Start'}
                </button>
                {hasData && (
                    <Link href="/map" className="text-sm text-center text-white/60 hover:text-white">
                        Skip to my map
                    </Link>
                )}
            </div>
        </div>
    );
}

function Steps({ current }) {
    const labels = ['Brainstorm', 'Rate', 'Map'];
    return (
        <ol className="flex items-center gap-2 text-xs">
            {labels.map((label, i) => {
                const n = i + 1;
                const active = n <= current;
                return (
                    <li key={label} className="flex items-center gap-2">
                        <span
                            className={[
                                'flex items-center justify-center w-5 h-5 rounded-full font-bold',
                                active ? 'bg-primary text-primary-content' : 'bg-white/10 text-white/50'
                            ].join(' ')}
                        >
                            {n}
                        </span>
                        <span className={active ? 'text-white' : 'text-white/40'}>{label}</span>
                        {n < labels.length && <span className="text-white/20">—</span>}
                    </li>
                );
            })}
        </ol>
    );
}

function Progress({ value, max }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="w-full h-1.5 rounded-full bg-white/10" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
    );
}

function Loading() {
    return <p className="py-16 text-center text-white/50">Loading…</p>;
}
