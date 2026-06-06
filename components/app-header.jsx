'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IkigaiMark } from 'components/ikigai/mark';

const navItems = [
    { href: '/discover', label: 'Discover' },
    { href: '/map', label: 'Your map' }
];

export function AppHeader() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-3 py-5">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold no-underline">
                <IkigaiMark className="w-7 h-7" />
                <span>Ikigai</span>
            </Link>
            <ul className="flex items-center gap-1 ml-auto text-sm">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={[
                                    'no-underline rounded-full px-3 py-1.5 transition-colors',
                                    active ? 'bg-white/15 font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                ].join(' ')}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
