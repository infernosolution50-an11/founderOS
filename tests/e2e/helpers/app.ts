import { expect, type APIRequestContext, type Page, test } from "@playwright/test";
import fs from "node:fs";
import { authFile, hasE2ECredentials } from "./env";

export const demoOpportunityId = "11111111-1111-4111-8111-111111111111";
export const e2ePrefix = "E2E FounderOS";

export function useAuthenticatedPage() {
  test.skip(!hasE2ECredentials(), "Authenticated E2E requires Supabase env vars plus E2E_EMAIL/E2E_PASSWORD or defaults.");
  test.skip(!fs.existsSync(authFile), "Authenticated storage state was not created.");
  test.use({ storageState: authFile });
}

export async function createOpportunity(request: APIRequestContext, name: string) {
  const response = await request.post("/api/opportunities", {
    data: { name }
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload.opportunity as { id: string; name: string };
}

export async function deleteOpportunity(request: APIRequestContext, id: string) {
  await request.delete(`/api/opportunities/${id}`);
}

export async function cleanupE2EOpportunities(request: APIRequestContext) {
  const response = await request.get("/api/opportunities");
  if (!response.ok()) return;
  const payload = await response.json();
  const opportunities = (payload.opportunities ?? []) as Array<{ id: string; name: string; is_demo?: boolean }>;
  await Promise.all(
    opportunities
      .filter((opportunity) => !opportunity.is_demo && opportunity.name.startsWith(e2ePrefix))
      .map((opportunity) => deleteOpportunity(request, opportunity.id))
  );
}

export async function openDashboard(page: Page) {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Opportunities" })).toBeVisible();
}

