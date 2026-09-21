import { test, expect } from "@playwright/test";
test("the production build works under a Pages subdirectory and reopens entirely offline", async ({
  page,
  context,
}) => {
  const errors = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (req) => {
    if (!req.url().startsWith("http://127.0.0.1:4174/"))
      external.push(req.url());
  });
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Your stronghold awaits." }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await new Promise((resolve) => {
      if (navigator.serviceWorker.controller) resolve();
      else
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        });
    });
  });
  await page.getByRole("button", { name: /Collect resources/ }).click();
  const resources = await page.evaluate(
    () => JSON.parse(localStorage.getItem("emberfall-save-v1")).resources,
  );
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your stronghold awaits." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("emberfall-save-v1")).resources,
    ),
  ).toEqual(resources);
  await page
    .locator(".sidebar .nav-link")
    .filter({ hasText: "Heroes" })
    .click();
  await expect(page.locator(".hero-card")).toHaveCount(6);
  await page.locator(".hero-card").first().click();
  await page.getByRole("button", { name: /Train to level 2/ }).click();
  await expect(page.getByText("LEVEL 2", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
