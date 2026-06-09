import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/lib/auth";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Sign in — styles." }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { redirect } = Route.useSearch();
  const target = (redirect as any) ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: target, replace: true });
  }, [user, navigate, target]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div>
      <SiteNav />
      <section className="mx-auto max-w-md px-5 pt-16">
        <div className="eyebrow">Account</div>
        <h1 className="font-display mt-2 text-4xl">Sign in</h1>

        <button
          onClick={google}
          className="mt-8 inline-flex h-11 w-full items-center justify-center gap-3 rounded-sm border border-border text-sm hover:bg-secondary"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Password" type="password" value={password} onChange={setPassword} required />
          <button
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary text-sm text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here? <Link to="/signup" search={{ redirect }} className="text-foreground underline-offset-4 hover:underline">Create an account</Link>
        </p>
      </section>
    </div>
  );
}

function Input({ label, type, value, onChange, required }: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow mb-2 block">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.2 0 9.7-2 13.2-5.2l-6.1-5c-2 1.4-4.4 2.2-7.1 2.2-5.3 0-9.7-3.1-11.3-7.4l-6.6 5.1C9.6 39.1 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.4l6.1 5C40.1 35.6 43.5 30.3 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
    </svg>
  );
}
