# eslint-plugin-require-sort

> **Enhanced require sorting for Node.js and Bun projects.**
>
> Organize your `require` statements by group, style, module type, and with flexible sorting modes (name, path, or line length). Auto-fix, customizable, and works with modern ESLint flat config.

---

## ✨ Features

- **Configurable group order**: by syntax, declaration, or module type
- **Flexible sort modes**: sort by variable name, module path, or line length
- **Ascending or descending order**
- **Auto-fix support**: one command to clean up your requires
- **Blank line control**: always, never, or ignore between groups
- **Supports Node.js and Bun built-ins**
- **Works with destructured, static, and member requires**
- **Zero dependencies**

---

## 🚀 Installation

```sh
npm install --save-dev eslint-plugin-require-sort
```

---

## ⚡️ Usage

Add to your ESLint configuration (flat config example):

```js
const requireSort = require("eslint-plugin-require-sort");

module.exports = [
  // ...other configs
  {
    files: ["**/*.js", "**/*.cjs"],
    plugins: { "eslint-plugin-require-sort": requireSort },
    rules: {
      "eslint-plugin-require-sort/sort": [
        "warn",
        {
          sortMode: "name", // or "path" or "length"
          sortOrder: "asc", // or "desc"
          groupOrder: ["syntax", "declaration", "module"],
          newlinesBetween: "always", // or "never" or "ignore"
          // ...other options
        },
      ],
    },
  },
];
```

---

## 🔧 Options

| Option                  | Type    | Default                               | Description                                                                                                          |
| ----------------------- | ------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `sortMode`              | string  | `'name'`                              | How to sort within groups: `'name'` (variable/module name), `'path'` (full module path), or `'length'` (line length) |
| `sortOrder`             | string  | `'asc'`                               | `'asc'` (A-Z, shortest first) or `'desc'` (Z-A, longest first)                                                       |
| `groupOrder`            | array   | `["syntax", "declaration", "module"]` | Order of sorting groups                                                                                              |
| `propertySyntaxOrder`   | array   | `["none", "single", "multiple"]`      | Order of require styles                                                                                              |
| `declarationOrder`      | array   | `["member", "static"]`                | Order of declaration types                                                                                           |
| `moduleTypeOrder`       | array   | `["builtin", ...]`                    | Order of module types (see below)                                                                                    |
| `ignoreCase`            | boolean | `false`                               | Ignore case when sorting                                                                                             |
| `ignoreDeclarationSort` | boolean | `false`                               | Skip declaration sorting                                                                                             |
| `ignorePropertySort`    | boolean | `false`                               | Skip property sorting in destructured requires                                                                       |
| `newlinesBetween`       | string  | `'always'`                            | `'always'`, `'never'`, or `'ignore'` between groups                                                                  |
| `environment`           | string  | `'node'`                              | `'node'` or `'bun'` for built-in detection                                                                           |
| `internalPattern`       | array   | `["^~/", "^@/"]`                      | Regex patterns for internal modules                                                                                  |

---

## 📜 Sorting Algorithm

The sorting algorithm of this library works in multiple passes, following your configured `groupOrder`. Each pass groups the `require` statements by one of the following:

- **Syntax**: Groups by the style of `require` (e.g., none, single, multiple).
- **Declaration**: Groups by declaration type (e.g., member, static).
- **Module Type**: Groups by module category (e.g., built-in, external, internal, relative).

For each group, the plugin sorts the statements according to your chosen `groupOrder`, based on the `sortMode` (`name`, `path`, or `length`) then the `sortOrder` (`asc` or `desc`). After sorting within a group, it proceeds to the next group in the order you specified, repeating the process until all groups are sorted. This layered approach ensures your `require` statements are organized by both structure and style.

The plugin also respects the `newlinesBetween` option, adding or removing blank lines between groups as specified. This allows for a clean and readable organization of your `require` statements.

---

## 📚 Grouping Options

The plugin organizes `require` statements into groups based on your configuration. The main grouping criteria are:

### Declaration Order

**Declaration** refers to how a `require` statement is structured, not the variable name itself:

- **Static declaration**: Assigns the entire module to a variable.  
  Example: `const foo = require('foo')`
- **Member declaration**: Assigns a property or method from the required module.  
  Example: `const bar = require('foo').bar`

This distinction lets you group and sort `require` statements by whether they import the whole module or just a specific member. Sorting by `declaration type` helps keep similar patterns together, making your code more organized and readable.

### Syntax

**Syntax** refers to the assignment style of the `require` statement. It can be categorized as follows:

- **None**: Unassigned `require` statement.
  Example: `require('foo')`
- **Single**: Single variable `require` statement.
  Example: `const foo = require('foo')`
- **Multiple**: Destructured `require` statement.
  Example: `const { bar } = require('foo')`

### Module Grouping

**Module grouping** categorizes `require` statements based on the type of module being imported. This helps in organizing imports logically, making it easier to read and maintain your code. The plugin supports various module types, which can be customized via the `moduleTypeOrder` option.

There are several module types that the plugin recognizes:

- **Built-in**: Node.js or Bun built-in modules (e.g., `'fs'`, `'path'`)
- **Nested Built-in**: Built-in modules with paths (e.g., `'node:fs/promises'`)
- **Subpath**: Subpath imports (e.g., `'#internal/utils'`)
- **Nested External**: External modules with paths (e.g., `'@babel/core/lib'`)
- **Internal**: Internal modules that match the `internalPattern` regex (e.g., `'^~/'`, `'^@/'`)
- **External**: External modules from `node_modules` (e.g., `'express'`, `'lodash'`)
- **Relative**: Relative paths (e.g., `'./foo'`, `'../bar'`)

This categorization allows you to keep your `require` statements organized by their source, making it easier to identify dependencies and maintain your codebase in a way that makes sense for your project.

---

## 📊 Sorting Options

### Sort Order

- **asc**: Sorts in ascending order (A-Z, shortest to longest)
- **desc**: Sorts in descending order (Z-A, longest to shortest)

### Sort Modes

- **name**: Sort by variable name or module name (default)
- **path**: Sort by the full module path string
- **length**: Sort by the length of the entire require statement (shortest to longest or vice versa)

---

## 📝 Example

**Input:**

```js
const { map, filter } = require("lodash");
const { join } = require("path");
const express = require("express");
const fs = require("fs");
const moment = require("moment");
require("dotenv").config();
require("./config/setup");
```

**Output (auto-fix, default config):**

```js
require("dotenv").config();
require("./config/setup");

const { filter, map } = require("lodash");
const { join } = require("path");

const express = require("express");
const fs = require("fs");
const moment = require("moment");
```

**Output (sortMode: 'length', sortOrder: 'desc'):**

```js
require("./config/setup");
require("dotenv").config();

const { filter, map } = require("lodash");
const moment = require("moment");
const express = require("express");
const { join } = require("path");
const fs = require("fs");
```

---

## 💡 Tips

- Use with ESLint's `--fix` to auto-organize your requires
- Combine with import sorting plugins for full control
- Works with both CommonJS and ESM (for `require` only)
- Supports Bun and Node.js built-ins

---

## 🙏 Credits

- Based on the original [eslint-plugin-require-sort](https://www.npmjs.com/package/eslint-plugin-require-sort) with enhancements inspired by [eslint-plugin-perfectionist](https://www.npmjs.com/package/eslint-plugin-perfectionist) and community feedback.

## 📝 License

MIT

## 📦 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the latest updates and changes.
