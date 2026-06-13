-- Add fee and feature attributes for calculator tools
-- Exchange fee attributes
INSERT INTO listing_attributes (listing_id, attribute_key, attribute_value, attribute_type) VALUES
-- Binance
((SELECT id FROM listings WHERE slug = 'binance'), 'taker_fee', '0.1', 'number'),
((SELECT id FROM listings WHERE slug = 'binance'), 'maker_fee', '0.1', 'number'),
-- Coinbase
((SELECT id FROM listings WHERE slug = 'coinbase'), 'taker_fee', '0.5', 'number'),
((SELECT id FROM listings WHERE slug = 'coinbase'), 'maker_fee', '0.5', 'number'),
-- Kraken
((SELECT id FROM listings WHERE slug = 'kraken'), 'taker_fee', '0.26', 'number'),
((SELECT id FROM listings WHERE slug = 'kraken'), 'maker_fee', '0.16', 'number'),
-- Bybit
((SELECT id FROM listings WHERE slug = 'bybit'), 'taker_fee', '0.1', 'number'),
((SELECT id FROM listings WHERE slug = 'bybit'), 'maker_fee', '0.1', 'number'),
-- KuCoin
((SELECT id FROM listings WHERE slug = 'kucoin'), 'taker_fee', '0.1', 'number'),
((SELECT id FROM listings WHERE slug = 'kucoin'), 'maker_fee', '0.1', 'number'),
-- Gemini
((SELECT id FROM listings WHERE slug = 'gemini'), 'taker_fee', '0.25', 'number'),
((SELECT id FROM listings WHERE slug = 'gemini'), 'maker_fee', '0.15', 'number');

-- Tax software features for finder
INSERT INTO listing_attributes (listing_id, attribute_key, attribute_value, attribute_type) VALUES
-- Koinly
((SELECT id FROM listings WHERE slug = 'koinly'), 'tx_capacity', 'Unlimited', 'string'),
((SELECT id FROM listings WHERE slug = 'koinly'), 'defi_support', 'true', 'boolean'),
((SELECT id FROM listings WHERE slug = 'koinly'), 'nft_support', 'true', 'boolean'),
((SELECT id FROM listings WHERE slug = 'koinly'), 'jurisdictions', 'US, UK, CA, AU, EU, Global', 'string'),
-- CoinTracker
((SELECT id FROM listings WHERE slug = 'cointracker'), 'tx_capacity', '10000', 'string'),
((SELECT id FROM listings WHERE slug = 'cointracker'), 'defi_support', 'true', 'boolean'),
((SELECT id FROM listings WHERE slug = 'cointracker'), 'nft_support', 'true', 'boolean'),
((SELECT id FROM listings WHERE slug = 'cointracker'), 'jurisdictions', 'US, CA, UK, AU', 'string'),
-- Crypto Tax Calculator
((SELECT id FROM listings WHERE slug = 'crypto-tax-calculator'), 'tx_capacity', 'Unlimited', 'string'),
((SELECT id FROM listings WHERE slug = 'crypto-tax-calculator'), 'defi_support', 'true', 'boolean'),
((SELECT id FROM listings WHERE slug = 'crypto-tax-calculator'), 'nft_support', 'true', 'boolean'),
((SELECT id FROM listings WHERE slug = 'crypto-tax-calculator'), 'jurisdictions', 'US, UK, AU, CA, EU', 'string'),
-- TaxBit
((SELECT id FROM listings WHERE slug = 'taxbit'), 'tx_capacity', 'Unlimited', 'string'),
((SELECT id FROM listings WHERE slug = 'taxbit'), 'defi_support', 'false', 'boolean'),
((SELECT id FROM listings WHERE slug = 'taxbit'), 'nft_support', 'false', 'boolean'),
((SELECT id FROM listings WHERE slug = 'taxbit'), 'jurisdictions', 'US only', 'string');