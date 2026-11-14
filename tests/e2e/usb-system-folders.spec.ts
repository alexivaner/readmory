import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
const base = process.env.E2E_BASE_PATH || "";

test("read-only Kobo folder scan skips protected macOS/Windows directories", async ({
  page,
}) => {
  const bytes = [
    ...(await readFile(path.resolve("fixtures/generated/KoboReader.sqlite"))),
  ];
  await page.addInitScript((bytes) => {
    const directory = (name: string, children: unknown[]) => ({
      kind: "directory",
      name,
      async *values() {
        yield* children;
      },
    });
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async (options: { mode: string }) => {
        if (options.mode !== "read")
          throw Error("Reader access must be read-only");
        return directory("KOBOeReader", [
          ...[
            ".TemporaryItems",
            "System Volume Information",
            "$RECYCLE.BIN",
          ].map((name) => ({
            kind: "directory",
            name,
            values() {
              throw new DOMException(
                "An attempt was made to write to a file or directory which could not be modified due to the state of the underlying filesystem.",
                "NoModificationAllowedError",
              );
            },
          })),
          directory(".kobo", [
            {
              kind: "file",
              name: "KoboReader.sqlite",
              getFile: async () =>
                new File([new Uint8Array(bytes)], "KoboReader.sqlite"),
            },
          ]),
        ]);
      },
    });
  }, bytes);
  await page.goto(base + "/#import");
  await page
    .getByRole("button", { name: "My Kobo is connected", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Select Kobo folder", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Import preview" }),
  ).toBeVisible();
  await expect(page.locator(".banner.error")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Import into my library", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
  ).toBeVisible();
});
