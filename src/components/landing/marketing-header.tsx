import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-paper/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" aria-label="Pliex home">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
          <Link href="#what" className="hover:text-navy-700">What it does</Link>
          <Link href="#how" className="hover:text-navy-700">How it works</Link>
          <Link href="#why" className="hover:text-navy-700">Why Pliex</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/sign-in">
            <Button size="sm">Continue with Google</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
