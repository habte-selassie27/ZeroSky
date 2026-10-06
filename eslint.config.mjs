import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist", "build", "coverage"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // Route loaders and context hooks are exported alongside their components on purpose.
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowCompoundComponents: true,
          allowExportNames: ["policiesLoader", "policyLoader", "useWallet", "useTransactions"],
        },
      ],
    },
  },
]);
