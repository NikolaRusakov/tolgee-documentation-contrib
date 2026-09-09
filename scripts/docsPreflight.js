#!/usr/bin/env node
/**
 * Pre-merge check for documentation pages against the docs guidelines and the AEO cheatsheet.
 *
 *   node scripts/docsPreflight.js android-sdk            # every .mdx under a folder
 *   node scripts/docsPreflight.js android-sdk/about.mdx  # one page
 *
 * Mechanical items only; "each section stands alone" and "real support questions" stay with the reviewer.
 * Exit code 1 when any page fails an item, so it can run in CI.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: node scripts/docsPreflight.js <folder-or-file.mdx> [...]');
  process.exit(2);
}

function listMdx(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .flatMap((e) => {
      const p = path.join(target, e.name);
      if (e.isDirectory()) return listMdx(p);
      return e.name.endsWith('.mdx') && !e.name.startsWith('_') ? [p] : [];
    });
}

function parseFrontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1');
  }
  return { data, body: src.slice(m[0].length) };
}

function prose(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^import .*$/gm, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/<FaqSection[\s\S]*?\/>/g, (m) => [...m.matchAll(/(?:question|answer):\s*'([^']*)'/g)].map((x) => x[1]).join(' '))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]+/g, ' ');
}

const words = (s) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

function check(file) {
  const src = fs.readFileSync(file, 'utf8');
  const { data, body } = parseFrontMatter(src);
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });

  // 1. front matter
  const desc = data.description || '';
  ok('frontmatter id/title/description/image', !!(data.id && data.title && desc && data.image), Object.keys(data).join(','));
  ok('description < 155 chars', desc.length > 0 && desc.length < 155, `${desc.length}`);

  // 2. tl;dr: first prose paragraph after imports/banners, 40-80 words, no links, no bullets
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('import ') && !p.startsWith('<') && !p.startsWith('#') && !p.startsWith(':::'));
  const tldr = paragraphs[0] || '';
  const tldrWords = words(prose(tldr));
  ok('tl;dr 40-80 words, plain prose', tldrWords >= 40 && tldrWords <= 80 && !/\]\(/.test(tldr) && !/^[-*]/.test(tldr), `${tldrWords} words`);

  // 3. word count
  const total = words(prose(body));
  ok('800+ words (or deliberate stub)', total >= 800, `${total} words${total < 800 ? ' (stub?)' : ''}`);

  // 4. question H2s
  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const questions = h2s.filter((h) => /\?$/.test(h));
  ok('H2s phrased as questions (>= half)', h2s.length > 0 && questions.length * 2 >= h2s.length - 2, `${questions.length}/${h2s.length}`);

  // 5. no TODO / WIP / FIXME / commented notes
  ok('no TODO/WIP/FIXME/comments', !/TODO|FIXME|\bWIP\b|\{\/\*|<!--/.test(body), '');

  // 6. links: routes not files, no bare URLs in prose, >= 3 internal links
  const links = [...body.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  const fileLinks = links.filter((l) => /\.mdx?(#|$)/.test(l) && !/^https?:/.test(l));
  const internal = links.filter((l) => l.startsWith('/'));
  const bare = prose(body.replace(/\]\([^)]*\)/g, ']()')).match(/https?:\/\/\S+/g) || [];
  ok('links use routes, not files', fileLinks.length === 0, fileLinks.join(' '));
  ok('>= 3 internal links out', internal.length >= 3, `${internal.length}`);
  ok('no bare URLs in prose', bare.length === 0, bare.slice(0, 3).join(' '));

  // 7. FAQ block, 8. Next steps, 9. code block
  ok('FAQ block (FaqSection)', /<FaqSection/.test(body), '');
  ok('"Next steps" section', /^## Next steps/m.test(body), '');
  ok('>= 1 code block', /```/.test(body), '');

  // 10. kebab-case route
  const route = path.basename(file, '.mdx');
  ok('kebab-case file name', /^[a-z0-9-]+$/.test(route), route);

  return { file, total, results };
}

let failed = false;
for (const file of args.flatMap(listMdx)) {
  const { total, results } = check(file);
  const fails = results.filter((r) => !r.pass);
  if (fails.length) failed = true;
  console.log(`${fails.length ? '✗' : '✓'} ${file}  (${total} words, ${results.length - fails.length}/${results.length})`);
  for (const r of fails) console.log(`    - ${r.name}${r.detail ? `: ${r.detail}` : ''}`);
}
process.exit(failed ? 1 : 0);
