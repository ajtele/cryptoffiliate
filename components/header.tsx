'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  ArrowLeftRight,
  HardDrive,
  Receipt,
  Shield,
  Cpu,
  Cloud,
  Menu,
  Search,
  ChevronDown,
  Sparkles,
  Moon,
  Sun,
  Tag,
  Calculator,
  Layers,
  Flame,
  Handshake,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';

const categories = [
  { slug: 'crypto-exchanges', name: 'Crypto Exchanges', icon: ArrowLeftRight },
  { slug: 'hardware-wallets', name: 'Hardware Wallets', icon: HardDrive },
  { slug: 'tax-software', name: 'Tax Software', icon: Receipt },
  { slug: 'security-tools', name: 'Security Tools', icon: Shield },
  { slug: 'trading-bots', name: 'Trading Bots', icon: Cpu },
  { slug: 'cloud-mining', name: 'Cloud Mining', icon: Cloud },
  { slug: 'crypto-affiliate-programs', name: 'Affiliate Programs', icon: Handshake },
];

const popularFilters = [
  { label: 'Best for Beginners', href: '/category/crypto-exchanges/filter/beginner-friendly' },
  { label: 'Wallets with Bluetooth', href: '/category/hardware-wallets/filter/bluetooth' },
  { label: 'No KYC Exchanges', href: '/category/crypto-exchanges/filter/no-kyc' },
];

const popularComparisons = [
  { label: 'Binance vs Coinbase', href: '/compare/binance/coinbase' },
  { label: 'Ledger vs Trezor', href: '/compare/ledger-nano-x/trezor-model-t' },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dealsCount, setDealsCount] = useState(0);

  useEffect(() => {
    const fetchDealsCount = async () => {
      const { count } = await supabase
        .from('promotions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      setDealsCount(count || 0);
    };
    fetchDealsCount();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <span className="hidden font-heading text-lg font-bold sm:inline-block">
            Cryptoffiliate
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
                Categories
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.slug} asChild>
                  <Link href={`/category/${cat.slug}`} className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground mb-1">Popular Filters</p>
              </div>
              {popularFilters.map((f) => (
                <DropdownMenuItem key={f.href} asChild>
                  <Link href={f.href} className="text-sm">{f.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
            <Link href="/rankings">Rankings</Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
            <Link href="/deals" className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              Deals
              {dealsCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-[10px] font-bold">
                  {dealsCount}
                </Badge>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
                Tools
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/tools/fee-calculator" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  Exchange Fee Calculator
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tools/tax-software-finder" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  Tax Software Finder
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
                Compare
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/compare">Compare Products</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground mb-1">Popular</p>
              </div>
              {popularComparisons.map((c) => (
                <DropdownMenuItem key={c.href} asChild>
                  <Link href={c.href} className="text-sm">{c.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI Advisor
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/ai-advisor/stack-builder" className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Build My Stack
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ai-advisor" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  Chat Advisor
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>

          <Button size="sm" asChild className="hidden sm:inline-flex ml-2 h-8 text-xs">
            <Link href="/ai-advisor">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              AI Advisor
            </Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </Link>
                ))}
                <div className="my-3 border-t" />
                <Link
                  href="/deals"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Deals
                </Link>
                <Link
                  href="/rankings"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Rankings
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Compare
                </Link>
                <Link
                  href="/ai-advisor"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  AI Advisor
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
