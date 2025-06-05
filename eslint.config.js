import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";


export default defineConfig([
    globalIgnores(["**/build/", "**/lib/", "**/.tap/", "**/.vscode/", "**/node_modules/"]),
    // {
    //     extends: compat.extends("eslint:recommended", "google"),
    //     rules: {},
    // },
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
]);