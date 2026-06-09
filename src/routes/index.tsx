import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ProductCard } from "@/components/product-card";
import { productImage } from "@/lib/product-images";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "styles. — quiet essentials" },
      { name: "description", content: "Premium t-shirts and shirts. Quiet essentials made to last. Sign in to place an order." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("slug,name,category,price_cents,image_url")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <SiteNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-10 md:pt-16">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="eyebrow mb-5">New season — 26/01</div>
            <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
              Quiet essentials,<br/>built to outlast<br/>the season.
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              Considered cuts in heavyweight cotton and European linen. Made in small runs, shipped from our studio.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/shop" className="inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm tracking-wide text-primary-foreground hover:opacity-90">
                Shop the collection
              </Link>
              <Link to="/signup" className="inline-flex h-11 items-center rounded-sm border border-border px-6 text-sm tracking-wide hover:bg-secondary">
                Create account
              </Link>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden bg-secondary">
              <img src={hero} alt="Folded shirts and t-shirts" width={1600} height={1100} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">The collection</h2>
          <Link to="/shop" className="text-sm underline-offset-4 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
          {products?.map((p) => (
            <ProductCard
              key={p.slug}
              p={{ ...p, image_url: productImage(p.slug, p.image_url) }}
            />
          ))}
        </div>
      </section>

      {/* Promise */}
      <section className="mx-auto mt-32 max-w-6xl px-5">
        <div className="grid gap-12 border-y border-border py-16 md:grid-cols-3">
          {[
            { t: "Small runs", d: "We make 200 of each piece. When they're gone, they're gone." },
            { t: "Considered materials", d: "Heavyweight 240gsm cottons. European linens. Mother-of-pearl buttons." },
            { t: "Honest pricing", d: "No seasonal markdowns. The price is the price, year round." },
          ].map((b) => (
            <div key={b.t}>
              <h3 className="font-display text-2xl">{b.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
