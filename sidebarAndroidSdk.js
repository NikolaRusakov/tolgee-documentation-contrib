// Mirrors the JS SDK sidebar: two entry pages, one category per UI toolkit under "Integrations"
// with the same Overview → Installation → Translating → Switching language spine, concepts once at
// top level, and the AI-agents landing page last. Every id below is a route under /android-sdk.
module.exports = {
  someSidebar: [
    'about',
    'get-started',
    {
      type: 'category',
      label: 'Integrations',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Android Views',
          link: { type: 'doc', id: 'integrations/android-views/overview' },
          items: [
            'integrations/android-views/installation',
            'integrations/android-views/translating',
            'integrations/android-views/switching-language',
            'integrations/android-views/api',
          ],
        },
        {
          type: 'category',
          label: 'Jetpack Compose',
          link: { type: 'doc', id: 'integrations/jetpack-compose/overview' },
          items: [
            'integrations/jetpack-compose/installation',
            'integrations/jetpack-compose/translating',
            'integrations/jetpack-compose/switching-language',
            'integrations/jetpack-compose/multiplatform',
            'integrations/jetpack-compose/api',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Core concepts',
      collapsed: false,
      items: ['content-delivery', 'formatting', 'language', 'caching'],
    },
    'production',
    'troubleshooting',
    'migrate-existing-app',
    'api',
    {
      type: 'category',
      label: 'For AI agents',
      link: { type: 'doc', id: 'agents/index' },
      items: ['agents/diagnostics'],
    },
  ],
};
