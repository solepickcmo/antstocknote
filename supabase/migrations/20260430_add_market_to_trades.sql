-- trades 테이블에 시장(국내/해외) 및 통화 정보 추가
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS market TEXT DEFAULT 'KRX';
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KRW';
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC;

COMMENT ON COLUMN public.trades.market IS '시장 구분 (KRX, NASDAQ, NYSE 등)';
COMMENT ON COLUMN public.trades.currency IS '거래 통화 (KRW, USD)';
COMMENT ON COLUMN public.trades.exchange_rate IS '거래 당시 적용 환율';
