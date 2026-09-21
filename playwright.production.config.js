import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";
export default defineConfig({
  ...base,
  testDir: "./tests/production",
  use: { ...base.use, baseURL: "http://127.0.0.1:4174/HeroMissions/" },
  webServer: {
    command: "node scripts/serve-pages.mjs",
    url: "http://127.0.0.1:4174/HeroMissions/",
    reuseExistingServer: !process.env.CI,
  },
});
