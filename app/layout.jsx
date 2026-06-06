import '../styles/globals.css';
import { AppHeader } from 'components/app-header';
import { BottomNav } from 'components/bottom-nav';
import { SwRegister } from 'components/sw-register';

export const metadata = {
    title: {
        template: '%s · Ikigai',
        default: 'Ikigai — Find your reason for being'
    },
    description:
        'Discover and follow your ikigai: where what you love, what you are good at, what the world needs, and what you can be paid for all meet.',
    applicationName: 'Ikigai',
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Ikigai' },
    icons: { icon: '/icon.svg', apple: '/icon.svg' }
};

export const viewport = {
    themeColor: '#0b1020',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased text-white bg-[#0b1020]">
                <div className="flex flex-col min-h-screen px-5 bg-noise sm:px-8">
                    <div className="flex flex-col w-full max-w-2xl mx-auto grow">
                        <AppHeader />
                        <main className="grow pb-28 sm:pb-16">{children}</main>
                    </div>
                </div>
                <BottomNav />
                <SwRegister />
            </body>
        </html>
    );
}
