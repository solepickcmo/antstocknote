-- ==========================================
-- 1. 테이블 구조 확장 (Soft Delete 지원)
-- ==========================================

-- 프로필 및 유저 테이블
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 매매 기록 및 구독 테이블
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 인덱스 추가 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

-- ==========================================
-- 2. RLS(Row Level Security) 설정 및 활성화
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ─── TRADE 정책 ───
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
CREATE POLICY "Users can view their own trades" ON public.trades
    FOR SELECT USING (
        (auth.uid())::TEXT = (user_id)::TEXT 
        AND deleted_at IS NULL
    );

-- ─── SUBSCRIPTION 정책 ───
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (
        (auth.uid())::TEXT = (user_id)::TEXT 
        AND deleted_at IS NULL
    );

-- ─── PROFILE 정책 ───
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
CREATE POLICY "Users can view their own profiles" ON public.profiles
    FOR SELECT USING (
        (auth.uid())::TEXT = (id)::TEXT 
        AND deleted_at IS NULL
    );

-- ==========================================
-- 3. 고도화된 구독 관리 RPC (Stored Procedure)
-- ==========================================

CREATE OR REPLACE FUNCTION public.manage_premium_access(
    target_user_id TEXT, 
    sub_action TEXT,
    expires_at_val TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role TEXT;
    v_record_exists BOOLEAN;
BEGIN
    -- 1. 호출자의 어드민 권한 확인 (TEXT 캐스팅으로 타입 충돌 방지)
    v_caller_role := (
        SELECT role FROM public.profiles 
        WHERE (id)::TEXT = (auth.uid())::TEXT 
        LIMIT 1
    );
    
    IF v_caller_role IS NULL OR v_caller_role != 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Forbidden: Admin only');
    END IF;

    -- 2. 대상자의 구독 레코드 존재 여부 확인
    SELECT EXISTS(
        SELECT 1 FROM public.subscriptions 
        WHERE (user_id)::TEXT = (target_user_id)::TEXT
    ) INTO v_record_exists;
    
    IF NOT v_record_exists THEN
        INSERT INTO public.subscriptions (user_id, tier, status) 
        VALUES (target_user_id, 'free', 'expired');
    END IF;

    -- 3. 요청 작업 수행
    IF sub_action = 'approve' THEN
        UPDATE public.subscriptions
        SET 
            status = 'active', 
            tier = 'premium', 
            expires_at = COALESCE(expires_at_val, NOW() + INTERVAL '30 days'),
            updated_at = NOW()
        WHERE (user_id)::TEXT = (target_user_id)::TEXT;
    ELSIF sub_action = 'decline' OR sub_action = 'cancel' THEN
        UPDATE public.subscriptions
        SET 
            status = CASE WHEN sub_action = 'decline' THEN 'canceled' ELSE 'expired' END, 
            updated_at = NOW()
        WHERE (user_id)::TEXT = (target_user_id)::TEXT;
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action: approve, decline, or cancel are supported');
    END IF;

    RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
