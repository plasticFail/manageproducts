import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: { react },
    languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } }, sourceType: "module" },
    settings: { react: { version: "18.3" } },
    rules: { "react/jsx-uses-vars": "error", "react/jsx-uses-react": "off", "no-unused-vars": ["warn", { args: "none" }], "no-empty": "off" },
  },
];
