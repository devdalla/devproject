import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — styles." }] }),
  component: Account,
});

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <div>
      <SiteNav />
      <section className="mx-auto max-w-2xl px-5 pt-16">
        <div className="eyebrow">Account</div>
        <h1 className="font-display mt-2 text-4xl">Hello, {user.user_metadata?.display_name ?? user.email}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Signed in as {user.email}</p>

        <div className="mt-10 grid gap-3">
          <Link to="/orders" className="inline-flex h-11 items-center justify-between rounded-sm border border-border px-5 text-sm hover:bg-secondary">
            <span>Orders</span><span>→</span>
          </Link>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="inline-flex h-11 items-center justify-between rounded-sm border border-border px-5 text-sm hover:bg-secondary"
          >
            <span>Sign out</span><span>→</span>
          </button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
