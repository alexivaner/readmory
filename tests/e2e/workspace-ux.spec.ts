import { test, expect } from "@playwright/test";
import path from "node:path";
const base = process.env.E2E_BASE_PATH || "";

test("first visit prioritizes import and offers backup recovery", async ({
  page,
}) => {
  await page.goto(base + "/");
  await expect(page.getByText("Opening your local library…")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Welcome to Readmory." }),
  ).toBeVisible();
  await expect(page.locator(".getting-started .primary")).toBeInViewport();
  await expect(
    page.getByRole("region", { name: "Reading statistics", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Have a Readmory backup? Restore it" })
    .click();
  await expect(
    page.getByLabel("Restore library backup", { exact: true }),
  ).toBeAttached();
  await expect(
    page.getByRole("button", { name: "Download backup" }),
  ).toBeVisible();
});

test("mobile navigation traps focus, dismisses with Escape and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(base + "/");
  await expect(page.getByText("Opening your local library…")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const sidebar = page.locator(".sidebar");
  await expect(sidebar).toHaveAttribute("inert", "");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Workspace navigation" });
  const close = dialog.getByRole("button", { name: "Close menu" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Toggle color theme" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sidebar).toHaveAttribute("inert", "");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "My library", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "My library." }),
  ).toBeVisible();
  await expect(sidebar).toHaveAttribute("inert", "");
  await trigger.click();
  await page
    .getByRole("button", { name: "Dismiss navigation" })
    .click({ position: { x: 300, y: 400 } });
  await expect(trigger).toBeFocused();
});

test("filters recover from an empty result without changing stored books", async ({
  page,
}) => {
  await page.goto(base + "/#import");
  await expect(page.getByText("Opening your local library…")).toBeHidden();
  await page
    .getByLabel("Select Kobo source files", { exact: true })
    .setInputFiles(path.resolve("fixtures/generated/KoboReader.sqlite"));
  await page.getByRole("button", { name: "Import into my library" }).click();
  await expect(
    page.getByRole("heading", { name: "The Quiet Atlas", exact: true }),
  ).toBeVisible();
  const count = await page.locator(".book-card").count();
  await page.getByLabel("Search books").fill("no matching title");
  await page.getByLabel("Reading status").selectOption("finished");
  await expect(
    page.getByRole("heading", { name: "No books match your search" }),
  ).toBeVisible();
  await page
    .locator(".empty")
    .getByRole("button", { name: "Reset filters" })
    .click();
  await expect(page.getByLabel("Search books")).toHaveValue("");
  await expect(page.getByLabel("Reading status")).toHaveValue("all");
  await expect(page.locator(".book-card")).toHaveCount(count);
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.locator(".getting-started")).toHaveCount(0);
  await expect(page.locator(".hero-banner")).toHaveCount(0);
  await expect(page.locator(".dashboard-books")).toBeInViewport();
  await page.reload();
  await page.getByRole("button", { name: "My library", exact: true }).click();
  await expect(page.locator(".book-card")).toHaveCount(count);
});
