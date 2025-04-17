import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin"; // Update plugin import
import tsParser from "@typescript-eslint/parser";

export default [
  // Base config for JavaScript files
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,  // Adjusting globals to use Node.js environment for JS files
    },
    rules: {
      "no-unused-vars": "warn",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-console": "warn",
    },
    ...pluginJs.configs.recommended,
  },

  // TypeScript-specific configuration
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: globals.node,  // Adjusting globals to use Node.js environment for TS files
    },
    plugins: { "@typescript-eslint": tseslint }, // Ensure correct plugin usage
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Set as warning
      "no-unused-vars": "warn",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-console": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off", // Example: Disable explicit return types rule
    },
  },

  // Configuration for ignoring certain files and folders
  {
    ignores: ["node_modules", "dist"],  // Ignore node_modules and dist directories
  },
];
