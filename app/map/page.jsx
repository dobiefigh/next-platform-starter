'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useIkigai } from 'lib/use-ikigai';
import { IkigaiVenn } from 'components/ikigai/venn';
import { IkigaiMark } from 'components/ikigai/mark';
import { IkigaiStatement } from 'components/ikigai/statement-card';
import { BalancePanel } from 'components/ikigai/balance-panel';
import { IconArrowRight, IconCheck, IconPencil } from 'components/icons';
import { buildExampleActivities, DIMENSIONS, IKIGAI_HEX, missingDims, summarize } from 'lib/ikigai';

export default function MapPage() {
    const { activities, ready, renameActivity, replaceAll } = useIkigai();

    if (!ready) {
        return (
            <div className="flex flex-col gap-8 py-4" aria-hidden="true">
                <div className="skeleton h-9 w-48" />
                <div className="skeleton h-72 w-full" />
                <div className="skeleton h-24 w-full" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center gap-5 py-16 text-center">
                <IkigaiMark className="w-16 h-16" />
                <h1>No map yet</h1>
                <p className="max-w-sm text-white/65">Map your activities across the four circles to discover your ikigai.</p>
                <div className="flex flex-col w-full max-w-xs gap-3">
                    <Link href="/discover" className="btn btn-lg">
                        Start discovering
                    </Link>
                    <button type="button" className="btn btn-ghost" onClick={() => replaceAll(buildExampleActivities())}>
                        Load an example
                    </button>
                </div>
            </div>
        );
    }

    const groups = summarize(activities);

    return (
        <div className="flex flex-col gap-8 py-4">
            <header className="flex flex-col gap-1">
                <h1>Your ikigai map</h1>
                <p className="text-white/70">
                    {activities.length} {activities.length === 1 ? 'activity' : 'activities'} mapped across the four circles.
                </p>
            </header>

            <IkigaiStatement activities={activities} />

            <div className="surface">
                <IkigaiVenn activities={activities} />
            </div>

            <BalancePanel activities={activities} />

            {groups.ikigai.length > 0 && (
                <Section title="Your ikigai" accent={IKIGAI_HEX} subtitle="Where all four circles meet — protect and grow these.">
                    {groups.ikigai.map((a) => (
                        <ActivityRow key={a.id} activity={a} highlight />
                    ))}
                </Section>
            )}

            {groups.almost.length > 0 && (
                <Section title="Almost there" subtitle="Just one circle away from your ikigai.">
                    {groups.almost.map((a) => (
                        <ActivityRow key={a.id} activity={a} badge={a.region.label} showGaps />
                    ))}
                </Section>
            )}

            {groups.overlap.length > 0 && (
                <Section title="Overlaps" subtitle="Two circles meet here.">
                    {groups.overlap.map((a) => (
                        <ActivityRow key={a.id} activity={a} badge={a.region.label} showGaps />
                    ))}
                </Section>
            )}

            {groups.single.length > 0 && (
                <Section title="One circle" subtitle="A single area so far.">
                    {groups.single.map((a) => (
                        <ActivityRow key={a.id} activity={a} badge={a.region.label} showGaps />
                    ))}
                </Section>
            )}

            {groups.none.length > 0 && (
                <Section title="Not placed yet" subtitle="Rate these to see where they land.">
                    {groups.none.map((a) => (
                        <ActivityRow key={a.id} activity={a} />
                    ))}
                </Section>
            )}

            <div className="flex items-center gap-3 pt-2">
                <Link href="/discover" className="btn btn-lg grow text-center">
                    Edit my map
                </Link>
                <Link href="/settings" className="btn btn-ghost">
                    Manage data
                </Link>
            </div>
        </div>
    );
}

function Section({ title, subtitle, accent, children }) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
                <h2 className="text-xl" style={accent ? { color: accent } : undefined}>
                    {title}
                </h2>
                {subtitle && <p className="text-sm text-white/65">{subtitle}</p>}
            </div>
            <ul className="flex flex-col gap-2">{children}</ul>
        </section>
    );
}

function ActivityRow({ activity, badge, highlight, showGaps }) {
    const { renameActivity } = useIkigai();
    const [editing, setEditing] = useState(false);
    const gaps = showGaps ? missingDims(activity) : [];
    return (
        <li
            className={[
                'flex flex-col gap-2 rounded-xl px-4 py-3 ring-1',
                highlight ? 'bg-white/10 ring-white/20' : 'bg-white/5 ring-white/10'
            ].join(' ')}
        >
            <div className="flex items-center gap-2">
                {editing ? (
                    <>
                        <input
                            className="input grow"
                            value={activity.name}
                            onChange={(e) => renameActivity(activity.id, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditing(false);
                            }}
                            aria-label="Activity name"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            aria-label="Done renaming"
                            className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-primary text-primary-content"
                        >
                            <IconCheck className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <span className="font-medium">{activity.name}</span>
                        {badge && <span className="text-xs text-white/55">{badge}</span>}
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            aria-label={`Rename ${activity.name}`}
                            className="flex items-center justify-center w-9 h-9 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <IconPencil className="w-3.5 h-3.5" />
                        </button>
                        <span className="ml-auto flex items-center gap-1" aria-hidden="true">
                            {DIMENSIONS.filter((d) => activity[d.key]).map((d) => (
                                <span key={d.key} title={d.short}>
                                    {d.emoji}
                                </span>
                            ))}
                        </span>
                    </>
                )}
            </div>

            {activity.note && <p className="text-sm italic text-white/55">“{activity.note}”</p>}

            {gaps.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/55">
                    <span>To grow:</span>
                    {gaps.map((d) => (
                        <span
                            key={d.key}
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
                            style={{ color: d.hex, borderColor: d.hex }}
                        >
                            + {d.short}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-end">
                <Link
                    href={`/follow/new?activityId=${activity.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary no-underline hover:opacity-80"
                >
                    Follow this <IconArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </li>
    );
}
