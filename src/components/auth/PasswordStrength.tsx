import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function passwordRules(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  };
}

export function passwordScore(password: string) {
  const rules = passwordRules(password);
  return [rules.length, rules.uppercase, rules.number, password.length >= 12].filter(Boolean).length;
}

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  const rules = passwordRules(password);
  const tone = score <= 1 ? "bg-os-red" : score <= 2 ? "bg-os-amber" : "bg-os-green";

  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <span key={segment} className={cn("h-1.5 rounded-full", segment <= score ? tone : "bg-os-border")} />
        ))}
      </div>
      <div className="mt-2 grid gap-1 text-os-xs text-os-muted">
        {[
          ["At least 8 characters", rules.length],
          ["One uppercase letter", rules.uppercase],
          ["One number", rules.number]
        ].map(([label, met]) => (
          <span key={label as string} className={cn("flex items-center gap-2", met && "text-os-green")}>
            {met ? <Check className="h-3 w-3" aria-hidden="true" /> : <span className="h-3 w-3 rounded-full border border-os-border" />}
            {label as string}
          </span>
        ))}
      </div>
    </div>
  );
}
