import { test, expect } from "@playwright/test";
const nav = (page, text) =>
  page.locator(".sidebar .nav-link").filter({ hasText: text });
const readSave = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("emberfall-save-v1")));
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-01T09:00:00Z") });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your stronghold awaits." }),
  ).toBeVisible();
});
test("the first-day loop: collect, train, summon, upgrade, dispatch, return, chapter, daily rewards, reload", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.getByRole("button", { name: /Collect resources/ }).click();
  expect((await readSave(page)).resources.gold).toBe(2630);
  await page
    .getByRole("button", { name: "Claim daily reward", exact: true })
    .click();
  expect((await readSave(page)).login.count).toBe(1);
  await nav(page, "Heroes").click();
  await page
    .locator(".hero-card")
    .filter({ hasText: "Lyra Windwhisper" })
    .click();
  await page.getByRole("button", { name: /Train to level 2/ }).click();
  await expect(page.getByText("LEVEL 2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await nav(page, "Summoning").click();
  await page.getByRole("button", { name: "Your daily free summon" }).click();
  await expect(
    page.getByRole("heading", { name: "Someone answered your call." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Let the story continue" }).click();
  await expect(
    page.getByRole("button", { name: "Free summon claimed" }),
  ).toBeDisabled();
  await nav(page, "Stronghold").click();
  await page.locator(".building-card").filter({ hasText: "The Keep" }).click();
  await page.getByRole("button", { name: "Begin upgrade" }).click();
  expect((await readSave(page)).buildings.keep.upgrade).not.toBeNull();
  await nav(page, "Missions").click();
  await page
    .getByRole("button", { name: "Prepare A road worth taking" })
    .click();
  await page.getByRole("button", { name: "Suggest party" }).click();
  await expect(page.locator(".party-hero.selected")).toHaveCount(2);
  await page.getByRole("button", { name: /Begin expedition/ }).click();
  await expect(page.getByRole("button", { name: "View party" })).toBeVisible();
  await page
    .getByRole("button", { name: "Available", exact: false })
    .filter({ hasText: "Available" })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Prepare Whispers of the Wildwood" })
    .click();
  await page.getByRole("button", { name: "Suggest party" }).click();
  await page.getByRole("button", { name: /Begin expedition/ }).click();
  expect((await readSave(page)).missions).toHaveLength(2);
  await page.clock.fastForward(301000);
  await page.getByRole("button", { name: "Claim rewards" }).click();
  await expect(
    page.getByRole("heading", { name: "A triumphant return!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Welcome home", exact: true }).click();
  await nav(page, "Chronicle").click();
  await page.getByRole("button", { name: "Complete chapter" }).click();
  expect((await readSave(page)).chapter).toBe(1);
  await nav(page, "Daily rewards").click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Claim", exact: true })
      .first()
      .click();
  await page.getByRole("button", { name: "Open daily chest" }).click();
  await expect(
    page.getByRole("button", { name: "Chest claimed" }),
  ).toBeDisabled();
  const before = await readSave(page);
  await page.reload();
  expect((await readSave(page)).resources).toEqual(before.resources);
  expect((await readSave(page)).chapter).toBe(1);
  await page.clock.fastForward(2 * 60 * 60 * 1000);
  await page.getByRole("button", { name: /Collect resources/ }).click();
  expect((await readSave(page)).buildings.keep.level).toBe(2);
  expect(errors).toEqual([]);
});
test("hero filtering, collection, empty states, and keyboard modal focus", async ({
  page,
}) => {
  await nav(page, "Heroes").click();
  await page.getByRole("textbox", { name: "Search heroes" }).fill("lyra");
  await expect(page.locator(".hero-card")).toHaveCount(1);
  await page.locator(".hero-card").focus();
  await page.clock.fastForward(3000);
  await expect(page.locator(".hero-card")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".hero-card")).toBeFocused();
  await page.getByRole("textbox", { name: "Search heroes" }).fill("not a hero");
  await expect(
    page.getByRole("heading", { name: "No heroes found" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search heroes" }).fill("");
  await page.getByRole("button", { name: /Hero collection/ }).click();
  await expect(page.locator(".hero-card")).toHaveCount(24);
  await page.getByLabel("Filter by rarity").selectOption("Legendary");
  await expect(page.locator(".hero-card")).toHaveCount(4);
});
test("save export, guarded import and reset, persistent name, and invalid-file recovery", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Settings & save" }).click();
  await page.getByLabel("STRONGHOLD NAME").fill("Starlit Haven");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export save" }).click();
  expect((await dl).suggestedFilename()).toMatch(/^emberfall-.*\.json$/);
  const state = await readSave(page);
  await page.locator("input[type=file]").setInputFiles({
    name: "save.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ ...state, name: "Imported Realm" })),
  });
  await expect(
    page.getByRole("heading", { name: "Continue a different adventure?" }),
  ).toBeVisible();
  expect((await readSave(page)).name).toBe("Starlit Haven");
  await page.getByRole("button", { name: "Import this adventure" }).click();
  expect((await readSave(page)).name).toBe("Imported Realm");
  await page.getByRole("button", { name: "Settings & save" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.getByRole("alert")).toContainText("not a valid");
  expect((await readSave(page)).name).toBe("Imported Realm");
  await page.getByRole("button", { name: "Begin a new story…" }).click();
  await expect(
    page.getByRole("button", { name: "Begin a new story", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("TYPE EMBERFALL TO START OVER").fill("EMBERFALL");
  await page
    .getByRole("button", { name: "Begin a new story", exact: true })
    .click();
  expect((await readSave(page)).name).toBe("Emberfall");
});
test("mobile navigation and every screen fit a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of [
    "Overview",
    "Stronghold",
    "Heroes",
    "Missions",
    "Summoning",
    "Daily rewards",
    "Chronicle",
    "Field guide",
  ]) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await nav(page, name).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await nav(page, "Missions").click();
  await page
    .getByRole("button", { name: "Prepare A road worth taking" })
    .click();
  await page.getByRole("button", { name: "Suggest party" }).click();
  await expect(
    page.getByRole("button", { name: /Begin expedition/ }),
  ).toBeEnabled();
  expect(
    await page
      .locator(".modal")
      .evaluate((e) => e.scrollWidth <= e.clientWidth),
  ).toBe(true);
});

test("saved actions synchronize between open tabs without a stale autosave restoring spent resources", async ({
  page,
  context,
}) => {
  const second = await context.newPage();
  await second.clock.install({ time: new Date("2026-09-01T09:00:00Z") });
  await second.goto("/");
  await page
    .getByRole("button", { name: "Claim daily reward", exact: true })
    .click();
  await expect(
    second.getByRole("button", { name: "View daily rewards", exact: true }),
  ).toBeVisible();
  await nav(second, "Summoning").click();
  await second
    .getByRole("button", { name: "Summon one", exact: false })
    .click();
  await expect(page.locator(".resource-pill.aether strong")).toHaveText("120");
  await page.clock.fastForward(11000);
  expect((await readSave(page)).resources.aether).toBe(120);
  expect((await readSave(page)).login.count).toBe(1);
  await second.close();
});
