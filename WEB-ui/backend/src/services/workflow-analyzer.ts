import {
  GraphNode,
  WorkflowEdge,
  WorkflowGraphData,
  WorkflowRelation,
} from '../types/index.js';
import { AstParseResult } from './ast-parser.js';
import { resolveModuleSpecifier, TsConfigOptions } from './resolver.js';

/**
 * Build an evidence-backed workflow graph from parsed AST results and repository files.
 * Extracts statically verifiable runtime interactions:
 * - boots: Server bootstrap initializing application listener
 * - mounts_router: Application or router mounting route group
 * - applies_middleware: Route or app registering authentication/logging/error middleware
 * - invokes_handler: Route binding HTTP endpoint to controller/handler function
 * - accesses_model: Route/controller interacting with entity model, store, or database
 * - calls_service: Route/controller invoking business service module
 * - renders_component: Verified React component hierarchy
 */
export function constructWorkflowGraph(
  nodes: GraphNode[],
  astMap: Map<string, AstParseResult>,
  inventorySet: Set<string>,
  tsconfig?: TsConfigOptions
): WorkflowGraphData {
  const edges: WorkflowEdge[] = [];
  const edgeIdSet = new Set<string>();

  // Map of filePath -> Map of imported symbol name -> resolved target filePath
  const fileSymbolTargetMap = new Map<string, Map<string, string>>();

  for (const [filePath, ast] of astMap.entries()) {
    const symbolMap = new Map<string, string>();

    for (const imp of ast.imports) {
      const resolvedTarget = resolveModuleSpecifier(
        filePath,
        imp.specifier,
        inventorySet,
        tsconfig
      );

      if (resolvedTarget) {
        // Map default import
        if (imp.defaultImport) {
          symbolMap.set(imp.defaultImport, resolvedTarget);
        }
        // Map namespace import
        if (imp.namespaceImport) {
          symbolMap.set(imp.namespaceImport, resolvedTarget);
        }
        // Map individual named symbols
        for (const sym of imp.importedSymbols) {
          symbolMap.set(sym, resolvedTarget);
        }
        // Also map module specifier base name as fallback
        const baseName = imp.specifier.split('/').pop()?.replace(/\.[^/.]+$/, '');
        if (baseName) {
          symbolMap.set(baseName, resolvedTarget);
        }
      }
    }

    fileSymbolTargetMap.set(filePath, symbolMap);
  }

  // 1. Process Server Bootstrap ('boots')
  for (const [filePath, ast] of astMap.entries()) {
    if (ast.framework.hasServerListen) {
      const symbolMap = fileSymbolTargetMap.get(filePath);

      // Check if this file imports 'app' from an application factory or app module
      if (symbolMap) {
        for (const [sym, targetPath] of symbolMap.entries()) {
          const targetAst = astMap.get(targetPath);
          const isAppTarget =
            sym.toLowerCase() === 'app' ||
            targetPath.includes('app.') ||
            (targetAst && targetAst.framework.isExpressApp);

          if (isAppTarget && targetPath !== filePath) {
            const edgeId = `wf:boots:${filePath}->${targetPath}`;
            if (!edgeIdSet.has(edgeId)) {
              edgeIdSet.add(edgeId);
              edges.push({
                id: edgeId,
                source: filePath,
                target: targetPath,
                relation: 'boots',
                label: 'boots application',
                status: 'confirmed',
                evidence: {
                  filePath,
                  line: ast.framework.serverListenLine || 1,
                  snippet: ast.framework.serverListenSnippet || 'app.listen(...)',
                  description: `Server bootstrap initializes application listener defined in ${targetPath}`,
                },
              });
            }
          }
        }
      }
    }
  }

  // 2. Process Router Mounts ('mounts_router')
  for (const [filePath, ast] of astMap.entries()) {
    const symbolMap = fileSymbolTargetMap.get(filePath);
    if (!symbolMap) continue;

    for (const mount of ast.framework.routerMounts) {
      const targetPath = symbolMap.get(mount.routerIdentifier);
      if (targetPath && targetPath !== filePath) {
        const edgeId = `wf:mounts:${filePath}->${targetPath}:${mount.path}`;
        if (!edgeIdSet.has(edgeId)) {
          edgeIdSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: filePath,
            target: targetPath,
            relation: 'mounts_router',
            label: `mounts ${mount.path}`,
            routePath: mount.path,
            status: 'confirmed',
            evidence: {
              filePath,
              line: mount.line,
              snippet: mount.snippet,
              description: `Mounts router ${mount.routerIdentifier} at endpoint prefix '${mount.path}'`,
            },
          });
        }
      }
    }
  }

  // 3. Process Global Middlewares ('applies_middleware')
  for (const [filePath, ast] of astMap.entries()) {
    const symbolMap = fileSymbolTargetMap.get(filePath);
    if (!symbolMap) continue;

    for (const mw of ast.framework.globalMiddlewares) {
      const targetPath = symbolMap.get(mw.identifier);
      if (targetPath && targetPath !== filePath) {
        const edgeId = `wf:mw:${filePath}->${targetPath}:${mw.identifier}`;
        if (!edgeIdSet.has(edgeId)) {
          edgeIdSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: filePath,
            target: targetPath,
            relation: 'applies_middleware',
            label: `applies ${mw.identifier}`,
            status: 'confirmed',
            evidence: {
              filePath,
              line: mw.line,
              snippet: mw.snippet,
              description: `Registers middleware '${mw.identifier}' from ${targetPath}`,
            },
          });
        }
      }
    }
  }

  // 4. Process Route Declarations & Handlers ('invokes_handler', 'applies_middleware')
  for (const [filePath, ast] of astMap.entries()) {
    const symbolMap = fileSymbolTargetMap.get(filePath);
    if (!symbolMap) continue;

    for (const route of ast.framework.routes) {
      // Handler binding
      if (route.handlerName) {
        const targetPath = symbolMap.get(route.handlerName);
        if (targetPath && targetPath !== filePath) {
          const edgeId = `wf:handler:${filePath}->${targetPath}:${route.method}:${route.path}`;
          if (!edgeIdSet.has(edgeId)) {
            edgeIdSet.add(edgeId);
            edges.push({
              id: edgeId,
              source: filePath,
              target: targetPath,
              relation: 'invokes_handler',
              label: `${route.method} ${route.path} -> ${route.handlerName}`,
              routePath: route.path,
              httpMethod: route.method,
              status: 'confirmed',
              evidence: {
                filePath,
                line: route.line,
                snippet: route.snippet,
                description: `Dispatches ${route.method} ${route.path} to handler function '${route.handlerName}' in ${targetPath}`,
              },
            });
          }
        }
      }

      // Route-level middlewares
      for (const mwName of route.middlewareNames) {
        const targetPath = symbolMap.get(mwName);
        if (targetPath && targetPath !== filePath) {
          const edgeId = `wf:route_mw:${filePath}->${targetPath}:${mwName}`;
          if (!edgeIdSet.has(edgeId)) {
            edgeIdSet.add(edgeId);
            edges.push({
              id: edgeId,
              source: filePath,
              target: targetPath,
              relation: 'applies_middleware',
              label: `guard: ${mwName}`,
              routePath: route.path,
              httpMethod: route.method,
              status: 'confirmed',
              evidence: {
                filePath,
                line: route.line,
                snippet: route.snippet,
                description: `Executes middleware '${mwName}' on ${route.method} ${route.path}`,
              },
            });
          }
        }
      }
    }
  }

  // 5. Process Service Calls & Data Model Access ('accesses_model', 'calls_service')
  for (const [filePath, ast] of astMap.entries()) {
    const symbolMap = fileSymbolTargetMap.get(filePath);
    if (!symbolMap) continue;

    for (const call of ast.framework.serviceCalls) {
      const targetPath = symbolMap.get(call.targetIdentifier);
      if (targetPath && targetPath !== filePath) {
        const isModel =
          targetPath.includes('/models/') ||
          targetPath.includes('/schemas/') ||
          targetPath.includes('store') ||
          targetPath.endsWith('.model.ts') ||
          targetPath.endsWith('.schema.ts') ||
          call.targetIdentifier.toLowerCase().includes('model') ||
          call.targetIdentifier.toLowerCase().includes('store');

        const relation: WorkflowRelation = isModel ? 'accesses_model' : 'calls_service';
        const edgeId = `wf:${relation}:${filePath}->${targetPath}:${call.method}`;

        if (!edgeIdSet.has(edgeId)) {
          edgeIdSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: filePath,
            target: targetPath,
            relation,
            label: `${call.callee}()`,
            status: 'confirmed',
            evidence: {
              filePath,
              line: call.line,
              snippet: call.snippet,
              description: `Calls ${call.callee}() defined in ${targetPath}`,
            },
          });
        }
      }
    }
  }

  // 6. Process React Component Hierarchy ('renders_component')
  for (const [filePath, ast] of astMap.entries()) {
    const symbolMap = fileSymbolTargetMap.get(filePath);
    if (!symbolMap) continue;

    for (const jsxRef of ast.framework.jsxComponentReferences) {
      const targetPath = symbolMap.get(jsxRef.componentName);
      if (targetPath && targetPath !== filePath) {
        const edgeId = `wf:renders:${filePath}->${targetPath}:${jsxRef.componentName}`;
        if (!edgeIdSet.has(edgeId)) {
          edgeIdSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: filePath,
            target: targetPath,
            relation: 'renders_component',
            label: `renders <${jsxRef.componentName}>`,
            status: 'confirmed',
            evidence: {
              filePath,
              line: jsxRef.line,
              snippet: jsxRef.snippet,
              description: `Renders component <${jsxRef.componentName}> from ${targetPath}`,
            },
          });
        }
      }
    }
  }

  // Node filtering for workflow graph:
  // Include nodes that participate in workflow edges or are classified as key architecture roles
  const activeNodeIds = new Set<string>();
  edges.forEach((e) => {
    activeNodeIds.add(e.source);
    activeNodeIds.add(e.target);
  });

  const workflowNodes = nodes.filter(
    (n) =>
      activeNodeIds.has(n.id) ||
      n.category === 'entry_point' ||
      n.category === 'route'
  );

  return {
    nodes: workflowNodes.length > 0 ? workflowNodes : nodes,
    edges,
    nodeCount: workflowNodes.length > 0 ? workflowNodes.length : nodes.length,
    edgeCount: edges.length,
    description:
      edges.length > 0
        ? `Statically verified execution pipeline (${edges.length} evidence-backed execution paths).`
        : 'No verifiable runtime execution pipelines detected in parsed source files.',
  };
}
