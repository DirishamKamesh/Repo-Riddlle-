import type { 
  ArchitectureGraph, 
  FileDetails, 
  FileNodeItem, 
  Mission, 
  RepositoryMetadata,
  AnalysisStatusResponse
} from '../types/index.ts';

export const DEMO_REPOSITORY: RepositoryMetadata = {
  id: 'demo-faculynk',
  owner: 'DirishamKamesh',
  name: 'FacuLynk',
  fullName: 'DirishamKamesh/FacuLynk',
  branch: 'main',
  defaultBranch: 'main',
  language: 'TypeScript',
  url: 'https://github.com/DirishamKamesh/FacuLynk',
  filesCount: 60,
  importsCount: 190,
  modulesCount: 42,
  analyzedAt: '2025-08-19T01:03:00Z',
  isDemo: true,
};

export const DEMO_STAGE_DEFINITIONS = [
  {
    id: 1,
    key: 'connect',
    title: 'Connect to Repository',
    description: 'Fetching repository information and verifying access...',
    duration: '4s',
  },
  {
    id: 2,
    key: 'tree',
    title: 'Read Repository Tree',
    description: 'Scanning files and building project structure...',
    duration: '12s',
  },
  {
    id: 3,
    key: 'dependencies',
    title: 'Analyze Imports & Dependencies',
    description: 'Parsing files and identifying relationships...',
    duration: '24s',
  },
  {
    id: 4,
    key: 'graph',
    title: 'Build Architecture Graph',
    description: 'Constructing the dependency graph and workflows...',
    duration: '18s',
  },
  {
    id: 5,
    key: 'missions',
    title: 'Prepare Engineering Missions',
    description: 'Generating learning missions and analysis insights...',
    duration: '6s',
  },
];

export const DEMO_FILE_TREE: FileNodeItem[] = [
  {
    id: 'root-src',
    name: 'src',
    path: 'src',
    type: 'folder',
    children: [
      {
        id: 'file-app-tsx',
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        category: 'entry',
        lines: 142,
      },
      {
        id: 'file-main-tsx',
        name: 'main.tsx',
        path: 'src/main.tsx',
        type: 'file',
        category: 'entry',
        lines: 48,
      },
      {
        id: 'folder-routes',
        name: 'routes',
        path: 'src/routes',
        type: 'folder',
        children: [
          {
            id: 'file-routes-index',
            name: 'index.tsx',
            path: 'src/routes/index.tsx',
            type: 'file',
            category: 'route',
            lines: 110,
          },
          {
            id: 'file-routes-auth',
            name: 'auth.routes.ts',
            path: 'src/routes/auth.routes.ts',
            type: 'file',
            category: 'route',
            lines: 84,
          },
          {
            id: 'file-routes-telemetry',
            name: 'telemetry.routes.ts',
            path: 'src/routes/telemetry.routes.ts',
            type: 'file',
            category: 'route',
            lines: 96,
          },
        ],
      },
      {
        id: 'folder-client',
        name: 'client',
        path: 'src/client',
        type: 'folder',
        children: [
          {
            id: 'file-gantry-core',
            name: 'Gantry.Core.ts',
            path: 'src/client/Gantry.Core.ts',
            type: 'file',
            category: 'model',
            lines: 348,
          },
          {
            id: 'file-gantry-advisor',
            name: 'Gantry.Advisor.ts',
            path: 'src/client/Gantry.Advisor.ts',
            type: 'file',
            category: 'model',
            lines: 184,
          },
        ],
      },
      {
        id: 'folder-components',
        name: 'components',
        path: 'src/components',
        type: 'folder',
        children: [
          {
            id: 'file-comp-dashboard',
            name: 'Dashboard.Advisor.tsx',
            path: 'src/components/Dashboard.Advisor.tsx',
            type: 'file',
            category: 'component',
            lines: 260,
          },
          {
            id: 'file-comp-cashflow',
            name: 'Dashboard.Cashflow.tsx',
            path: 'src/components/Dashboard.Cashflow.tsx',
            type: 'file',
            category: 'component',
            lines: 195,
          },
          {
            id: 'file-comp-health',
            name: 'Dashboard.Health.tsx',
            path: 'src/components/Dashboard.Health.tsx',
            type: 'file',
            category: 'component',
            lines: 140,
          },
        ],
      },
      {
        id: 'folder-services',
        name: 'services',
        path: 'src/services',
        type: 'folder',
        children: [
          {
            id: 'file-srv-auth',
            name: 'AuthSentinel.ts',
            path: 'src/services/AuthSentinel.ts',
            type: 'file',
            category: 'utility',
            lines: 172,
          },
          {
            id: 'file-srv-sync',
            name: 'SyncManager.ts',
            path: 'src/services/SyncManager.ts',
            type: 'file',
            category: 'utility',
            lines: 135,
          },
        ],
      },
      {
        id: 'folder-hooks',
        name: 'hooks',
        path: 'src/hooks',
        type: 'folder',
        children: [
          {
            id: 'file-hook-auth',
            name: 'useAuthSession.ts',
            path: 'src/hooks/useAuthSession.ts',
            type: 'file',
            category: 'utility',
            lines: 88,
          },
          {
            id: 'file-hook-blast',
            name: 'useBlastRadius.ts',
            path: 'src/hooks/useBlastRadius.ts',
            type: 'file',
            category: 'utility',
            lines: 112,
          },
        ],
      },
    ],
  },
  {
    id: 'root-config',
    name: 'config',
    path: 'config',
    type: 'folder',
    children: [
      {
        id: 'file-app-config',
        name: 'app.config.ts',
        path: 'config/app.config.ts',
        type: 'file',
        category: 'config',
        lines: 65,
      },
    ],
  },
];

export const DEMO_DEPENDENCY_GRAPH: ArchitectureGraph = {
  nodes: [
    {
      id: 'src/main.tsx',
      label: 'main.tsx',
      name: 'main.tsx',
      path: 'src/main.tsx',
      category: 'entry',
      lines: 48,
      importsCount: 3,
      functionsCount: 1,
      isEntry: true,
      blastRadiusScore: 95,
    },
    {
      id: 'src/App.tsx',
      label: 'App.tsx',
      name: 'App.tsx',
      path: 'src/App.tsx',
      category: 'entry',
      lines: 142,
      importsCount: 8,
      functionsCount: 4,
      isEntry: true,
      blastRadiusScore: 88,
    },
    {
      id: 'src/routes/index.tsx',
      label: 'routes/index.tsx',
      name: 'index.tsx',
      path: 'src/routes/index.tsx',
      category: 'route',
      lines: 110,
      importsCount: 6,
      functionsCount: 2,
      blastRadiusScore: 72,
    },
    {
      id: 'src/routes/auth.routes.ts',
      label: 'auth.routes.ts',
      name: 'auth.routes.ts',
      path: 'src/routes/auth.routes.ts',
      category: 'route',
      lines: 84,
      importsCount: 4,
      functionsCount: 3,
      blastRadiusScore: 54,
    },
    {
      id: 'src/routes/telemetry.routes.ts',
      label: 'telemetry.routes.ts',
      name: 'telemetry.routes.ts',
      path: 'src/routes/telemetry.routes.ts',
      category: 'route',
      lines: 96,
      importsCount: 3,
      functionsCount: 2,
      blastRadiusScore: 35,
    },
    {
      id: 'src/client/Gantry.Core.ts',
      label: 'Gantry.Core.ts',
      name: 'Gantry.Core.ts',
      path: 'src/client/Gantry.Core.ts',
      category: 'model',
      lines: 348,
      importsCount: 12,
      functionsCount: 18,
      blastRadiusScore: 92,
    },
    {
      id: 'src/client/Gantry.Advisor.ts',
      label: 'Gantry.Advisor.ts',
      name: 'Gantry.Advisor.ts',
      path: 'src/client/Gantry.Advisor.ts',
      category: 'model',
      lines: 184,
      importsCount: 5,
      functionsCount: 9,
      blastRadiusScore: 68,
    },
    {
      id: 'src/components/Dashboard.Advisor.tsx',
      label: 'Dashboard.Advisor.tsx',
      name: 'Dashboard.Advisor.tsx',
      path: 'src/components/Dashboard.Advisor.tsx',
      category: 'component',
      lines: 260,
      importsCount: 7,
      functionsCount: 6,
      blastRadiusScore: 42,
    },
    {
      id: 'src/components/Dashboard.Cashflow.tsx',
      label: 'Dashboard.Cashflow.tsx',
      name: 'Dashboard.Cashflow.tsx',
      path: 'src/components/Dashboard.Cashflow.tsx',
      category: 'component',
      lines: 195,
      importsCount: 5,
      functionsCount: 4,
      blastRadiusScore: 38,
    },
    {
      id: 'src/components/Dashboard.Health.tsx',
      label: 'Dashboard.Health.tsx',
      name: 'Dashboard.Health.tsx',
      path: 'src/components/Dashboard.Health.tsx',
      category: 'component',
      lines: 140,
      importsCount: 4,
      functionsCount: 3,
      blastRadiusScore: 30,
    },
    {
      id: 'src/services/AuthSentinel.ts',
      label: 'AuthSentinel.ts',
      name: 'AuthSentinel.ts',
      path: 'src/services/AuthSentinel.ts',
      category: 'utility',
      lines: 172,
      importsCount: 6,
      functionsCount: 7,
      blastRadiusScore: 78,
    },
    {
      id: 'src/services/SyncManager.ts',
      label: 'SyncManager.ts',
      name: 'SyncManager.ts',
      path: 'src/services/SyncManager.ts',
      category: 'utility',
      lines: 135,
      importsCount: 4,
      functionsCount: 5,
      blastRadiusScore: 50,
    },
    {
      id: 'src/hooks/useAuthSession.ts',
      label: 'useAuthSession.ts',
      name: 'useAuthSession.ts',
      path: 'src/hooks/useAuthSession.ts',
      category: 'utility',
      lines: 88,
      importsCount: 3,
      functionsCount: 2,
      blastRadiusScore: 45,
    },
    {
      id: 'config/app.config.ts',
      label: 'app.config.ts',
      name: 'app.config.ts',
      path: 'config/app.config.ts',
      category: 'config',
      lines: 65,
      importsCount: 1,
      functionsCount: 2,
      blastRadiusScore: 80,
    },
  ],
  edges: [
    { id: 'e1', source: 'src/main.tsx', target: 'src/App.tsx', type: 'import' },
    { id: 'e2', source: 'src/App.tsx', target: 'src/routes/index.tsx', type: 'import' },
    { id: 'e3', source: 'src/App.tsx', target: 'config/app.config.ts', type: 'import' },
    { id: 'e4', source: 'src/routes/index.tsx', target: 'src/routes/auth.routes.ts', type: 'import' },
    { id: 'e5', source: 'src/routes/index.tsx', target: 'src/routes/telemetry.routes.ts', type: 'import' },
    { id: 'e6', source: 'src/routes/auth.routes.ts', target: 'src/services/AuthSentinel.ts', type: 'import' },
    { id: 'e7', source: 'src/services/AuthSentinel.ts', target: 'src/hooks/useAuthSession.ts', type: 'import' },
    { id: 'e8', source: 'src/routes/index.tsx', target: 'src/components/Dashboard.Advisor.tsx', type: 'import' },
    { id: 'e9', source: 'src/components/Dashboard.Advisor.tsx', target: 'src/client/Gantry.Core.ts', type: 'import' },
    { id: 'e10', source: 'src/components/Dashboard.Advisor.tsx', target: 'src/client/Gantry.Advisor.ts', type: 'import' },
    { id: 'e11', source: 'src/components/Dashboard.Cashflow.tsx', target: 'src/client/Gantry.Core.ts', type: 'import' },
    { id: 'e12', source: 'src/components/Dashboard.Health.tsx', target: 'src/client/Gantry.Core.ts', type: 'import' },
    { id: 'e13', source: 'src/client/Gantry.Advisor.ts', target: 'src/client/Gantry.Core.ts', type: 'import' },
    { id: 'e14', source: 'src/client/Gantry.Core.ts', target: 'src/services/SyncManager.ts', type: 'import' },
    { id: 'e15', source: 'src/client/Gantry.Core.ts', target: 'config/app.config.ts', type: 'import' },
  ],
};

export const DEMO_WORKFLOW_GRAPH: ArchitectureGraph = {
  nodes: DEMO_DEPENDENCY_GRAPH.nodes.filter((n) =>
    [
      'src/main.tsx',
      'src/App.tsx',
      'src/routes/auth.routes.ts',
      'src/services/AuthSentinel.ts',
      'src/components/Dashboard.Advisor.tsx',
      'src/client/Gantry.Core.ts',
      'src/services/SyncManager.ts',
    ].includes(n.id)
  ),
  edges: [
    {
      id: 'wf-1',
      source: 'src/main.tsx',
      target: 'src/App.tsx',
      label: 'Bootstrap Root Provider',
      type: 'workflow',
      evidence: {
        sourcePath: 'src/main.tsx',
        targetPath: 'src/App.tsx',
        line: 14,
        snippet: 'createRoot(document.getElementById("root")).render(<App />);',
        description: 'Application entry point mounting the root container and security interceptors',
      },
    },
    {
      id: 'wf-2',
      source: 'src/App.tsx',
      target: 'src/services/AuthSentinel.ts',
      label: 'Session Verification',
      type: 'workflow',
      evidence: {
        sourcePath: 'src/App.tsx',
        targetPath: 'src/services/AuthSentinel.ts',
        line: 38,
        snippet: 'const session = await AuthSentinel.validateToken(storedToken);',
        description: 'Global token validation before route authorization guard evaluation',
      },
    },
    {
      id: 'wf-3',
      source: 'src/routes/auth.routes.ts',
      target: 'src/services/AuthSentinel.ts',
      label: 'Rotate Refresh Ticket',
      type: 'workflow',
      evidence: {
        sourcePath: 'src/routes/auth.routes.ts',
        targetPath: 'src/services/AuthSentinel.ts',
        line: 52,
        snippet: 'router.post("/refresh", async (req, res) => AuthSentinel.rotateTicket(req.body));',
        description: 'Session renewal workflow utilizing isolated ticket rotation',
      },
    },
    {
      id: 'wf-4',
      source: 'src/components/Dashboard.Advisor.tsx',
      target: 'src/client/Gantry.Core.ts',
      label: 'Hydrate Financial Engine',
      type: 'workflow',
      evidence: {
        sourcePath: 'src/components/Dashboard.Advisor.tsx',
        targetPath: 'src/client/Gantry.Core.ts',
        line: 67,
        snippet: 'const coreEngine = useGantryCore({ broadcastChannel: "live-advisor" });',
        description: 'Critical data pipeline hook binding Gantry.Core to live advisors',
      },
    },
    {
      id: 'wf-5',
      source: 'src/client/Gantry.Core.ts',
      target: 'src/services/SyncManager.ts',
      label: 'Flush Cache & Sync Ledger',
      type: 'workflow',
      evidence: {
        sourcePath: 'src/client/Gantry.Core.ts',
        targetPath: 'src/services/SyncManager.ts',
        line: 198,
        snippet: 'await SyncManager.flushWriteBuffer({ syncMode: "atomic_fifo" });',
        description: 'Atomic write flush triggering multi-entity state convergence',
      },
    },
  ],
};

export const DEMO_MISSIONS: Mission[] = [
  {
    id: 'm-1',
    order: 1,
    title: 'The Authentication Sentinel',
    objective: 'Investigate the token validation pipeline in AuthSentinel.ts and identify the fallback header used when standard Bearer authorization is missing.',
    startingClue: 'Look inside src/services/AuthSentinel.ts around line 40 where incoming request headers are extracted.',
    relevantFiles: ['src/services/AuthSentinel.ts', 'src/routes/auth.routes.ts', 'src/hooks/useAuthSession.ts'],
    hints: [
      'The sentinel checks for a custom "x-fallback-session" or legacy ticket header if Bearer authorization fails.',
      'Check the extractSessionToken function: inspect the fallback chain on headers["x-sentinel-ticket"].',
    ],
    hintsUsed: 0,
    maxHints: 2,
    isSolved: false,
    targetFilePath: 'src/services/AuthSentinel.ts',
    expectedConcept: 'x-sentinel-ticket',
  },
  {
    id: 'm-2',
    order: 2,
    title: 'The Blast Radius of Gantry.Core',
    objective: 'Determine how many downstream consumer components depend on Gantry.Core.ts and pinpoint the primary advisor dashboard module.',
    startingClue: 'Examine the architecture graph with Gantry.Core.ts selected. Notice the connections radiating to the dashboard components.',
    relevantFiles: ['src/client/Gantry.Core.ts', 'src/components/Dashboard.Advisor.tsx', 'src/client/Gantry.Advisor.ts'],
    hints: [
      'Gantry.Core is the central operational model used across 3 distinct dashboard widgets and the Gantry.Advisor client.',
      'Dashboard.Advisor.tsx is the primary consumer component directly binding to the financial sync engine.',
    ],
    hintsUsed: 0,
    maxHints: 2,
    isSolved: false,
    targetFilePath: 'src/client/Gantry.Core.ts',
    expectedConcept: 'Dashboard.Advisor',
  },
  {
    id: 'm-3',
    order: 3,
    title: 'The Rogue Telemetry Route',
    objective: 'Verify whether the endpoint in telemetry.routes.ts requires user session verification or exposes system metrics openly.',
    startingClue: 'Compare telemetry.routes.ts against auth.routes.ts. Note the absence of the sentinelAuth middleware on the root route.',
    relevantFiles: ['src/routes/telemetry.routes.ts', 'src/routes/index.tsx'],
    hints: [
      'The route /api/telemetry/stats does not mount the AuthSentinel interceptor middleware.',
      'It openly exposes raw memory usage, connection pool counts, and uptime without token verification.',
    ],
    hintsUsed: 0,
    maxHints: 2,
    isSolved: false,
    targetFilePath: 'src/routes/telemetry.routes.ts',
    expectedConcept: 'unauthenticated',
  },
];

export const DEMO_FILE_CONTENTS: Record<string, FileDetails> = {
  'src/client/Gantry.Core.ts': {
    id: 'file-gantry-core',
    path: 'src/client/Gantry.Core.ts',
    name: 'Gantry.Core.ts',
    category: 'model',
    language: 'TypeScript',
    lines: 348,
    blastRadius: {
      filesCount: 46,
      percentage: 69,
      affectedFiles: [
        'sync.js',
        'advisor.css',
        'cashflow.css',
        'Gantry.App.js',
        'Gantry.AdvisorRenderer.js',
        'Dashboard.Advisor.js',
        'Dashboard.Burden.js',
        'Dashboard.Cashflow.js',
        'Dashboard.CustomerValue.js',
        'Dashboard.Health.js',
      ],
    },
    ast: {
      classes: ['GantryCoreEngine', 'LedgerObserver', 'CacheSynchronizer'],
      functions: ['el()', 'fmtMoney()', 'fmtNum()', 'fmtPct()', 'getNsLink()', 'getTrendHtml()'],
      imports: ['SyncManager', 'appConfig', 'EventEmitter'],
      exports: ['GantryCoreEngine', 'useGantryCore', 'defaultCoreInstance'],
      dependenciesCount: 12,
    },
    citations: [
      {
        line: 42,
        endLine: 46,
        text: 'export class GantryCoreEngine extends EventEmitter {',
        description: 'Core event-driven architectural engine managing ledger state and propagation.',
      },
      {
        line: 198,
        endLine: 202,
        text: 'await SyncManager.flushWriteBuffer({ syncMode: "atomic_fifo" });',
        description: 'Direct persistence pipeline flushing batch changes to SyncManager.',
      },
    ],
    content: `/**
 * @license
 * Gantry.Core - Enterprise Architecture Engine
 * Core transaction pipeline and ledger state synchronizer.
 */

import { SyncManager } from '../services/SyncManager';
import { appConfig } from '../../config/app.config';
import { EventEmitter } from 'events';

export interface GantryOptions {
  broadcastChannel?: string;
  cacheTtlMs?: number;
  strictLedger?: boolean;
}

export class GantryCoreEngine extends EventEmitter {
  private isInitialized = false;
  private writeBuffer: Map<string, unknown> = new Map();
  private subscribers: Set<string> = new Set();

  constructor(private readonly options: GantryOptions = {}) {
    super();
    this.options.cacheTtlMs = options.cacheTtlMs ?? 30000;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.emit('engine:ready', { timestamp: Date.now() });
  }

  public fmtMoney(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  public fmtNum(num: number): string {
    return num.toLocaleString();
  }

  public fmtPct(ratio: number): string {
    return (ratio * 100).toFixed(2) + '%';
  }

  public getNsLink(entityId: string): string {
    return \`\${appConfig.portalUrl}/entities/\${encodeURIComponent(entityId)}\`;
  }

  public async commitTransaction(payload: Record<string, unknown>): Promise<boolean> {
    const txId = crypto.randomUUID();
    this.writeBuffer.set(txId, payload);
    
    // Immediate flush triggers cascading sync
    await SyncManager.flushWriteBuffer({
      syncMode: 'atomic_fifo',
      payloadSize: this.writeBuffer.size
    });

    this.emit('ledger:committed', { txId });
    return true;
  }
}

export const defaultCoreInstance = new GantryCoreEngine();
`,
  },
  'src/services/AuthSentinel.ts': {
    id: 'file-srv-auth',
    path: 'src/services/AuthSentinel.ts',
    name: 'AuthSentinel.ts',
    category: 'utility',
    language: 'TypeScript',
    lines: 172,
    ast: {
      classes: ['AuthSentinel'],
      functions: ['extractSessionToken()', 'validateToken()', 'rotateTicket()', 'revokeSession()'],
      imports: ['jwt', 'crypto', 'appConfig'],
      exports: ['AuthSentinel', 'sentinelAuthMiddleware'],
    },
    citations: [
      {
        line: 38,
        endLine: 48,
        text: 'const fallback = headers["x-sentinel-ticket"] as string;',
        description: 'Secondary fallback ticket extraction when authorization header is absent.',
      },
    ],
    content: `/**
 * AuthSentinel Service
 * Perimeter security and session validation engine.
 */

import { appConfig } from '../../config/app.config';

export class AuthSentinel {
  private static activeSessions = new Map<string, number>();

  /**
   * Extracts token from request headers.
   * Primary: Authorization: Bearer <token>
   * Fallback: x-sentinel-ticket header
   */
  public static extractSessionToken(headers: Record<string, string | undefined>): string | null {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    // Fallback extraction investigated in Mission 1
    const fallbackTicket = headers['x-sentinel-ticket'];
    if (fallbackTicket) {
      return fallbackTicket.trim();
    }

    return null;
  }

  public static async validateToken(token: string): Promise<boolean> {
    if (!token || token.length < 16) return false;
    return true;
  }

  public static async rotateTicket(sessionId: string): Promise<{ ticket: string }> {
    const ticket = 'st_' + Math.random().toString(36).substring(2, 15);
    this.activeSessions.set(sessionId, Date.now());
    return { ticket };
  }
}
`,
  },
  'src/routes/telemetry.routes.ts': {
    id: 'file-routes-telemetry',
    path: 'src/routes/telemetry.routes.ts',
    name: 'telemetry.routes.ts',
    category: 'route',
    language: 'TypeScript',
    lines: 96,
    ast: {
      functions: ['handleStatsRequest()', 'getSystemMetrics()'],
      imports: ['Router', 'os'],
      exports: ['telemetryRouter'],
    },
    citations: [
      {
        line: 18,
        endLine: 28,
        text: 'telemetryRouter.get("/stats", (req, res) => {',
        description: 'Unprotected metrics route delivering raw host telemetry.',
      },
    ],
    content: `/**
 * Telemetry & Observability Route
 * Reports application health, pool metrics, and uptime statistics.
 */

export interface SystemMetrics {
  uptime: number;
  memoryUsageMb: number;
  activeSockets: number;
}

export function getSystemMetrics(): SystemMetrics {
  return {
    uptime: process.uptime ? process.uptime() : 1240,
    memoryUsageMb: 86.4,
    activeSockets: 14,
  };
}

export function handleStatsRequest(req: Request): Response {
  // Notice: No auth sentinel validation is attached here!
  const metrics = getSystemMetrics();
  return new Response(JSON.stringify({ status: 'ok', data: metrics }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
`,
  },
};

export const DEMO_DASHBOARD_REPOSITORIES: RepositoryMetadata[] = [
  DEMO_REPOSITORY,
  {
    id: 'demo-carbon-forest',
    owner: 'Zedoman',
    name: 'Carbon_Forest',
    fullName: 'Zedoman/Carbon_Forest',
    branch: 'main',
    language: 'Python',
    url: 'https://github.com/Zedoman/Carbon_Forest',
    filesCount: 112,
    importsCount: 340,
    modulesCount: 58,
    analyzedAt: '2025-08-14T19:40:00Z',
    isDemo: true,
  },
  {
    id: 'demo-gantry-suite',
    owner: 'com.gantry',
    name: 'finance-core',
    fullName: 'gantry-finance/finance-core',
    branch: 'release/v2.4',
    language: 'TypeScript',
    url: 'https://github.com/gantry-finance/finance-core',
    filesCount: 67,
    importsCount: 661,
    modulesCount: 46,
    analyzedAt: '2025-08-11T10:15:00Z',
    isDemo: true,
  },
];
