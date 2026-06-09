import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — styles." }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotalCents } = useCart();

  return (
    <div>
      <SiteNav />
      <section className="mx-auto max-w-5xl px-5 pt-12">
        <div className="eyebrow">Bag</div>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm text-primary-foreground">
              Shop the collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 md:grid-cols-3">
            <ul className="md:col-span-2 divide-y divide-border border-y border-border">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex gap-5 py-6">
                  {i.imageUrl && (
                    <img src={i.imageUrl} alt={i.name} className="h-28 w-24 flex-none object-cover" />
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg leading-tight">{i.name}</h3>
                        <div className="eyebrow mt-1">Size {i.size}</div>
                      </div>
                      <button onClick={() => remove(i.productId, i.size)} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="inline-flex items-center border border-border">
                        <button className="h-9 w-9" onClick={() => setQty(i.productId, i.size, i.quantity - 1)} aria-label="Decrease">
                          <Minus className="mx-auto h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm tabular-nums">{i.quantity}</span>
                        <button className="h-9 w-9" onClick={() => setQty(i.productId, i.size, i.quantity + 1)} aria-label="Increase">
                          <Plus className="mx-auto h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-sm tabular-nums">{formatPrice(i.unitPriceCents * i.quantity)}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="md:col-span-1">
              <div className="border border-border p-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <Link to="/checkout" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary text-sm text-primary-foreground">
                  Checkout
                </Link>
                <Link to="/shop" className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground">
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
