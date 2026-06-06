'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconCompass, IconMap, IconTarget, IconGear } from 'components/icons';

const tabs = [
    { href: '/discover', label: 'Discover', Icon: IconCompass },
    { href: '/map', label: 'Map', Icon: IconMap },
    { href: '/follow', label: 'Follow', Icon: IconTarget },
    { href: '/settings', label: 'Data', Icon: IconGear }
];

function isActive(pathname, href) {
    return pathname === href || pathname.startsWith(href + '/');
}

// Thumb-reachable bottom tab bar on mobile; the top header carries nav on desktop.
export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 bg-[#0b1020]/90 backdrop-blur-md sm:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Primary"
        >
            <ul className="flex items-stretch justify-around max-w-2xl mx-auto">
                {tabs.map(({ href, label, Icon }) => {
                    const active = isActive(pathname, href);
                    return (
                        <li key={href} className="flex-1">
                            <Link
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={[
                                    'flex flex-col items-center justify-center gap-1 py-2.5 no-underline transition-colors',
                                    active ? 'text-primary' : 'text-white/55 hover:text-white'
                                ].join(' ')}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-[11px] font-medium">{label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
