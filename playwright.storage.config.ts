import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig(base, {
  testMatch: "storage.spec.ts",
  use: { channel: undefined, serviceWorkers: "block" },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
