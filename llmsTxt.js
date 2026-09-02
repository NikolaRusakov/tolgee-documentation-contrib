// LLM-friendly output of the documentation site.
//
// On every `docusaurus build` this plugin writes, next to the HTML pages:
//   - /llms.txt        an index of every documentation page with a one-line description
//   - /llms-full.txt   the same index followed by the full Markdown of every page
//   - /<route>.md      a clean Markdown twin of each page (e.g. /android-sdk/installation.md)
// Format: https://llmstxt.org
//
// The Android SDK API reference (KDoc rendered by Dokka) lives in the SDK repository and
// publishes its own llms.txt on GitHub Pages; it is cross-linked from the Optional section.

const ANDROID_SDK_API_REFERENCE =
  'https://tolgee.github.io/tolgee-mobile-kotlin-sdk';

const llmsTxt = [
  '@signalwire/docusaurus-plugin-llms-txt',
  {
    siteTitle: 'Tolgee documentation',
    siteDescription:
      'Tolgee is an open-source localization platform. These docs cover the Tolgee Platform (translation management, content delivery CDN, REST API), the Tolgee CLI, and the JavaScript, Android and iOS SDKs. Every link below points to a Markdown version of a documentation page.',
    // Default categorisation depth (route rules below override it per section).
    depth: 2,
    // Section order in llms.txt. Task-oriented SDK guides go first so a coding agent
    // reading only the top of the file lands on install / migrate instructions.
    includeOrder: [
      '/android-sdk/agents/**',
      '/android-sdk/**',
      '/platform/getting_started/**',
      '/platform/projects_and_organizations/content_delivery',
      '/platform/formats/**',
      '/platform/**',
      '/tolgee-cli/**',
      '/js-sdk/**',
      '/ios-sdk/**',
    ],
    content: {
      enableMarkdownFiles: true,
      enableLlmsFullTxt: true,
      // Absolute links (https://docs.tolgee.io/...) survive being copied out of the file.
      relativePaths: false,
      includeDocs: true,
      includePages: false,
      includeBlog: false,
      includeVersionedDocs: false,
      includeGeneratedIndex: false,
      excludeRoutes: [
        // 400+ generated REST endpoint pages would dominate llms-full.txt; the OpenAPI
        // spec is linked in the Optional section instead.
        '/api/**',
        // Legal pages and event notes are not developer documentation.
        '/docs/**',
        '/search',
        '/404',
        '/404.html',
      ],
      // First matching rule wins, so specific routes come before their parents.
      routeRules: [
        {
          route: '/android-sdk/agents/**',
          depth: 2,
          categoryName: 'Android SDK: guides for AI agents',
        },
        {
          route: '/android-sdk/jetpack/**',
          depth: 2,
          categoryName: 'Android SDK: Jetpack Compose',
        },
        {
          route: '/android-sdk/integrate/**',
          depth: 2,
          categoryName: 'Android SDK: starters',
        },
        // Top-level SDK pages stay in one flat list instead of one subcategory per page.
        { route: '/android-sdk/**', depth: 1, categoryName: 'Android SDK' },
        { route: '/platform/**', categoryName: 'Tolgee Platform' },
        { route: '/tolgee-cli/**', categoryName: 'Tolgee CLI' },
        { route: '/js-sdk/**', categoryName: 'JavaScript SDK' },
        { route: '/ios-sdk/**', categoryName: 'iOS SDK' },
      ],
    },
    optionalLinks: [
      {
        title: 'Android SDK API reference for LLMs (llms.txt)',
        url: `${ANDROID_SDK_API_REFERENCE}/llms.txt`,
        description:
          'Index of the Kotlin API reference (core, compose, gradle-plugin modules) generated from KDoc',
      },
      {
        title: 'Android SDK API reference, full text (llms-full.txt)',
        url: `${ANDROID_SDK_API_REFERENCE}/llms-full.txt`,
        description:
          'Every class and member of the Android SDK as one Markdown file, for investigating behaviour and debugging',
      },
      {
        title: 'Android SDK source code',
        url: 'https://github.com/tolgee/tolgee-mobile-kotlin-sdk',
        description:
          'Kotlin Multiplatform SDK repository with demo apps and AGENTS.md',
      },
      {
        title: 'Tolgee REST API (OpenAPI)',
        url: 'https://docs.tolgee.io/api',
        description:
          'Interactive REST API reference; the OpenAPI document is served by the platform at https://app.tolgee.io/v3/api-docs',
      },
      {
        title: 'Tolgee CLI configuration schema',
        url: 'https://docs.tolgee.io/cli-schema.json',
        description: 'JSON schema for .tolgeerc',
      },
    ],
    onRouteError: 'warn',
    logLevel: 1,
  },
];

module.exports = { llmsTxt };
