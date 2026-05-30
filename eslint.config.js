// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/**", "android/**", "ios/**", "node_modules/**", ".expo/**"],
  },
  {
    files: ["i18n/**/*.ts"],
    rules: {
      // i18next singleton: default export instance exposes .use/.init/.t
      "import/no-named-as-default-member": "off",
    },
  },
])
