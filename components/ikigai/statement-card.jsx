import Link from 'next/link';
import { ikigaiStatement, IKIGAI_HEX } from 'lib/ikigai';
import { IconArrowRight } from 'components/icons';

// The "My ikigai is to…" payoff card.
export function IkigaiStatement({ activities }) {
    const { kind, sentence, keywords, next } = ikigaiStatement(activities);
    const isIkigai = kind === 'ikigai';

    return (
        <section
            className="rounded-2xl p-5 ring-1 animate-rise"
            style={{
                background: isIkigai ? 'rgba(247, 212, 136, 0.1)' : 'rgba(255,255,255,0.05)',
                borderColor: isIkigai ? 'rgba(247, 212, 136, 0.4)' : 'rgba(255,255,255,0.1)',
                '--tw-ring-color': isIkigai ? 'rgba(247, 212, 136, 0.4)' : 'rgba(255,255,255,0.1)'
            }}
        >
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: isIkigai ? IKIGAI_HEX : '#9ca3af' }}>
                Your ikigai, in a sentence
            </p>
            <p className="text-lg font-semibold leading-snug">{sentence}</p>

            {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {keywords.map((k) => (
                        <span key={k} className="chip text-xs">
                            {k}
                        </span>
                    ))}
                </div>
            )}

            {next && (
                <Link
                    href={`/follow/new?activityId=${next.id}`}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary no-underline hover:opacity-80"
                >
                    Your next step: follow {next.name} <IconArrowRight className="w-4 h-4" />
                </Link>
            )}
        </section>
    );
}
