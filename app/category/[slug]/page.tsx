import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ListingCard } from '@/components/listing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftRight,
  HardDrive,
  Receipt,
  Shield,
  Cpu,
  Cloud,
  ArrowRight,
  Calculator,
  Handshake,
  ExternalLink,
} from 'lucide-react';
import type { Metadata } from 'next';

const categoryIcons: Record<string, any> = {
  'crypto-exchanges': ArrowLeftRight,
  'hardware-wallets': HardDrive,
  'tax-software': Receipt,
  'security-tools': Shield,
  'trading-bots': Cpu,
  'cloud-mining': Cloud,
  'crypto-affiliate-programs': Handshake,
};

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

async function getCategory(slug: string) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

async function getListings(categoryId: number, sortBy: string = 'rating') {
  let query = supabase
    .from('listings')
    .select('*, category:categories(*)')
    .eq('category_id', categoryId);

  if (sortBy === 'rating') {
    query = query.order('overall_rating', { ascending: false });
  } else if (sortBy === 'reviews') {
    query = query.order('review_count', { ascending: false });
  } else if (sortBy === 'featured') {
    query = query.order('is_featured', { ascending: false });
  }

  const { data } = await query;
  return data || [];
}

async function getFilters(categoryId: number) {
  const { data } = await supabase
    .from('listing_attributes')
    .select('attribute_key, attribute_value')
    .in('listing_id', (
      await supabase.from('listings').select('id').eq('category_id', categoryId)
    ).data?.map((l: any) => l.id) || []);

  const filters = new Map<string, Set<string>>();
  (data || []).forEach((attr: any) => {
    if (!filters.has(attr.attribute_key)) {
      filters.set(attr.attribute_key, new Set());
    }
    filters.get(attr.attribute_key)!.add(attr.attribute_value);
  });
  return filters;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Category Not Found' };

  return {
    title: `Best ${category.name} ${new Date().getFullYear()} - Compare & Review | Cryptoffiliate`,
    description: `${category.description}. Compare top ${category.name.toLowerCase()}, read expert reviews, and find the perfect fit for your needs.`,
    openGraph: {
      title: `Best ${category.name} - Compare & Review`,
      description: category.description || '',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort = 'rating' } = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const listings = await getListings(category.id, sort);
  const filters = await getFilters(category.id);
  const CategoryIcon = categoryIcons[slug] || ArrowLeftRight;

  const filterLinks = Array.from(filters.entries())
    .filter(([key, values]) => {
      return values.has('true') || values.size <= 5;
    })
    .slice(0, 6)
    .map(([key]) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      href: `/category/${slug}/filter/${key.replace(/_/g, '-')}`,
    }));

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CategoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="mb-1">Best {category.name}</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {category.description}. Compare top products, read reviews,
                and find the perfect fit for your needs.
              </p>
            </div>
          </div>

          {filterLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {filterLinks.map((f) => (
              <Link key={f.href} href={f.href}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors">
                    {f.label}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {/* Editorial intro for affiliate programs */}
        {slug === 'crypto-affiliate-programs' && (
          <div className="mb-8 p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Find the Right Crypto Affiliate Program</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Whether you're a content creator, influencer, or publisher, crypto affiliate programs
                  offer a way to monetize your audience. Compare commission rates, cookie durations,
                  and payout terms to find programs that match your audience and content style.
                </p>
                <p className="text-xs text-muted-foreground">
                  Looking for more affiliate marketing resources?{' '}
                  <a
                    href="{{CRYPTOFFILIATES_URL}}"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Cryptoffiliates <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tools CTA for exchanges */}
        {slug === 'crypto-exchanges' && (
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Compare trading fees</p>
                <p className="text-xs text-muted-foreground">See how much you could save based on your volume</p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/tools/fee-calculator">
                Fee Calculator <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {listings.length} products ranked by {sort === 'rating' ? 'rating' : sort === 'reviews' ? 'reviews' : 'featured'}
          </p>
          <div className="flex items-center gap-2">
            {['rating', 'reviews', 'featured'].map((s) => (
              <Link key={s} href={`/category/${slug}?sort=${s}`}>
                <Badge
                  variant={sort === s ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                >
                  {s}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No listings found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} rank={index + 1} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/compare?category=${slug}`}>
              Compare {category.name} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
