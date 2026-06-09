import { Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/format";

export interface ProductCardData {
  slug: string;
  name: string;
  category: string;
  price_cents: number;
  image_url: string | null;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <Link to="/products/$slug" params={{ slug: p.slug }} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-secondary">
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg leading-tight">{p.name}</h3>
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatPrice(p.price_cents)}
        </span>
      </div>
      <div className="eyebrow mt-1">{p.category === "tshirt" ? "T-shirt" : "Shirt"}</div>
    </Link>
  );
}
