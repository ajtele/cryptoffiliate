import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/listing-card';
import {
  ArrowLeftRight,
  HardDrive,
  Receipt,
  Shield,
  Cpu,
  Cloud,
  Sparkles,
  TrendingUp,
  Star,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  Layers,
  Tag,
  Handshake,
} from 'lucide-react';

const categories = [
  { slug: 'crypto-exchanges', name: 'Crypto Exchanges', description: 'Trade cryptocurrencies on secure platforms', icon: ArrowLeftRight },
  { slug: 'hardware-wallets', name: 'Hardware Wallets', description: 'Cold storage for your crypto assets', icon: HardDrive },
  { slug: 'tax-software', name: 'Tax Software', description: 'Simplify crypto tax reporting', icon: Receipt },
  { slug: 'security-tools', name: 'Security Tools', description: 'Protect your digital assets', icon: Shield },
  { slug: 'trading-bots', name: 'Trading Bots', description: 'Automate your trading strategies', icon: Cpu },
  { slug: 'cloud-mining', name: 'Cloud Mining', description: 'Mine without hardware', icon: Cloud },
  { slug: 'crypto-affiliate-programs', name: 'Affiliate Programs', description: 'Monetize your crypto audience', icon: Handshake },
];

const features = [
  { icon: Star, title: 'Expert Reviews', description: 'In-depth analysis from crypto industry professionals' },
  { icon: TrendingUp, title: 'Data-Driven Rankings', description: 'Transparent scoring across all categories' },
  { icon: ShieldCheck, title: 'Honest Affiliates', description: 'Clear disclosure on all partnerships' },
  { icon: Zap, title: 'AI Recommendations', description: 'Personalized suggestions powered by AI' },
];

async function getHomepageData() {
  const [featuredResult, topRatedResult] = await Promise.all([
    supabase
      .from('listings')
      .select('*, category:categories(*)')
      .eq('is_featured', true)
      .order('overall_rating', { ascending: false })
      .limit(6),
    supabase
      .from('listings')
      .select('*, category:categories(*)')
      .order('overall_rating', { ascending: false })
      .limit(8),
  ]);

  return {
    featured: featuredResult.data || [],
    topRated: topRatedResult.data || [],
  };
}

export default async function HomePage() {
  const { featured, topRated } = await getHomepageData();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">
              The Crypto Product Directory
            </p>
            <h1 className="text-balance mb-5">
              Find the Best Crypto Products,{' '}
              <span className="text-muted-foreground">Backed by Data</span>
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground mb-8 leading-relaxed">
              Compare exchanges, wallets, tax software, and trading tools.
              Expert reviews, real ratings, and transparent affiliate recommendations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/ai-advisor/stack-builder">
                  <Layers className="mr-2 h-4 w-4" />
                  Build My Crypto Stack
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/rankings">View Rankings</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="text-primary">
                <Link href="/deals">
                  <Tag className="mr-2 h-4 w-4" />
                  Today's Deals
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl lg:max-w-none mx-auto">
            {[
              { value: '50+', label: 'Products Reviewed' },
              { value: '7', label: 'Categories' },
              { value: '60K+', label: 'User Reviews' },
              { value: '$2M+', label: 'Commissions Tracked' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-14">
        <div className="mb-8">
          <h2 className="mb-1">Browse by Category</h2>
          <p className="text-sm text-muted-foreground">Explore our curated crypto product verticals</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} className="group">
              <Card className="card-hover h-full">
                <CardContent className="p-5">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <category.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold mb-0.5 group-hover:text-primary transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="border-t border-b bg-card py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="mb-1">Featured Products</h2>
                <p className="text-sm text-muted-foreground">Top picks from our editorial team</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/rankings">
                  View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  category={listing.category}
                  showCategory
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="container mx-auto px-4 py-14">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="mb-2">Why Trust Cryptoffiliate</h2>
          <p className="text-sm text-muted-foreground">
            Expert research combined with real user feedback for unbiased recommendations.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-sm font-semibold mb-1">{feature.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Rated */}
      {topRated.length > 0 && (
        <section className="border-t py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="mb-1">Top Rated Products</h2>
              <p className="text-sm text-muted-foreground">Highest rated across all categories</p>
            </div>
            <div className="grid gap-1 lg:grid-cols-2">
              {topRated.map((listing, index) => (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.slug}`}
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {listing.logo_url ? (
                      <img src={listing.logo_url} alt={listing.name} className="h-7 w-7 object-contain" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{listing.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {listing.name}
                      </span>
                      {listing.is_verified && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {listing.tagline || listing.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{listing.overall_rating.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 py-14">
        <Card className="overflow-hidden border-0 bg-foreground text-background">
          <CardContent className="p-8 lg:p-10">
            <div className="max-w-xl">
              <Sparkles className="mb-4 h-6 w-6 opacity-60" />
              <h2 className="mb-3 text-background">Not Sure Which Product to Choose?</h2>
              <p className="mb-6 text-sm opacity-70 leading-relaxed">
                Our AI Advisor analyzes your needs, experience level, and goals
                to recommend the perfect crypto products for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" asChild>
                  <Link href="/ai-advisor/stack-builder">
                    <Layers className="mr-2 h-4 w-4" />
                    Build My Crypto Stack
                  </Link>
                </Button>
                <Button variant="outline" className="bg-transparent border-background/20 text-background hover:bg-background/10" asChild>
                  <Link href="/ai-advisor">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Chat with AI Advisor
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
