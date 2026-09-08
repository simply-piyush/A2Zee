export default function manifest() {
  return {
    name: 'A2Zee - Cooperative Gig Services Platform',
    short_name: 'A2Zee',
    description: 'A2Zee - Your Need. Our People. One Platform. Cooperative Gig Services Platform for Household & Community Services (Ministry of Cooperation & NCCT)',
    start_url: '/',
    display: 'fullscreen',
    display_override: ['fullscreen', 'standalone'],
    background_color: '#FFF6F0',
    theme_color: '#1F4072',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['utilities', 'lifestyle', 'business'],
    shortcuts: [
      {
        name: 'Book an Artisan',
        short_name: 'Book',
        description: 'Book verified cooperative artisans near you',
        url: '/user',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Artisan Dashboard',
        short_name: 'Jobs',
        description: 'View assigned emergency gigs and dispatches',
        url: '/worker',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Admin Federation Portal',
        short_name: 'Admin',
        description: 'Cooperative society governance and 85-10-5 split ledger',
        url: '/admin',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
