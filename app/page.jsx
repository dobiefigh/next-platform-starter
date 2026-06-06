import Link from 'next/link';
import { IkigaiMark } from 'components/ikigai/mark';
import { DIMENSIONS } from 'lib/ikigai';

export default function HomePage() {
    return (
        <div className="flex flex-col gap-12 py-6">
            <section className="flex flex-col items-center text-center gap-5">
                <IkigaiMark className="w-24 h-24" />
                <h1 className="max-w-md">Find your ikigai</h1>
                <p className="max-w-md text-lg text-white/70">
                    {'Ikigai is the Japanese idea of a "reason for being" — the sweet spot where four parts of your life overlap. Map yours in a few minutes.'}
                </p>
                <div className="flex flex-col w-full max-w-xs gap-3 pt-2 sm:flex-row sm:max-w-md sm:justify-center">
                    <Link href="/discover" className="btn btn-lg sm:min-w-48">
                        Begin your map
                    </Link>
                    <Link href="/map" className="btn btn-lg btn-ghost sm:min-w-48">
                        View your map
                    </Link>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {DIMENSIONS.map((d) => (
                    <div key={d.key} className="surface flex items-start gap-3">
                        <span
                            className="mt-1 inline-block w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: d.hex }}
                            aria-hidden="true"
                        />
                        <div>
                            <h3 className="text-base">{d.label}</h3>
                            <p className="text-sm text-white/60">{d.prompt}</p>
                        </div>
                    </div>
                ))}
            </section>

            <section className="surface text-center">
                <p className="text-white/70">
                    {'Where all four meet is your '}
                    <span className="font-semibold" style={{ color: '#f7d488' }}>
                        ikigai
                    </span>
                    {'. Discovery is the first step — following it comes next.'}
                </p>
            </section>
        </div>
    );
}
