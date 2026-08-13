import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-[28px] font-semibold tracking-tight">
          Sign in to your account
        </h1>
        <p className="mt-1.5 mb-8 text-[13.5px] text-muted-foreground">
          Enter your username and password below
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
