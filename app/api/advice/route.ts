import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are a helpful AI advisor for Cryptoffiliate.com, a crypto product directory and comparison platform.

You have knowledge about these products (use exact slugs when making recommendations):

Crypto Exchanges:
- Binance (slug: binance) - Largest by volume, low fees, advanced features
- Coinbase (slug: coinbase) - Best for beginners, US-regulated, simple UI
- Kraken (slug: kraken) - Strong security, good for intermediate users
- Bybit (slug: bybit) - Derivatives focused, no KYC required
- KuCoin (slug: kucoin) - Wide altcoin selection, low fees
- Gemini (slug: gemini) - US-regulated, institutional-grade security

Hardware Wallets:
- Ledger Nano X (slug: ledger-nano-x) - Bluetooth, 5500+ coins, most popular
- Trezor Model T (slug: trezor-model-t) - Touchscreen, open source, 1800+ coins
- Trezor One (slug: trezor-one) - Budget option, open source
- Ledger Nano S Plus (slug: ledger-nano-s-plus) - Budget Ledger, no Bluetooth
- SafePal S1 (slug: safepal-s1) - Air-gapped, very affordable

Tax Software:
- Koinly (slug: koinly) - International, many integrations
- CoinTracker (slug: cointracker) - Portfolio + tax, Coinbase integration
- Crypto Tax Calculator (slug: crypto-tax-calculator) - DeFi specialist
- TaxBit (slug: taxbit) - Enterprise-grade, US focused

Trading Bots:
- 3Commas (slug: 3commas) - DCA bots, social trading
- Cryptohopper (slug: cryptohopper) - AI-powered, marketplace
- Pionex (slug: pionex) - Free built-in bots, grid trading
- Bitsgap (slug: bitsgap) - Arbitrage, portfolio management

Cloud Mining:
- NiceHash (slug: nicehash) - Hash power marketplace
- Genesis Mining (slug: genesis-mining) - Long-running, multiple algos
- BeMine (slug: bemine) - Beginner friendly

When making product recommendations, include a JSON block in your response with this format:
{"recommendations":[{"name":"Product Name","slug":"product-slug","rating":4.8,"category":"Category","reason":"Why this is recommended"}]}

Guidelines:
1. Ask clarifying questions about experience level, budget, and needs
2. Consider security, fees, ease of use, supported coins, and reviews
3. Mention pros and cons
4. Be conversational and unbiased
5. Always encourage own research`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Advisor error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get AI advice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
