import cream from "@/assets/p-tee-cream.jpg";
import black from "@/assets/p-tee-black.jpg";
import olive from "@/assets/p-tee-olive.jpg";
import white from "@/assets/p-shirt-white.jpg";
import sand from "@/assets/p-shirt-sand.jpg";
import stripe from "@/assets/p-shirt-stripe.jpg";

const map: Record<string, string> = {
  "cream-essential-tee": cream,
  "charcoal-heavyweight-tee": black,
  "olive-pocket-tee": olive,
  "white-linen-shirt": white,
  "sand-oxford-shirt": sand,
  "breton-stripe-shirt": stripe,
};

export function productImage(slug: string, fallback: string | null) {
  return map[slug] ?? fallback ?? "";
}
