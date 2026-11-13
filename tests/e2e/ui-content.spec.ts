import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import initSqlJs from "sql.js";
const base = process.env.E2E_BASE_PATH || "";

test("long reader content fits shared links and separated entries across workspace views", async ({
  page,
}) => {
  test.setTimeout(120000);
  const req = createRequire(import.meta.url);
  const SQL = await initSqlJs({
    locateFile: () => req.resolve("sql.js/dist/sql-wasm.wasm"),
  });
  const db = new SQL.Database(
    await readFile(path.resolve("fixtures/generated/KoboReader.sqlite")),
  );
  const longTitle =
    "Synthetic Reading Journal: A Detailed Guide to Noticing Everyday Life " +
    "SyntheticIdentifier".repeat(8);
  db.run("UPDATE content SET Title=? WHERE ContentID=?", [
    longTitle,
    "file:///mnt/onboard/The Quiet Atlas.epub",
  ]);
  db.run("UPDATE Bookmark SET Annotation=?", [
    "A synthetic personal note. " + "UnbrokenNote".repeat(35),
  ]);
  db.run("INSERT INTO Bookmark VALUES(?,?,?,?,?,?)", [
    "audit-second",
    "file:///mnt/onboard/The Quiet Atlas.epub",
    "A synthetic highlighted passage. ".repeat(30),
    "A second synthetic note, with its own entry.",
    0,
    "2026-10-02",
  ]);
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
  await expect(
    page.getByRole("heading", { name: longTitle, exact: true }),
  ).toBeVisible();
  await page.getByRole("heading", { name: longTitle, exact: true }).click();
  await page
    .getByLabel("Your reflection", { exact: true })
    .fill(
      "A synthetic reflection about this reading journal. " +
        "ReflectionText".repeat(25),
    );
  await page
    .getByRole("button", { name: "Save reflection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Knowledge library", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add topics", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Topics separated by commas")
    .fill("SyntheticTopic".repeat(12));
  await page.getByRole("button", { name: "Save topics", exact: true }).click();
  const headings: Record<string, string> = {
    dashboard: "Your reading.",
    library: "My library.",
    knowledge: "Knowledge library.",
    notes: "Personal notes.",
    statistics: "Reading statistics.",
    rhythm: "Reading rhythm.",
    import: "Import your library.",
    settings: "Settings.",
  };
  for (const theme of ["light", "dark"]) {
    for (const route of [
      "dashboard",
      "library",
      "knowledge",
      "notes",
      "statistics",
      "rhythm",
      "import",
      "settings",
    ]) {
      await page.goto(base + "/#" + route);
      await expect(page.getByText("Opening your local library…")).toBeHidden();
      await expect(
        page.getByRole("heading", { name: headings[route], exact: true }),
      ).toBeVisible();
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const width of [1920, 1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            ),
        );
        const overflow = await page
          .locator(".text-link, .annotation, .note-card")
          .evaluateAll((elements) =>
            elements
              .filter((el) => {
                if (!(el instanceof HTMLElement) || !el.getClientRects().length)
                  return false;
                return el.scrollWidth > el.clientWidth + 1;
              })
              .map((el) => ({
                className: el.className,
                text: el.textContent?.slice(0, 60),
              })),
          );
        expect(overflow, `${route}, ${theme}, ${width}px`).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${route}, ${theme}, ${width}px`,
        ).toBe(true);
        if ((route === "knowledge" || route === "notes") && width === 1440) {
          const entries = page.locator(
            route === "notes" ? ".note-card" : ".knowledge-grid .annotation",
          );
          expect(await entries.count()).toBeGreaterThan(0);
          expect(
            await entries.evaluateAll((elements) =>
              elements.every(
                (el) =>
                  getComputedStyle(el).borderTopStyle === "solid" &&
                  getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)",
              ),
            ),
          ).toBe(true);
          await page.screenshot({
            path: `test-results/audit-${route}-${theme}.png`,
            fullPage: true,
          });
        }
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/#notes");
  await expect(page.getByText("Opening your local library…")).toBeHidden();
  await page.locator(".note-book-link").first().click();
  await expect(
    page.getByRole("heading", { name: longTitle, exact: true }),
  ).toBeVisible();
  const entry = page.locator(".annotation-list .annotation").first();
  expect(await entry.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    for (const width of [1920, 1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      expect(
        await page
          .locator(".annotation-list .text-link, .annotation-list .annotation")
          .evaluateAll((elements) =>
            elements.every((el) => el.scrollWidth <= el.clientWidth + 1),
          ),
        `book detail, ${theme}, ${width}px`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/#notes");
  await page.getByRole("button", { name: /My reflections/ }).click();
  await expect(page.locator(".note-card")).toHaveCount(1);
  expect(
    await page
      .locator(".note-card")
      .evaluate(
        (el) =>
          el.scrollWidth <= el.clientWidth &&
          getComputedStyle(el).borderTopStyle === "solid",
      ),
  ).toBe(true);
});
