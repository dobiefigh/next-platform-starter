import { dimensionBalance } from 'lib/ikigai';

// Insight panel: how the four circles are represented across all activities.
export function BalancePanel({ activities }) {
    const { counts, max, strongest, weakest, total } = dimensionBalance(activities);
    if (total === 0) return null;

    const balanced = strongest.key === weakest.key || counts.every((c) => c.count === counts[0].count);

    return (
        <section className="surface flex flex-col gap-3">
            <h2 className="text-base font-semibold">Balance</h2>
            <ul className="flex flex-col gap-2">
                {counts.map(({ dim, count }) => (
                    <li key={dim.key} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-sm text-white/70">
                            {dim.emoji} {dim.short}
                        </span>
                        <span className="grow h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <span
                                className="block h-full rounded-full transition-all"
                                style={{ width: `${(count / max) * 100}%`, backgroundColor: dim.hex }}
                            />
                        </span>
                        <span className="w-5 shrink-0 text-right text-sm tabular-nums text-white/70">{count}</span>
                    </li>
                ))}
            </ul>
            <p className="text-sm text-white/65">
                {balanced ? (
                    'Nicely balanced across all four circles.'
                ) : (
                    <>
                        Strongest in <span style={{ color: strongest.hex }}>{strongest.short}</span>, lightest in{' '}
                        <span style={{ color: weakest.hex }}>{weakest.short}</span> — adding {weakest.label.toLowerCase()} could unlock more overlaps.
                    </>
                )}
            </p>
        </section>
    );
}
