import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ProductCard } from "@/components/product-card";
import { productImage } from "@/lib/product-images";

const search = z.object({
  category: z.enum(["tshirt", "shirt"]).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop — styles." },
      { name: "description", content: "Browse our full collection of t-shirts and shirts." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: async () => {
      let q = supabase.from("products").select("slug,name,category,price_cents,image_url");
      if (category) q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <SiteNav />
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <div className="eyebrow">Shop</div>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">
          {category === "tshirt" ? "T-shirts" : category === "shirt" ? "Shirts" : "Everything"}
        </h1>
        <nav className="mt-6 flex gap-6 text-sm">
          <Link to="/shop" className="border-b border-transparent pb-1 data-[active=true]:border-foreground" data-active={!category}>All</Link>
          <Link to="/shop" search={{ category: "tshirt" }} className="border-b border-transparent pb-1 data-[active=true]:border-foreground" data-active={category === "tshirt"}>T-shirts</Link>
          <Link to="/shop" search={{ category: "shirt" }} className="border-b border-transparent pb-1 data-[active=true]:border-foreground" data-active={category === "shirt"}>Shirts</Link>
        </nav>
      </div>

      <section className="mx-auto mt-10 max-w-6xl px-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
            {products?.map((p) => (
              <ProductCard key={p.slug} p={{ ...p, image_url: productImage(p.slug, p.image_url) }} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
