'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Star, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

interface Exchange {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  overall_rating: number;
  affiliate_url: string | null;
  website_url: string | null;
  taker_fee: number;
  maker_fee: number;
}

const volumeRanges = [
  { label: '$1,000/mo', value: 1000 },
  { label: '$5,000/mo', value: 5000 },
  { label: '$10,000/mo', value: 10000 },
  { label: '$25,000/mo', value: 25000 },
  { label: '$50,000/mo', value: 50000 },
  { label: '$100,000/mo', value: 100000 },
];

export default function FeeCalculatorPage() {
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get('exchange');
  const [exchanges, setExchanges] = React.useState<Exchange[]>([]);
  const [monthlyVolume, setMonthlyVolume] = React.useState(10000);
  const [selectedExchanges, setSelectedExchanges] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchExchangeFees();
  }, []);

  const fetchExchangeFees = async () => {
    const { data: listings } = await supabase
      .from('listings')
      .select('id, slug, name, logo_url, overall_rating, affiliate_url, website_url')
      .eq('category_id', 1);

    if (!listings) {
      setLoading(false);
      return;
    }

    const { data: fees } = await supabase
      .from('listing_attributes')
      .select('listing_id, attribute_key, attribute_value')
      .in('listing_id', listings.map((l) => l.id))
      .in('attribute_key', ['taker_fee', 'maker_fee']);

    const feeMap: Record<string, { taker?: number; maker?: number }> = {};
    (fees || []).forEach((f) => {
      if (!feeMap[f.listing_id]) feeMap[f.listing_id] = {};
      feeMap[f.listing_id][f.attribute_key as 'taker' | 'maker'] = parseFloat(f.attribute_value) || 0;
    });

    const exchangeData: Exchange[] = listings
      .filter((l) => feeMap[l.id]?.taker && feeMap[l.id]?.maker)
      .map((l) => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        logo_url: l.logo_url,
        overall_rating: l.overall_rating,
        affiliate_url: l.affiliate_url,
        website_url: l.website_url,
        taker_fee: feeMap[l.id]?.taker || 0,
        maker_fee: feeMap[l.id]?.maker || 0,
      }))
      .sort((a, b) => a.taker_fee - b.taker_fee);

    setExchanges(exchangeData);

    // Pre-select exchange from query param
    if (preselectedSlug) {
      const preselected = exchangeData.find((e) => e.slug === preselectedSlug);
      if (preselected) {
        setSelectedExchanges([preselected.id]);
        // Also select the next 2 lowest-fee exchanges for comparison
        const others = exchangeData.filter((e) => e.id !== preselected.id).slice(0, 2);
        setSelectedExchanges((prev) => [...prev, ...others.map((e) => e.id)]);
      }
    }

    setLoading(false);
  };

  const toggleExchange = (id: string) => {
    setSelectedExchanges((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedExchanges(exchanges.map((e) => e.id));
  };

  const clearAll = () => {
    setSelectedExchanges([]);
  };

  const calculateMonthlyFees = (exchange: Exchange) => {
    const avgFeeRate = (exchange.taker_fee + exchange.maker_fee) / 2;
    const monthlyFee = (monthlyVolume * avgFeeRate) / 100;
    return monthlyFee;
  };

  const selectedData = exchanges
    .filter((e) => selectedExchanges.includes(e.id))
    .map((e) => ({
      ...e,
      monthlyFee: calculateMonthlyFees(e),
    }))
    .sort((a, b) => a.monthlyFee - b.monthlyFee);

  const cheapest = selectedData[0];
  const potentialSavings = selectedData.length > 1
    ? selectedData[selectedData.length - 1].monthlyFee - selectedData[0].monthlyFee
    : 0;

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <h1 className="mb-2">Exchange Fee Calculator</h1>
            <p className="text-sm text-muted-foreground">
              Compare trading fees across exchanges and see how much you could save.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calculator Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Monthly Trading Volume</Label>
                    <span className="text-sm font-bold text-primary">
                      ${monthlyVolume.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[volumeRanges.findIndex((v) => v.value === monthlyVolume)]}
                    onValueChange={(v) => {
                      const idx = v[0] || 0;
                      setMonthlyVolume(volumeRanges[idx]?.value || 10000);
                    }}
                    max={volumeRanges.length - 1}
                    step={1}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {volumeRanges.map((v) => (
                      <Badge
                        key={v.value}
                        variant={monthlyVolume === v.value ? 'default' : 'outline'}
                        className="cursor-pointer text-[10px]"
                        onClick={() => setMonthlyVolume(v.value)}
                      >
                        {v.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Select Exchanges</Label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAll}>
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto">
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading exchanges...</p>
                    ) : (
                      exchanges.map((exchange) => (
                        <div
                          key={exchange.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            selectedExchanges.includes(exchange.id)
                              ? 'bg-accent border-primary/50'
                              : 'hover:bg-accent/50'
                          }`}
                          onClick={() => toggleExchange(exchange.id)}
                        >
                          <Checkbox
                            checked={selectedExchanges.includes(exchange.id)}
                            onCheckedChange={() => toggleExchange(exchange.id)}
                          />
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            {exchange.logo_url ? (
                              <img src={exchange.logo_url} alt={exchange.name} className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-muted-foreground">{exchange.name[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{exchange.name}</span>
                            <div className="text-xs text-muted-foreground">
                              Taker: {exchange.taker_fee}% | Maker: {exchange.maker_fee}%
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Need Help Choosing?</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Answer a few questions and let our AI recommend the perfect exchange for your needs.
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                  <Link href="/ai-advisor/stack-builder">
                    Build My Stack <ArrowRight className="ml-1.5 h-3 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {selectedData.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">Select exchanges to compare</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose at least 2 exchanges to see the fee comparison.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Summary Card */}
                {potentialSavings > 0 && (
                  <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
                          <Sparkles className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Potential Monthly Savings</p>
                          <p className="text-2xl font-bold text-success">
                            ${potentialSavings.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by using {cheapest?.name} instead of {selectedData[selectedData.length - 1]?.name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comparison Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Exchange</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Taker Fee</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Maker Fee</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Monthly Fee</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground w-24"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedData.map((exchange, i) => (
                            <tr
                              key={exchange.id}
                              className={`border-b last:border-0 ${i === 0 ? 'bg-success/5' : ''}`}
                            >
                              <td className="px-4 py-3">
                                <Link href={`/listing/${exchange.slug}`} className="flex items-center gap-2.5 group">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                    {exchange.logo_url ? (
                                      <img src={exchange.logo_url} alt={exchange.name} className="h-6 w-6 object-contain" />
                                    ) : (
                                      <span className="text-xs font-bold text-muted-foreground">{exchange.name[0]}</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-medium group-hover:text-primary transition-colors">
                                      {exchange.name}
                                    </span>
                                    {i === 0 && (
                                      <Badge className="ml-2 text-[10px] bg-success/10 text-success">
                                        Cheapest
                                      </Badge>
                                    )}
                                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                      <Star className="h-3 w-3 fill-primary text-primary" />
                                      {exchange.overall_rating.toFixed(1)}
                                    </div>
                                  </div>
                                </Link>
                              </td>
                              <td className="px-4 py-3 text-center">{exchange.taker_fee}%</td>
                              <td className="px-4 py-3 text-center">{exchange.maker_fee}%</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-semibold ${i === 0 ? 'text-success' : ''}`}>
                                  ${exchange.monthlyFee.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button size="sm" variant={i === 0 ? 'default' : 'outline'} className="text-xs" asChild>
                                  <a
                                    href={exchange.affiliate_url || exchange.website_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                  >
                                    Visit <ExternalLink className="ml-1 h-3 w-3" />
                                  </a>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground text-center">
                  Fees are estimated based on average maker/taker rates. Actual fees may vary based on volume tier and trading pairs.
                  <br />
                  <Link href="/deals" className="text-primary hover:underline">
                    Check for special promotions and referral bonuses
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
