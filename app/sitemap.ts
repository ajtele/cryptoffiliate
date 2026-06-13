import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptoffiliate.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/rankings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/ai-advisor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const { data: categories } = await supabase.from('categories').select('slug');
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const { data: listings } = await supabase.from('listings').select('slug, updated_at');
  const listingPages: MetadataRoute.Sitemap = (listings || []).map((listing) => ({
    url: `${baseUrl}/listing/${listing.slug}`,
    lastModified: new Date(listing.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const { data: attrs } = await supabase
    .from('listing_attributes')
    .select('attribute_key')
    .eq('attribute_type', 'boolean');
  const uniqueKeys = Array.from(new Set((attrs || []).map((a) => a.attribute_key)));
  const filterPages: MetadataRoute.Sitemap = [];
  for (const cat of categories || []) {
    for (const key of uniqueKeys) {
      filterPages.push({
        url: `${baseUrl}/category/${cat.slug}/filter/${key.replace(/_/g, '-')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  const comparePages: MetadataRoute.Sitemap = [];
  if (listings && listings.length > 1) {
    const { data: cats } = await supabase.from('categories').select('id');
    for (const cat of cats || []) {
      const { data: catListings } = await supabase
        .from('listings')
        .select('slug')
        .eq('category_id', cat.id)
        .order('overall_rating', { ascending: false })
        .limit(5);
      const slugs = (catListings || []).map((l) => l.slug);
      for (let i = 0; i < slugs.length; i++) {
        for (let j = i + 1; j < slugs.length; j++) {
          comparePages.push({
            url: `${baseUrl}/compare/${slugs[i]}/${slugs[j]}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
          });
        }
      }
    }
  }

  return [...staticPages, ...categoryPages, ...listingPages, ...filterPages, ...comparePages];
}
