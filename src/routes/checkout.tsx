import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — styles." }] }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotalCents, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postal: "",
    country: "United States",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      toast.message("Sign in to complete your order");
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    }
  }, [loading, user, navigate]);

  if (items.length === 0) {
    return (
      <div>
        <SiteNav />
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm text-primary-foreground">
            Shop the collection
          </Link>
        </div>
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_cents: subtotalCents,
          status: "pending",
          payment_status: "unpaid",
          notes: form.notes || null,
          shipping_address: {
            full_name: form.full_name,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            region: form.region,
            postal: form.postal,
            country: form.country,
            phone: form.phone,
          },
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.productId,
          product_name: i.name,
          size: i.size,
          quantity: i.quantity,
          unit_price_cents: i.unitPriceCents,
        })),
      );
      if (itemsError) throw itemsError;

      clear();
      toast.success("Order placed");
      navigate({ to: "/orders" });
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SiteNav />
      <section className="mx-auto max-w-5xl px-5 pt-12">
        <div className="eyebrow">Checkout</div>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Shipping & order</h1>

        <form onSubmit={placeOrder} className="mt-10 grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2 space-y-5">
            <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
            <Field label="Address" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} required />
            <Field label="Apartment, suite (optional)" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} />
            <div className="grid grid-cols-2 gap-5">
              <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
              <Field label="State / Region" value={form.region} onChange={(v) => setForm({ ...form, region: v })} required />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Postal code" value={form.postal} onChange={(v) => setForm({ ...form, postal: v })} required />
              <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
            </div>
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            <div>
              <label className="eyebrow mb-2 block">Order notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full rounded-sm border border-border bg-background p-3 text-sm"
              />
            </div>
          </div>

          <aside className="md:col-span-1">
            <div className="border border-border p-6">
              <h2 className="font-display text-xl">Order</h2>
              <ul className="mt-4 divide-y divide-border">
                {items.map((i) => (
                  <li key={`${i.productId}-${i.size}`} className="flex justify-between py-3 text-sm">
                    <span>{i.name} <span className="text-muted-foreground">· {i.size} × {i.quantity}</span></span>
                    <span className="tabular-nums">{formatPrice(i.unitPriceCents * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary text-sm text-primary-foreground disabled:opacity-60"
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                We'll confirm by email. Payment captured separately for now.
              </p>
            </div>
          </aside>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="eyebrow mb-2 block">{label}{required && " *"}</label>
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
