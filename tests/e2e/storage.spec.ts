import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
test.use({ serviceWorkers: "block" });

// Patch only the isolated test worker, never the user's browser or source files.
async function fault(page: Page, script: string) {
  await page.route("**/*.js", async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({
      response,
      body: body.includes("kobo-library-writer") ? script + "\n" + body : body,
    });
  });
}
async function importLibrary(page: Page) {
  await page
    .getByRole("button", { name: "Connect Kobo", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Select Kobo source files", { exact: true })
    .setInputFiles(path.resolve("fixtures/generated/KoboReader.sqlite"));
  await page.getByRole("button", { name: "Import into my library" }).click();
  await expect(
    page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
  ).toBeVisible();
}
async function requireOpfs(page: Page) {
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  test.skip(
    await page
      .getByText("IndexedDB · SQLite WASM", { exact: true })
      .isVisible(),
    "This engine already uses the IndexedDB fallback natively",
  );
}

test("native browser storage imports and survives reload", async ({ page }) => {
  await page.goto("/");
  await importLibrary(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
  ).toBeVisible();
});

const failures = {
  "OPFS unavailable": `navigator.storage.getDirectory = async () => { throw new DOMException('Blocked', 'SecurityError'); };`,
  "file creation blocked": `const getFile = FileSystemDirectoryHandle.prototype.getFileHandle; FileSystemDirectoryHandle.prototype.getFileHandle = function(name, options) { if (options?.create) return Promise.reject(new DOMException('Read only', 'NoModificationAllowedError')); return getFile.call(this, name, options); };`,
  "createWritable unavailable": `FileSystemFileHandle.prototype.createWritable = undefined;`,
  "writer locked": `FileSystemFileHandle.prototype.createWritable = async () => { throw new DOMException('Read only', 'NoModificationAllowedError'); };`,
  "write fails": `FileSystemFileHandle.prototype.createWritable = async () => ({ write: async () => { throw new DOMException('Full', 'QuotaExceededError'); }, abort: async () => {} });`,
  "close and abort fail": `FileSystemFileHandle.prototype.createWritable = async () => ({ write: async () => {}, close: async () => { throw new DOMException('Read only', 'NoModificationAllowedError'); }, abort: async () => { throw Error('Closed'); } });`,
};
for (const [name, script] of Object.entries(failures)) {
  test(`${name}: import persists in IndexedDB after reload`, async ({
    page,
  }) => {
    await fault(page, script);
    await page.goto("/");
    await importLibrary(page);
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(
      page.getByText("IndexedDB · SQLite WASM", { exact: true }),
    ).toBeVisible();
    // Remove the fault: recovery must still use the committed fallback.
    await page.unrouteAll({ behavior: "wait" });
    await page.reload();
    await page.getByRole("button", { name: "My library", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
    ).toBeVisible();
  });
}

test("fallback from an existing OPFS library never resurrects its stale contents", async ({
  page,
}) => {
  await page.goto("/");
  await importLibrary(page);
  await requireOpfs(page);
  await fault(page, failures["writer locked"]);
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Clear library…", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear everything", exact: true })
    .click();
  await expect(
    page.getByText("IndexedDB · SQLite WASM", { exact: true }),
  ).toBeVisible();
  await page.unrouteAll({ behavior: "wait" });
  await page.reload();
  await page.getByRole("button", { name: "My library", exact: true }).click();
  await expect(page.locator(".book-card")).toHaveCount(0);
});

test("both backends failing reports recovery steps and preserves the saved library", async ({
  page,
}) => {
  await page.goto("/");
  await importLibrary(page);
  await fault(
    page,
    failures["writer locked"] +
      `
    const transaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function(names, mode, options) {
      const tx = transaction.call(this, names, mode, options);
      if (mode === 'readwrite') queueMicrotask(() => tx.abort());
      return tx;
    };`,
  );
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Clear library…", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear everything", exact: true })
    .click();
  await expect(page.locator(".banner.error")).toContainText(
    "could not save your library",
  );
  await page.unrouteAll({ behavior: "wait" });
  await page.reload();
  await page.getByRole("button", { name: "My library", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
  ).toBeVisible();
});

test("unreadable existing OPFS data is never overwritten with an empty library", async ({
  page,
}) => {
  await page.goto("/");
  await importLibrary(page);
  await requireOpfs(page);
  await fault(
    page,
    `FileSystemFileHandle.prototype.getFile = async () => { throw new DOMException('Blocked', 'NotReadableError'); };`,
  );
  await page.reload();
  await expect(page.locator(".banner.error")).toContainText(
    "could not read the saved library",
  );
  await page.unrouteAll({ behavior: "wait" });
  await page.reload();
  await page.getByRole("button", { name: "My library", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
  ).toBeVisible();
});
