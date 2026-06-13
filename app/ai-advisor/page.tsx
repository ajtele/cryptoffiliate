'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, User, Bot, Loader as Loader2, ArrowRight, Star, ExternalLink, Layers } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Recommendation {
  name: string;
  slug?: string;
  rating?: number;
  reason?: string;
  category?: string;
}

const suggestionPrompts = [
  "What's the best exchange for beginners?",
  'Recommend a hardware wallet under $100',
  'Compare Koinly vs CoinTracker',
  'Best bot for grid trading',
];

function tryParseRecommendations(content: string): Recommendation[] | null {
  try {
    const jsonMatch = content.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
      return parsed.recommendations;
    }
  } catch {}
  return null;
}

function RecommendationCards({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="space-y-2 mt-2">
      {recommendations.map((rec, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{rec.name}</span>
              {rec.rating && (
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-medium">{rec.rating}</span>
                </div>
              )}
              {rec.category && (
                <Badge variant="secondary" className="text-[10px] h-4">{rec.category}</Badge>
              )}
            </div>
            {rec.reason && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rec.reason}</p>
            )}
            {rec.slug && (
              <Link
                href={`/listing/${rec.slug}`}
                className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
              >
                View details <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your crypto product advisor. I can help you find the best exchanges, hardware wallets, tax software, trading bots, and more. What are you looking for?",
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let assistantMessage = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage += parsed.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage };
                  return newMessages;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I encountered an error. Please try again or browse our categories directly.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-3 inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="mb-2">AI Product Advisor</h1>
            <p className="text-sm text-muted-foreground">
              Get personalized crypto product recommendations. Describe your needs and experience level.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="flex flex-col h-[560px]">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, i) => {
                    const recs = message.role === 'assistant' ? tryParseRecommendations(message.content) : null;
                    const textContent = recs
                      ? message.content.replace(/\{[\s\S]*"recommendations"[\s\S]*\}/, '').trim()
                      : message.content;

                    return (
                      <div key={i} className={cn('flex gap-2.5', message.role === 'user' && 'justify-end')}>
                        {message.role === 'assistant' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                            <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        )}
                        <div className={cn('max-w-[80%]', message.role === 'user' ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3.5 py-2' : '')}>
                          {message.role === 'assistant' ? (
                            <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2">
                              {textContent && <p className="text-sm whitespace-pre-wrap">{textContent}</p>}
                              {recs && <RecommendationCards recommendations={recs} />}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        {message.role === 'user' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl px-3.5 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {messages.length === 1 && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestionPrompts.map((s) => (
                      <Button key={s} variant="outline" size="sm" onClick={() => setInput(s)} className="text-xs h-7">
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t p-3">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    placeholder="Ask about crypto products..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 h-9"
                  />
                  <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="h-9">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold mb-3">How It Works</h4>
                <ol className="space-y-2.5 text-sm text-muted-foreground">
                  {['Describe your needs or ask a question', 'Get personalized product recommendations', 'Compare options and read detailed reviews'].map((step, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-xs leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">Build Your Stack</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Answer a few questions and get a complete product recommendation for every category.
                </p>
                <Button variant="default" size="sm" className="w-full text-xs" asChild>
                  <Link href="/ai-advisor/stack-builder">
                    Build My Stack <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h4 className="text-sm font-semibold mb-2">Prefer to browse?</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Explore product categories and rankings at your own pace.
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                  <Link href="/rankings">View Rankings <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
