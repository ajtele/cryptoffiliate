'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star, Check, Loader as Loader2 } from 'lucide-react';
import type { Listing, Category } from '@/lib/supabase';

interface SearchResult extends Listing {
  category: Category | null;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = React.useState(query);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  React.useEffect(() => {
    if (query) performSearch(query);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);

    const { data } = await supabase
      .from('listings')
      .select('*, category:categories(*)')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tagline.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
      .order('overall_rating', { ascending: false })
      .limit(20);

    setResults(data || []);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-xl">
            <h1 className="text-center mb-5">Search Products</h1>
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search exchanges, wallets, affiliate programs..."
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasSearched ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for exchanges, wallets, affiliate programs, or trading bots.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <Link key={result.id} href={`/listing/${result.slug}`}>
                    <Card className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            {result.logo_url ? (
                              <img src={result.logo_url} alt={result.name} className="h-8 w-8 object-contain" />
                            ) : (
                              <span className="text-sm font-bold text-muted-foreground">{result.name[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{result.name}</span>
                              {result.is_verified && <Check className="h-3.5 w-3.5 text-primary" />}
                            </div>
                            {result.tagline && (
                              <p className="text-xs text-muted-foreground truncate">{result.tagline}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                              <span className="text-sm font-semibold">{result.overall_rating.toFixed(1)}</span>
                            </div>
                            {result.category && (
                              <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">{result.category.name}</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold mb-1">Search for crypto products</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Find exchanges, hardware wallets, affiliate programs, trading bots, and more.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
