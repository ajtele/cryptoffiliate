import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are a crypto product advisor helping users build their complete crypto stack. Based on their answers, recommend ONE product per requested category.

You have access to these products (use exact slugs):

Crypto Exchanges:
- Binance (binance) - Largest by volume, low fees
- Coinbase (coinbase) - Best for beginners, US-regulated
- Kraken (kraken) - Strong security
- Bybit (bybit) - Derivatives, no KYC option
- KuCoin (kucoin) - Wide altcoin selection
- Gemini (gemini) - US-regulated, institutional security

Hardware Wallets:
- Ledger Nano X (ledger-nano-x) - Bluetooth, most popular
- Trezor Model T (trezor-model-t) - Touchscreen, open source
- Trezor One (trezor-one) - Budget option
- Ledger Nano S Plus (ledger-nano-s-plus) - Budget Ledger
- SafePal S1 (safepal-s1) - Air-gapped, affordable

Tax Software:
- Koinly (koinly) - International, many integrations
- CoinTracker (cointracker) - Portfolio + tax
- Crypto Tax Calculator (crypto-tax-calculator) - DeFi specialist
- TaxBit (taxbit) - Enterprise-grade, US focused

Trading Bots:
- 3Commas (3commas) - DCA bots, social trading
- Cryptohopper (cryptohopper) - AI-powered
- Pionex (pionex) - Free built-in bots
- Bitsgap (bitsgap) - Arbitrage

Cloud Mining:
- NiceHash (nicehash) - Hash power marketplace
- Genesis Mining (genesis-mining) - Multiple algos

Security Tools:
- Ledger Recover (ledger-recover) - Key recovery
- Fireblocks (fireblocks) - Institutional custody

Return a JSON object with recommendations. For each requested category, include:
- name: exact product name
- slug: exact slug from list above
- category: category name
- reason: 1-2 sentences why this product fits their needs

Example response format:
{
  "exchange": { "name": "Coinbase", "slug": "coinbase", "category": "Crypto Exchanges", "reason": "Best for beginners with an easy interface and US regulation for security." },
  "wallet": { "name": "Ledger Nano X", "slug": "ledger-nano-x", "category": "Hardware Wallets", "reason": "Bluetooth connectivity and 5500+ coin support for a growing portfolio." }
}

Only include categories the user requested. Be concise and specific in your reasoning. Match products to user's experience level, portfolio size, priorities, and location.`;

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    // Get all listings for context
    const { data: listings } = await supabase
      .from('listings')
      .select('slug, name, overall_rating, category:categories(name)')
      .order('overall_rating', { ascending: false });

    const listingsContext = (listings || [])
      .map((l: any) => `${l.name} (${l.slug}) - ${l.category?.name || 'Unknown'}`)
      .join('\n');

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userPrompt = `User's answers:
- Experience: ${answers.experience || 'Not specified'}
- Portfolio size: ${answers.portfolio || 'Not specified'}
- Priorities: ${answers.priorities || 'Not specified'}
- Location: ${answers.location || 'Not specified'}
- Products needed: ${(answers.needs || []).join(', ') || 'Not specified'}

Available products in our database:
${listingsContext}

Based on their needs, recommend ONE product per requested category.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract JSON from response
    const textContent = response.content
      .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
      .map((c) => c.text)
      .join('');

    // Find JSON object in response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const recommendations = JSON.parse(jsonMatch[0]);

    // Generate session token
    const sessionToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    // Save session
    await supabase.from('advisor_sessions').insert({
      session_token: sessionToken,
      answers: answers,
      recommended_stack: recommendations,
    });

    return NextResponse.json({ sessionToken, recommendations });
  } catch (error) {
    console.error('Stack advisor error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
