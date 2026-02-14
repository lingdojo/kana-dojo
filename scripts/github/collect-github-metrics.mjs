import fs from 'node:fs';
import path from 'node:path';

const token = process.env.GITHUB_TOKEN;
const repoSlug = process.env.REPO_SLUG || process.env.GITHUB_REPOSITORY;
const outputPath = process.env.METRICS_FILE || 'data/github-metrics.json';

if (!token) {
  process.stderr.write('Missing GITHUB_TOKEN. Skipping metrics collection.\n');
  process.exit(0);
}

if (!repoSlug || !repoSlug.includes('/')) {
  process.stderr.write(
    'Missing or invalid repo slug. Set REPO_SLUG or GITHUB_REPOSITORY.\n',
  );
  process.exit(0);
}

const [owner, repo] = repoSlug.split('/');
const apiBase = 'https://api.github.com';
const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
};

const parseLastPage = linkHeader => {
  if (!linkHeader) return null;
  const match = linkHeader.match(/page=(\d+)>; rel="last"/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
};

const fetchJson = async url => {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    process.stderr.write(`Request failed: ${url} (${response.status})\n`);
    return null;
  }
  const data = await response.json();
  return { data, response };
};

const repoResult = await fetchJson(`${apiBase}/repos/${owner}/${repo}`);
if (!repoResult) process.exit(0);

const { stargazers_count: stars, forks_count: forks } = repoResult.data ?? {};
if (typeof stars !== 'number' || typeof forks !== 'number') {
  process.stderr.write('Invalid repo response. Skipping metrics collection.\n');
  process.exit(0);
}

// Note: We omit `anon=1` to match the contributor count shown on GitHub's website.
// There may be a small discrepancy (±1-3) due to caching or how GitHub handles
// deleted/renamed accounts and bots. This is expected and acceptable.
const contributorsUrl = `${apiBase}/repos/${owner}/${repo}/contributors?per_page=1`;
const contributorsResult = await fetchJson(contributorsUrl);
if (!contributorsResult) process.exit(0);

const linkHeader = contributorsResult.response.headers.get('link');
let contributors = parseLastPage(linkHeader);

if (!contributors) {
  if (Array.isArray(contributorsResult.data)) {
    contributors = contributorsResult.data.length;
  } else {
    process.stderr.write(
      'Invalid contributors response. Skipping metrics collection.\n',
    );
    process.exit(0);
  }
}

const collectedAt = new Date().toISOString();
const entry = {
  collectedAt,
  stars,
  forks,
  contributors,
  diff: {
    stars: 0,
    forks: 0,
    contributors: 0,
  },
};

const absoluteOutputPath = path.resolve(outputPath);
fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });

let history = [];
if (fs.existsSync(absoluteOutputPath)) {
  try {
    const raw = fs.readFileSync(absoluteOutputPath, 'utf8');
    history = raw.trim() ? JSON.parse(raw) : [];
    if (!Array.isArray(history))
      throw new Error('Metrics file is not an array.');
  } catch (error) {
    process.stderr.write(`Failed to read metrics file: ${error.message}\n`);
    process.exit(0);
  }
}

const lastEntry = history.at(-1);
if (lastEntry && typeof lastEntry === 'object') {
  entry.diff.stars = entry.stars - (lastEntry.stars ?? entry.stars);
  entry.diff.forks = entry.forks - (lastEntry.forks ?? entry.forks);
  entry.diff.contributors =
    entry.contributors - (lastEntry.contributors ?? entry.contributors);
}

history.push(entry);
fs.writeFileSync(
  absoluteOutputPath,
  `${JSON.stringify(history, null, 2)}\n`,
  'utf8',
);
process.stdout.write('Metrics entry appended.\n');
