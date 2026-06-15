import fs from "node:fs";
import path from "node:path";

export const authFile = path.join(__dirname, "..", ".auth", "user.json");

export function loadE2EEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([^#=\s]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  }

  return {
    email: process.env.E2E_EMAIL || "founderos.e2e+local@gmail.com",
    password: process.env.E2E_PASSWORD || "FounderOS123!",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

export function hasE2ECredentials() {
  const env = loadE2EEnv();
  return Boolean(env.email && env.password && env.supabaseUrl && env.serviceRoleKey);
}

export function ensureEmptyAuthState() {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  if (!fs.existsSync(authFile)) {
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }, null, 2));
  }
}

