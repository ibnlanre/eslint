import type { Rule } from "eslint";
import type { ExportNamedDeclaration, ImportDeclaration, Node } from "estree";
import type { Context } from "eslint-module-utils";

declare module "eslint-plugin-import" {
  interface ImportPluginRules {
    "no-resolved": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: string;
        };
        schema: any[];
      };
      create: (context: Context) => any;
    };
    named: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: string;
        };
        schema: any[];
      };
      create: (context: Context) => any;
    };
    default: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: string;
        };
        schema: never[];
      };
      create: (context: Context) => {
        ImportDeclaration: ImportDeclaration;
        ExportNamedDeclaration: ExportNamedDeclaration;
      };
    };
    namespace: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: string;
        };
        schema: {
          type: string;
          properties: {
            allowComputed: {
              description: string;
              type: string;
              default: boolean;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => {
        Program: (_ref2: any) => void;
        ExportNamespaceSpecifier: (namespace: any) => null | undefined;
        MemberExpression: (dereference: any) => void;
        VariableDeclarator: (_ref3: any) => void;
        JSXMemberExpression: (_ref4: any) => void;
      };
    };
    "no-namespace": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: string;
        };
        fixable: string;
        schema: {
          type: string;
          properties: {
            ignore: {
              type: string;
              items: {
                type: string;
              };
              uniqueItems: boolean;
            };
          };
        }[];
      };
      create: (context: Context) => {
        ImportNamespaceSpecifier: (node: Node) => void;
      };
    };
    export: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: string;
        };
        schema: never[];
      };
      create: (context: Context) => {
        ExportDefaultDeclaration: (node: Node) => void;
        ExportSpecifier: (node: Node) => void;
        ExportNamedDeclaration: (node: Node) => void;
        ExportAllDeclaration: (node: Node) => void;
        "Program:exit": () => void;
      };
    };
    "no-mutable-exports": Rule.RuleModule;
    extensions: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          anyOf: (
            | {
                type: string;
                items: (
                  | {
                      enum: string[];
                    }
                  | {
                      type: string;
                      properties: {
                        pattern: {
                          type: string;
                          patternProperties: {
                            ".*": {
                              enum: string[];
                            };
                          };
                        };
                        checkTypeImports: {
                          type: string;
                        };
                        ignorePackages: {
                          type: string;
                        };
                      };
                    }
                )[];
                additionalItems: boolean;
              }
            | {
                type: string;
                items: (
                  | {
                      enum: string[];
                    }
                  | {
                      type: string;
                      patternProperties: {
                        ".*": {
                          enum: string[];
                        };
                      };
                    }
                )[];
                additionalItems: boolean;
              }
          )[];
        };
      };
      create: (context: Context) => any;
    };
    "no-restricted-paths": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            zones: {
              type: string;
              minItems: number;
              items: {
                type: string;
                properties: {
                  target: {
                    anyOf: (
                      | {
                          type: string;
                          items?: undefined;
                          uniqueItems?: undefined;
                          minLength?: undefined;
                        }
                      | {
                          type: string;
                          items: {
                            type: string;
                          };
                          uniqueItems: boolean;
                          minLength: number;
                        }
                    )[];
                  };
                  from: {
                    anyOf: (
                      | {
                          type: string;
                          items?: undefined;
                          uniqueItems?: undefined;
                          minLength?: undefined;
                        }
                      | {
                          type: string;
                          items: {
                            type: string;
                          };
                          uniqueItems: boolean;
                          minLength: number;
                        }
                    )[];
                  };
                  except: {
                    type: string;
                    items: {
                      type: string;
                    };
                    uniqueItems: boolean;
                  };
                  message: {
                    type: string;
                  };
                };
                additionalProperties: boolean;
              };
            };
            basePath: {
              type: string;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => any;
    };
    "no-internal-modules": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          anyOf: (
            | {
                type: string;
                properties: {
                  allow: {
                    type: string;
                    items: {
                      type: string;
                    };
                  };
                  forbid?: undefined;
                };
                additionalProperties: boolean;
              }
            | {
                type: string;
                properties: {
                  forbid: {
                    type: string;
                    items: {
                      type: string;
                    };
                  };
                  allow?: undefined;
                };
                additionalProperties: boolean;
              }
          )[];
        }[];
      };
      create: (context: Context) => any;
    };
    "group-exports": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
      };
      create: (context: Context) => {
        ExportNamedDeclaration: (node: Node) => void;
        AssignmentExpression: (node: Node) => void;
        "Program:exit": () => void;
      };
    };
    "no-relative-packages": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: any[];
      };
      create: (context: Context) => any;
    };
    "no-relative-parent-imports": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: any[];
      };
      create: (context: Context) => any;
    };
    "consistent-type-specifier-style": Rule.RuleModule;
    "no-self-import": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          recommended: boolean;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => any;
    };
    "no-cycle": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: any[];
      };
      create: (context: Context) => any;
    };
    "no-named-default": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => {
        ImportDeclaration: (node: Node) => void;
      };
    };
    "no-named-as-default": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => {
        ImportDefaultSpecifier: any;
        ExportDefaultSpecifier: any;
      };
    };
    "no-named-as-default-member": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => {
        ImportDefaultSpecifier: (node: Node) => void;
        MemberExpression: (node: Node) => void;
        VariableDeclarator: (node: Node) => void;
        "Program:exit": () => void;
      };
    };
    "no-unused-modules": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          properties: {
            src: {
              description: string;
              type: string;
              uniqueItems: boolean;
              items: {
                type: string;
                minLength: number;
              };
            };
            ignoreExports: {
              description: string;
              type: string;
              uniqueItems: boolean;
              items: {
                type: string;
                minLength: number;
              };
            };
            missingExports: {
              description: string;
              type: string;
            };
            unusedExports: {
              description: string;
              type: string;
            };
            ignoreUnusedTypeExports: {
              description: string;
              type: string;
            };
          };
          anyOf: (
            | {
                properties: {
                  unusedExports: {
                    enum: boolean[];
                  };
                  src: {
                    minItems: number;
                  };
                };
                required: string[];
              }
            | {
                properties: {
                  missingExports: {
                    enum: boolean[];
                  };
                };
                required: string[];
              }
          )[];
        }[];
      };
      create: (context: Context) => {
        "Program:exit": (node: Node) => void;
        ExportDefaultDeclaration: (node: Node) => void;
        ExportNamedDeclaration: (node: Node) => void;
      };
    };
    "no-commonjs": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          anyOf: (
            | {
                type: string;
                items: {
                  enum: string[];
                }[];
                additionalItems: boolean;
              }
            | {
                type: string;
                items: {
                  type: string;
                  properties: {
                    allowPrimitiveModules: {
                      type: string;
                    };
                    allowRequire: {
                      type: string;
                    };
                    allowConditionalRequire: {
                      type: string;
                    };
                  };
                  additionalProperties: boolean;
                }[];
                additionalItems: boolean;
              }
          )[];
        };
      };
      create: (context: Context) => {
        MemberExpression: (node: Node) => void;
        CallExpression: (call: any) => void;
      };
    };
    "no-amd": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => {
        CallExpression: (node: Node) => void;
      };
    };
    "no-duplicates": Rule.RuleModule;
    first: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: {
          type: string;
          enum: string[];
        }[];
      };
      create: (context: Context) => {
        Program: (n: any) => void;
      };
    };
    "max-dependencies": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            max: {
              type: string;
            };
            ignoreTypeImports: {
              type: string;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => any;
    };
    "no-extraneous-dependencies": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            devDependencies: {
              type: string[];
            };
            optionalDependencies: {
              type: string[];
            };
            peerDependencies: {
              type: string[];
            };
            bundledDependencies: {
              type: string[];
            };
            packageDir: {
              type: string[];
            };
            includeInternal: {
              type: string[];
            };
            includeTypes: {
              type: string[];
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => any;
      "Program:exit": () => void;
    };
    "no-absolute-path": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: any[];
      };
      create: (context: Context) => any;
    };
    "no-nodejs-modules": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            allow: {
              type: string;
              uniqueItems: boolean;
              items: {
                type: string;
              };
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => any;
    };
    "no-webpack-loader-syntax": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => any;
    };
    order: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: {
          type: string;
          properties: {
            groups: {
              type: string;
            };
            pathGroupsExcludedImportTypes: {
              type: string;
            };
            distinctGroup: {
              type: string;
              default: boolean;
            };
            pathGroups: {
              type: string;
              items: {
                type: string;
                properties: {
                  pattern: {
                    type: string;
                  };
                  patternOptions: {
                    type: string;
                  };
                  group: {
                    type: string;
                    enum: string[];
                  };
                  position: {
                    type: string;
                    enum: string[];
                  };
                };
                additionalProperties: boolean;
                required: string[];
              };
            };
            "newlines-between": {
              enum: string[];
            };
            named: {
              default: boolean;
              oneOf: (
                | {
                    type: string;
                  }
                | {
                    type: string;
                    properties: {
                      enabled: {
                        type: string;
                      };
                      import: {
                        type: string;
                      };
                      export: {
                        type: string;
                      };
                      require: {
                        type: string;
                      };
                      cjsExports: {
                        type: string;
                      };
                      types: {
                        type: string;
                        enum: string[];
                      };
                    };
                    additionalProperties: boolean;
                  }
              )[];
            };
            alphabetize: {
              type: string;
              properties: {
                caseInsensitive: {
                  type: string;
                  default: boolean;
                };
                order: {
                  enum: string[];
                  default: string;
                };
                orderImportKind: {
                  enum: string[];
                  default: string;
                };
              };
              additionalProperties: boolean;
            };
            warnOnUnassignedImports: {
              type: string;
              default: boolean;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => any;
    };
    "newline-after-import": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: {
          type: string;
          properties: {
            count: {
              type: string;
              minimum: number;
            };
            exactCount: {
              type: string;
            };
            considerComments: {
              type: string;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => {
        ImportDeclaration: (node: Node) => void;
        TSImportEqualsDeclaration: (node: Node) => void;
        CallExpression: (node: Node) => void;
        "Program:exit": (node: Node) => void;
        FunctionDeclaration: () => void;
        FunctionExpression: () => void;
        ArrowFunctionExpression: () => void;
        BlockStatement: () => void;
        ObjectExpression: () => void;
        Decorator: () => void;
        "FunctionDeclaration:exit": () => void;
        "FunctionExpression:exit": () => void;
        "ArrowFunctionExpression:exit": () => void;
        "BlockStatement:exit": () => void;
        "ObjectExpression:exit": () => void;
        "Decorator:exit": () => void;
      };
    };
    "prefer-default-export": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            target: {
              type: string;
              enum: string[];
              default: string;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => {
        ExportDefaultSpecifier: () => void;
        ExportSpecifier: (node: Node) => void;
        ExportNamedDeclaration: (node: Node) => void;
        ExportDefaultDeclaration: () => void;
        ExportAllDeclaration: () => void;
        "Program:exit": () => void;
      };
    };
    "no-default-export": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) =>
        | {
            ExportDefaultDeclaration?: undefined;
            ExportNamedDeclaration?: undefined;
          }
        | {
            ExportDefaultDeclaration: (node: Node) => void;
            ExportNamedDeclaration: (node: Node) => void;
          };
    };
    "no-named-export": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) =>
        | {
            ExportAllDeclaration?: undefined;
            ExportNamedDeclaration?: undefined;
          }
        | {
            ExportAllDeclaration: (node: Node) => void;
            ExportNamedDeclaration: (node: Node) => any;
          };
    };
    "no-dynamic-require": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            esmodule: {
              type: string;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => {
        CallExpression: (node: Node) => any;
        ImportExpression: (node: Node) => any;
      };
    };
    unambiguous: {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) =>
        | {
            Program?: undefined;
          }
        | {
            Program: (ast: Node) => void;
          };
    };
    "no-unassigned-import": {
      create: (context: Context) => {
        ImportDeclaration: (node: Node) => void;
        ExpressionStatement: (node: Node) => void;
      };
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            devDependencies: {
              type: string[];
            };
            optionalDependencies: {
              type: string[];
            };
            peerDependencies: {
              type: string[];
            };
            allow: {
              type: string;
              items: {
                type: string;
              };
            };
          };
          additionalProperties: boolean;
        }[];
      };
    };
    "no-useless-path-segments": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: {
          type: string;
          properties: {
            commonjs: {
              type: string;
            };
            noUselessIndex: {
              type: string;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => any;
    };
    "dynamic-import-chunkname": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: {
          type: string;
          properties: {
            importFunctions: {
              type: string;
              uniqueItems: boolean;
              items: {
                type: string;
              };
            };
            allowEmpty: {
              type: string;
            };
            webpackChunknameFormat: {
              type: string;
            };
          };
        }[];
        hasSuggestions: boolean;
      };
      create: (context: Context) => {
        ImportExpression: (node: Node) => void;
        CallExpression: (node: Node) => void;
      };
    };
    "no-import-module-exports": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          recommended: boolean;
        };
        fixable: string;
        schema: {
          type: string;
          properties: {
            exceptions: {
              type: string;
            };
          };
          additionalProperties: boolean;
        }[];
      };
      create: (context: Context) => {
        ImportDeclaration: (node: Node) => void;
        MemberExpression: (node: Node) => void;
      };
    };
    "no-empty-named-blocks": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: never[];
        hasSuggestions: boolean;
      };
      create: (context: Context) => {
        ImportDeclaration: (node: Node) => void;
        "Program:exit": (program: any) => void;
      };
    };
    "exports-last": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => {
        Program: (_ref2: any) => void;
      };
    };
    "no-deprecated": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        schema: never[];
      };
      create: (context: Context) => {
        Program: (_ref: any) => any;
        Identifier: (node: Node) => void;
        MemberExpression: (dereference: any) => void;
      };
    };
    "imports-first": {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: {
          type: string;
          enum: string[];
        }[];
      };
      create: (context: Context) => {
        Program: (n: any) => void;
      };
    } & {
      meta: {
        type: string;
        docs: {
          category: string;
          description: string;
          url: any;
        };
        fixable: string;
        schema: {
          type: string;
          enum: string[];
        }[];
      } & {
        deprecated: boolean;
        docs: {
          category: string;
          description: string;
          url: any;
        };
      };
    };
  }

  interface ImportPlugin {
    meta: {
      name: string;
      version: string;
    };
    rules: ImportPluginRules;
  }

  interface ESlintPluginImport {
    configs: {
      recommended: {
        plugins: string[];
        rules: {
          "import/no-unresolved": string;
          "import/named": string;
          "import/namespace": string;
          "import/default": string;
          "import/export": string;
          "import/no-named-as-default": string;
          "import/no-named-as-default-member": string;
          "import/no-duplicates": string;
        };
        parserOptions: {
          sourceType: string;
          ecmaVersion: number;
        };
      };
      errors: {
        plugins: string[];
        rules: {
          "import/no-unresolved": number;
          "import/named": number;
          "import/namespace": number;
          "import/default": number;
          "import/export": number;
        };
      };
      warnings: {
        plugins: string[];
        rules: {
          "import/no-named-as-default": number;
          "import/no-named-as-default-member": number;
          "import/no-duplicates": number;
        };
      };
      "stage-0": {
        plugins: string[];
        rules: {
          "import/no-deprecated": number;
        };
      };
      react: {
        settings: {
          "import/extensions": string[];
        };
        parserOptions: {
          ecmaFeatures: {
            jsx: boolean;
          };
        };
      };
      "react-native": {
        settings: {
          "import/resolver": {
            node: {
              extensions: string[];
            };
          };
        };
      };
      electron: {
        settings: {
          "import/core-modules": string[];
        };
      };
      typescript: {
        settings: {
          "import/extensions": string[];
          "import/external-module-folders": string[];
          "import/parsers": {
            "@typescript-eslint/parser": string[];
          };
          "import/resolver": {
            node: {
              extensions: string[];
            };
          };
        };
        rules: {
          "import/named": string;
        };
      };
    };

    flatConfigs: {
      recommended: {
        name: "import/recommended";
        plugins: { import: ImportPlugin };
        rules: {
          "import/no-unresolved": string;
          "import/named": string;
          "import/namespace": string;
          "import/default": string;
          "import/export": string;
          "import/no-named-as-default": string;
          "import/no-named-as-default-member": string;
          "import/no-duplicates": string;
        };
        languageOptions: {
          ecmaVersion: number;
          sourceType: string;
        };
      };
      errors: {
        name: "import/errors";
        plugins: { import: ImportPlugin };
        rules: {
          "import/no-unresolved": number;
          "import/named": number;
          "import/namespace": number;
          "import/default": number;
          "import/export": number;
        };
      };
      warnings: {
        name: "import/warnings";
        plugins: { import: ImportPlugin };
        rules: {
          "import/no-named-as-default": number;
          "import/no-named-as-default-member": number;
          "import/no-duplicates": number;
        };
      };
      react: {
        settings: {
          "import/extensions": string[];
        };
        languageOptions: {
          parserOptions: {
            ecmaFeatures: {
              jsx: boolean;
            };
          };
        };
      };
      "react-native": {
        settings: {
          "import/resolver": {
            node: {
              extensions: string[];
            };
          };
        };
      };
      electron: {
        settings: {
          "import/core-modules": string[];
        };
      };
      typescript: {
        settings: {
          "import/extensions": string[];
          "import/external-module-folders": string[];
          "import/parsers": {
            "@typescript-eslint/parser": string[];
          };
          "import/resolver": {
            node: {
              extensions: string[];
            };
          };
        };
        rules: {
          "import/named": string;
        };
      };
    };
  }

  declare const _default: ESlintPluginImport;
  export = _default;
}
