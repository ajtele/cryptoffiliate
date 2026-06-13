import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

const categories = [
  { slug: 'crypto-exchanges', name: 'Crypto Exchanges' },
  { slug: 'hardware-wallets', name: 'Hardware Wallets' },
  { slug: 'tax-software', name: 'Tax Software' },
  { slug: 'security-tools', name: 'Security Tools' },
  { slug: 'trading-bots', name: 'Trading Bots' },
  { slug: 'cloud-mining', name: 'Cloud Mining' },
  { slug: 'crypto-affiliate-programs', name: 'Affiliate Programs' },
];

const comparisons = [
  { name: 'Binance vs Coinbase', href: '/compare/binance/coinbase' },
  { name: 'Ledger vs Trezor', href: '/compare/ledger-nano-x/trezor-model-t' },
  { name: 'Kraken vs Bybit', href: '/compare/kraken/bybit' },
  { name: 'Compare All', href: '/compare' },
];

const guides = [
  { name: 'Best for Beginners', href: '/category/crypto-exchanges/filter/beginner-friendly' },
  { name: 'No KYC Exchanges', href: '/category/crypto-exchanges/filter/no-kyc' },
  { name: 'Bluetooth Wallets', href: '/category/hardware-wallets/filter/bluetooth' },
  { name: 'Open Source Wallets', href: '/category/hardware-wallets/filter/open-source' },
];

const tools = [
  { name: 'Deals & Promotions', href: '/deals' },
  { name: 'Fee Calculator', href: '/tools/fee-calculator' },
  { name: 'Tax Software Finder', href: '/tools/tax-software-finder' },
  { name: 'Build Crypto Stack', href: '/ai-advisor/stack-builder' },
];

const company = [
  { name: 'About Us', href: '/about' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Affiliate Disclosure', href: '/disclosure' },
];

const social = [
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { name: 'Email', href: 'mailto:hello@cryptoffiliate.com', icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-heading text-lg font-bold">Cryptoffiliate</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your trusted guide to crypto products. Expert reviews, transparent affiliate recommendations.
            </p>
            <div className="mt-4 flex gap-3">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Categories</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Popular Comparisons</h4>
            <ul className="space-y-2">
              {comparisons.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Buying Guides</h4>
            <ul className="space-y-2">
              {guides.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Tools</h4>
            <ul className="space-y-2">
              {tools.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Cryptoffiliate. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center sm:text-right max-w-sm">
              We may earn affiliate commissions from links on this site. This supports our editorial work at no extra cost to you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
