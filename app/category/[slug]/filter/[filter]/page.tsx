import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ListingCard } from '@/components/listing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

interface FilterPageProps {
  params: Promise<{ slug: string; filter: string }>;
}

function filterToAttrKey(filter: string): string {
  return filter.replace(/-/g, '_');
}

function filterToTitle(filter: string): string {
  const parts = filter.split('-');
  if (parts[0] === 'no') {
    return `No ${parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
  }
  return parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function getCategory(slug: string) {
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).single();
  return data;
}

async function getFilteredListings(categorySlug: string, filter: string) {
  const category = await getCategory(categorySlug);
  if (!category) return { category: null, listings: [] };

  const attrKey = filterToAttrKey(filter);
  const isNegative = filter.startsWith('no-');
  const actualKey = isNegative ? filterToAttrKey(filter.replace('no-', '')) : attrKey;
  const expectedValue = isNegative ? 'false' : 'true';

  const { data: matchingAttrs } = await supabase
    .from('listing_attributes')
    .select('listing_id')
    .eq('attribute_key', actualKey)
    .eq('attribute_value', expectedValue);

  const listingIds = (matchingAttrs || []).map((a: any) => a.listing_id);

  if (listingIds.length === 0) {
    return { category, listings: [] };
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*, category:categories(*)')
    .eq('category_id', category.id)
    .in('id', listingIds)
    .order('overall_rating', { ascending: false });

  return { category, listings: listings || [] };
}

export async function generateMetadata({ params }: FilterPageProps): Promise<Metadata> {
  const { slug, filter } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Not Found' };

  const title = filterToTitle(filter);
  return {
    title: `Best ${category.name} with ${title} ${new Date().getFullYear()} | Cryptoffiliate`,
    description: `Compare the best ${category.name.toLowerCase()} that offer ${title.toLowerCase()}. Expert reviews and ratings to help you choose.`,
    openGraph: {
      title: `Best ${category.name} - ${title}`,
      description: `Compare ${category.name.toLowerCase()} with ${title.toLowerCase()}.`,
    },
  };
}

export async function generateStaticParams() {
  const { data: categories } = await supabase.from('categories').select('slug');
  const { data: attrs } = await supabase
    .from('listing_attributes')
    .select('attribute_key')
    .eq('attribute_type', 'boolean');

  const uniqueKeys = Array.from(new Set((attrs || []).map((a: any) => a.attribute_key)));
  const params: { slug: string; filter: string }[] = [];

  for (const cat of categories || []) {
    for (const key of uniqueKeys) {
      params.push({ slug: cat.slug, filter: key.replace(/_/g, '-') });
    }
  }

  return params;
}

export default async function FilterPage({ params }: FilterPageProps) {
  const { slug, filter } = await params;
  const { category, listings } = await getFilteredListings(slug, filter);

  if (!category) notFound();

  const title = filterToTitle(filter);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${category.name} with ${title}`,
    description: `Top ${category.name.toLowerCase()} that offer ${title.toLowerCase()}.`,
    numberOfItems: listings.length,
    itemListElement: listings.map((listing: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: listing.name,
        url: `/listing/${listing.slug}`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: listing.overall_rating,
          reviewCount: listing.review_count,
        },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col">
        <section className="border-b">
          <div className="container mx-auto px-4 py-10">
            <Link
              href={`/category/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All {category.name}
            </Link>
            <h1 className="mb-2">
              Best {category.name} with {title}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              We've filtered the top {category.name.toLowerCase()} that offer {title.toLowerCase()}.
              Compare features, pricing, and ratings to find the right fit.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No products found matching this filter.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/category/${slug}`}>
                  View all {category.name}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {listings.length} product{listings.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing: any, index: number) => (
                  <ListingCard key={listing.id} listing={listing} rank={index + 1} />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/compare?category=${slug}`}>
                    Compare these products <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
