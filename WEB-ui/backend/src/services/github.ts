import { config } from '../config.js';
import { Repository } from '../types/index.js';

export interface GithubUrlParsed {
  owner: string;
  repo: string;
}

export interface TreeFileItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface IngestionResult {
  repository: Repository;
  files: TreeFileItem[];
  isTruncated: boolean;
  totalTreeFiles: number;
  filteredFiles: TreeFileItem[];
}

export interface FileContentResult {
  path: string;
  content: string | null;
  error?: string;
  size: number;
}

// In-memory cache keyed by `owner/repo@sha`
const repoCache = new Map<string, IngestionResult>();
const fileContentCache = new Map<string, string>();

/**
 * Strict GitHub repository URL validation
 */
export function parseAndValidateGithubUrl(urlInput: string): GithubUrlParsed {
  const trimmed = (urlInput || '').trim();
  if (!trimmed) {
    throw new Error('Repository URL is required.');
  }

  // Reject URLs that don't belong to github.com
  if (!trimmed.includes('github.com')) {
    throw new Error('Only GitHub repositories are supported (e.g. https://github.com/owner/repository).');
  }

  // Normalize scheme
  let url = trimmed;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Reject branch, blob, PR, or issue URLs
  if (url.includes('/tree/') || url.includes('/blob/')) {
    throw new Error('Please submit the root repository URL, not a branch or file path (e.g. https://github.com/owner/repository).');
  }
  if (url.includes('/pull/') || url.includes('/issues/') || url.includes('/commit/')) {
    throw new Error('Please submit the repository root URL, not a pull request, issue, or commit link.');
  }

  // Validate pattern
  const GITHUB_REPO_REGEX = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
  const match = url.match(GITHUB_REPO_REGEX);

  if (!match) {
    throw new Error('Invalid GitHub repository URL format. Expected: https://github.com/owner/repository');
  }

  const owner = match[2];
  let repo = match[3];
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  return { owner, repo };
}

/**
 * Helper to perform authenticated/unauthenticated GitHub API requests with rate limit checks
 */
async function fetchGithubApi(endpoint: string): Promise<any> {
  const url = `https://api.github.com${endpoint}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RepoRiddle-Analyzer/1.0',
  };

  if (config.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${config.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 403 || response.status === 429) {
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    const resetTime = rateLimitReset
      ? new Date(parseInt(rateLimitReset, 10) * 1000).toLocaleTimeString()
      : 'shortly';

    if (rateLimitRemaining === '0') {
      throw new Error(
        `GitHub API rate limit exceeded. Reset time: ${resetTime}. Configure GITHUB_TOKEN in backend .env to increase limit to 5,000 requests/hr.`
      );
    }
  }

  if (response.status === 404) {
    throw new Error('Repository not found on GitHub. Verify the owner and repository name, and ensure it is public.');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${body.slice(0, 150)}`);
  }

  return response.json();
}

/**
 * Filter out non-code, generated, lockfiles, and dependencies
 */
export function isEligibleSourceFile(filePath: string): boolean {
  const lower = filePath.toLowerCase().replace(/\\/g, '/');

  // Skip vendor, dependencies, and build outputs
  const ignoredPrefixes = [
    'node_modules/',
    'dist/',
    'build/',
    'out/',
    'coverage/',
    '.next/',
    '.nuxt/',
    '.cache/',
    'vendor/',
    'target/',
    '.git/',
  ];
  if (ignoredPrefixes.some((prefix) => lower.startsWith(prefix) || lower.includes(`/${prefix}`))) {
    return false;
  }

  // Skip minified, bundle, source maps, and binary
  if (
    lower.endsWith('.min.js') ||
    lower.endsWith('.min.css') ||
    lower.endsWith('.map') ||
    lower.endsWith('.d.ts') ||
    lower.endsWith('.bundle.js') ||
    lower.endsWith('package-lock.json') ||
    lower.endsWith('yarn.lock') ||
    lower.endsWith('pnpm-lock.yaml')
  ) {
    return false;
  }

  // Accept JS, TS, JSX, TSX, JSON, Markdown, Config files
  const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json'];
  return allowedExtensions.some((ext) => lower.endsWith(ext));
}

/**
 * Detect primary language and technologies from file paths
 */
function detectTechnologies(filePaths: string[]): string[] {
  const techs = new Set<string>();
  const paths = filePaths.map((p) => p.toLowerCase());

  if (paths.some((p) => p.endsWith('.ts') || p.endsWith('.tsx'))) techs.add('TypeScript');
  if (paths.some((p) => p.endsWith('.js') || p.endsWith('.jsx'))) techs.add('JavaScript');
  if (paths.some((p) => p.endsWith('.tsx') || p.endsWith('.jsx') || p.includes('react'))) techs.add('React');
  if (paths.some((p) => p.includes('next.config') || p.includes('/pages/api/') || p.includes('/app/api/'))) techs.add('Next.js');
  if (paths.some((p) => p.includes('express') || p.includes('server.ts') || p.includes('app.ts'))) techs.add('Express');
  if (paths.some((p) => p.includes('zod') || p.includes('schema'))) techs.add('Zod');
  if (paths.some((p) => p.includes('prisma') || p.endsWith('.prisma'))) techs.add('Prisma');
  if (paths.some((p) => p.includes('test') || p.includes('spec') || p.includes('jest'))) techs.add('Jest/Testing');

  return Array.from(techs);
}

/**
 * Ingest repository: fetch metadata, commit SHA, and tree
 */
export async function ingestRepository(owner: string, repo: string): Promise<IngestionResult> {
  const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}`;

  // 1. Fetch repo metadata
  const repoMeta = await fetchGithubApi(`/repos/${owner}/${repo}`);
  const defaultBranch = repoMeta.default_branch || 'main';

  // 2. Fetch commit SHA of default branch
  const branchData = await fetchGithubApi(`/repos/${owner}/${repo}/branches/${encodeURIComponent(defaultBranch)}`);
  const commitSha = branchData.commit.sha;
  const versionedKey = `${cacheKey}@${commitSha}`;

  if (repoCache.has(versionedKey)) {
    return repoCache.get(versionedKey)!;
  }

  // 3. Fetch git tree recursively
  const treeData = await fetchGithubApi(`/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`);
  const rawTree: TreeFileItem[] = treeData.tree || [];
  const isTruncated = Boolean(treeData.truncated);

  // 4. Filter source files
  const eligibleFiles = rawTree.filter((item) => item.type === 'blob' && isEligibleSourceFile(item.path));

  // Cap at 1000 files for MVP budget
  const MAX_MVP_FILES = 1000;
  const cappedFiles = eligibleFiles.slice(0, MAX_MVP_FILES);
  const truncatedByCap = isTruncated || eligibleFiles.length > MAX_MVP_FILES;

  const detectedTechnologies = detectTechnologies(cappedFiles.map((f) => f.path));

  const repository: Repository = {
    id: `${owner}-${repo}`,
    owner: repoMeta.owner.login,
    name: repoMeta.name,
    fullName: repoMeta.full_name,
    description: repoMeta.description || 'Public GitHub Repository',
    language: repoMeta.language || 'TypeScript',
    defaultBranch,
    commitSha,
    stars: repoMeta.stargazers_count || 0,
    fileCount: cappedFiles.length,
    detectedTechnologies: detectedTechnologies.length > 0 ? detectedTechnologies : ['JavaScript/TypeScript'],
  };

  const result: IngestionResult = {
    repository,
    files: rawTree,
    isTruncated: truncatedByCap,
    totalTreeFiles: rawTree.length,
    filteredFiles: cappedFiles,
  };

  repoCache.set(versionedKey, result);
  return result;
}

/**
 * Fetch raw file content with bounded concurrency and caching
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  commitSha: string,
  filePath: string
): Promise<FileContentResult> {
  const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}@${commitSha}:${filePath}`;
  if (fileContentCache.has(cacheKey)) {
    const cached = fileContentCache.get(cacheKey)!;
    return {
      path: filePath,
      content: cached,
      size: cached.length,
    };
  }

  // Raw GitHub user content URL using verified commit SHA (prevents arbitrary injection)
  const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(commitSha)}/${filePath.replace(/\\/g, '/')}`;

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'RepoRiddle-Analyzer/1.0',
    };
    if (config.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${config.GITHUB_TOKEN}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const resp = await fetch(rawUrl, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      return {
        path: filePath,
        content: null,
        error: `HTTP ${resp.status} fetching file from GitHub`,
        size: 0,
      };
    }

    const text = await resp.text();

    // Check size budget: 500KB max per file
    if (text.length > 500 * 1024) {
      return {
        path: filePath,
        content: null,
        error: 'File exceeds maximum size budget (500KB)',
        size: text.length,
      };
    }

    fileContentCache.set(cacheKey, text);
    return {
      path: filePath,
      content: text,
      size: text.length,
    };
  } catch (err: any) {
    return {
      path: filePath,
      content: null,
      error: err.message || 'Network error fetching source file',
      size: 0,
    };
  }
}

/**
 * Batch fetch source files with bounded concurrency (e.g. 5 concurrent requests)
 */
export async function batchFetchSourceFiles(
  owner: string,
  repo: string,
  commitSha: string,
  filePaths: string[],
  concurrencyLimit = 5
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const queue = [...filePaths];

  async function worker() {
    while (queue.length > 0) {
      const path = queue.shift()!;
      const res = await fetchFileContent(owner, repo, commitSha, path);
      if (res.content !== null) {
        results.set(path, res.content);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrencyLimit, filePaths.length) },
    () => worker()
  );
  await Promise.all(workers);

  return results;
}
