export default function manifest() {
    return {
        name: 'Ikigai — Find your reason for being',
        short_name: 'Ikigai',
        description: 'Discover and follow your ikigai: where what you love, what you are good at, what the world needs, and what you can be paid for all meet.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b1020',
        theme_color: '#0b1020',
        categories: ['lifestyle', 'productivity', 'health'],
        icons: [
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
    };
}
