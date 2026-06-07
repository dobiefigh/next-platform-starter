'use client';

import { useJournal } from 'lib/use-journal';
import { MOODS, promptForDate } from 'lib/journal';
import { todayKey } from 'lib/follow';
import { IconCheck } from 'components/icons';

// Auto-saving daily reflection: rotating prompt + mood + a few words.
export function DailyReflection() {
    const { entries, ready, saveEntry } = useJournal();
    if (!ready) return <div className="skeleton h-44 w-full" aria-hidden="true" />;

    const date = todayKey();
    const prompt = promptForDate(date);
    const entry = entries[date] || {};
    const hasContent = !!entry.mood || !!(entry.text && entry.text.trim());

    return (
        <section className="surface flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Daily reflection</h2>
                {hasContent && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                        <IconCheck className="w-3.5 h-3.5" /> Saved
                    </span>
                )}
            </div>

            <p className="text-sm text-white/70">{prompt}</p>

            <div className="flex items-stretch justify-between gap-1">
                {MOODS.map((m) => {
                    const selected = entry.mood === m.value;
                    return (
                        <button
                            key={m.value}
                            type="button"
                            onClick={() => saveEntry(date, { mood: selected ? null : m.value, prompt })}
                            aria-label={m.label}
                            aria-pressed={selected}
                            className={[
                                'flex-1 flex flex-col items-center gap-1 rounded-xl py-2 transition-colors',
                                selected ? 'bg-primary/15 ring-1 ring-primary/40' : 'hover:bg-white/10'
                            ].join(' ')}
                        >
                            <span className={['text-2xl transition-transform', selected ? 'scale-110' : 'opacity-70'].join(' ')}>
                                {m.emoji}
                            </span>
                            <span className={['text-[10px]', selected ? 'text-white' : 'text-white/55'].join(' ')}>{m.label}</span>
                        </button>
                    );
                })}
            </div>

            <textarea
                className="input min-h-20 resize-y"
                placeholder="A few words on today…"
                value={entry.text || ''}
                onChange={(e) => saveEntry(date, { text: e.target.value, prompt })}
                aria-label="Reflection note"
            />
        </section>
    );
}
