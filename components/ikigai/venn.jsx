import { IKIGAI_HEX, regionCounts } from 'lib/ikigai';

// Four circles arranged so adjacent pairs form the classic ikigai overlaps:
//   love+skill = Passion (top), skill+pay = Profession (right),
//   need+pay = Vocation (bottom), love+need = Mission (left), all four = Ikigai (centre).
const CIRCLES = [
    { key: 'love', cx: 140, cy: 140, fill: '#fb7185' },
    { key: 'skill', cx: 220, cy: 140, fill: '#fbbf24' },
    { key: 'need', cx: 140, cy: 220, fill: '#34d399' },
    { key: 'pay', cx: 220, cy: 220, fill: '#60a5fa' }
];

const LABELS = [
    { text: 'Love', x: 96, y: 84, fill: '#fb7185' },
    { text: 'Good at', x: 264, y: 84, fill: '#fbbf24' },
    { text: 'World needs', x: 96, y: 296, fill: '#34d399' },
    { text: 'Paid for', x: 264, y: 296, fill: '#60a5fa' }
];

const BADGES = [
    { id: 'passion', x: 180, y: 112 },
    { id: 'mission', x: 112, y: 180 },
    { id: 'profession', x: 248, y: 180 },
    { id: 'vocation', x: 180, y: 248 }
];

export function IkigaiVenn({ activities = [] }) {
    const counts = regionCounts(activities);
    const ikigaiCount = counts.ikigai || 0;

    return (
        <svg viewBox="0 0 360 360" className="w-full max-w-sm mx-auto" role="img" aria-label="Your ikigai map">
            <g style={{ mixBlendMode: 'screen' }}>
                {CIRCLES.map((c) => (
                    <circle key={c.key} cx={c.cx} cy={c.cy} r="110" fill={c.fill} fillOpacity="0.4" />
                ))}
            </g>

            {BADGES.map((b) => (
                <Badge key={b.id} x={b.x} y={b.y} n={counts[b.id] || 0} />
            ))}

            <circle cx="180" cy="180" r="27" fill="#0b1020" fillOpacity="0.7" />
            <circle cx="180" cy="180" r="27" fill="none" stroke={IKIGAI_HEX} strokeOpacity={ikigaiCount ? 0.95 : 0.35} strokeWidth="2" />
            <text x="180" y="175" textAnchor="middle" fontSize="10" fontWeight="700" fill={IKIGAI_HEX}>
                IKIGAI
            </text>
            <text x="180" y="192" textAnchor="middle" fontSize="14" fontWeight="800" fill="#ffffff">
                {ikigaiCount}
            </text>

            {LABELS.map((l) => (
                <text key={l.text} x={l.x} y={l.y} textAnchor="middle" fontSize="12" fontWeight="700" fill={l.fill}>
                    {l.text}
                </text>
            ))}
        </svg>
    );
}

function Badge({ x, y, n }) {
    const active = n > 0;
    return (
        <g opacity={active ? 1 : 0.4}>
            <circle cx={x} cy={y} r="13" fill="#0b1020" fillOpacity="0.6" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
                {n}
            </text>
        </g>
    );
}
