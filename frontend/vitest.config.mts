import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      // The logic layer: route handlers, auth and API helpers, hooks, and the components with tests
      include: [
        "app/api/**/route.ts",
        "lib/**",
        "hooks/**",
        "proxy.ts",
        "components/admin-students-table.tsx",
        "components/admin-teachers-table.tsx",
        "components/admin-student-modal.tsx",
        "components/teacher-assignments-by-course.tsx",
        "components/wrapped-axis-tick.tsx",
        "components/record-error.tsx",
      ],
      exclude: ["app/api/auth/**"],
      // CI fails below these; raise them as coverage grows
      thresholds: { lines: 85, statements: 85, functions: 75, branches: 75 },
    },
  },
})
