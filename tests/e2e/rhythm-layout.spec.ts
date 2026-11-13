import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import initSqlJs from "sql.js";
const base = process.env.E2E_BASE_PATH || "";

test("long session book titles wrap inside the selected-day panel and still open the book", async ({
  page,
}) => {
  const req = createRequire(import.meta.url);
  const SQL = await initSqlJs({
    locateFile: () => req.resolve("sql.js/dist/sql-wasm.wasm"),
  });
  const db = new SQL.Database(
    await readFile(path.resolve("fixtures/generated/kobalt.sqlite")),
  );
  const title =
    "A Synthetic Guide to Noticing Small Details in Everyday Life and Keeping a Reading Journal " +
    "SyntheticIdentifier".repeat(8);
  db.run("UPDATE books SET title=?", [title]);
  db.run("UPDATE reading_sessions SET title=?", [title]);
  await page.goto(base + "/#import");
  await expect(page.getByText("Opening your local library…")).toBeHidden();
  await page
    .getByLabel("Select Kobo source files", { exact: true })
    .setInputFiles({
      name: "kobalt.sqlite",
      mimeType: "application/octet-stream",
      buffer: Buffer.from(db.export()),
    });
  db.close();
  await page.getByRole("button", { name: "Import into my library" }).click();
  await page
    .getByRole("button", { name: "Reading rhythm", exact: true })
    .click();
  await page.getByLabel("Reading month").selectOption("2026-09");
  await page
    .getByRole("button", { name: /2026-09-21 ·/ })
    .first()
    .click();
  const panel = page.getByRole("region", { name: "Selected day reading" });
  const link = panel.getByRole("button", { name: title, exact: true });
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(link).toBeVisible();
    const bounds = await panel.boundingBox();
    const content = await link.boundingBox();
    expect(content!.x).toBeGreaterThanOrEqual(bounds!.x);
    expect(content!.x + content!.width).toBeLessThanOrEqual(
      bounds!.x + bounds!.width,
    );
    expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 1440 || width === 390)
      await panel.screenshot({
        path: `test-results/rhythm-long-title-${width}.png`,
      });
  }
  await link.click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
});
