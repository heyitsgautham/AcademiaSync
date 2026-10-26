import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Shared API shapes live in types/api.ts; reach for those instead of any
      "@typescript-eslint/no-explicit-any": "error",
      // New in eslint-plugin-react-hooks 7. Twenty existing effects copy fetched data or URL
      // parameters into form state; they work, but new code should derive state instead.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
])
