import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import initSqlJs from "sql.js";
const base = process.env.E2E_BASE_PATH || "";

test("long highlights expand independently while favorite and topic actions remain available", async ({
  page,
}) => {
  const req = createRequire(import.meta.url);
  const SQL = await initSqlJs({
    locateFile: () => req.resolve("sql.js/dist/sql-wasm.wasm"),
  });
  const db = new SQL.Database(
    await readFile(path.resolve("fixtures/generated/KoboReader.sqlite")),
  );
  const passage =
    "A synthetic passage about noticing small details in a familiar place. ".repeat(
      16,
    );
  for (let i = 0; i < 2; i++) {
    db.run("INSERT INTO Bookmark VALUES(?,?,?,?,?,?)", [
      `reading-preview-${i}`,
      "file:///mnt/onboard/The Quiet Atlas.epub",
      passage,
      "",
      0,
      "2026-10-02",
    ]);
  }
  await page.goto(base + "/#import");
  await expect(page.getByText("Opening your local library…")).toBeHidden();
  await page
    .getByLabel("Select Kobo source files", { exact: true })
    .setInputFiles({
      name: "KoboReader.sqlite",
      mimeType: "application/octet-stream",
      buffer: Buffer.from(db.export()),
    });
  db.close();
  await page.getByRole("button", { name: "Import into my library" }).click();
  await page
    .getByRole("heading", { name: "The Quiet Atlas", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Knowledge library", exact: true })
    .click();
  const entries = page
    .locator(".knowledge-grid .annotation")
    .filter({ has: page.locator(".passage-full") });
  const first = entries.first();
  const second = entries.nth(1);
  await expect(first.locator(".passage-full blockquote")).toBeHidden();
  const disclosure = first
    .locator("summary")
    .filter({ hasText: "Read full highlight" });
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(first.locator(".passage-full blockquote")).toHaveText(
    passage.trim(),
  );
  await expect(first.locator(".passage-full blockquote")).toBeVisible();
  await expect(second.locator(".passage-full blockquote")).toBeHidden();
  await first
    .getByRole("button", { name: "Save to favorites", exact: true })
    .click();
  await expect(
    first.getByRole("button", { name: "Remove from favorites", exact: true }),
  ).toBeVisible();
  await first.getByRole("button", { name: "Add topics", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Edit topics" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await first.locator("summary").click();
  await expect(first.locator(".passage-full blockquote")).toBeHidden();
});
