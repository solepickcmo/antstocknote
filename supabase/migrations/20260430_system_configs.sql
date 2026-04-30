-- 시스템 설정 및 캐시 데이터 저장 테이블
CREATE TABLE IF NOT EXISTS public.system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 환율 데이터 삽입 (기본값)
INSERT INTO public.system_configs (key, value, updated_at)
VALUES ('usd_krw_rate', '{"rate": 1380.0, "date": "2026-04-30"}', NOW())
ON CONFLICT (key) DO NOTHING;

-- RLS 설정: 누구나 읽을 수 있지만, 인증된 사용자만 (또는 특정 관리자만) 수정 가능하도록 설정 가능
-- 여기서는 편의상 누구나 읽기 허용
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System configs are readable by everyone" ON public.system_configs;
CREATE POLICY "System configs are readable by everyone" ON public.system_configs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only authenticated users can update configs" ON public.system_configs;
CREATE POLICY "Only authenticated users can update configs" ON public.system_configs
    FOR UPDATE USING (auth.role() = 'authenticated');
