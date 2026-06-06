// The ikigai wordmark glyph: four overlapping circles that blend at the centre.
export function IkigaiMark({ className }) {
    return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
            <g style={{ mixBlendMode: 'screen' }}>
                <circle cx="40" cy="40" r="26" fill="#fb7185" fillOpacity="0.85" />
                <circle cx="60" cy="40" r="26" fill="#fbbf24" fillOpacity="0.85" />
                <circle cx="40" cy="60" r="26" fill="#34d399" fillOpacity="0.85" />
                <circle cx="60" cy="60" r="26" fill="#60a5fa" fillOpacity="0.85" />
            </g>
        </svg>
    );
}
