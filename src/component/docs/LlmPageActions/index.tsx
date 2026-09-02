import React, { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  useActivePluginAndVersion,
  useDoc,
} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

/**
 * Docs plugin ids whose pages get a Markdown twin (`<route>.md`) from
 * `@signalwire/docusaurus-plugin-llms-txt`. Keep in sync with the exclusions in
 * `llmsTxt.js`: the REST API reference and the root `docs/` folder are not converted.
 */
const PLUGINS_WITH_MARKDOWN = new Set([
  'android-sdk',
  'platform',
  'js-sdk',
  'ios-sdk',
  'tolgee-cli',
]);

const DEFAULT_PROMPT = 'Read {url} so I can ask questions about it.';

type Status = { kind: 'idle' } | { kind: 'ok' | 'error'; text: string };

type AgentLink = {
  name: string;
  href: (prompt: string) => string;
};

/** Hosted assistants that accept a prompt in the URL; the prompt points them at the Markdown twin. */
const AGENT_LINKS: AgentLink[] = [
  {
    name: 'Open in ChatGPT',
    href: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    name: 'Open in Claude',
    href: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
  {
    name: 'Open in Perplexity',
    href: (prompt) =>
      `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
  },
  {
    name: 'Open in Cursor',
    href: (prompt) =>
      `cursor://anysphere.cursor-deeplink/prompt?text=${encodeURIComponent(
        prompt
      )}`,
  },
];

async function copyText(text: string): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    throw new Error('Clipboard is not available in this browser');
  }
  await navigator.clipboard.writeText(text);
}

/**
 * "Copy page / open in an AI assistant" menu rendered above every documentation page
 * that has a Markdown twin. Lets a reader hand the page to ChatGPT, Claude, Perplexity or
 * Cursor, or copy the Markdown / a ready prompt for agents without a URL scheme
 * (Claude Code, Copilot, Codex, Gemini CLI).
 */
export function LlmPageActions(): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const { metadata, frontMatter } = useDoc();
  const active = useActivePluginAndVersion();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const pluginId = active?.activePlugin?.pluginId;
  // Only the current version is converted (includeVersionedDocs: false).
  const isCurrent = active?.activeVersion?.name === 'current';
  if (!pluginId || !PLUGINS_WITH_MARKDOWN.has(pluginId) || !isCurrent) {
    return null;
  }

  const markdownPath = `${metadata.permalink.replace(/\/$/, '')}.md`;
  const markdownUrl = `${siteConfig.url.replace(/\/$/, '')}${markdownPath}`;
  const promptTemplate =
    (frontMatter as { llm_prompt?: string }).llm_prompt ?? DEFAULT_PROMPT;
  const prompt = promptTemplate.replace('{url}', markdownUrl);

  const closeMenu = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  const report = (next: Status) => {
    setStatus(next);
    window.setTimeout(() => setStatus({ kind: 'idle' }), 2500);
  };

  const copyMarkdown = useCallback(async () => {
    try {
      const response = await fetch(markdownPath, {
        headers: { Accept: 'text/markdown, text/plain' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      await copyText(await response.text());
      report({ kind: 'ok', text: 'Copied page as Markdown' });
    } catch {
      report({
        kind: 'error',
        text: 'Markdown is generated at build time; copy the link instead',
      });
    }
  }, [markdownPath]);

  const copyPrompt = useCallback(async () => {
    try {
      await copyText(prompt);
      report({ kind: 'ok', text: 'Copied prompt for your agent' });
    } catch {
      report({ kind: 'error', text: 'Could not access the clipboard' });
    }
  }, [prompt]);

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={clsx(styles.button, styles.primary)}
        onClick={copyMarkdown}
        title="Copy the Markdown version of this page"
      >
        Copy page
      </button>
      <details ref={detailsRef} className={styles.details}>
        <summary
          className={clsx(styles.button, styles.summary)}
          aria-label="More ways to use this page with an AI assistant"
        >
          <span aria-hidden="true">▾</span>
        </summary>
        <ul className={styles.menu} onClick={closeMenu}>
          <li>
            <a
              className={styles.item}
              href={markdownPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.itemTitle}>View as Markdown</span>
              <span className={styles.itemHint}>
                Plain text of this page, for any LLM
              </span>
            </a>
          </li>
          <li>
            <button type="button" className={styles.item} onClick={copyPrompt}>
              <span className={styles.itemTitle}>Copy prompt</span>
              <span className={styles.itemHint}>
                For Claude Code, Copilot, Codex, Gemini CLI
              </span>
            </button>
          </li>
          {AGENT_LINKS.map((agent) => (
            <li key={agent.name}>
              <a
                className={styles.item}
                href={agent.href(prompt)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.itemTitle}>{agent.name}</span>
              </a>
            </li>
          ))}
          <li className={styles.divider} aria-hidden="true" />
          <li>
            <a
              className={styles.item}
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.itemTitle}>llms.txt</span>
              <span className={styles.itemHint}>
                Index of every page for agents
              </span>
            </a>
          </li>
        </ul>
      </details>
      <span
        className={clsx(
          styles.status,
          status.kind === 'error' && styles.statusError
        )}
        role="status"
        aria-live="polite"
      >
        {status.kind === 'idle' ? '' : status.text}
      </span>
    </div>
  );
}
