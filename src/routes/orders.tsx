import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders — styles." }] }),
  component: Orders,
});

function Orders() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/orders" } });
  }, [user, loading, navigate]);

  const { data } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, created_at, status, payment_status, total_cents, order_items(product_name, size, quantity, unit_price_cents)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return orders;
    },
  });

  return (
    <div>
      <SiteNav />
      <section className="mx-auto max-w-4xl px-5 pt-12">
        <div className="eyebrow">Account</div>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Your orders</h1>

        {data && data.length === 0 && (
          <div className="mt-12 text-center text-muted-foreground">
            <p>No orders yet.</p>
            <Link to="/shop" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm text-primary-foreground">
              Start shopping
            </Link>
          </div>
        )}

        <ul className="mt-10 space-y-6">
          {data?.map((o: any) => (
            <li key={o.id} className="border border-border p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <div className="eyebrow">Order · {o.id.slice(0, 8)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-full border border-border px-3 py-1 capitalize">{o.status}</span>
                  <span className="rounded-full border border-border px-3 py-1 capitalize">{o.payment_status}</span>
                  <span className="tabular-nums">{formatPrice(o.total_cents)}</span>
                </div>
              </div>
              <ul className="mt-4 divide-y divide-border border-t border-border">
                {o.order_items?.map((it: any, idx: number) => (
                  <li key={idx} className="flex justify-between py-3 text-sm">
                    <span>{it.product_name} <span className="text-muted-foreground">· {it.size} × {it.quantity}</span></span>
                    <span className="tabular-nums">{formatPrice(it.unit_price_cents * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </div>
  );
}
