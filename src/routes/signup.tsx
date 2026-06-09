import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/lib/auth";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/signup")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Create account — styles." }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { redirect } = Route.useSearch();
  const target = (redirect as any) ?? "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: target, replace: true });
  }, [user, navigate, target]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account");
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
        <h1 className="font-display mt-2 text-4xl">Create account</h1>

        <button
          onClick={google}
          className="mt-8 inline-flex h-11 w-full items-center justify-center gap-3 rounded-sm border border-border text-sm hover:bg-secondary"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Name" value={name} onChange={setName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          <button
            disabled={busy}
            className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary text-sm text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" search={{ redirect }} className="text-foreground underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </section>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
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
