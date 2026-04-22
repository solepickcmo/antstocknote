-- Feature 1: 투자 원칙 테이블 및 RLS
CREATE TABLE IF NOT EXISTS public.investment_principles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    order_num INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, order_num)
);

CREATE INDEX IF NOT EXISTS idx_investment_principles_user_id ON public.investment_principles(user_id);

ALTER TABLE public.investment_principles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own principles" ON public.investment_principles;
CREATE POLICY "Users can manage their own principles" ON public.investment_principles
    FOR ALL USING (
        (auth.uid())::TEXT = (user_id)::TEXT
    );

-- Feature 3: 종목 분석 기록 테이블 및 RLS
CREATE TABLE IF NOT EXISTS public.stock_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    ticker TEXT,
    stock_name TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sa_user_ticker ON public.stock_analyses(user_id, ticker);
CREATE INDEX IF NOT EXISTS idx_sa_user_date ON public.stock_analyses(user_id, analysis_date DESC);

ALTER TABLE public.stock_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own analyses" ON public.stock_analyses;
CREATE POLICY "Users can manage their own analyses" ON public.stock_analyses
    FOR ALL USING (
        (auth.uid())::TEXT = (user_id)::TEXT
    );
