import { Rule, SourceCode } from "eslint";
import { Node } from "estree";
import { builtinModules } from "module";

("use strict");

type RuleContext = Rule.RuleContext;
type ReportFixer = Rule.ReportFixer;
type SortingNode = {
  syntaxGroup: string;
  moduleGroup: string;
  declarationGroup: string;
  node: Node;
  name: string;
  range: number[];
};
type PropertySyntax = "single" | "multiple" | "none";
type ModuleType =
  | "builtin"
  | "nested-builtin"
  | "subpath"
  | "nested-external"
  | "internal"
  | "external"
  | "relative";
type DeclarationType = "member" | "static" | "call";
type SortMode = "path" | "name" | "length";
type Configuration = {
  ignoreCase?: boolean;
  ignoreDeclarationSort?: boolean;
  ignorePropertySort?: boolean;
  newlinesBetween?: "always" | "never" | "ignore";
  propertySyntaxOrder?: PropertySyntax[];
  moduleTypeOrder?: ModuleType[];
  declarationOrder?: DeclarationType[];
  groupOrder?: ("declaration" | "module" | "syntax")[];
  environment?: "node" | "bun";
  internalPattern?: string[];
  sortMode?: SortMode;
  sortOrder?: "asc" | "desc";
};

/**
 * @typedef {import("estree").Node} Node
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("eslint").Rule.ReportFixer} ReportFixer
 * @typedef {import("eslint").SourceCode} SourceCode
 *
 * @typedef {{ syntaxGroup: string, moduleGroup: string, declarationGroup: string, node: Node, name: string, range: number[] }} SortingNode
 * @typedef {"single" | "multiple" | "none"} PropertySyntax
 * @typedef {"builtin" | "nested-builtin" | "subpath" | "nested-external" | "internal" | "external" | "relative"} ModuleType
 * @typedef {"member" | "static" | "call"} DeclarationType
 * @typedef {"path" | "name" | "length"} SortMode
 *
 * @typedef {{
 *     ignoreCase?: boolean,
 *     ignoreDeclarationSort?: boolean,
 *     ignorePropertySort?: boolean,
 *     newlinesBetween?: "always" | "never" | "ignore",
 *     propertySyntaxOrder?: PropertySyntax[],
 *     moduleTypeOrder?: ModuleType[],
 *     declarationOrder?: DeclarationType[],
 *     groupOrder?: ("declaration"|"module"|"syntax")[],
 *     environment?: "node" | "bun",
 *     internalPattern?: string[],
 *     sortMode?: SortMode,
 *     sortOrder?: "asc" | "desc",
 * }} Configuration
 */

const NODE_BUILTIN_MODULES = new Set(builtinModules);

const BUN_PREFIX_ONLY_MODULES = [
  "bun:sqlite",
  "bun:test",
  "bun:wrap",
  "bun:ffi",
  "bun:jsc",
];
const BUN_NODE_MODULES = [
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "constants",
  "cluster",
  "console",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
  "test",
];
const BUN_IMPORTED_MODULES = ["detect-libc", "undici", "bun", "ws"];
const BUN_BUILTIN_MODULES = new Set([
  ...BUN_NODE_MODULES,
  ...BUN_PREFIX_ONLY_MODULES,
  ...BUN_IMPORTED_MODULES,
]);

const DEFAULT_INTERNAL_PATTERN = ["^~/", "^@/"];
const DEFAULT_ENVIRONMENT = "node";
const DEFAULT_PROPERTY_SYNTAX_ORDER = ["none", "single", "multiple"];
const DEFAULT_DECLARATION_ORDER = ["member", "static"];
const DEFAULT_MODULE_TYPE_ORDER = [
  "builtin",
  "nested-builtin",
  "subpath",
  "external",
  "nested-external",
  "internal",
  "relative",
];
const DEFAULT_NEWLINES_BETWEEN = "always";
const DEFAULT_IGNORE_CASE = false;
const DEFAULT_IGNORE_DECLARATION_SORT = false;
const DEFAULT_IGNORE_PROPERTY_SORT = false;
const DEFAULT_SORT_MODE = "name";
const DEFAULT_SORT_ORDER = "asc";
const DEFAULT_GROUP_ORDER = ["syntax", "declaration", "module"];

function isNodeBuiltinModule(path: string, environment: string): boolean {
  if (environment === "bun") {
    return BUN_BUILTIN_MODULES.has(path) || path.startsWith("bun:");
  }
  if (environment === "node") {
    return NODE_BUILTIN_MODULES.has(path) || path.startsWith("node:");
  }
  return false;
}

/**
 * @type {import("eslint").Rule.RuleModule}
 */
export const requireSort = {
  meta: {
    version: "1.0.0",
    name: "eslint-plugin-requires",
    description: "Sort require statements in JavaScript files",
  },
  rules: {
    sort: {
      /**
       * @param {RuleContext} context
       * @returns
       */
      create(context: Rule.RuleContext) {
        /**
         * @type {Configuration}
         * @description Configuration options for the rule.
         */
        const configuration = context.options[0] || {};
        const {
          ignoreCase = DEFAULT_IGNORE_CASE,
          ignoreDeclarationSort = DEFAULT_IGNORE_DECLARATION_SORT,
          ignorePropertySort = DEFAULT_IGNORE_PROPERTY_SORT,
          declarationOrder = DEFAULT_DECLARATION_ORDER,
          sortMode = DEFAULT_SORT_MODE,
          sortOrder = DEFAULT_SORT_ORDER,
          internalPattern = DEFAULT_INTERNAL_PATTERN,
          moduleTypeOrder = DEFAULT_MODULE_TYPE_ORDER,
          propertySyntaxOrder = DEFAULT_PROPERTY_SYNTAX_ORDER,
          groupOrder = DEFAULT_GROUP_ORDER,
          newlinesBetween = DEFAULT_NEWLINES_BETWEEN,
          environment = DEFAULT_ENVIRONMENT,
        } = configuration;

        const sourceCode = context.sourceCode;

        /**
         * @type {SortingNode[]}
         * @description Array of sorting nodes.
         */
        const sortingNodes: SortingNode[] = [];

        /**
         * Checks if a call expression is a static require call (require("...")).
         *
         * @param {Node} node
         * @returns {boolean}
         */
        function isStaticRequire(node: Node): boolean {
          return (
            node.type === "CallExpression" &&
            node.callee?.type === "Identifier" &&
            node.callee?.name === "require" &&
            node.arguments?.length === 1
          );
        }

        /**
         * Checks if a variable declaration node is a member require (require(...).member).
         *
         * @param {Node} node
         * @returns {boolean}
         */
        function isMemberRequire(node: Node): boolean {
          if (node.type !== "VariableDeclaration") return false;
          const declarator = node.declarations?.[0];
          return (
            declarator?.init?.type === "MemberExpression" &&
            declarator.init.object?.type === "CallExpression" &&
            declarator.init.object.callee?.name === "require"
          );
        }

        /**
         * Checks if a variable declaration is a simple require declaration.
         *
         * @param {Node} node
         * @returns {boolean}
         */
        function isVariableDeclarationWithRequire(node: Node): boolean {
          if (node.type !== "VariableDeclaration") return false;
          const declarator = node.declarations?.[0];
          return (
            declarator?.init?.type === "CallExpression" &&
            declarator.init.callee?.name === "require" &&
            declarator.init.arguments?.[0]?.type === "Literal"
          );
        }

        /**
         * Checks if the left side of a variable declarator is an object pattern.
         *
         * @param {Node} node
         * @returns {boolean}
         */
        function hasObjectPattern(node: Node): boolean {
          if (node.type !== "VariableDeclaration") return false;
          return node.declarations[0]?.id?.type === "ObjectPattern";
        }

        /**
         * Checks if a node is top-level (direct child of Program).
         *
         * @param {{ parent: Node }} node
         * @returns {boolean}
         */
        function isTopLevel(node: { parent: Node }): boolean {
          return node.parent?.type === "Program";
        }

        /**
         * Check if the node is an assignment pattern.
         *
         * @param {Node} node - AST node
         * @returns {boolean}
         */
        function isAssignmentPattern(node: Node): boolean {
          return node?.type === "AssignmentPattern";
        }

        /**
         * Check if the node is a function call expression with require.
         *
         * @param {Node} node - AST node
         * @returns {boolean}
         */
        function isCallExpressionWithRequire(node: Node): boolean {
          return (
            node.type === "CallExpression" &&
            node.callee?.name === "require" &&
            node.arguments?.[0]?.type === "Literal"
          );
        }

        /**
         * @description Gets the declaration name of the node.
         *
         * @param {Node} node
         * @returns {string}
         */
        const getDeclarationName = (node: Node): string => {
          if (sortMode === "path") {
            if (isCallExpressionWithRequire(node)) {
              return node.arguments[0].value;
            } else if (isVariableDeclarationWithRequire(node)) {
              return node.declarations[0].init.arguments[0].value;
            } else if (isMemberRequire(node)) {
              const declarator = node.declarations[0];
              return declarator.init.object.arguments[0].value;
            }
            return "";
          } else if (sortMode === "length") {
            // For length sorting, return the full text of the node
            return sourceCode.getText(node);
          } else {
            // Default mode: "name"
            if (isStaticRequire(node)) return node.arguments[0].value;
            if (isMemberRequire(node)) {
              const declarator = node.declarations[0];
              return declarator.init.object.arguments[0].value;
            }
            if (!hasObjectPattern(node)) return node.declarations[0].id.name;
            const value = node.declarations[0].id.properties[0].value;
            return isAssignmentPattern(value) ? value.left.name : value.name;
          }
        };

        /**
         * Gets the name of the node to be sorted.
         *
         * @param {Node} node
         * @returns {boolean}
         */
        function getSortableName({ value }) {
          const name = isAssignmentPattern(value)
            ? value.left.name
            : value.name;
          if (name) return ignoreCase ? name.toLowerCase() : name;
          return null;
        }

        /**
         * Sorts the properties of an object by their names.
         *
         * @param {Node} a
         * @param {Node} b
         *
         * @returns {number}
         */
        function sortByName(a, b) {
          const nameA = getSortableName(a);
          const nameB = getSortableName(b);

          if (nameA > nameB) return 1;
          if (nameA < nameB) return -1;

          return 0;
        }

        /**
         * Checks if the node has comments before or after it.
         *
         * @param {Node[]} properties
         * @returns {boolean}
         */
        const hasComments = (properties) => {
          return properties.some((property) => {
            const commentsBefore = sourceCode.getCommentsBefore(property);
            const commentsAfter = sourceCode.getCommentsAfter(property);
            return commentsBefore.length || commentsAfter.length;
          });
        };

        /**
         * Detect unsorted property in a destructured require declaration.
         *
         * @param {Node} node - VariableDeclaration node
         * @returns {{unsortedPropertyNode: Node, properties: Node[]} | null}
         */
        function detectUnsortedProperty(node) {
          if (node.type === "CallExpression" || isStaticRequire(node))
            return null;
          if (node.declarations[0]?.id?.type !== "ObjectPattern") return null;

          const properties = node.declarations[0].id.properties;
          if (!properties.length) return null;

          const firstUnsortedIndex = properties
            .map(getSortableName)
            .findIndex((name, index, arr) => {
              return (
                index > 0 &&
                name !== null &&
                arr[index - 1] !== null &&
                arr[index - 1] > name
              );
            });

          if (firstUnsortedIndex === -1) return null;
          return {
            unsortedPropertyNode: properties[firstUnsortedIndex],
            properties,
          };
        }

        /**
         * Build sorted text for destructured properties.
         *
         * @param {Node[]} properties - Array of property AST nodes
         * @returns {string}
         */
        function buildPropertySortText(properties) {
          const sortedProps = [...properties].sort(sortByName);
          let text = "";

          sortedProps.forEach((prop, idx) => {
            text += sourceCode.getText(prop);

            if (idx < sortedProps.length - 1) {
              const origIndex = properties.indexOf(prop);

              if (origIndex !== -1 && origIndex < properties.length - 1) {
                const nextOriginal = properties[origIndex + 1];
                text += sourceCode
                  .getText()
                  .slice(prop.range[1], nextOriginal.range[0]);
              } else {
                text += ", ";
              }
            }
          });

          return text;
        }

        /**
         * Validates the property sort order in a destructured require declaration.
         *
         * @param {Node} node - VariableDeclaration node
         * @returns {void}
         */
        function validatePropertySort(node) {
          try {
            const detected = detectUnsortedProperty(node);
            if (!detected) return;

            const { unsortedPropertyNode, properties } = detected;
            const nameNode =
              unsortedPropertyNode.key || unsortedPropertyNode.value;

            context.report({
              node: unsortedPropertyNode,
              messageId: "propertyOrder",
              data: { propertyName: nameNode.name },
              fix: (fixer) => {
                if (hasComments(properties)) return null;
                const range = [
                  properties[0].range[0],
                  properties[properties.length - 1].range[1],
                ];
                const newText = buildPropertySortText(properties);
                return fixer.replaceTextRange(range, newText);
              },
            });
          } catch (error) {
            console.error("Error validating property sort:", error);
          }
        }

        /**
         * Get the property syntax type of a node.
         *
         * @param {Node} node
         * @returns {PropertySyntax}
         */
        function getPropertySyntax(node) {
          if (node.type === "CallExpression" && isStaticRequire(node))
            return "none";
          if (hasObjectPattern(node)) return "multiple";
          return "single";
        }

        /**
         * Check if a module path (including its subpaths) is a builtin for the given environment
         *
         * @param {string} path
         * @returns {boolean}
         */
        function isBuiltinModule(path) {
          if (environment === "bun") {
            return BUN_BUILTIN_MODULES.has(path) || path.startsWith("bun:");
          }

          if (environment === "node") {
            return NODE_BUILTIN_MODULES.has(path) || path.startsWith("node:");
          }
        }

        /**
         * Check if a path matches the internal pattern
         *
         * @param {string} path
         * @returns {boolean}
         */
        function isInternalPath(path) {
          return internalPattern.some((pattern) => {
            const regex = new RegExp(pattern);
            return regex.test(path);
          });
        }

        /**
         * Check if a path is a subpath (starts with #)
         *
         * @param {string} path
         * @returns {boolean}
         */
        function isSubpath(path) {
          return path.startsWith("#");
        }

        /**
         * Check if a path is a relative path (starts with ./, ../, or .)
         *
         * @param {string} path
         * @returns {boolean}
         */
        function isRelativePath(path) {
          return (
            path === "." || path.startsWith("./") || path.startsWith("../")
          );
        }

        /**
         * Check if a path is a nested module path (contains /)
         *
         * @param {string} path
         * @returns {boolean}
         */
        function isNestedPath(path) {
          return path.includes("/");
        }

        /**
         * Check if a path is a nested builtin module
         *
         * @param {string} path
         * @returns {boolean}
         */
        function isNestedBuiltinModule(path) {
          if (!isNestedPath(path)) return false;
          return isBuiltinModule(path.split("/")[0], environment);
        }

        /**
         * Get the path type of a require statement
         *
         * @param {string | undefined} path
         * @returns {ModuleType}
         */
        function getModuleType(path = "") {
          if (isSubpath(path)) return "subpath";
          if (isRelativePath(path)) return "relative";
          if (isNestedBuiltinModule(path)) return "nested-builtin";
          if (isBuiltinModule(path)) return "builtin";
          if (isInternalPath(path)) return "internal";
          if (isNestedPath(path)) return "nested-external";
          return "external";
        }

        /**
         * Get the declaration type of a require statement
         *
         * @param {Node} node
         * @returns {DeclarationType}
         */
        function getDeclarationType(node) {
          if (isMemberRequire(node)) {
            return "member";
          }

          if (
            node.type === "VariableDeclaration" &&
            node.declarations[0]?.init?.type === "CallExpression" &&
            node.declarations[0]?.init?.callee?.type === "CallExpression" &&
            node.declarations[0]?.init?.callee?.callee?.name === "require"
          ) {
            return "call";
          }

          return "static";
        }

        /**
         * Get the module path from a require statement
         *
         * @param {Node} node
         * @returns {string}
         */
        function getModulePath(node) {
          if (node.type === "VariableDeclaration") {
            if (isMemberRequire(node)) {
              return node.declarations[0].init.object.arguments[0].value;
            } else {
              return node.declarations[0].init.arguments[0].value;
            }
          } else if (node.type === "CallExpression") {
            return node.arguments[0].value;
          }

          return "";
        }

        /**
         * Gets both syntax, declaration and path type groups for a require statement.
         *
         * @param {Node} node
         * @returns {{ syntaxGroup: string, moduleGroup: string, declarationGroup: string }}
         */
        function getRequireGroups(node) {
          const modulePath = getModulePath(node);
          return {
            syntaxGroup: getPropertySyntax(node),
            moduleGroup: getModuleType(modulePath),
            declarationGroup: getDeclarationType(node),
          };
        }

        /**
         * Compare two sorting nodes by group order then by name.
         *
         * @param {SortingNode} a
         * @param {SortingNode} b
         *
         * @returns {number}
         */
        function compareSortingNodes(a, b) {
          // First compare by group order
          for (const group of groupOrder) {
            let aVal, bVal, orderArr;
            switch (group) {
              case "declaration":
                aVal = a.declarationGroup;
                bVal = b.declarationGroup;
                orderArr = declarationOrder;
                break;
              case "module":
                aVal = a.moduleGroup;
                bVal = b.moduleGroup;
                orderArr = moduleTypeOrder;
                break;
              case "syntax":
                aVal = a.syntaxGroup;
                bVal = b.syntaxGroup;
                orderArr = propertySyntaxOrder;
                break;
            }
            const aIdx = orderArr.indexOf(aVal);
            const bIdx = orderArr.indexOf(bVal);
            if (aIdx !== bIdx) {
              return aIdx - bIdx;
            }
          }

          // If all group values are equal, sort by mode
          let nameA = a.name;
          let nameB = b.name;

          if (sortMode === "length") {
            // Compare by string length first, then alphabetically as tiebreaker
            if (nameA.length !== nameB.length) {
              return sortOrder === "asc"
                ? nameA.length - nameB.length
                : nameB.length - nameA.length;
            }
          } else {
            // For path and name modes, just use alphabetical sorting
            if (ignoreCase) {
              nameA = nameA ? nameA.toLowerCase() : nameA;
              nameB = nameB ? nameB.toLowerCase() : nameB;
            }
          }

          // Final comparison (used as tiebreaker for length mode)
          if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
          if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
          return 0;
        }

        /**
         * Build sorted text block for require declarations including newlines between groups.
         *
         * @param {Array<SortingNode>} sortingNodes
         * @returns {string}
         */
        function buildSortedText(sortingNodes) {
          const sorted = [...sortingNodes].sort(compareSortingNodes);
          let text = "";
          let prevGroups = {};
          sorted.forEach((item, idx) => {
            if (idx > 0) {
              let groupChanged = false;
              for (const group of groupOrder) {
                if (item[`${group}Group`] !== prevGroups[group]) {
                  groupChanged = true;
                  break;
                }
              }
              if (groupChanged && newlinesBetween === "always") {
                text += "\n\n";
              } else {
                text += "\n";
              }
            }
            text += sourceCode.getText(item.node);
            for (const group of groupOrder) {
              prevGroups[group] = item[`${group}Group`];
            }
          });
          return text;
        }

        /**
         * Fixes the declaration sort order.
         *
         * @param {Array<SortingNode>} sortingNodes
         * @returns {Function}
         */
        function fixDeclarationSort(sortingNodes: SortingNode[]) {
          /**
           * @param {ReportFixer} fixer
           */
          return (fixer: Rule.ReportFixer) => {
            if (sortingNodes.length <= 1) return null;

            const nodesWithGroups = sortingNodes.map((nodeInfo) => {
              return { ...nodeInfo, ...getRequireGroups(nodeInfo.node) };
            });

            const newText = buildSortedText(nodesWithGroups);
            const start = Math.min(
              ...nodesWithGroups.map((node) => node.range[0])
            );
            const end = Math.max(
              ...nodesWithGroups.map((node) => node.range[1])
            );

            return fixer.replaceTextRange([start, end], newText);
          };
        }

        /**
         * Fixes the declaration sort order.
         *
         * @param {Array<SortingNode>} sortingNodes
         */
        function reportDeclarationSortErrors(sortingNodes) {
          let previousNode = null;

          const nodesWithGroups = sortingNodes.map((nodeInfo) => {
            return { ...nodeInfo, ...getRequireGroups(nodeInfo.node) };
          });

          nodesWithGroups.forEach((sortingNode, idx) => {
            if (idx === 0) {
              previousNode = sortingNode;
              return;
            }

            const prev = previousNode;
            const comparison = compareSortingNodes(prev, sortingNode);

            if (comparison > 0) {
              // Determine which group caused the wrong order
              for (const group of groupOrder) {
                let prevVal, currentVal, orderArr;

                switch (group) {
                  case "declaration":
                    prevVal = prev.declarationGroup;
                    currentVal = sortingNode.declarationGroup;
                    orderArr = declarationOrder;
                    break;
                  case "module":
                    prevVal = prev.moduleGroup;
                    currentVal = sortingNode.moduleGroup;
                    orderArr = moduleTypeOrder;
                    break;
                  case "syntax":
                    prevVal = prev.syntaxGroup;
                    currentVal = sortingNode.syntaxGroup;
                    orderArr = propertySyntaxOrder;
                    break;
                }

                const prevIdx = orderArr.indexOf(prevVal);
                const currentIdx = orderArr.indexOf(currentVal);

                if (currentIdx !== prevIdx) {
                  context.report({
                    node: sortingNode.node,
                    messageId: "unexpectedGroupOrder",
                    data: {
                      rightGroup: currentVal,
                      leftGroup: prevVal,
                    },
                    fix: fixDeclarationSort(nodesWithGroups),
                  });
                  break;
                }
              }

              // If all group values are equal, it must be a name order issue
              if (
                groupOrder.every((group) => {
                  const [prevVal, currentVal] =
                    group === "declaration"
                      ? [prev.declarationGroup, sortingNode.declarationGroup]
                      : group === "module"
                      ? [prev.moduleGroup, sortingNode.moduleGroup]
                      : [prev.syntaxGroup, sortingNode.syntaxGroup];
                  return prevVal === currentVal;
                })
              ) {
                context.report({
                  node: sortingNode.node,
                  messageId: "unexpectedOrder",
                  data: {
                    right: sortingNode.name,
                    left: prev.name,
                  },
                  fix: fixDeclarationSort(nodesWithGroups),
                });
              }
            }

            // Spacing between groups
            const linesBetween =
              sortingNode.node.loc.start.line - prev.node.loc.end.line;
            const hasGroupChange = groupOrder.some((group) => {
              const prevVal = prev[`${group}Group`];
              const currentVal = sortingNode[`${group}Group`];
              return prevVal !== currentVal;
            });

            if (
              newlinesBetween === "always" &&
              hasGroupChange &&
              linesBetween <= 1
            ) {
              context.report({
                node: sortingNode.node,
                messageId: "missedSpacingBetweenRequires",
                data: { right: sortingNode.name, left: prev.name },
                fix: fixDeclarationSort(nodesWithGroups),
              });
            } else if (newlinesBetween === "never" && linesBetween > 1) {
              context.report({
                node: sortingNode.node,
                messageId: "extraSpacingBetweenRequires",
                data: { right: sortingNode.name, left: prev.name },
                fix: fixDeclarationSort(nodesWithGroups),
              });
            }

            previousNode = sortingNode;
          });
        }

        /**
         * Reports property sort errors.
         *
         * @param {Array<SortingNode>} sortingNodes
         * @returns {void}
         */
        function reportPropertySortErrors(sortingNodes) {
          sortingNodes.forEach(({ node }) => {
            if (node.type === "VariableDeclaration") {
              validatePropertySort(node);
            }
          });
        }

        return {
          /**
           * Handles the sorting of require expressions.
           *
           * @param {Node} node
           * @returns {void}
           */
          ExpressionStatement(node) {
            if (!isTopLevel(node)) return;
            if (!isStaticRequire(node.expression)) return;

            const sortingNode = {
              syntaxGroup: "none",
              moduleGroup: getModuleType(node.expression.arguments[0].value),
              declarationGroup: getDeclarationType(node),
              node: node.expression,
              name: getDeclarationName(node.expression),
              range: node.expression.range,
            };

            sortingNodes.push(sortingNode);
          },
          VariableDeclaration(node) {
            if (!isTopLevel(node)) return;

            if (
              isMemberRequire(node) ||
              isVariableDeclarationWithRequire(node)
            ) {
              const sortingNode = {
                syntaxGroup: getPropertySyntax(node),
                moduleGroup: getModuleType(getModulePath(node)),
                declarationGroup: getDeclarationType(node),
                node,
                name: getDeclarationName(node),
                range: node.range,
              };

              sortingNodes.push(sortingNode);
            }
          },
          "Program:exit"() {
            if (!ignoreDeclarationSort && sortingNodes.length > 1) {
              reportDeclarationSortErrors(sortingNodes);
            }
            if (!ignorePropertySort) {
              reportPropertySortErrors(sortingNodes);
            }
          },
        };
      },
      meta: {
        docs: {
          category: "ECMAScript 6",
          description:
            "enforce sorted require declarations within modules with spacing between groups",
          recommended: false,
          url: "https://github.com/zcuric/eslint-plugin-require-sort",
        },
        fixable: "code",
        schema: [
          {
            additionalProperties: false,
            properties: {
              ignoreCase: {
                default: false,
                type: "boolean",
              },
              ignoreDeclarationSort: {
                default: false,
                type: "boolean",
              },
              ignorePropertySort: {
                default: false,
                type: "boolean",
              },
              newlinesBetween: {
                default: "always",
                enum: DEFAULT_NEWLINES_BETWEEN,
              },
              propertySyntaxOrder: {
                items: {
                  enum: DEFAULT_PROPERTY_SYNTAX_ORDER,
                  type: "string",
                },
                type: "array",
                uniqueItems: true,
              },
              moduleTypeOrder: {
                items: {
                  enum: DEFAULT_MODULE_TYPE_ORDER,
                  type: "string",
                },
                type: "array",
                uniqueItems: true,
              },
              declarationOrder: {
                items: {
                  enum: DEFAULT_DECLARATION_ORDER,
                  type: "string",
                },
                type: "array",
                uniqueItems: true,
              },
              groupOrder: {
                items: {
                  enum: DEFAULT_GROUP_ORDER,
                  type: "string",
                },
                type: "array",
                uniqueItems: true,
                default: DEFAULT_GROUP_ORDER,
              },
              environment: {
                default: "node",
                enum: DEFAULT_ENVIRONMENT,
                type: "string",
              },
              internalPattern: {
                items: {
                  type: "string",
                },
                type: "array",
              },
              sortMode: {
                default: DEFAULT_SORT_MODE,
                enum: ["path", "name", "length"],
                type: "string",
              },
              sortOrder: {
                default: "asc",
                enum: ["asc", "desc"],
                type: "string",
              },
            },
            type: "object",
          },
        ],
        type: "suggestion",
        messages: {
          unexpectedGroupOrder:
            "Expected '{{rightGroup}}' group to come before '{{leftGroup}}' group.",
          unexpectedOrder: "Expected '{{right}}' to come before '{{left}}'.",
          missedSpacingBetweenRequires:
            "Missed spacing between '{{left}}' and '{{right}}'.",
          extraSpacingBetweenRequires:
            "Extra spacing between '{{left}}' and '{{right}}'.",
          propertyOrder:
            "Property '{{propertyName}}' of the require declaration should be sorted alphabetically.",
        },
      },
      defaultOptions: [
        {
          ignoreCase: DEFAULT_IGNORE_CASE,
          ignoreDeclarationSort: DEFAULT_IGNORE_DECLARATION_SORT,
          ignorePropertySort: DEFAULT_IGNORE_PROPERTY_SORT,
          sortMode: DEFAULT_SORT_MODE,
          internalPattern: DEFAULT_INTERNAL_PATTERN,
          moduleTypeOrder: DEFAULT_MODULE_TYPE_ORDER,
          propertySyntaxOrder: DEFAULT_PROPERTY_SYNTAX_ORDER,
          declarationOrder: DEFAULT_DECLARATION_ORDER,
          groupOrder: DEFAULT_GROUP_ORDER,
          newlinesBetween: DEFAULT_NEWLINES_BETWEEN,
          environment: DEFAULT_ENVIRONMENT,
        },
      ],
    },
  },
};
