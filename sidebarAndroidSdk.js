module.exports = {
  someSidebar: [
    'about',
    'installation',
    'modules',
    'usage',
    {
      type: 'category',
      label: 'Starters',
      items: ['integrate/AndroidViews', 'integrate/AndroidJetpackCompose'],
    },
    {
      type: 'category',
      label: 'Jetpack Compose',
      items: [
        'jetpack/installation',
        'jetpack/usage',
        'jetpack/troubleshooting',
      ],
    },
    'production',
    'troubleshooting',
    {
      type: 'category',
      label: 'For AI agents',
      link: { type: 'doc', id: 'agents/index' },
      items: [
        'agents/install-views',
        'agents/install-compose',
        'agents/migrate-strings',
        'agents/api-reference',
        'agents/diagnostics',
      ],
    },
  ],
};
