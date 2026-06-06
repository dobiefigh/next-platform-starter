// Lightweight, consistent stroke icon set (24x24, currentColor).
// One shared wrapper keeps stroke weight and sizing uniform.
function Icon({ children, className, filled }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill={filled ? 'currentColor' : 'none'}
            stroke={filled ? 'none' : 'currentColor'}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export function IconCompass({ className }) {
    return (
        <Icon className={className}>
            <circle cx="12" cy="12" r="9" />
            <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
        </Icon>
    );
}

export function IconMap({ className }) {
    return (
        <Icon className={className}>
            <circle cx="9.5" cy="10" r="5" />
            <circle cx="14.5" cy="10" r="5" />
            <circle cx="9.5" cy="14" r="5" />
            <circle cx="14.5" cy="14" r="5" />
        </Icon>
    );
}

export function IconTarget({ className }) {
    return (
        <Icon className={className}>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" filled />
        </Icon>
    );
}

export function IconGear({ className }) {
    return (
        <Icon className={className}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </Icon>
    );
}

export function IconCheck({ className }) {
    return (
        <Icon className={className}>
            <path d="M20 6L9 17l-5-5" />
        </Icon>
    );
}

export function IconFlame({ className }) {
    return (
        <Icon className={className} filled>
            <path d="M12 2c1 3-2 4-2 7a2 2 0 104 0c0-.7-.2-1.3-.5-1.8C16 9 18 11.5 18 14.5A6 6 0 016 14.5C6 10 9 7 12 2z" />
        </Icon>
    );
}

export function IconPlus({ className }) {
    return (
        <Icon className={className}>
            <path d="M12 5v14M5 12h14" />
        </Icon>
    );
}

export function IconX({ className }) {
    return (
        <Icon className={className}>
            <path d="M18 6L6 18M6 6l12 12" />
        </Icon>
    );
}

export function IconArrowRight({ className }) {
    return (
        <Icon className={className}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </Icon>
    );
}
