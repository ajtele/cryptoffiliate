import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Check,
  X,
  ArrowLeftRight,
  ThumbsUp,
  ThumbsDown,
  Plus,
} from 'lucide-react';

interface ComparePageProps {
  searchParams: Promise<{ items?: string; category?: string }>;
}

async function getCategories() {
  const { data } = await supabase.from('categories').select('*').order('display_order');
  return data || [];
}

async function getListingsForCategory(categorySlug?: string) {
  let query = supabase.from('listings').select('*, category:categories(*)').order('overall_rating', { ascending: false });

  if (categorySlug) {
    const { data: category } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    if (category) query = query.eq('category_id', category.id);
  }

  const { data } = await query.limit(20);
  return data || [];
}

async function getListingsByIds(slugs: string[]) {
  const { data } = await supabase.from('listings').select('*, category:categories(*)').in('slug', slugs);
  return data || [];
}

export const metadata = {
  title: 'Compare Crypto Products - Side by Side | Cryptoffiliate',
  description: 'Compare crypto exchanges, hardware wallets, tax software, and more side by side. Find the best product for your needs.',
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { items, category } = await searchParams;
  const categories = await getCategories();
  const selectedSlugs = items?.split(',').filter(Boolean) || [];
  const availableListings = await getListingsForCategory(category);
  const selectedListings = selectedSlugs.length > 0 ? await getListingsByIds(selectedSlugs) : [];

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="mb-2">Compare Products</h1>
            <p className="text-sm text-muted-foreground">
              Select 2-3 products for a detailed side-by-side comparison.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href="/compare">
            <Badge variant={!category ? 'default' : 'outline'} className="cursor-pointer">All</Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/compare?category=${cat.slug}${items ? `&items=${items}` : ''}`}>
              <Badge variant={category === cat.slug ? 'default' : 'outline'} className="cursor-pointer">
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Product Selection */}
        {selectedListings.length === 0 && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <ArrowLeftRight className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Select Products to Compare</h3>
              <p className="text-sm text-muted-foreground">Choose 2-3 products from below</p>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            {category ? `${categories.find(c => c.slug === category)?.name} products` : 'All products'}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {availableListings.map((listing) => {
              const isSelected = selectedSlugs.includes(listing.slug);
              const newItems = isSelected
                ? selectedSlugs.filter(s => s !== listing.slug).join(',')
                : selectedSlugs.length < 3 ? [...selectedSlugs, listing.slug].join(',') : items;
              return (
                <Link
                  key={listing.id}
                  href={`/compare?items=${newItems || ''}${category ? `&category=${category}` : ''}`}
                >
                  <Card className={`card-hover cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            {listing.logo_url ? (
                              <img src={listing.logo_url} alt={listing.name} className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">{listing.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{listing.name}</div>
                            <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              {listing.overall_rating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border">
                          {isSelected ? <Check className="h-3 w-3 text-primary" /> : <Plus className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedListings.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground w-36">Feature</th>
                      {selectedListings.map((listing) => (
                        <th key={listing.id} className="px-4 py-3 text-center min-w-[180px]">
                          <Link href={`/listing/${listing.slug}`} className="inline-flex flex-col items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              {listing.logo_url ? (
                                <img src={listing.logo_url} alt={listing.name} className="h-8 w-8 object-contain" />
                              ) : (
                                <span className="text-sm font-bold text-muted-foreground">{listing.name[0]}</span>
                              )}
                            </div>
                            <span className="font-semibold text-xs">{listing.name}</span>
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2.5 text-muted-foreground">Rating</td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-2.5 text-center font-semibold">
                          <div className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            {l.overall_rating.toFixed(1)}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2.5 text-muted-foreground">Price</td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-2.5 text-center">
                          {l.pricing_type === 'free' ? 'Free' : l.starting_price || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2.5 text-muted-foreground">Reviews</td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-2.5 text-center">{l.review_count.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2.5 text-muted-foreground">Verified</td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-2.5 text-center">
                          {l.is_verified ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted mx-auto" />}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2.5 text-muted-foreground">
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-success" /> Pros</span>
                      </td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-2.5 text-left">
                          <ul className="space-y-1">
                            {l.pros?.slice(0, 3).map((p: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs">
                                <Check className="h-3 w-3 text-success shrink-0 mt-0.5" />{p}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2.5 text-muted-foreground">
                        <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3 text-destructive" /> Cons</span>
                      </td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-2.5 text-left">
                          <ul className="space-y-1">
                            {l.cons?.slice(0, 3).map((c: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs">
                                <X className="h-3 w-3 text-destructive shrink-0 mt-0.5" />{c}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2.5 text-muted-foreground">Commission</td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-2.5 text-center text-xs text-success font-medium">
                          {l.affiliate_commission || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3"></td>
                      {selectedListings.map((l) => (
                        <td key={l.id} className="px-4 py-3 text-center">
                          <Button size="sm" className="text-xs" asChild>
                            <a href={l.affiliate_url || l.website_url || '#'} target="_blank" rel="noopener noreferrer nofollow">
                              Visit Site
                            </a>
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
