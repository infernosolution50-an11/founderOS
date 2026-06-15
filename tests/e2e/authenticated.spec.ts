import { expect, test } from "@playwright/test";
import { cleanupE2EOpportunities, createOpportunity, deleteOpportunity, demoOpportunityId, e2ePrefix, openDashboard, useAuthenticatedPage } from "./helpers/app";

useAuthenticatedPage();

test.beforeEach(async ({ request }) => {
  await cleanupE2EOpportunities(request);
});

test.afterEach(async ({ request }) => {
  await cleanupE2EOpportunities(request);
});

test("dashboard shows shared demos and supports search", async ({ page }) => {
  await openDashboard(page);

  await expect(page.getByText("AI procurement copilot for mid-market finance teams")).toBeVisible();
  await expect(page.getByText("Demo").first()).toBeVisible();

  await page.getByLabel("Search opportunities").fill("Broad AI productivity");
  await expect(page.getByText("Broad AI productivity assistant for everyone")).toBeVisible();
  await expect(page.getByText("AI procurement copilot for mid-market finance teams")).toBeHidden();
});

test("shared demo is read-only and API mutations are forbidden", async ({ page, request }) => {
  await page.goto(`/opportunity/${demoOpportunityId}`);

  await expect(page.getByText("Shared demo").first()).toBeVisible();
  await expect(page.getByText("Read-only").first()).toBeVisible();
  await expect(page.getByLabel("Opportunity name")).toBeDisabled();
  await expect(page.getByRole("button", { name: /copy to my workspace/i }).first()).toBeVisible();

  const patch = await request.patch(`/api/opportunities/${demoOpportunityId}`, {
    data: { name: `${e2ePrefix} forbidden patch` }
  });
  expect(patch.status()).toBe(403);

  const deleted = await request.delete(`/api/opportunities/${demoOpportunityId}`);
  expect(deleted.status()).toBe(403);
});

test("shared demo can be copied to a private editable workspace", async ({ page, request }) => {
  await page.goto(`/opportunity/${demoOpportunityId}`);
  await page.getByRole("button", { name: /copy to my workspace/i }).first().click();
  await page.waitForURL(/\/opportunity\/(?!11111111-1111-4111-8111-111111111111)/);

  const copiedId = page.url().split("/opportunity/")[1]?.split(/[?#]/)[0];
  expect(copiedId).toBeTruthy();
  await expect(page.getByText("Read-only")).toBeHidden();
  await expect(page.getByLabel("Opportunity name")).toBeEnabled();
  await expect(page.getByLabel("Opportunity name")).toHaveValue(/AI procurement copilot.*Copy/);

  if (copiedId) await deleteOpportunity(request, copiedId);
});

test("private opportunity can be created, edited, reloaded, and deleted", async ({ page, request }) => {
  await openDashboard(page);
  await page.getByRole("button", { name: /^create opportunity$/i }).click();
  await page.waitForURL(/\/opportunity\//);

  const opportunityId = page.url().split("/opportunity/")[1]?.split(/[?#]/)[0];
  expect(opportunityId).toBeTruthy();

  const updatedName = `${e2ePrefix} autosave ${Date.now()}`;
  const saved = page.waitForResponse((response) => response.url().includes(`/api/opportunities/${opportunityId}`) && response.request().method() === "PATCH" && response.ok());
  await page.getByLabel("Opportunity name").fill(updatedName);
  await saved;

  await page.reload();
  await expect(page.getByLabel("Opportunity name")).toHaveValue(updatedName);

  if (opportunityId) await deleteOpportunity(request, opportunityId);
});

test("private opportunity task workflow works", async ({ page, request }) => {
  const opportunity = await createOpportunity(request, `${e2ePrefix} tasks ${Date.now()}`);
  await page.goto(`/opportunity/${opportunity.id}`);
  await page.getByRole("tab", { name: "Execute" }).click();

  const taskText = `${e2ePrefix} validate task`;
  await page.getByPlaceholder("Add task").fill(taskText);
  await page.locator('input[type="date"]').fill("2026-06-30");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText(taskText)).toBeVisible();
  await expect(page.getByText("6/30/2026")).toBeVisible();

  await page.getByRole("button", { name: /mark task done/i }).click();

  page.once("dialog", (dialog) => dialog.accept());
  const removed = page.waitForResponse((response) => response.url().includes("/api/tasks/") && response.request().method() === "DELETE" && response.ok());
  await page.getByText(taskText).locator("xpath=ancestor::div[contains(@class, 'relative')][1]").getByRole("button", { name: "Delete" }).click();
  await removed;
  await expect(page.getByText(taskText)).toBeHidden();

  await deleteOpportunity(request, opportunity.id);
});

