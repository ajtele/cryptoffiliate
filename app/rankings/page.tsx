'use client';

import * as React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Check, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing, Category } from '@/lib/supabase';

interface ListingWithCategory extends Listing {
  category: Category | null;
  user_review_count?: number;
}

const ITEMS_PER_PAGE = 12;

const categoryOptions = [
  { slug: '', name: 'All Categories' },
  { slug: 'crypto-exchanges', name: 'Crypto Exchanges' },
  { slug: 'hardware-wallets', name: 'Hardware Wallets' },
  { slug: 'tax-software', name: 'Tax Software' },
  { slug: 'security-tools', name: 'Security Tools' },
  { slug: 'trading-bots', name: 'Trading Bots' },
  { slug: 'cloud-mining', name: 'Cloud Mining' },
  { slug: 'crypto-affiliate-programs', name: 'Affiliate Programs' },
];

export default function RankingsPage() {
  const [listings, setListings] = React.useState<ListingWithCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState('');
  const [sortField, setSortField] = React.useState<'rating' | 'reviews' | 'name'>('rating');
  const [sortAsc, setSortAsc] = React.useState(false);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    fetchListings();
  }, [activeCategory, sortField, sortAsc]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, category:categories(*)');

    if (activeCategory) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', activeCategory)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (sortField === 'rating') {
      query = query.order('overall_rating', { ascending: sortAsc });
    } else if (sortField === 'reviews') {
      query = query.order('review_count', { ascending: sortAsc });
    } else {
      query = query.order('name', { ascending: !sortAsc });
    }

    const { data } = await query;

    // Fetch user review counts
    if (data && data.length > 0) {
      const listingIds = data.map((l) => l.id);
      const { data: reviewCounts } = await supabase
        .from('reviews')
        .select('listing_id')
        .eq('is_approved', true)
        .in('listing_id', listingIds);

      const countMap = new Map<string, number>();
      (reviewCounts || []).forEach((r: any) => {
        countMap.set(r.listing_id, (countMap.get(r.listing_id) || 0) + 1);
      });

      const listingsWithReviews = data.map((l) => ({
        ...l,
        user_review_count: countMap.get(l.id) || 0,
      }));
      setListings(listingsWithReviews);
    } else {
      setListings(data || []);
    }

    setPage(0);
    setLoading(false);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const paginatedListings = listings.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl">
            <h1 className="mb-2">Crypto Product Rankings</h1>
            <p className="text-sm text-muted-foreground">
              Discover the highest-rated products across all categories.
              Rankings based on real user reviews and expert analysis.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categoryOptions.map((cat) => (
            <Badge
              key={cat.slug}
              variant={activeCategory === cat.slug ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              onClick={() => setActiveCategory(cat.slug)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">#</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('name')} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                        Product <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      <button onClick={() => handleSort('rating')} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                        Rating <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">
                      <button onClick={() => handleSort('reviews')} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                        Reviews <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden lg:table-cell">Price</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden lg:table-cell">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="h-5 bg-muted rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    paginatedListings.map((listing, i) => (
                      <tr key={listing.id} className="border-b hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground font-medium">
                          {page * ITEMS_PER_PAGE + i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/listing/${listing.slug}`} className="flex items-center gap-3 group">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                              {listing.logo_url ? (
                                <img src={listing.logo_url} alt={listing.name} className="h-6 w-6 object-contain" />
                              ) : (
                                <span className="text-xs font-bold text-muted-foreground">{listing.name[0]}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium group-hover:text-primary transition-colors">{listing.name}</span>
                                {listing.is_verified && <Check className="h-3.5 w-3.5 text-primary" />}
                              </div>
                              {listing.tagline && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{listing.tagline}</p>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {listing.category && (
                            <Badge variant="secondary" className="text-[10px]">{listing.category.name}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="space-y-0.5">
                            <div className="inline-flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                              <span className="font-semibold">{listing.overall_rating.toFixed(1)}</span>
                            </div>
                            {(listing as any).user_review_count > 0 && (
                              <p className="text-[10px] text-muted-foreground">
                                {(listing as any).user_review_count} user{(listing as any).user_review_count !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center hidden md:table-cell text-muted-foreground">
                          {listing.review_count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-sm">
                          {listing.pricing_type === 'free' ? 'Free' : listing.starting_price || '-'}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          {listing.affiliate_commission ? (
                            <span className="text-xs text-success font-medium">{listing.affiliate_commission}</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, listings.length)} of {listings.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i ? 'default' : 'ghost'}
                      size="icon"
                      className="h-7 w-7 text-xs"
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
