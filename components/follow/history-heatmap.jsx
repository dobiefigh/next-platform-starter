// GitHub-style consistency grid for daily check-ins over the last 12 weeks.
const WEEKS = 12;
const TOTAL_DAYS = WEEKS * 7;

function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function lastDates(n) {
    const out = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = n - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        out.push(day);
    }
    return out;
}

function levelColor(level) {
    switch (level) {
        case 1:
            return 'rgba(43, 220, 210, 0.3)';
        case 2:
            return 'rgba(43, 220, 210, 0.6)';
        case 3:
            return 'rgba(43, 220, 210, 0.95)';
        default:
            return 'rgba(255, 255, 255, 0.06)';
    }
}

function levelFor(count) {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    return 3;
}

export function HistoryHeatmap({ checkins }) {
    // Count daily check-ins (10-char date keys) per day.
    const counts = {};
    for (const c of checkins) {
        if (c.date && c.date.length === 10) counts[c.date] = (counts[c.date] || 0) + 1;
    }

    const dates = lastDates(TOTAL_DAYS);
    const leadingPad = dates[0].getDay(); // 0 = Sunday: align first column to the week start
    const cells = [...Array(leadingPad).fill(null), ...dates];

    return (
        <div className="flex flex-col gap-2">
            <div
                className="overflow-x-auto"
                style={{ display: 'grid', gridTemplateRows: 'repeat(7, 0.7rem)', gridAutoFlow: 'column', gap: '3px' }}
            >
                {cells.map((d, i) => {
                    if (!d) return <span key={`pad-${i}`} />;
                    const key = dateKey(d);
                    const count = counts[key] || 0;
                    return (
                        <span
                            key={key}
                            className="rounded-[2px]"
                            style={{ width: '0.7rem', height: '0.7rem', backgroundColor: levelColor(levelFor(count)) }}
                            title={`${key}: ${count} check-in${count === 1 ? '' : 's'}`}
                        />
                    );
                })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/55">
                <span>Less</span>
                {[0, 1, 2, 3].map((l) => (
                    <span key={l} className="rounded-[2px]" style={{ width: '0.7rem', height: '0.7rem', backgroundColor: levelColor(l) }} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
