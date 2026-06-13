'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Layers, ArrowRight, ArrowLeft, CircleHelp as HelpCircle, Loader as Loader2 } from 'lucide-react';

const steps = [
  {
    id: 'experience',
    title: 'What\'s your crypto experience level?',
    description: 'This helps us recommend products with the right complexity.',
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to crypto, just getting started' },
      { value: 'intermediate', label: 'Intermediate', description: 'Trading occasionally, familiar with basics' },
      { value: 'advanced', label: 'Advanced', description: 'Active trader, DeFi user, or developer' },
    ],
  },
  {
    id: 'portfolio',
    title: 'What\'s your approximate portfolio size?',
    description: 'Helps us recommend appropriate security levels.',
    options: [
      { value: 'small', label: 'Under $1,000', description: 'Just starting out' },
      { value: 'medium', label: '$1,000 - $10,000', description: 'Growing portfolio' },
      { value: 'large', label: '$10,000 - $100,000', description: 'Significant holdings' },
      { value: 'whale', label: 'Over $100,000', description: 'Substantial investment' },
    ],
  },
  {
    id: 'priorities',
    title: 'What matters most to you?',
    description: 'We\'ll prioritize products that match your needs.',
    options: [
      { value: 'security', label: 'Maximum Security', description: 'Best protection, even if less convenient' },
      { value: 'fees', label: 'Lowest Fees', description: 'Minimize costs for frequent trading' },
      { value: 'ease', label: 'Ease of Use', description: 'Simple, beginner-friendly interfaces' },
      { value: 'features', label: 'Advanced Features', description: 'Trading tools, DeFi, staking' },
    ],
  },
  {
    id: 'location',
    title: 'Where are you based?',
    description: 'Some products are region-specific or have different features.',
    options: [
      { value: 'us', label: 'United States', description: '' },
      { value: 'eu', label: 'Europe', description: '' },
      { value: 'asia', label: 'Asia-Pacific', description: '' },
      { value: 'other', label: 'Other Region', description: '' },
    ],
  },
  {
    id: 'needs',
    title: 'Which products do you need?',
    description: 'Select all that apply - we\'ll build your complete stack.',
    multiSelect: true,
    options: [
      { value: 'exchange', label: 'Crypto Exchange', description: '' },
      { value: 'wallet', label: 'Hardware Wallet', description: '' },
      { value: 'tax', label: 'Tax Software', description: '' },
      { value: 'security', label: 'Security Tools', description: '' },
      { value: 'bot', label: 'Trading Bot', description: '' },
    ],
  },
];

export default function StackBuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSingleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    // Auto-advance after selecting
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const handleMultiSelect = (value: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[step.id] as string[]) || [];
      if (checked) {
        return { ...prev, [step.id]: [...current, value] };
      } else {
        return { ...prev, [step.id]: current.filter((v) => v !== value) };
      }
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/advisor/stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) throw new Error('Failed to get recommendations');

      const { sessionToken } = await response.json();
      router.push(`/ai-advisor/stack/${sessionToken}`);
    } catch (error) {
      console.error('Error submitting:', error);
      setIsSubmitting(false);
    }
  };

  const canProceed = step.multiSelect
    ? (answers[step.id] as string[])?.length > 0
    : !!answers[step.id];

  return (
    <div className="flex flex-col min-h-[80vh]">
      <section className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl mb-2">Build Your Crypto Stack</h1>
            <p className="text-sm text-muted-foreground">
              Answer a few questions and get personalized product recommendations for each category.
            </p>
          </div>
        </div>
      </section>

      <section className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => i < currentStep && setCurrentStep(i)}
                  className={`text-[10px] transition-colors ${
                    i <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                  disabled={i > currentStep}
                >
                  {s.title.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-6">
                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold mb-1">{step.title}</h2>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>

              {step.multiSelect ? (
                <div className="space-y-3">
                  {step.options.map((option) => {
                    const isSelected = ((answers[step.id] as string[]) || []).includes(option.value);
                    return (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'bg-accent border-primary/50' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => handleMultiSelect(option.value, !isSelected)}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isSelected ? 'bg-primary border-primary' : 'border-input'
                          }`}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <Label className="cursor-pointer flex-1 text-sm">{option.label}</Label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <RadioGroup
                  value={answers[step.id] as string || ''}
                  onValueChange={handleSingleSelect}
                  className="space-y-3"
                >
                  {step.options.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[step.id] === option.value
                          ? 'bg-accent border-primary/50'
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleSingleSelect(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={option.value} className="cursor-pointer text-sm font-medium">
                          {option.label}
                        </Label>
                        {option.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}

              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={!canProceed || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Building...
                      </>
                    ) : (
                      <>
                        Get Recommendations <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick answers summary */}
          {Object.keys(answers).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(answers).map(([key, value]) => {
                const stepData = steps.find((s) => s.id === key);
                if (Array.isArray(value)) {
                  return value.map((v) => {
                    const option = stepData?.options.find((o) => o.value === v);
                    return (
                      <Badge key={`${key}-${v}`} variant="secondary" className="text-xs">
                        {option?.label}
                      </Badge>
                    );
                  });
                }
                const option = stepData?.options.find((o) => o.value === value);
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
