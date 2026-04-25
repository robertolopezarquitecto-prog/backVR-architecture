import js from "@eslint/js";
import { reactRefresh } from "eslint-plugin-react-refresh";
import sonarjs from "eslint-plugin-sonarjs";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["dist", ".next/**", "out/**", "build/**", "coverage/**", "node_modules/**"]),
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, sonarjs.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-refresh": reactRefresh.plugin,
    },
    rules: {
      "react-refresh/only-export-components": ["off", { allowConstantExport: true }],
    },
  },
);
