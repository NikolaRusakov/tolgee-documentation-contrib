# Tolgee documentation

<img src="./tolgee_logo_text.svg" alt="logo" width="100px">

## Installation

```shell
npm install-clean
```

## Local Development

```shell
npm run start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Build

```shell
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## LLM-friendly output

The build also writes `build/llms.txt`, `build/llms-full.txt` and a Markdown twin of every documentation page
(`build/<route>.md`) through `@signalwire/docusaurus-plugin-llms-txt`, configured in `llmsTxt.js`. Every converted
page shows a **Copy page** menu (`src/component/docs/LlmPageActions`) to copy the Markdown or open the page in an AI
assistant; a page can set `llm_prompt` in its front matter to customise the prompt (`{url}` is replaced by the
Markdown URL). Guides written for coding agents live in `android-sdk/agents/`; the research behind the approach is in
`LLM_DOCS_RESEARCH.md`. `context7.json` prepares the repository for Context7 indexing (submit once at
https://context7.com/add-library).
