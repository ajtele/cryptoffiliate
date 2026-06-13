import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Layers, Share2, ArrowLeft, Check } from 'lucide-react';
import type { Metadata } from 'next';

interface StackPageProps {
  params: Promise<{ token: string }>;
}

interface Recommendation {
  name: string;
  slug: string;
  category: string;
  reason: string;
}

async function getSession(token: string) {
  const { data } = await supabase
    .from('advisor_sessions')
    .select('*')
    .eq('session_token', token)
    .single();
  return data;
}

async function getListingDetails(slug: string) {
  const { data } = await supabase
    .from('listings')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: StackPageProps): Promise<Metadata> {
  const { token } = await params;
  const session = await getSession(token);
  if (!session) return { title: 'Not Found' };

  return {
    title: 'Your Personalized Crypto Stack | Cryptoffiliate',
    description: 'AI-generated product recommendations for your crypto needs.',
  };
}

const categoryIcons: Record<string, string> = {
  'crypto exchanges': '💱',
  'hardware wallets': '🔐',
  'tax software': '📊',
  'trading bots': '🤖',
  'cloud mining': '☁️',
  'security tools': '🛡️',
};

export default async function StackResultsPage({ params }: StackPageProps) {
  const { token } = await params;
  const session = await getSession(token);

  if (!session) notFound();

  const recommendations = session.recommended_stack as Record<string, Recommendation>;
  const answers = session.answers as Record<string, string | string[]>;

  // Fetch full listing details for each recommendation
  const recommendationEntries = await Promise.all(
    Object.entries(recommendations).map(async ([key, rec]) => {
      const listing = await getListingDetails(rec.slug);
      return { key, rec, listing };
    })
  );

  const shareUrl = `https://cryptoffiliate.com/ai-advisor/stack/${token}`;

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h1 className="mb-2">Your Personalized Crypto Stack</h1>
            <p className="text-sm text-muted-foreground">
              Based on your needs, here are our top product recommendations.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Summary of answers */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground mr-2">Your profile:</span>
                {Object.entries(answers).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return value.map((v) => (
                      <Badge key={`${key}-${v}`} variant="secondary" className="text-[10px]">
                        {v}
                      </Badge>
                    ));
                  }
                  return (
                    <Badge key={key} variant="secondary" className="text-[10px]">
                      {value}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-4">
            {recommendationEntries.map(({ key, rec, listing }) => (
              <Card key={key} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Category indicator */}
                    <div className="w-2 bg-primary/20 shrink-0" />

                    <div className="flex-1 p-5">
                      <div className="flex items-start gap-4">
                        {listing && (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                            {listing.logo_url ? (
                              <img
                                src={listing.logo_url}
                                alt={listing.name}
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              <span className="text-xl font-bold text-muted-foreground">
                                {listing.name[0]}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs text-muted-foreground">
                              {categoryIcons[rec.category.toLowerCase()] || '📦'} {rec.category}
                            </span>
                            {listing && (
                              <>
                                <Badge variant="outline" className="text-[10px]">
                                  Top Pick
                                </Badge>
                                {listing.is_verified && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    <Check className="mr-1 h-2.5 w-2.5" />
                                    Verified
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>

                          <Link
                            href={`/listing/${rec.slug}`}
                            className="text-lg font-semibold hover:text-primary transition-colors"
                          >
                            {rec.name}
                          </Link>

                          {listing && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 mb-2">
                              <div className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-primary text-primary" />
                                <span className="font-medium">{listing.overall_rating.toFixed(1)}</span>
                              </div>
                              <span>({listing.review_count.toLocaleString()} reviews)</span>
                              {listing.starting_price && (
                                <span>
                                  {listing.pricing_type === 'free' ? 'Free' : `From ${listing.starting_price}`}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {rec.reason}
                          </p>
                        </div>

                        <div className="shrink-0 flex flex-col gap-2">
                          {listing && (
                            <Button size="sm" className="text-xs" asChild>
                              <a
                                href={listing.affiliate_url || listing.website_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                              >
                                Visit <ExternalLink className="ml-1.5 h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-xs" asChild>
                            <Link href={`/listing/${rec.slug}`}>Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Share and actions */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Share2 className="h-4 w-4" />
                <span>Share your stack:</span>
                <code className="text-xs bg-muted px-2 py-0.5 rounded">{shareUrl}</code>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/ai-advisor/stack-builder">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Start Over
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/ai-advisor">
                    Chat Advisor
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Additional help */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Need more help?</h3>
                  <p className="text-xs text-muted-foreground">
                    Our AI advisor can answer detailed questions about any of these products.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ai-advisor">Ask Advisor</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
