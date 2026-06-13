import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, ExternalLink, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Metadata } from 'next';

interface ComparePageProps {
  params: Promise<{ slug1: string; slug2: string }>;
}

async function getListing(slug: string) {
  const { data } = await supabase
    .from('listings')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single();
  return data;
}

async function getAttributes(listingId: string) {
  const { data } = await supabase
    .from('listing_attributes')
    .select('*')
    .eq('listing_id', listingId);
  return data || [];
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug1, slug2 } = await params;
  const [a, b] = await Promise.all([getListing(slug1), getListing(slug2)]);
  if (!a || !b) return { title: 'Comparison Not Found' };

  return {
    title: `${a.name} vs ${b.name} ${new Date().getFullYear()} - Head-to-Head Comparison | Cryptoffiliate`,
    description: `Compare ${a.name} vs ${b.name} side by side. Features, pricing, ratings, pros and cons to help you choose.`,
    openGraph: {
      title: `${a.name} vs ${b.name} - Comparison`,
      description: `Side-by-side comparison of ${a.name} and ${b.name}.`,
    },
  };
}

export async function generateStaticParams() {
  const { data: categories } = await supabase.from('categories').select('id');
  const params: { slug1: string; slug2: string }[] = [];

  for (const cat of categories || []) {
    const { data: listings } = await supabase
      .from('listings')
      .select('slug')
      .eq('category_id', cat.id)
      .order('overall_rating', { ascending: false })
      .limit(5);

    const slugs = (listings || []).map((l: any) => l.slug);
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        params.push({ slug1: slugs[i], slug2: slugs[j] });
      }
    }
  }

  return params;
}

export default async function HeadToHeadPage({ params }: ComparePageProps) {
  const { slug1, slug2 } = await params;
  const [listingA, listingB] = await Promise.all([getListing(slug1), getListing(slug2)]);

  if (!listingA || !listingB) notFound();

  const [attrsA, attrsB] = await Promise.all([
    getAttributes(listingA.id),
    getAttributes(listingB.id),
  ]);

  const allKeys = Array.from(new Set(attrsA.map(a => a.attribute_key).concat(attrsB.map(a => a.attribute_key))));
  const attrMapA = Object.fromEntries(attrsA.map(a => [a.attribute_key, a.attribute_value]));
  const attrMapB = Object.fromEntries(attrsB.map(a => [a.attribute_key, a.attribute_value]));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${listingA.name} vs ${listingB.name}`,
    numberOfItems: 2,
    itemListElement: [
      { '@type': 'ListItem', position: 1, item: { '@type': 'Product', name: listingA.name } },
      { '@type': 'ListItem', position: 2, item: { '@type': 'Product', name: listingB.name } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col">
        <div className="border-b">
          <div className="container mx-auto px-4 py-3">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Comparisons
            </Link>
          </div>
        </div>

        <section className="border-b">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-center mb-8">{listingA.name} vs {listingB.name}</h1>
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[listingA, listingB].map((listing) => (
                <div key={listing.id} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted mb-3">
                    {listing.logo_url ? (
                      <img src={listing.logo_url} alt={listing.name} className="h-12 w-12 object-contain" />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">{listing.name[0]}</span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold">{listing.name}</h2>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold">{listing.overall_rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({listing.review_count.toLocaleString()})</span>
                  </div>
                  {listing.category && (
                    <Badge variant="secondary" className="mt-2 text-xs">{listing.category.name}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          {/* Comparison Table */}
          <Card className="mb-8">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground w-1/3">Feature</th>
                      <th className="px-4 py-3 text-center font-medium">{listingA.name}</th>
                      <th className="px-4 py-3 text-center font-medium">{listingB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">Overall Rating</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${listingA.overall_rating >= listingB.overall_rating ? 'text-success' : ''}`}>
                          {listingA.overall_rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${listingB.overall_rating >= listingA.overall_rating ? 'text-success' : ''}`}>
                          {listingB.overall_rating.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">Reviews</td>
                      <td className="px-4 py-3 text-center">{listingA.review_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{listingB.review_count.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">Price</td>
                      <td className="px-4 py-3 text-center">{listingA.pricing_type === 'free' ? 'Free' : listingA.starting_price || '-'}</td>
                      <td className="px-4 py-3 text-center">{listingB.pricing_type === 'free' ? 'Free' : listingB.starting_price || '-'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">Verified</td>
                      <td className="px-4 py-3 text-center">{listingA.is_verified ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                      <td className="px-4 py-3 text-center">{listingB.is_verified ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">Commission</td>
                      <td className="px-4 py-3 text-center text-success text-xs">{listingA.affiliate_commission || '-'}</td>
                      <td className="px-4 py-3 text-center text-success text-xs">{listingB.affiliate_commission || '-'}</td>
                    </tr>
                    {allKeys.map((key) => (
                      <tr key={key} className="border-b">
                        <td className="px-4 py-3 text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-center">
                          {attrMapA[key] === 'true' ? <Check className="h-4 w-4 text-success mx-auto" /> :
                           attrMapA[key] === 'false' ? <X className="h-4 w-4 text-muted-foreground mx-auto" /> :
                           attrMapA[key] || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {attrMapB[key] === 'true' ? <Check className="h-4 w-4 text-success mx-auto" /> :
                           attrMapB[key] === 'false' ? <X className="h-4 w-4 text-muted-foreground mx-auto" /> :
                           attrMapB[key] || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pros & Cons */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {[listingA, listingB].map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4">{listing.name}</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ThumbsUp className="h-3.5 w-3.5 text-success" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pros</span>
                      </div>
                      <ul className="space-y-1.5">
                        {listing.pros?.slice(0, 4).map((pro: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cons</span>
                      </div>
                      <ul className="space-y-1.5">
                        {listing.cons?.slice(0, 4).map((con: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTAs */}
          <div className="grid gap-4 md:grid-cols-2">
            {[listingA, listingB].map((listing) => (
              <Button key={listing.id} className="w-full" asChild>
                <a href={listing.affiliate_url || listing.website_url || '#'} target="_blank" rel="noopener noreferrer nofollow">
                  Visit {listing.name} <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
