import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useCart } from "@/lib/cart";
import { productImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — styles.` },
      { name: "description", content: "Considered essentials. Order online." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div>
        <SiteNav />
        <p className="mx-auto max-w-6xl px-5 pt-12 text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <SiteNav />
        <p className="mx-auto max-w-6xl px-5 pt-12">Product not found.</p>
      </div>
    );
  }

  const img = productImage(product.slug, product.image_url);

  return (
    <div>
      <SiteNav />
      <section className="mx-auto mt-6 max-w-6xl px-5 md:mt-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            <img src={img} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="md:pl-6">
            <div className="eyebrow">{product.category === "tshirt" ? "T-shirt" : "Shirt"}</div>
            <h1 className="font-display mt-2 text-4xl md:text-5xl">{product.name}</h1>
            <div className="mt-3 text-lg tabular-nums">{formatPrice(product.price_cents)}</div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8">
              <div className="eyebrow mb-3">Size</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`h-11 min-w-12 rounded-sm border px-4 text-sm transition ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  if (!size) return toast.error("Pick a size first");
                  add({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    size,
                    quantity: 1,
                    unitPriceCents: product.price_cents,
                    imageUrl: img,
                  });
                  toast.success(`${product.name} added to cart`);
                }}
                className="inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm text-primary-foreground hover:opacity-90"
              >
                Add to cart
              </button>
              <button
                onClick={() => {
                  if (!size) return toast.error("Pick a size first");
                  add({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    size,
                    quantity: 1,
                    unitPriceCents: product.price_cents,
                    imageUrl: img,
                  });
                  navigate({ to: "/cart" });
                }}
                className="inline-flex h-11 items-center rounded-sm border border-border px-6 text-sm hover:bg-secondary"
              >
                Buy now
              </button>
            </div>

            <ul className="mt-10 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
              <li>Free shipping on orders over $100</li>
              <li>30-day returns, no questions asked</li>
            </ul>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
