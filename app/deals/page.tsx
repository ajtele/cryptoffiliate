import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink, Clock, Tag, Check } from 'lucide-react';
import type { Metadata } from 'next';

interface DealPageProps {
  searchParams: Promise<{ category?: string }>;
}

interface PromotionWithListing {
  id: string;
  title: string;
  description: string | null;
  bonus_value: string;
  promo_code: string | null;
  expires_at: string | null;
  listing: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    overall_rating: number;
    affiliate_url: string | null;
    website_url: string | null;
    category: { slug: string; name: string } | null;
  };
}

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('display_order');
  return data || [];
}

async function getActivePromotions(categorySlug?: string): Promise<PromotionWithListing[]> {
  let query = supabase
    .from('promotions')
    .select(`
      id,
      title,
      description,
      bonus_value,
      promo_code,
      expires_at,
      listing_id
    `)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (categorySlug) {
    const { data: category } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    if (category) {
      const { data: listings } = await supabase.from('listings').select('id').eq('category_id', category.id);
      const listingIds = (listings || []).map(l => l.id);
      query = query.in('listing_id', listingIds);
    }
  }

  const { data: promotions } = await query;
  if (!promotions || promotions.length === 0) return [];

  // Fetch listings separately
  const listingIds = promotions.map(p => p.listing_id);
  const { data: listings } = await supabase
    .from('listings')
    .select('id, slug, name, logo_url, overall_rating, affiliate_url, website_url, category:categories(slug, name)')
    .in('id', listingIds);

  const listingMap = new Map((listings || []).map((l: any) => [l.id, l]));

  return promotions.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    bonus_value: p.bonus_value,
    promo_code: p.promo_code,
    expires_at: p.expires_at,
    listing: listingMap.get(p.listing_id) || {
      id: p.listing_id,
      slug: '',
      name: 'Unknown',
      logo_url: null,
      overall_rating: 0,
      affiliate_url: null,
      website_url: null,
      category: null
    }
  }));
}

function getTimeRemaining(expiresAt: string | null): string | null {
  if (!expiresAt) return null;

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 1) return `${days} days left`;
  if (days === 1) return '1 day left';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 1) return `${hours} hours left`;
  if (hours === 1) return '1 hour left';

  return 'Ending soon';
}

export const metadata: Metadata = {
  title: 'Crypto Deals & Bonuses - Exclusive Promotions | Cryptoffiliate',
  description: 'Find the best crypto promotions, sign-up bonuses, and exclusive deals for exchanges, hardware wallets, tax software, and trading tools.',
};

export default async function DealsPage({ searchParams }: DealPageProps) {
  const { category } = await searchParams;
  const [categories, promotions] = await Promise.all([
    getCategories(),
    getActivePromotions(category),
  ]);

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <h1 className="mb-2">Crypto Deals & Promotions</h1>
            <p className="text-sm text-muted-foreground">
              Exclusive sign-up bonuses, discount codes, and limited-time offers from top crypto platforms.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/deals">
            <Badge variant={!category ? 'default' : 'outline'} className="cursor-pointer">All Deals</Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/deals?category=${cat.slug}`}>
              <Badge variant={category === cat.slug ? 'default' : 'outline'} className="cursor-pointer">
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No active promotions found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => {
              const timeRemaining = getTimeRemaining(promo.expires_at);
              const isOngoing = !promo.expires_at;

              return (
                <Card key={promo.id} className="card-hover flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {promo.listing.logo_url ? (
                          <img src={promo.listing.logo_url} alt={promo.listing.name} className="h-9 w-9 object-contain" />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">{promo.listing.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/listing/${promo.listing.slug}`} className="font-semibold text-sm hover:text-primary transition-colors">
                          {promo.listing.name}
                        </Link>
                        {promo.listing.category && (
                          <p className="text-xs text-muted-foreground">{promo.listing.category.name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span className="text-sm font-semibold">{promo.listing.overall_rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                          {promo.bonus_value}
                        </Badge>
                        {promo.promo_code && (
                          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                            {promo.promo_code}
                          </code>
                        )}
                      </div>

                      <h3 className="font-medium text-sm">{promo.title}</h3>
                      {promo.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{promo.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {isOngoing ? (
                          <span className="text-success font-medium">Ongoing</span>
                        ) : timeRemaining ? (
                          <span>{timeRemaining}</span>
                        ) : null}
                      </div>
                      <Button size="sm" className="text-xs" asChild>
                        <a
                          href={promo.listing.affiliate_url || promo.listing.website_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                        >
                          Claim Offer
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
