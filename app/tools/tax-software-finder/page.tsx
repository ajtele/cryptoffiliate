'use client';

import * as React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Receipt, ArrowRight, Star, ExternalLink, Check, Sparkles, CircleHelp as HelpCircle } from 'lucide-react';
import type { Listing } from '@/lib/supabase';

interface TaxSoftware extends Listing {
  tx_capacity: string;
  defi_support: boolean;
  nft_support: boolean;
  jurisdictions: string;
}

const questions = [
  {
    id: 'transactions',
    title: 'How many transactions do you have per year?',
    options: [
      { value: '100', label: 'Less than 100' },
      { value: '1000', label: '100 - 1,000' },
      { value: '5000', label: '1,000 - 5,000' },
      { value: '10000', label: '5,000 - 10,000' },
      { value: 'unlimited', label: '10,000+' },
    ],
  },
  {
    id: 'activity',
    title: 'What type of crypto activity do you have?',
    options: [
      { value: 'basic', label: 'Just buying and selling' },
      { value: 'defi', label: 'DeFi (staking, lending, yield farming)' },
      { value: 'nft', label: 'NFT trading' },
      { value: 'all', label: 'Mix of everything' },
    ],
  },
  {
    id: 'jurisdiction',
    title: 'Where do you need to file taxes?',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'eu', label: 'European Union' },
      { value: 'other', label: 'Other / Multiple countries' },
    ],
  },
];

export default function TaxSoftwareFinderPage() {
  const [allSoftware, setAllSoftware] = React.useState<TaxSoftware[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [showResults, setShowResults] = React.useState(false);

  React.useEffect(() => {
    fetchTaxSoftware();
  }, []);

  const fetchTaxSoftware = async () => {
    const { data: listings } = await supabase
      .from('listings')
      .select('*, category:categories(*)')
      .eq('category_id', 3);

    if (!listings) {
      setLoading(false);
      return;
    }

    const { data: attrs } = await supabase
      .from('listing_attributes')
      .select('listing_id, attribute_key, attribute_value')
      .in('listing_id', listings.map((l) => l.id));

    const attrMap: Record<string, Record<string, string>> = {};
    (attrs || []).forEach((a) => {
      if (!attrMap[a.listing_id]) attrMap[a.listing_id] = {};
      attrMap[a.listing_id][a.attribute_key] = a.attribute_value;
    });

    const software: TaxSoftware[] = listings.map((l) => ({
      ...l,
      tx_capacity: attrMap[l.id]?.tx_capacity || 'Unknown',
      defi_support: attrMap[l.id]?.defi_support === 'true',
      nft_support: attrMap[l.id]?.nft_support === 'true',
      jurisdictions: attrMap[l.id]?.jurisdictions || 'Unknown',
    }));

    setAllSoftware(software);
    setLoading(false);
  };

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [questions[currentStep].id]: value }));
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const restart = () => {
    setAnswers({});
    setCurrentStep(0);
    setShowResults(false);
  };

  const getScore = (software: TaxSoftware): number => {
    let score = software.overall_rating * 20;

    // Transaction capacity score
    const txAnswer = answers.transactions;
    if (txAnswer === 'unlimited' || (txAnswer && parseInt(txAnswer) >= 5000)) {
      if (software.tx_capacity === 'Unlimited') score += 20;
      else if (software.tx_capacity !== 'Unknown') score += 5;
    } else if (txAnswer && parseInt(txAnswer) < 5000) {
      const capacity = software.tx_capacity === 'Unlimited' ? Infinity : parseInt(software.tx_capacity) || 0;
      if (capacity >= parseInt(txAnswer)) score += 15;
    }

    // Activity support score
    const activity = answers.activity;
    if (activity === 'defi' || activity === 'all') {
      if (software.defi_support) score += 15;
    }
    if (activity === 'nft' || activity === 'all') {
      if (software.nft_support) score += 15;
    }

    // Jurisdiction match
    const jurisdiction = answers.jurisdiction;
    if (jurisdiction && software.jurisdictions.toLowerCase().includes(jurisdiction.toLowerCase())) {
      score += 10;
    }
    if (software.jurisdictions.toLowerCase().includes('global')) {
      score += 5;
    }

    return score;
  };

  const rankedResults = showResults
    ? [...allSoftware]
        .map((s) => ({ ...s, score: getScore(s) }))
        .sort((a, b) => b.score - a.score)
    : [];

  if (loading) {
    return (
      <div className="flex flex-col">
        <section className="border-b">
          <div className="container mx-auto px-4 py-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <h1 className="mb-2">Tax Software Finder</h1>
            </div>
          </div>
        </section>
        <section className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading tax software options...</p>
        </section>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex flex-col">
        <section className="border-b">
          <div className="container mx-auto px-4 py-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h1 className="mb-2">Your Tax Software Matches</h1>
              <p className="text-sm text-muted-foreground">
                Based on your trading activity and needs, here are the best matches.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-4">
            {rankedResults.map((software, i) => (
              <Card key={software.id} className={i === 0 ? 'border-primary/30 bg-primary/5' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {software.logo_url ? (
                        <img src={software.logo_url} alt={software.name} className="h-9 w-9 object-contain" />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">{software.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/listing/${software.slug}`} className="font-semibold hover:text-primary transition-colors">
                          {software.name}
                        </Link>
                        {i === 0 && (
                          <Badge className="bg-primary/10 text-primary">Best Match</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {Math.round(software.score)}% match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          {software.overall_rating.toFixed(1)}
                        </div>
                        <span>Up to {software.tx_capacity} transactions</span>
                        {software.defi_support && (
                          <Badge variant="secondary" className="text-[10px]">DeFi</Badge>
                        )}
                        {software.nft_support && (
                          <Badge variant="secondary" className="text-[10px]">NFT</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Regions: {software.jurisdictions}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col gap-2 items-end">
                      <div className="text-sm font-medium text-right">
                        {software.pricing_type === 'free' ? 'Free' : software.starting_price || 'See pricing'}
                      </div>
                      <Button size="sm" className="text-xs" asChild>
                        <a
                          href={software.affiliate_url || software.website_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                        >
                          Get Started <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="pt-6 text-center">
              <Button variant="outline" onClick={restart}>
                Start Over
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <h1 className="mb-2">Tax Software Finder</h1>
            <p className="text-sm text-muted-foreground">
              Answer a few questions to find the best crypto tax software for your needs.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-6">
                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <h2 className="text-lg font-semibold">{currentQuestion.title}</h2>
              </div>

              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option.value
                        ? 'bg-accent border-primary/50'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleAnswer(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1 text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                {currentStep === questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={!answers[currentQuestion.id]}>
                    See Results <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Quick answers summary */}
          {Object.keys(answers).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(answers).map(([key, value]) => {
                const question = questions.find((q) => q.id === key);
                const option = question?.options.find((o) => o.value === value);
                return (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {option?.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
