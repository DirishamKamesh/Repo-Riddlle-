import path from 'path';

export interface TsConfigOptions {
  baseUrl?: string;
  paths?: Record<string, string[]>;
}

/**
 * Clean and parse tsconfig.json or jsconfig.json content (removes JSON comments and trailing commas)
 */
export function parseTsConfigFile(rawJson: string): TsConfigOptions {
  try {
    // Strip single line and multi-line comments from JSON
    const cleanJson = rawJson
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/,(\s*[}\]])/g, '$1');

    const parsed = JSON.parse(cleanJson);
    const compilerOptions = parsed.compilerOptions || {};

    const baseUrl = compilerOptions.baseUrl
      ? compilerOptions.baseUrl.replace(/^[./]+/, '').replace(/\/$/, '')
      : undefined;

    const paths = compilerOptions.paths || undefined;

    return {
      baseUrl: baseUrl || '',
      paths,
    };
  } catch {
    return {};
  }
}

/**
 * Test candidate paths against the verified repository inventory set.
 * Supports:
 * - Direct file matches
 * - ESM extension rewriting (.js / .mjs -> .ts / .tsx)
 * - Extension appends (.ts, .tsx, .js, .jsx, .json, .d.ts)
 * - Directory index resolutions (/index.ts, /index.tsx, /index.js, etc.)
 */
function testCandidatePath(
  candidate: string,
  inventorySet: Set<string>
): string | null {
  const normalized = path.posix.normalize(candidate.replace(/\\/g, '/')).replace(/^\//, '');

  // 1. Direct match
  if (inventorySet.has(normalized)) {
    return normalized;
  }

  // 2. ESM extension rewriting: e.g. import './foo.js' -> foo.ts or foo.tsx or foo.js
  if (normalized.endsWith('.js')) {
    const base = normalized.slice(0, -3);
    const tsCandidates = [`${base}.ts`, `${base}.tsx`, `${base}.js`];
    for (const c of tsCandidates) {
      if (inventorySet.has(c)) return c;
    }
  } else if (normalized.endsWith('.mjs')) {
    const base = normalized.slice(0, -4);
    const tsCandidates = [`${base}.mts`, `${base}.ts`, `${base}.mjs`];
    for (const c of tsCandidates) {
      if (inventorySet.has(c)) return c;
    }
  } else if (normalized.endsWith('.cjs')) {
    const base = normalized.slice(0, -4);
    const tsCandidates = [`${base}.cts`, `${base}.ts`, `${base}.cjs`];
    for (const c of tsCandidates) {
      if (inventorySet.has(c)) return c;
    }
  } else if (normalized.endsWith('.jsx')) {
    const base = normalized.slice(0, -4);
    const tsCandidates = [`${base}.tsx`, `${base}.jsx`];
    for (const c of tsCandidates) {
      if (inventorySet.has(c)) return c;
    }
  }

  // 3. Extension append candidates
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.d.ts'];
  for (const ext of extensions) {
    const candidateWithExt = `${normalized}${ext}`;
    if (inventorySet.has(candidateWithExt)) {
      return candidateWithExt;
    }
  }

  // 4. Directory index resolutions
  const indexFiles = [
    `${normalized}/index.ts`,
    `${normalized}/index.tsx`,
    `${normalized}/index.js`,
    `${normalized}/index.jsx`,
    `${normalized}/index.mjs`,
    `${normalized}/index.cjs`,
    `${normalized}/index.json`,
  ];
  for (const idx of indexFiles) {
    if (inventorySet.has(idx)) {
      return idx;
    }
  }

  return null;
}

/**
 * Resolve an import specifier to a verified repository file path.
 * Supports:
 * - Relative imports (`./`, `../`)
 * - Configured tsconfig `paths` aliases (e.g. `@/*` -> `src/*`)
 * - Configured `baseUrl`
 * - ESM .js extension mapping to .ts
 * - Directory index lookups
 *
 * Returns repository-relative file path, or null if external dependency or unresolved.
 */
export function resolveModuleSpecifier(
  sourceFilePath: string,
  importSpecifier: string,
  inventorySet: Set<string>,
  tsconfig?: TsConfigOptions
): string | null {
  const spec = importSpecifier.trim();
  if (!spec) return null;

  // 1. Relative imports
  if (spec.startsWith('.') || spec.startsWith('/')) {
    const sourceDir = path.dirname(sourceFilePath);
    const rawTarget = path.posix.join(
      sourceDir.replace(/\\/g, '/'),
      spec.replace(/\\/g, '/')
    );
    return testCandidatePath(rawTarget, inventorySet);
  }

  // 2. TSConfig path alias resolution (e.g., `@/*`, `~/*`, `@components/*`)
  if (tsconfig?.paths) {
    for (const [pattern, mappings] of Object.entries(tsconfig.paths)) {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        if (spec.startsWith(prefix)) {
          const suffix = spec.slice(prefix.length);
          for (const mapping of mappings) {
            const mappedPath = mapping.replace('*', suffix);
            const candidate = tsconfig.baseUrl
              ? path.posix.join(tsconfig.baseUrl, mappedPath)
              : mappedPath;
            const resolved = testCandidatePath(candidate, inventorySet);
            if (resolved) return resolved;
          }
        }
      } else if (pattern === spec) {
        for (const mapping of mappings) {
          const candidate = tsconfig.baseUrl
            ? path.posix.join(tsconfig.baseUrl, mapping)
            : mapping;
          const resolved = testCandidatePath(candidate, inventorySet);
          if (resolved) return resolved;
        }
      }
    }
  }

  // 3. TSConfig baseUrl resolution (for non-relative imports)
  if (tsconfig?.baseUrl) {
    const candidate = path.posix.join(tsconfig.baseUrl, spec);
    const resolved = testCandidatePath(candidate, inventorySet);
    if (resolved) return resolved;
  }

  // 4. Default root resolution fallback if repository matches root directory name
  const rootCandidate = testCandidatePath(spec, inventorySet);
  if (rootCandidate) {
    return rootCandidate;
  }

  return null;
}
