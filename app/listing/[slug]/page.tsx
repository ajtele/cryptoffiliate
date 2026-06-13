import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Star,
  Check,
  X,
  ExternalLink,
  ArrowLeft,
  Shield,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Users,
  Tag,
  Clock,
  MessageSquare,
  Calculator,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import type { Metadata } from 'next';

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

async function getListing(slug: string) {
  const { data } = await supabase
    .from('listings')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single();
  return data;
}

async function getListingAttributes(listingId: string) {
  const { data } = await supabase
    .from('listing_attributes')
    .select('*')
    .eq('listing_id', listingId);
  return data || [];
}

async function getActivePromotion(listingId: string) {
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('listing_id', listingId)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}

async function getApprovedReviews(listingId: string) {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', listingId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

async function getReviewStats(listingId: string) {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('listing_id', listingId)
    .eq('is_approved', true);

  if (!data || data.length === 0) {
    return { avgRating: null, count: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return {
    avgRating: sum / data.length,
    count: data.length,
  };
}

async function getRelatedListings(categoryId: number, excludeSlug: string) {
  const { data } = await supabase
    .from('listings')
    .select('*, category:categories(*)')
    .eq('category_id', categoryId)
    .neq('slug', excludeSlug)
    .order('overall_rating', { ascending: false })
    .limit(4);
  return data || [];
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: 'Not Found' };

  return {
    title: `${listing.name} Review ${new Date().getFullYear()} - Pros, Cons & Affiliate Program | Cryptoffiliate`,
    description: listing.tagline || listing.description?.slice(0, 160),
    openGraph: {
      title: `${listing.name} - Review & Affiliate Program`,
      description: listing.tagline || listing.description?.slice(0, 160) || '',
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const [attributes, promotion, reviews, reviewStats, relatedListings] = await Promise.all([
    getListingAttributes(listing.id),
    getActivePromotion(listing.id),
    getApprovedReviews(listing.id),
    getReviewStats(listing.id),
    getRelatedListings(listing.category_id, listing.slug),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.name,
    description: listing.description,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: listing.overall_rating,
      reviewCount: listing.review_count,
      bestRating: 5,
    },
    ...(reviewStats.avgRating && {
      review: reviews.map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author_name },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.body,
      })),
    }),
    ...(listing.starting_price && { offers: { '@type': 'Offer', price: listing.starting_price } }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col">
        <div className="border-b">
          <div className="container mx-auto px-4 py-3">
            <Link
              href={`/category/${listing.category?.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {listing.category?.name}
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {listing.logo_url ? (
                    <img src={listing.logo_url} alt={listing.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">{listing.name[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl md:text-3xl">{listing.name}</h1>
                    {listing.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    )}
                    {listing.is_featured && (
                      <Badge className="text-xs bg-primary/10 text-primary">Featured</Badge>
                    )}
                    {promotion && (
                      <Badge className="text-xs bg-primary/10 text-primary flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {promotion.bonus_value}
                      </Badge>
                    )}
                  </div>
                  {listing.tagline && (
                    <p className="text-muted-foreground mb-3">{listing.tagline}</p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold">{listing.overall_rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({listing.review_count.toLocaleString()} reviews)
                      </span>
                    </div>
                    {listing.category && (
                      <Badge variant="outline" className="text-xs">{listing.category.name}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Promotion Banner */}
              {promotion && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Tag className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{promotion.title}</span>
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {promotion.bonus_value}
                          </Badge>
                          {promotion.promo_code && (
                            <code className="text-xs bg-background px-2 py-0.5 rounded font-mono border">
                              {promotion.promo_code}
                            </code>
                          )}
                        </div>
                        {promotion.description && (
                          <p className="text-xs text-muted-foreground">{promotion.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {promotion.expires_at ? (
                            <span>
                              Expires {new Date(promotion.expires_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-success font-medium">Ongoing offer</span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" className="shrink-0" asChild>
                        <a
                          href={listing.affiliate_url || listing.website_url || '#'}
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
              )}

              {/* About */}
              {listing.description && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-3">About</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Specs & Features Table */}
              {attributes.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-4">Specs & Features</h2>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          {attributes.map((attr, i) => (
                            <tr key={attr.id} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                              <td className="px-4 py-2.5 font-medium capitalize text-muted-foreground w-1/2">
                                {attr.attribute_key.replace(/_/g, ' ')}
                              </td>
                              <td className="px-4 py-2.5">
                                {attr.attribute_value === 'true' ? (
                                  <Check className="h-4 w-4 text-success" />
                                ) : attr.attribute_value === 'false' ? (
                                  <X className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <span>{attr.attribute_value}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pros & Cons */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="h-4 w-4 text-success" />
                      <h3 className="font-semibold text-sm">Pros</h3>
                    </div>
                    <ul className="space-y-2">
                      {listing.pros?.map((pro: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      )) || <li className="text-sm text-muted-foreground">No pros listed</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsDown className="h-4 w-4 text-destructive" />
                      <h3 className="font-semibold text-sm">Cons</h3>
                    </div>
                    <ul className="space-y-2">
                      {listing.cons?.map((con: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      )) || <li className="text-sm text-muted-foreground">No cons listed</li>}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* User Reviews Section */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-lg font-semibold">User Reviews</h2>
                    </div>
                    {reviewStats.count > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span className="font-semibold">{reviewStats.avgRating?.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">({reviewStats.count})</span>
                      </div>
                    )}
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="pb-4 border-b last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {review.author_name[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{review.author_name}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i <= review.rating ? 'fill-primary text-primary' : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
                          {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-6">
                      No user reviews yet. Be the first to review!
                    </p>
                  )}

                  {/* Review Submission Form */}
                  <form action={`/api/reviews/${listing.id}`} method="POST" className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold">Write a Review</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="author_name" className="text-xs">Your Name</Label>
                        <Input id="author_name" name="author_name" required className="h-9 text-sm" placeholder="John D." />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rating" className="text-xs">Rating</Label>
                        <select
                          id="rating"
                          name="rating"
                          required
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Average</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Terrible</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs">Title (optional)</Label>
                      <Input id="title" name="title" className="h-9 text-sm" placeholder="Great product!" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="body" className="text-xs">Your Review</Label>
                      <Textarea id="body" name="body" rows={3} className="text-sm" placeholder="Share your experience..." />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Reviews are moderated and will appear after approval.
                    </p>
                    <Button type="submit" size="sm">Submit Review</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Compare with similar */}
              {relatedListings.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="text-lg font-semibold mb-4">Compare with Similar Products</h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {relatedListings.map((related) => (
                        <Link
                          key={related.id}
                          href={`/compare/${listing.slug}/${related.slug}`}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            {related.logo_url ? (
                              <img src={related.logo_url} alt={related.name} className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">{related.name[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                              {listing.name} vs {related.name}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              {related.overall_rating.toFixed(1)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="sticky top-20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold">{listing.overall_rating.toFixed(1)}</div>
                      <div className="flex items-center mt-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i <= Math.round(listing.overall_rating)
                                ? 'fill-primary text-primary'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {listing.review_count.toLocaleString()} reviews
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-1.5 mb-5">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(listing.overall_rating / 5) * 100}%` }}
                    />
                  </div>

                  <Separator className="mb-5" />

                  {listing.starting_price && (
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Price</div>
                        <div className="text-sm font-medium">
                          {listing.pricing_type === 'free' ? 'Free' : `From ${listing.starting_price}`}
                        </div>
                      </div>
                    </div>
                  )}

                  {listing.affiliate_commission && (
                    <div className="flex items-center gap-3 mb-5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Commission</div>
                        <div className="text-sm font-medium text-success">
                          {listing.affiliate_commission}
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="mb-5" />

                  <p className="text-[11px] text-muted-foreground mb-4">
                    We may earn a commission through affiliate links at no extra cost to you.
                  </p>

                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <a
                        href={listing.affiliate_url || listing.website_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        Visit {listing.name}
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full text-sm" asChild>
                      <Link href={`/compare?items=${listing.slug}`}>Compare</Link>
                    </Button>
                  </div>

                  {/* Tool Links */}
                  {(() => {
                    const hasFees = attributes.some((a) => a.attribute_key === 'taker_fee' || a.attribute_key === 'maker_fee');
                    const isTaxCategory = listing.category?.slug === 'tax-software';
                    if (!hasFees && !isTaxCategory) return null;
                    return (
                      <div className="pt-4 border-t mt-4 space-y-2">
                        {hasFees && (
                          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" asChild>
                            <Link href={`/tools/fee-calculator?exchange=${listing.slug}`}>
                              <Calculator className="mr-2 h-3.5 w-3.5" />
                              Calculate your savings
                              <ArrowRight className="ml-auto h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                        {isTaxCategory && (
                          <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8" asChild>
                            <Link href="/tools/tax-software-finder">
                              <Receipt className="mr-2 h-3.5 w-3.5" />
                              Find your fit
                              <ArrowRight className="ml-auto h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {listing.affiliate_details && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold">Affiliate Program</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {listing.affiliate_details}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
