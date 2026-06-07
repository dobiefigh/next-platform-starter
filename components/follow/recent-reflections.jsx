'use client';

import { useJournal } from 'lib/use-journal';
import { moodByValue } from 'lib/journal';

function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function RecentReflections() {
    const { entries, ready } = useJournal();
    if (!ready) return null;

    const list = Object.values(entries)
        .filter((e) => e.mood || (e.text && e.text.trim()))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 5);

    if (list.length === 0) return null;

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl">Recent reflections</h2>
            <ul className="flex flex-col gap-2">
                {list.map((e) => {
                    const mood = moodByValue(e.mood);
                    return (
                        <li key={e.date} className="surface flex items-start gap-3 py-3">
                            <span className="text-xl" aria-hidden="true">
                                {mood ? mood.emoji : '📝'}
                            </span>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-white/55">{formatDate(e.date)}</span>
                                {e.text && e.text.trim() ? (
                                    <p className="text-sm text-white/80">{e.text}</p>
                                ) : (
                                    <p className="text-sm italic text-white/55">{mood ? mood.label : ''}</p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
