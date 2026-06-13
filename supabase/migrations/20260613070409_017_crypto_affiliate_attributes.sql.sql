-- Add listing attributes for Crypto Affiliate Programs
INSERT INTO listing_attributes (listing_id, attribute_key, attribute_value) VALUES
-- Binance Affiliate
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'commission_rate', 'Up to 50%'),
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'commission_type', 'revenue_share'),
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'cookie_duration', 'Lifetime'),
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'minimum_payout', '$100'),
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'payment_methods', 'Crypto, Bank transfer'),
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'sub_affiliate_program', 'true'),
((SELECT id FROM listings WHERE slug='binance-affiliate'), 'marketing_materials_provided', 'true'),

-- Coinbase Affiliate
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'commission_rate', 'Up to 50% of fees'),
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'commission_type', 'revenue_share'),
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'cookie_duration', '30 days'),
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'minimum_payout', '$50'),
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'payment_methods', 'Bank transfer, PayPal'),
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'sub_affiliate_program', 'false'),
((SELECT id FROM listings WHERE slug='coinbase-affiliate'), 'marketing_materials_provided', 'true'),

-- Kraken Affiliate
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'commission_rate', 'Up to 50%'),
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'commission_type', 'revenue_share'),
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'cookie_duration', '90 days'),
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'minimum_payout', '$100'),
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'payment_methods', 'Crypto, Bank transfer'),
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'sub_affiliate_program', 'false'),
((SELECT id FROM listings WHERE slug='kraken-affiliate'), 'marketing_materials_provided', 'true'),

-- Bybit Affiliate
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'commission_rate', 'Up to 50%'),
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'commission_type', 'revenue_share'),
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'cookie_duration', '90 days'),
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'minimum_payout', '$50'),
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'payment_methods', 'Crypto'),
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'payout_frequency', 'Weekly'),
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'sub_affiliate_program', 'true'),
((SELECT id FROM listings WHERE slug='bybit-affiliate'), 'marketing_materials_provided', 'true'),

-- KuCoin Affiliate
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'commission_rate', 'Up to 50%'),
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'commission_type', 'revenue_share'),
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'cookie_duration', '60 days'),
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'minimum_payout', '$50'),
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'payment_methods', 'Crypto'),
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'sub_affiliate_program', 'true'),
((SELECT id FROM listings WHERE slug='kucoin-affiliate'), 'marketing_materials_provided', 'true'),

-- Ledger Affiliate
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'commission_rate', 'Up to 15%'),
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'commission_type', 'CPA'),
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'cookie_duration', '30 days'),
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'minimum_payout', '$100'),
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'payment_methods', 'Bank transfer, PayPal'),
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'sub_affiliate_program', 'false'),
((SELECT id FROM listings WHERE slug='ledger-affiliate'), 'marketing_materials_provided', 'true'),

-- Trezor Affiliate
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'commission_rate', 'Up to 12%'),
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'commission_type', 'CPA'),
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'cookie_duration', '30 days'),
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'minimum_payout', '$50'),
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'payment_methods', 'Crypto, Bank transfer'),
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'sub_affiliate_program', 'false'),
((SELECT id FROM listings WHERE slug='trezor-affiliate'), 'marketing_materials_provided', 'true'),

-- Koinly Affiliate
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'commission_rate', '25%'),
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'commission_type', 'revenue_share'),
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'cookie_duration', '90 days'),
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'minimum_payout', '$50'),
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'payment_methods', 'PayPal'),
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'sub_affiliate_program', 'false'),
((SELECT id FROM listings WHERE slug='koinly-affiliate'), 'marketing_materials_provided', 'true'),

-- 3Commas Affiliate
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'commission_rate', 'Up to 30%'),
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'commission_type', 'revenue_share'),
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'cookie_duration', '30 days'),
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'minimum_payout', '$100'),
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'payment_methods', 'Crypto'),
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'sub_affiliate_program', 'false'),
((SELECT id FROM listings WHERE slug='3commas-affiliate'), 'marketing_materials_provided', 'true'),

-- Ledger Referral
((SELECT id FROM listings WHERE slug='ledger-referral'), 'commission_rate', '10%'),
((SELECT id FROM listings WHERE slug='ledger-referral'), 'commission_type', 'CPA'),
((SELECT id FROM listings WHERE slug='ledger-referral'), 'cookie_duration', '7 days'),
((SELECT id FROM listings WHERE slug='ledger-referral'), 'minimum_payout', 'None'),
((SELECT id FROM listings WHERE slug='ledger-referral'), 'payment_methods', 'Bank transfer'),
((SELECT id FROM listings WHERE slug='ledger-referral'), 'payout_frequency', 'Monthly'),
((SELECT id FROM listings WHERE slug='ledger-referral'), 'sub_affiliate_program', 'false'),
((SELECT id FROM listings WHERE slug='ledger-referral'), 'marketing_materials_provided', 'false');