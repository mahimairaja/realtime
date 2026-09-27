// Builds the site's data from README.md. The README is the product: every word, table and link
// on the site comes from it. A README whose shape this parser does not recognise stops the build
// here, so the site never publishes a half-read page.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const site = resolve(here, '..');
const REPO_URL = 'https://github.com/mahimairaja/realtime';

const readme = readFileSync(resolve(repo, 'README.md'), 'utf8');
const problems = [];
const need = (value, what) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) {
    problems.push(`Could not find ${what} in README.md.`);
  }
  return value;
};

// --- Reference links -----------------------------------------------------------------------
// The README cites sources as [text][ref] with the definitions at the bottom. Every rendered
// fragment is given the full definition list so a reference resolves wherever it is used.
const refLines = readme.split('\n').filter((l) => /^\[[^\]]+\]:\s*\S+/.test(l));
const refDefs = refLines.join('\n');
const refs = Object.fromEntries(refLines.map((l) => l.match(/^\[([^\]]+)\]:\s*(\S+)/).slice(1)));

// --- Sections ------------------------------------------------------------------------------
// "## 💵 8. Pricing" -> { num: 8, emoji, title, slug }. GitHub's anchor for that heading is
// "-8-pricing"; links to it are rewritten to the section's own page.
const githubSlug = (s) =>
  s
    .toLowerCase()
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    // No trim: GitHub keeps the space the emoji leaves, which is why the anchor starts with "-".
    .replace(/\s/g, '-');
const pageSlug = (title) => githubSlug(title).replace(/^-+|-+$/g, '').replace(/-+/g, '-');

const headings = [...readme.matchAll(/^## (\S+) (\d+)\. (.+)$/gm)];
need(headings, 'numbered "## <emoji> N. Title" sections');
const tailStart = readme.search(/^\[MIT\]\(LICENSE\)/m);
const sections = headings.map((m, i) => {
  const [, emoji, num, title] = m;
  const start = m.index + m[0].length;
  const end = i + 1 < headings.length ? headings[i + 1].index : tailStart > 0 ? tailStart : readme.length;
  return {
    num: Number(num),
    emoji,
    title,
    slug: pageSlug(title),
    anchor: githubSlug(`${emoji} ${num}. ${title}`),
    body: readme.slice(start, end).trim(),
  };
});
const anchorToPage = Object.fromEntries(sections.map((s) => [`#${s.anchor}`, `/${s.slug}/`]));

// --- Markdown ------------------------------------------------------------------------------
const LEVELS = { '🟢': ['beginner', 'Beginner'], '🟡': ['intermediate', 'Intermediate'], '🔴': ['advanced', 'Advanced'] };
const marked = new Marked({ gfm: true });
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      let url = href ?? '';
      if (anchorToPage[url]) url = anchorToPage[url];
      else if (url.startsWith('#')) url = `${REPO_URL}${url}`;
      else if (!/^[a-z]+:/i.test(url) && !url.startsWith('/')) url = `${REPO_URL}/blob/main/${url.replace(/^\.\//, '')}`;
      const external = /^https?:/i.test(url);
      const t = title ? ` title="${title}"` : '';
      return `<a href="${url}"${t}${external ? ' rel="noopener" target="_blank"' : ''}>${text}</a>`;
    },
  },
});
const levelSpans = (html) =>
  html
    // "🟢→🔴" ranges first, then single tags.
    .replace(/(🟢|🟡|🔴)→(🟢|🟡|🔴)/gu, (_, a, b) => `<span class="level" data-level="${LEVELS[a][0]}">${LEVELS[a][1]} → ${LEVELS[b][1]}</span>`)
    .replace(/🟢|🟡|🔴/gu, (e) => `<span class="level" data-level="${LEVELS[e][0]}">${LEVELS[e][1]}</span>`)
    // A lone "?" cell or code span is the README's "not documented" marker.
    .replace(/<td>\s*(?:<code>)?\?(?:<\/code>)?\s*<\/td>/g, '<td><span class="unknown">Not documented</span></td>')
    // ...except where the README is explaining the marker itself ("A `?` means ...").
    .replace(/<code>\?<\/code>(?! means)/g, '<span class="unknown">Not documented</span>');
const md = (text) => levelSpans(marked.parse(`${text}\n\n${refDefs}\n`));
// Table cells use [text][ref] links, which only resolve with the definitions present, so render
// them as a block with the definitions appended and unwrap the paragraph.
const inline = (text) =>
  text.trim() === '?'
    ? '<span class="unknown">Not documented</span>'
    : md(text.trim())
        .trim()
        .replace(/^<p>([\s\S]*)<\/p>$/, '$1');
const plain = (text) =>
  text
    .replace(/\[([^\]]+)\](\[[^\]]*\]|\([^)]*\))/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Everything inside <details> is shown open on the site; the summary becomes a subheading.
const expandDetails = (body) =>
  body
    .replace(/<summary><b>(.+?)<\/b><\/summary>/g, '')
    .replace(/<\/?details>/g, '')
    .trim();
const introOf = (body) => body.split(/^<details>/m)[0].trim();

// --- Hero -------------------------------------------------------------------------------------
const alt = need(readme.match(/alt="([^"]+)"/)?.[1], 'the banner alt text');
const [name, headlineRaw] = alt.split(/:\s*/);
const lede = need(readme.match(/^A curated reference[^\n]+$/m)?.[0], 'the one-line description under the banner');
const start = sections.find((s) => s.num === 0);
const evidence = need(start?.body.match(/^\*\*Evidence:\*\*.+$/m)?.[0], 'the Evidence paragraph in section 0');
const reviewed = need(evidence?.match(/\*\*(\d{4}-\d{2}-\d{2})\*\*/)?.[1], 'the review date in the Evidence paragraph');

// --- Section 1: the audio paths ---------------------------------------------------------------
const what = sections.find((s) => s.num === 1);
const code = (what?.body.match(/```text\n([\s\S]+?)```/)?.[1] ?? '').split(/^Conversation behavior/m)[0];
const paths = code
  .split('\n')
  .map((l) => l.match(/^([A-Z][\w -]*):\s+(.+->.+)$/))
  .filter(Boolean)
  .map(([, label, chain]) => ({ label, stages: chain.split('->').map((x) => x.trim()) }));
need(paths, 'the "Audio paths" diagram in section 1');

// --- Section 2: the quick matrix --------------------------------------------------------------
const tableRows = (text) =>
  text
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) =>
      l
        .slice(1, -1)
        .split(/(?<!\\)\|/)
        .map((c) => c.trim()),
    );
const comparison = sections.find((s) => s.num === 2);
const [header, , ...rows] = tableRows(introOf(comparison?.body ?? ''));
need(rows, 'the quick comparison table in section 2');
const modelRef = (cell) => {
  const m = cell.match(/^\[([^\]]+)\]\[([^\]]+)\]$/);
  return m ? { name: m[1], href: refs[m[2]] ?? null } : { name: plain(cell), href: null };
};
const matrix = {
  controls: (header ?? []).slice(1),
  models: rows.map((r) => ({
    ...modelRef(r[0]),
    cells: r.slice(1).map((c) => ({ html: inline(c), unknown: c.trim() === '?' })),
  })),
  notes: introOf(comparison?.body ?? '')
    .split('\n')
    .filter((l) => l && !l.startsWith('|'))
    .slice(1)
    .map((l) => md(l)),
};

// --- Section 8: five-minute estimates ---------------------------------------------------------
const pricing = sections.find((s) => s.num === 8);
const estimateBlock = pricing?.body.split(/^### Five-minute starting estimates/m)[1]?.split(/^<details>|^### /m)[0] ?? '';
const [, , ...estimateRows] = tableRows(estimateBlock);
const estimateIntro = estimateBlock.split('\n').filter((l) => l && !l.startsWith('|'))[0] ?? '';
const estimates = estimateRows.map((r) => {
  const amount = r[1].match(/\$([\d.]+)/);
  return {
    model: plain(r[0]),
    label: plain(r[1]),
    amount: amount ? Number(amount[1]) : null,
    floor: /at least/i.test(r[1]),
    approx: /about/i.test(r[1]),
    extra: plain(r[2]),
    sourceHtml: inline(r[3]),
    verified: plain(r[4]),
  };
});
need(estimates, 'the five-minute estimates table in section 8');

// --- Stars (optional) -------------------------------------------------------------------------
let stars = null;
try {
  const res = await fetch('https://api.github.com/repos/mahimairaja/realtime', {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'realtime-site' },
    signal: AbortSignal.timeout(8000),
  });
  if (res.ok) stars = (await res.json()).stargazers_count ?? null;
} catch {
  // offline or rate limited
}

if (problems.length) {
  for (const p of problems) console.error(p);
  console.error('\nThe site is built from README.md; fix its structure before building.');
  process.exit(1);
}

const data = {
  repo: REPO_URL,
  hero: {
    name,
    headline: headlineRaw.charAt(0).toUpperCase() + headlineRaw.slice(1),
    lede,
    evidenceHtml: md(evidence),
    reviewed,
    startHtml: md(introOf(start.body).split(/^\*\*Evidence:\*\*/m)[0]),
  },
  paths,
  pathsHtml: md(what.body.split('\n\n')[0]),
  turnHtml: md(need(what.body.match(/^\*\*The question that decides[^\n]+$/m)?.[0], 'the "who owns the turn" line in section 1')),
  ruleHtml: md(need(sections.find((x) => x.num === 11)?.body.match(/^\*\*Every comparison needs[^\n]+$/m)?.[0], 'the evidence rule in section 11')),
  matrix,
  estimates: { introHtml: md(estimateIntro), rows: estimates, headlineHtml: md(pricing.body.split('\n').find((l) => l.startsWith('**USD')) ?? '') },
  sections: sections
    .filter((s) => s.num > 0)
    .map((s) => ({
      num: s.num,
      emoji: s.emoji,
      title: s.title,
      slug: s.slug,
      intro: plain(introOf(s.body).split('\n\n')[0]),
      introHtml: md(introOf(s.body).split('\n\n')[0]),
      html: md(expandDetails(s.body)),
    })),
  stars,
};

mkdirSync(resolve(site, 'src/data'), { recursive: true });
writeFileSync(resolve(site, 'src/data/readme.json'), JSON.stringify(data, null, 2) + '\n');

// Social card: the repository's own banner, framed at 1200 x 630.
mkdirSync(resolve(site, 'public'), { recursive: true });
await sharp(resolve(repo, 'docs/assets/banner-dark.webp'))
  .resize(1200, 630, { fit: 'contain', background: '#0a0a0a' })
  .png()
  .toFile(resolve(site, 'public/og.png'));

console.log(
  `Synced ${data.sections.length} sections, ${matrix.models.length} models x ${matrix.controls.length} controls, ` +
    `${estimates.length} estimates, ${paths.length} audio paths. Reviewed ${reviewed}. Stars: ${stars ?? 'unknown'}.`,
);
