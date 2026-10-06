import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

/**
 * Syncs code snippets for the Android SDK docs from the Tolgee Mobile Kotlin SDK repository at a
 * pinned ref, into android-sdk/_snippets/. Pages include them with a fenced block:
 *
 *   ```kotlin title="MyApplication.kt" file=<rootDir>/android-sdk/_snippets/init.kt
 *   ```
 *
 * which plugins/remark-snippet-file.cjs fills in at build time, so the code is in the static HTML
 * (and therefore in the Markdown copies and llms.txt).
 *
 *   npm run snippets:sync    fetch and write
 *   npm run snippets:check   fetch and compare with the committed files; exit 1 on any difference
 *
 * It fails when a file is missing at the pinned ref, when a start/end pattern or line range no
 * longer matches, when the `expect` guard does not match the extracted text, or when the tag no
 * longer points at the pinned SHA.
 */

type Replace = { from: string; to: string };
type Snippet = {
  id: string;
  path: string;
  lines?: string;
  start?: string;
  end?: string;
  expect?: string;
  drop?: string[];
  replace?: Replace[];
};
type Manifest = {
  defaults: { repo: string; ref: string; sha: string };
  snippets: Snippet[];
};

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'android-sdk/_snippets');
const check = process.argv.includes('--check');
const skipTagCheck = process.argv.includes('--skip-tag-check');

const EXTENSIONS: Record<string, string> = {
  '.kt': 'kt',
  '.kts': 'kts',
  '.xml': 'xml',
  '.tolgeerc': 'json',
};

function fail(message: string): never {
  console.error(`snippets: ${message}`);
  process.exit(1);
}

function verifyTag({ repo, ref, sha }: Manifest['defaults']) {
  let output: string;
  try {
    output = execFileSync(
      'git',
      [
        'ls-remote',
        `https://github.com/${repo}.git`,
        `refs/tags/${ref}`,
        `refs/tags/${ref}^{}`,
      ],
      { encoding: 'utf8' }
    );
  } catch (e) {
    fail(`cannot resolve tag ${ref} of ${repo}: ${(e as Error).message}`);
  }
  const rows = output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t'));
  if (rows.length === 0) fail(`tag ${ref} does not exist in ${repo}`);
  // An annotated tag lists the tag object, then the commit it points at with a ^{} suffix.
  const peeled = rows.find(([, name]) => name.endsWith('^{}'));
  const resolved = (peeled ?? rows[0])[0];
  if (resolved !== sha) {
    fail(
      `tag ${ref} now points at ${resolved}, but snippets.json pins ${sha}. ` +
        `Tags can move; review the change and update "sha" on purpose.`
    );
  }
}

async function fetchSource(repo: string, sha: string, file: string) {
  const url = `https://raw.githubusercontent.com/${repo}/${sha}/${file}`;
  const response = await fetch(url);
  if (!response.ok) fail(`HTTP ${response.status} for ${url}`);
  return response.text();
}

function dedent(lines: string[]) {
  const indents = lines
    .filter((l) => l.trim() !== '')
    .map((l) => l.match(/^ */)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) =>
    l.slice(Math.min(min, l.length - l.trimStart().length))
  );
}

function extract(snippet: Snippet, source: string) {
  const all = source.replace(/\r\n/g, '\n').split('\n');
  let from = 0;
  let to = all.length - 1;

  if (snippet.lines) {
    const m = snippet.lines.match(/^(\d+)-(\d+)$/);
    if (!m) fail(`${snippet.id}: "lines" must look like "12-20"`);
    from = Number(m[1]) - 1;
    to = Number(m[2]) - 1;
    if (to >= all.length)
      fail(
        `${snippet.id}: lines ${snippet.lines} exceed the file (${all.length} lines)`
      );
  } else if (snippet.start || snippet.end) {
    if (snippet.start) {
      const start = new RegExp(snippet.start);
      from = all.findIndex((l) => start.test(l));
      if (from < 0)
        fail(
          `${snippet.id}: start pattern /${snippet.start}/ not found in ${snippet.path}`
        );
    }
    if (snippet.end) {
      const end = new RegExp(snippet.end);
      const offset = all.slice(from).findIndex((l) => end.test(l));
      if (offset < 0)
        fail(
          `${snippet.id}: end pattern /${snippet.end}/ not found after line ${
            from + 1
          }`
        );
      to = from + offset;
    }
  } else {
    while (to > from && all[to].trim() === '') to--;
  }

  const dropped = (snippet.drop ?? []).map((pattern) => new RegExp(pattern));
  const sliced = all.slice(from, to + 1);
  const kept = sliced.filter((line) => !dropped.some((re) => re.test(line)));
  if (dropped.length > 0 && kept.length === sliced.length)
    fail(`${snippet.id}: no line matched a "drop" pattern, remove the pattern`);
  let text = dedent(kept).join('\n').replace(/\s+$/, '');
  if (snippet.expect && !new RegExp(snippet.expect).test(text))
    fail(
      `${snippet.id}: expected /${snippet.expect}/ in the extracted text, found:\n${text}`
    );
  for (const r of snippet.replace ?? []) {
    if (!text.includes(r.from))
      fail(
        `${snippet.id}: replace target "${r.from}" not found in the extracted text`
      );
    text = text.split(r.from).join(r.to);
  }
  return { text: `${text}\n`, firstLine: from + 1, lastLine: to + 1 };
}

async function main() {
  const manifest: Manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'snippets.json'), 'utf8')
  );
  const { repo, ref, sha } = manifest.defaults;
  if (!skipTagCheck) verifyTag(manifest.defaults);

  const ids = new Set<string>();
  const outputs = new Map<string, string>();
  const sources: Record<string, unknown> = {};
  const fetched = new Map<string, string>();

  for (const snippet of manifest.snippets) {
    if (ids.has(snippet.id)) fail(`duplicate snippet id "${snippet.id}"`);
    ids.add(snippet.id);
    if (!fetched.has(snippet.path))
      fetched.set(snippet.path, await fetchSource(repo, sha, snippet.path));
    const { text, firstLine, lastLine } = extract(
      snippet,
      fetched.get(snippet.path)!
    );
    const ext =
      path.basename(snippet.path) === '.tolgeerc'
        ? 'json'
        : EXTENSIONS[path.extname(snippet.path)] ?? 'txt';
    outputs.set(`${snippet.id}.${ext}`, text);
    sources[snippet.id] = {
      file: `${snippet.id}.${ext}`,
      path: snippet.path,
      lines: `${firstLine}-${lastLine}`,
      blob: `https://github.com/${repo}/blob/${sha}/${snippet.path}#L${firstLine}-L${lastLine}`,
    };
  }
  outputs.set(
    'sources.json',
    `${JSON.stringify({ repo, ref, sha, snippets: sources }, null, 2)}\n`
  );

  const stale = fs.existsSync(OUT_DIR)
    ? fs.readdirSync(OUT_DIR).filter((f) => !outputs.has(f))
    : [];

  if (check) {
    const problems: string[] = [];
    for (const [name, content] of outputs) {
      const file = path.join(OUT_DIR, name);
      if (!fs.existsSync(file)) problems.push(`missing ${name}`);
      else if (fs.readFileSync(file, 'utf8') !== content)
        problems.push(`differs ${name}`);
    }
    for (const name of stale) problems.push(`stale ${name}`);
    if (problems.length) {
      fail(
        `out of date, run "npm run snippets:sync":\n  ${problems.join('\n  ')}`
      );
    }
    console.log(
      `snippets: ${manifest.snippets.length} snippets match ${ref} (${sha.slice(
        0,
        7
      )})`
    );
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const name of stale) fs.rmSync(path.join(OUT_DIR, name));
  for (const [name, content] of outputs)
    fs.writeFileSync(path.join(OUT_DIR, name), content);
  console.log(
    `snippets: wrote ${
      manifest.snippets.length
    } snippets from ${ref} (${sha.slice(0, 7)})`
  );
}

main();
