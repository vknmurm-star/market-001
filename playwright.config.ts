import { defineConfig } from "@playwright/test";

/**
 * Конфиг для e2e-теста полного пути покупателя на живом проде
 * (https://beauty.an51.su). Тестовый заказ реально создаётся в БД —
 * см. tests/e2e-order-flow.spec.ts. Прогон намеренно последовательный
 * (workers: 1), чтобы desktop- и mobile-прогоны не создавали заказы
 * параллельно на общем сервере.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  outputDir: "./test-results/artifacts",
  globalTeardown: "./tests/global-teardown.ts",
  use: {
    baseURL: "https://beauty.an51.su",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: "mobile",
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
});
