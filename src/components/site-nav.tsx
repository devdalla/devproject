import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export function SiteNav() {
  const { count } = useCart();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="font-display text-2xl tracking-tight">
          styles<span className="text-muted-foreground">.</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/shop" className="hover:opacity-60" activeProps={{ className: "opacity-60" }}>
            Shop
          </Link>
          <Link to="/shop" search={{ category: "tshirt" }} className="hover:opacity-60">
            T-shirts
          </Link>
          <Link to="/shop" search={{ category: "shirt" }} className="hover:opacity-60">
            Shirts
          </Link>
          <Link to="/orders" className="hover:opacity-60">
            Orders
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <Link
            to={user ? "/account" : "/login"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
            aria-label="Account"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">styles.</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Quiet essentials, made to last.
          </p>
        </div>
        <div className="text-sm">
          <div className="eyebrow mb-3">Shop</div>
          <ul className="space-y-2">
            <li><Link to="/shop">All</Link></li>
            <li><Link to="/shop" search={{ category: "tshirt" }}>T-shirts</Link></li>
            <li><Link to="/shop" search={{ category: "shirt" }}>Shirts</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="eyebrow mb-3">Account</div>
          <ul className="space-y-2">
            <li><Link to="/login">Sign in</Link></li>
            <li><Link to="/signup">Create account</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="eyebrow mb-3 text-foreground">Studio</div>
          <p>© {new Date().getFullYear()} styles.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
