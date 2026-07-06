import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".astro/",
      ".github/",
      "public/",
      "skills-lock.json",
    ],
  },

  // Base JS recommended configuration
  js.configs.recommended,

  // TypeScript recommended configuration
  ...tseslint.configs.recommended,

  // Astro configuration
  ...eslintPluginAstro.configs["flat/recommended"],

  // React configuration (only for standard JS/TS/JSX/TSX files)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...eslintPluginReact.configs.flat.recommended,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...eslintPluginReact.configs.flat["jsx-runtime"],
  },

  // React Hooks configuration (only for JS/TS/JSX/TSX files)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": eslintPluginReactHooks,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },

  // Specific overrides for Astro files parsing TypeScript
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".astro"],
      },
    },
  },

  // Global settings & rules customization
  {
    settings: {
      react: {
        version: "19.2",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
);
