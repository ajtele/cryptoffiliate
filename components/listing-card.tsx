import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Check, ExternalLink, Tag } from 'lucide-react';
import type { Listing, Category } from '@/lib/supabase';

interface ListingCardProps {
  listing: Listing;
  category?: Category;
  showCategory?: boolean;
  rank?: number;
  hasActiveDeal?: boolean;
}

export function ListingCard({ listing, category, showCategory = false, rank, hasActiveDeal }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.slug}`}>
      <Card className="card-hover h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {rank && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {rank}
              </div>
            )}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              {listing.logo_url ? (
                <img
                  src={listing.logo_url}
                  alt={listing.name}
                  className="h-9 w-9 object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">
                  {listing.name[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{listing.name}</h3>
                {listing.is_verified && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </div>
              {listing.tagline && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {listing.tagline}
                </p>
              )}
            </div>
          </div>

          {listing.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-semibold">{listing.overall_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({listing.review_count.toLocaleString()})
                </span>
              </div>
              {listing.starting_price && (
                <span className="text-xs text-muted-foreground">
                  {listing.pricing_type === 'free' ? 'Free' : `From ${listing.starting_price}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveDeal && (
                <Badge className="text-[10px] h-5 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                  <Tag className="h-2.5 w-2.5" />
                  Deal
                </Badge>
              )}
              {showCategory && category && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {category.name}
                </Badge>
              )}
              {listing.is_featured && (
                <Badge className="text-[10px] h-5 bg-primary/10 text-primary hover:bg-primary/20">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface ListingCardCompactProps {
  listing: Listing;
  category?: Category;
  rank?: number;
}

export function ListingCardCompact({ listing, category, rank }: ListingCardCompactProps) {
  return (
    <Link href={`/listing/${listing.slug}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group">
        {rank && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {rank}
          </div>
        )}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          {listing.logo_url ? (
            <img src={listing.logo_url} alt={listing.name} className="h-7 w-7 object-contain" />
          ) : (
            <span className="text-sm font-bold text-muted-foreground">{listing.name[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {listing.name}
            </span>
            {listing.is_verified && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span>{listing.overall_rating.toFixed(1)}</span>
            </div>
            {category && <span>{category.name}</span>}
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
