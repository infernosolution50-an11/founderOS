import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  return (
    <AuthShell
      title={isLogin ? "Welcome back" : "Create your account"}
      subtitle={isLogin ? "Log in to keep sharpening your opportunities with Ember." : "Start your founder intelligence workspace."}
    >
      {isLogin ? <LoginForm /> : <SignupForm />}
    </AuthShell>
  );
}
