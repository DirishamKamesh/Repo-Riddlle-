import ts from 'typescript';

export interface ParsedImport {
  specifier: string;
  importedSymbols: string[];
  defaultImport?: string;
  namespaceImport?: string;
  isTypeOnly: boolean;
  kind: 'static' | 'dynamic' | 're_export' | 'require';
  line: number;
}

export interface ExpressRouteDeclaration {
  method: string; // 'get', 'post', 'put', 'delete', 'patch', 'use', etc.
  path: string; // e.g. '/tasks', '/api/v1'
  handlerName?: string;
  middlewareNames: string[];
  line: number;
  snippet: string;
}

export interface ExpressRouterMount {
  path: string; // e.g. '/api/tasks'
  routerIdentifier: string; // e.g. 'taskRouter'
  line: number;
  snippet: string;
}

export interface ServiceCallEvidence {
  callee: string; // e.g. 'TaskStore.create', 'prisma.task.findMany', 'taskService.getAll'
  targetIdentifier: string; // e.g. 'TaskStore', 'taskService'
  method: string; // e.g. 'create', 'findMany'
  line: number;
  snippet: string;
}

export interface FrameworkPatterns {
  isExpressApp: boolean;
  isExpressRouter: boolean;
  hasServerListen: boolean;
  serverListenLine?: number;
  serverListenSnippet?: string;
  routerMounts: ExpressRouterMount[];
  routes: ExpressRouteDeclaration[];
  globalMiddlewares: Array<{ identifier: string; line: number; snippet: string }>;
  serviceCalls: ServiceCallEvidence[];
  jsxComponentReferences: Array<{ componentName: string; line: number; snippet: string }>;
}

export interface AstParseResult {
  filePath: string;
  imports: ParsedImport[];
  framework: FrameworkPatterns;
  parseError?: string;
}

function getScriptKind(filePath: string): ts.ScriptKind {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (lower.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (lower.endsWith('.ts')) return ts.ScriptKind.TS;
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return ts.ScriptKind.JS;
  if (lower.endsWith('.json')) return ts.ScriptKind.JSON;
  return ts.ScriptKind.Unknown;
}

function getNodeSnippet(sourceFile: ts.SourceFile, node: ts.Node): string {
  const text = node.getText(sourceFile);
  const firstLine = text.split('\n')[0]?.trim() || '';
  return firstLine.slice(0, 140);
}

/**
 * Parse source code using the TypeScript Compiler API.
 * Extracts imports (static, dynamic, CommonJS, re-exports, type-only) and
 * structural framework patterns (Express routes, mounts, middlewares, service calls, React components).
 */
export function parseSourceAst(filePath: string, sourceCode: string): AstParseResult {
  const scriptKind = getScriptKind(filePath);
  const imports: ParsedImport[] = [];

  const framework: FrameworkPatterns = {
    isExpressApp: false,
    isExpressRouter: false,
    hasServerListen: false,
    routerMounts: [],
    routes: [],
    globalMiddlewares: [],
    serviceCalls: [],
    jsxComponentReferences: [],
  };

  try {
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true, // setParentNodes
      scriptKind
    );

    function visit(node: ts.Node) {
      // 1. Static Import Declarations: `import ... from 'specifier'`
      if (ts.isImportDeclaration(node)) {
        if (ts.isStringLiteral(node.moduleSpecifier)) {
          const specifier = node.moduleSpecifier.text;
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const importClause = node.importClause;

          if (!importClause) {
            // Side-effect import: `import './polyfill'`
            imports.push({
              specifier,
              importedSymbols: [],
              isTypeOnly: false,
              kind: 'static',
              line,
            });
          } else {
            const isTypeOnly = Boolean(importClause.isTypeOnly);
            const symbols: string[] = [];
            let defaultImport: string | undefined;
            let namespaceImport: string | undefined;

            if (importClause.name) {
              defaultImport = importClause.name.text;
              symbols.push(defaultImport);
            }

            if (importClause.namedBindings) {
              if (ts.isNamespaceImport(importClause.namedBindings)) {
                namespaceImport = importClause.namedBindings.name.text;
                symbols.push(`* as ${namespaceImport}`);
              } else if (ts.isNamedImports(importClause.namedBindings)) {
                for (const element of importClause.namedBindings.elements) {
                  const symName = element.name.text;
                  symbols.push(symName);
                }
              }
            }

            imports.push({
              specifier,
              importedSymbols: symbols,
              defaultImport,
              namespaceImport,
              isTypeOnly,
              kind: 'static',
              line,
            });
          }
        }
      }

      // 2. Re-Export Declarations: `export * from 'specifier'`, `export { a } from 'specifier'`
      else if (ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const specifier = node.moduleSpecifier.text;
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const isTypeOnly = Boolean(node.isTypeOnly);
          const symbols: string[] = [];

          if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            for (const el of node.exportClause.elements) {
              symbols.push(el.name.text);
            }
          }

          imports.push({
            specifier,
            importedSymbols: symbols,
            isTypeOnly,
            kind: 're_export',
            line,
          });
        }
      }

      // 3. Call Expressions: require(), dynamic import(), Express router & listen calls
      else if (ts.isCallExpression(node)) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

        // Dynamic import: `import('specifier')`
        if (
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          node.arguments.length >= 1 &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          imports.push({
            specifier: node.arguments[0].text,
            importedSymbols: [],
            isTypeOnly: false,
            kind: 'dynamic',
            line,
          });
        }

        // CommonJS require: `require('specifier')`
        else if (
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'require' &&
          node.arguments.length === 1 &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          imports.push({
            specifier: node.arguments[0].text,
            importedSymbols: [],
            isTypeOnly: false,
            kind: 'require',
            line,
          });
        }

        // Express app initialization: `express()`
        else if (
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'express'
        ) {
          framework.isExpressApp = true;
        }

        // Router initialization: `Router()` or `express.Router()`
        else if (
          (ts.isIdentifier(node.expression) && node.expression.text === 'Router') ||
          (ts.isPropertyAccessExpression(node.expression) &&
            node.expression.name.text === 'Router')
        ) {
          framework.isExpressRouter = true;
        }

        // Property access calls: `.listen()`, `.use()`, `.get()`, `.post()`, etc.
        else if (ts.isPropertyAccessExpression(node.expression)) {
          const methodName = node.expression.name.text;
          const objExpr = node.expression.expression;
          const snippet = getNodeSnippet(sourceFile, node);

          // Server listen: `app.listen(...)` or `server.listen(...)`
          if (methodName === 'listen') {
            framework.hasServerListen = true;
            framework.serverListenLine = line;
            framework.serverListenSnippet = snippet;
          }

          // Express app.use(...) or router.use(...)
          else if (methodName === 'use') {
            const args = node.arguments;
            if (args.length >= 2 && ts.isStringLiteral(args[0]) && ts.isIdentifier(args[1])) {
              // Router mount: `app.use('/api/tasks', taskRouter)`
              framework.routerMounts.push({
                path: args[0].text,
                routerIdentifier: args[1].text,
                line,
                snippet,
              });
            } else if (args.length >= 1 && ts.isIdentifier(args[0])) {
              // Global middleware: `app.use(errorHandler)`
              framework.globalMiddlewares.push({
                identifier: args[0].text,
                line,
                snippet,
              });
            }
          }

          // Route handlers: .get, .post, .put, .delete, .patch
          else if (['get', 'post', 'put', 'delete', 'patch', 'all'].includes(methodName)) {
            const args = node.arguments;
            if (args.length >= 2 && ts.isStringLiteral(args[0])) {
              const routePath = args[0].text;
              const middlewareNames: string[] = [];
              let handlerName: string | undefined;

              // Remaining arguments are middlewares and handler
              for (let i = 1; i < args.length; i++) {
                const arg = args[i];
                if (ts.isIdentifier(arg)) {
                  if (i === args.length - 1) {
                    handlerName = arg.text;
                  } else {
                    middlewareNames.push(arg.text);
                  }
                }
              }

              framework.routes.push({
                method: methodName.toUpperCase(),
                path: routePath,
                handlerName,
                middlewareNames,
                line,
                snippet,
              });
            }
          }

          // Service / Data store calls: e.g. `TaskStore.create`, `prisma.task.findMany`, `taskService.get`
          else if (ts.isIdentifier(objExpr)) {
            const targetIdentifier = objExpr.text;
            if (
              targetIdentifier.endsWith('Store') ||
              targetIdentifier.endsWith('Service') ||
              targetIdentifier.endsWith('Model') ||
              targetIdentifier.endsWith('Repository') ||
              targetIdentifier === 'prisma' ||
              targetIdentifier === 'db'
            ) {
              framework.serviceCalls.push({
                callee: `${targetIdentifier}.${methodName}`,
                targetIdentifier,
                method: methodName,
                line,
                snippet,
              });
            }
          }
        }
      }

      // 4. React JSX Component references: `<TaskCard ... />` or `<Header>...</Header>`
      else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagNameNode = node.tagName;
        if (ts.isIdentifier(tagNameNode)) {
          const componentName = tagNameNode.text;
          // React custom components start with uppercase letter
          if (/^[A-Z]/.test(componentName)) {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
            const snippet = getNodeSnippet(sourceFile, node);
            framework.jsxComponentReferences.push({
              componentName,
              line,
              snippet,
            });
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return {
      filePath,
      imports,
      framework,
    };
  } catch (err: any) {
    return {
      filePath,
      imports: [],
      framework,
      parseError: err.message || 'Failed to parse TypeScript AST',
    };
  }
}
