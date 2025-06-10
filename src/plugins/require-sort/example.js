"use strict";

module.exports = {
  // Import the enhanced require-sort plugin
  plugins: ["require-sort-enhanced"],

  // Configure the rule
  rules: {
    "require-sort-enhanced/require-sort": [
      "warn",
      {
        // Sort case-insensitively
        ignoreCase: true,

        // Always add a blank line between different require groups
        newlinesBetween: "always",

        /**
         * The order of sorting for different require styles.
         *
         * - **none**: Static requires. `require('dotenv').config()`
         * - **multiple**: Multiple property requires. `const { x, y } = require('module'))`
         * - **single**: Single property requires. `const x = require('module'))`
         * - **member**: Member requires. `require('module').something`
         */
        propertySyntaxSortOrder: ["none", "multiple", "single", "member"],

        /**
         * The order of sorting for different module types.
         *
         * - **builtin**: Node.js/Bun built-in modules (e.g., 'fs', 'path')
         * - **nested-builtin**: Built-in modules with paths (e.g., 'node:fs/promises')
         * - **subpath**: Subpath imports (e.g., '#internal/utils')
         * - **nested-external**: External modules with paths (e.g., '@babel/core/lib')
         * - **internal**: Internal modules (matching internalPattern)
         * - **external**: External modules from node_modules
         */
        moduleTypeOrder: [
          "builtin",
          "nested-builtin",
          "subpath",
          "nested-external",
          "internal",
          "external",
        ],

        // Specify the environment for proper built-in module detection
        environment: "node", // or "bun"

        // Pattern for identifying internal modules
        internalPattern: ["^~/", "^@/"],

        // Whether to sort by full path (including subpaths) or just module name
        sortByPath: false,
      },
    ],
  },
};
