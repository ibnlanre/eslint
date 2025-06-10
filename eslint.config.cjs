require("eslint-plugin-only-warn");

const css = require("@eslint/css").default;
const json = require("@eslint/json").default;
const markdown = require("@eslint/markdown").default;

const compat = require("eslint-plugin-compat");
const cypress = require("eslint-plugin-cypress");
const deMorgan = require("eslint-plugin-de-morgan");
const depend = require("eslint-plugin-depend");
const globals = require("globals");
const html = require("eslint-plugin-html");
const importX = require("eslint-plugin-import-x");
const jestPlugin = require("eslint-plugin-jest");
const jsxA11y = require("eslint-plugin-jsx-a11y");
const lodash = require("eslint-plugin-lodash");
const optimizeRegex = require("eslint-plugin-optimize-regex");
const perfectionist = require("eslint-plugin-perfectionist");
const prettier = require("eslint-plugin-prettier");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRedux = require("eslint-plugin-react-redux");
const risxss = require("eslint-plugin-risxss");
const secrets = require("eslint-plugin-no-secrets");
const security = require("eslint-plugin-security");
const sonarjs = require("eslint-plugin-sonarjs");
const switchCase = require("eslint-plugin-switch-case");
const tailwindcss = require("eslint-plugin-tailwindcss");
const testingLibrary = require("eslint-plugin-testing-library");
const tsPaths = require("eslint-plugin-paths");
const tseslint = require("typescript-eslint");
const unusedImports = require("eslint-plugin-unused-imports");
const xss = require("eslint-plugin-xss");
const youDontNeedLodashUnderscrore = require("eslint-plugin-you-dont-need-lodash-underscore");

const eslintReact = require("@eslint-react/eslint-plugin");
const js = require("@eslint/js");
const stylisticJsx = require("@stylistic/eslint-plugin-jsx");
const typescript = require("@typescript-eslint/parser");
const vitestPlugin = require("@vitest/eslint-plugin");

const requireSort = require("./require-sort-enhanced");

const { defineConfig } = require("eslint/config");

const EXT = {
  COMMONJS: "**/*.cjs",
  CSS: "**/*.{css,scss,sass,less}",
  HTML: "**/*.{htm,html,xml,xhtml}",
  JS: "**/*.{js,jsx}",
  JSON: "**/*.{json,json5,jsonc}",
  MD: "**/*.{md,mdx,markdown}",
  MODULE: "**/*.{mjs,mjsx,mtsx}",
  TEST: "**/*.[spec|test|cy].{js,ts,jsx,tsx}",
  TS: "**/*.{ts,tsx}",
  YML: "**/*.{yml,yaml}",
};

/**
 * Helper function to omit properties from an object based on a predicate
 *
 * @param {Record<string, unknown>} object - The object to omit properties from
 * @param {(value: unknown, key: string) => boolean} predicate - The predicate function to determine which properties to omit
 * @returns {Record<string, unknown>} - A new object with the omitted properties
 */
function omitBy(object, predicate) {
  if (typeof object !== "object" || object === null) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.filter((value, index) => !predicate(value, index));
  }

  const obj = {};
  for (const key in object) {
    if (!Object.hasOwnProperty.call(object, key)) continue;
    const value = Reflect.get(object, key);
    if (!predicate(value, key)) {
      Reflect.set(obj, key, value);
    }
  }
  return obj;
}

const ignoresConfig = tseslint.config({
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.vscode/**",
    "**/.github/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/.vercel/**",
    "**/.output/**",
  ],
});

const testGlobals = {
  ...globals.jest,
  ...globals.vitest,
  ...globals.commonjs,
  ...globals.mocha,
  ...cypress.environments.globals.globals,
};

const cypressConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS, EXT.TEST],
  languageOptions: {
    globals: testGlobals,
    parser: tseslint.parser,
  },
  plugins: { cypress },
  rules: cypress.configs.recommended.rules,
});

const jestConfig = tseslint.config({
  extends: [
    jestPlugin.configs["flat/recommended"],
    jestPlugin.configs["flat/style"],
  ],
  files: [EXT.JS, EXT.COMMONJS, EXT.MODULE, EXT.TEST],
  languageOptions: {
    globals: testGlobals,
  },
  plugins: { jest: jestPlugin },
});

const vitestConfig = tseslint.config({
  extends: [vitestPlugin.configs.recommended],
  files: [EXT.JS, EXT.COMMONJS, EXT.MODULE, EXT.TEST],
  languageOptions: {
    globals: testGlobals,
  },
  plugins: { vitest: vitestPlugin },
});

const testingLibraryConfig = tseslint.config({
  extends: [
    testingLibrary.configs["flat/react"],
    testingLibrary.configs["flat/dom"],
  ],
  files: [EXT.JS, EXT.COMMONJS, EXT.MODULE, EXT.TEST],
  languageOptions: {
    globals: testGlobals,
  },
});

const markdownConfig = tseslint.config({
  extends: markdown.configs.recommended,
  files: [EXT.MD],
  language: "markdown/commonmark",
  plugins: {
    "@eslint/markdown": markdown,
  },
});

const htmlConfig = tseslint.config({
  files: [EXT.HTML],
  languageOptions: {
    sourceType: "module",
  },
  plugins: { html, xss },
  rules: {
    ...xss.configs.recommended.rules,
  },
});

const cssConfig = tseslint.config({
  extends: [css.configs.recommended],
  files: [EXT.CSS],
  language: "css/css",
  plugins: { css },
});

const tailwindcssConfig = tseslint.config({
  extends: [...tailwindcss.configs["flat/recommended"]],
  files: [EXT.CSS, EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS, EXT.JSON],
  languageOptions: {
    parser: tseslint.parser,
  },
  plugins: { tailwindcss },
});

const jsCommonjsConfig = tseslint.config({
  extends: [js.configs.recommended],
  files: [EXT.JS, EXT.COMMONJS],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.nodeBuiltin,
      ...testGlobals,
    },
    sourceType: "commonjs",
  },
  plugins: { js },
  rules: {
    "sort-imports": "off",
  },
});

const jsModuleConfig = tseslint.config({
  extends: [js.configs.recommended],
  files: [EXT.JS, EXT.MODULE],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.serviceworker,
      ...globals.builtin,
      ...testGlobals,
    },
    sourceType: "module",
  },
  plugins: { js },
  rules: {
    "sort-imports": "off",
  },
});

const compatConfig = tseslint.config({
  extends: [compat.configs["flat/recommended"]],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
});

const deMorganConfig = tseslint.config({
  extends: [deMorgan.configs.recommended],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { deMorgan },
});

const securityConfig = tseslint.config({
  extends: [security.configs.recommended],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { security },
});

const switchCaseConfig = tseslint.config({
  extends: [switchCase.configs.recommended],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { "switch-case": switchCase },
});

const sonarjsConfig = tseslint.config({
  extends: [sonarjs.configs.recommended],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
});

const lodashConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { lodash },
  rules: {
    ...omitBy(lodash.configs.recommended.rules, (value, key) =>
      key.startsWith("lodash/prefer-")
    ),
  },
});

const optimizeRegexConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { "optimize-regex": optimizeRegex },
  rules: {
    ...optimizeRegex.configs.recommended.rules,
  },
});

const youDontNeedLodashUnderscoreConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { "you-dont-need-lodash-underscore": youDontNeedLodashUnderscrore },
  rules: {
    ...youDontNeedLodashUnderscrore.configs["compatible-warn"].rules,
  },
});

const dependConfig = tseslint.config({
  extends: [depend.configs["flat/recommended"]],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  ignores: ["**/*.d.ts"],
});

const unusedImportsConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
    },
  },
  plugins: { "unused-imports": unusedImports },
  rules: {
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        vars: "all",
        varsIgnorePattern: "^_",
      },
    ],
  },
});

const secretsConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
    },
  },
  plugins: { json, "no-secrets": secrets },
  rules: {
    "no-secrets/no-pattern-match": ["warn"],
    "no-secrets/no-secrets": ["warn"],
  },
});

const importConfig = tseslint.config({
  extends: [importX.flatConfigs.react, importX.flatConfigs.typescript],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parser: typescript,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
    },
  },
  plugins: { typescript },
  rules: {
    "import-x/no-cycle": ["warn", { maxDepth: "∞" }],
  },
  settings: {
    "import-x/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import-x/ignore": ["node_modules", "\\.(coffee|scss|css|less|hbs|svg)$"],
    "import-x/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import-x/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
});

const typescriptConfig = tseslint.config({
  extends: [
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  files: [EXT.TS],
  languageOptions: {
    globals: globals.browser,
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      projectService: true,
    },
  },
  plugins: { "ts-paths": tsPaths },
  rules: {
    "ts-paths/alias": ["warn"],
  },
});

const reactConfig = tseslint.config({
  extends: [
    jsxA11y.flatConfigs.recommended,
    eslintReact.configs["recommended-typescript"],
    reactHooks.configs["recommended-latest"],
  ],
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.vitest,
    },
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: {
    "@stylistic/jsx": stylisticJsx,
    jsxA11y,
    "react-redux": reactRedux,
    reactHooks,
    risxss,
  },
  rules: {
    ...reactRedux.configs.recommended.rules,
    "@stylistic/jsx/jsx-self-closing-comp": "warn",
    "risxss/catch-potential-xss-react": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
});

const jsonConfig = tseslint.config({
  extends: [json.configs.recommended],
  files: [EXT.JSON],
  language: "json/json",
  plugins: { json },
});

const jsoncConfig = tseslint.config({
  extends: [json.configs.recommended],
  files: [EXT.JSON, EXT.YML],
  language: "json/jsonc",
  plugins: { json },
});

const perfectionistConfig = tseslint.config({
  files: [EXT.COMMONJS, EXT.JS, EXT.MODULE, EXT.TS],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
    },
  },
  plugins: { perfectionist },
  rules: {
    ...perfectionist.configs["recommended-natural"].rules,
    "perfectionist/sort-imports": [
      "warn",
      {
        fallbackSort: { order: "asc", type: "alphabetical" },
        groups: [
          ["type-builtin", "type-subpath", "type-external"],
          ["type-internal", "type-parent", "type-sibling", "type-index"],
          ["named-type-builtin", "named-type-subpath", "named-type-external"],
          [
            "named-type-internal",
            "named-type-parent",
            "named-type-sibling",
            "named-type-index",
          ],
          ["ts-equals-import"],
          ["value-builtin", "value-subpath", "value-external"],
          ["value-internal", "value-parent", "value-sibling", "value-index"],
          [
            "named-value-builtin",
            "named-value-subpath",
            "named-value-external",
          ],
          [
            "named-value-internal",
            "named-value-parent",
            "named-value-sibling",
            "named-value-index",
          ],
          ["value-side-effect", "value-side-effect-style"],
          ["require-import"],
          ["unknown"],
        ],
        type: "natural",
      },
    ],
  },
});

const requireSortConfig = tseslint.config({
  files: [EXT.COMMONJS], //[EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
    },
  },
  plugins: { "eslint-plugin-requires": requireSort },
  rules: {
    "eslint-plugin-requires/sort": ["warn"],
  },
});

const prettierConfig = tseslint.config({
  files: [EXT.JS, EXT.MODULE, EXT.COMMONJS, EXT.TS],
  plugins: { prettier },
  rules: {
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
        parser: "typescript",
        printWidth: 120,
        semi: true,
        singleQuote: false,
        tabWidth: 4,
        trailingComma: "all",
        useTabs: false,
      },
    ],
  },
});

module.exports = defineConfig([
  ignoresConfig,
  cypressConfig,
  jestConfig,
  vitestConfig,
  testingLibraryConfig,
  markdownConfig,
  htmlConfig,
  cssConfig,
  tailwindcssConfig,
  jsCommonjsConfig,
  jsModuleConfig,
  compatConfig,
  deMorganConfig,
  securityConfig,
  switchCaseConfig,
  sonarjsConfig,
  lodashConfig,
  optimizeRegexConfig,
  youDontNeedLodashUnderscoreConfig,
  dependConfig,
  unusedImportsConfig,
  secretsConfig,
  importConfig,
  typescriptConfig,
  reactConfig,
  jsonConfig,
  jsoncConfig,
  perfectionistConfig,
  requireSortConfig,
  prettierConfig,
]);
