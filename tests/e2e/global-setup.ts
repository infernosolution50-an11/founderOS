import { chromium, type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { authFile, ensureEmptyAuthState, loadE2EEnv } from "./helpers/env";

export default async function globalSetup(config: FullConfig) {
  const env = loadE2EEnv();
  ensureEmptyAuthState();

  if (!env.supabaseUrl || !env.serviceRoleKey || !env.email || !env.password) {
    console.warn("Skipping authenticated E2E setup because E2E/Supabase env vars are missing.");
    return;
  }

  const supabase = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;

  const existing = users.data.users.find((user) => user.email?.toLowerCase() === env.email.toLowerCase());
  if (existing) {
    const updated = await supabase.auth.admin.updateUserById(existing.id, {
      password: env.password,
      email_confirm: true,
      user_metadata: { full_name: "FounderOS E2E" }
    });
    if (updated.error) throw updated.error;
  } else {
    const created = await supabase.auth.admin.createUser({
      email: env.email,
      password: env.password,
      email_confirm: true,
      user_metadata: { full_name: "FounderOS E2E" }
    });
    if (created.error) throw created.error;
  }

  const baseURL = config.projects[0]?.use?.baseURL || "http://127.0.0.1:3000";
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto("/login");
  await page.getByLabel("Email").fill(env.email);
  await page.getByLabel("Password").fill(env.password);
  await page.getByRole("button", { name: /^log in$/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await page.context().storageState({ path: authFile });
  await browser.close();
}

