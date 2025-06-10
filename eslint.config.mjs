import eslintPlugin from 'eslint-plugin-eslint-plugin';
import extensionEngine from "@extensionengine/eslint-config";

export default [
  eslintPlugin.configs['flat/recommended'],
  {
    rules: {
      ...extensionEngine.rules
    }
  }
]
