-- 1. 기초 테이블 구조 최적화 (deleted_at 인덱스 추가로 성능 향상)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_trades_deleted_at ON public.trades(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted_at ON public.subscriptions(deleted_at) WHERE deleted_at IS NULL;

-- 2. RLS 정책 최적화: 가입자 상태를 함께 체크하여 탈퇴 유저 데이터 원천 차단
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
CREATE POLICY "Users can view their own trades" ON public.trades
    FOR SELECT USING (
        auth.uid() = user_id 
        AND deleted_at IS NULL 
        AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.deleted_at IS NULL)
    );

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (
        auth.uid() = user_id 
        AND deleted_at IS NULL
    );

-- 3. 고도화된 구독 관리 RPC
CREATE OR REPLACE FUNCTION public.manage_subscription(
    target_user_id UUID,
    sub_action TEXT,
    expires_at_val TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
    v_target_exists BOOLEAN;
BEGIN
    -- 1. 호출자의 어드민 권한 확인
    v_role := (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1);
    
    IF v_role IS NULL OR v_role != 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Forbidden: Admin only');
    END IF;

    -- 2. 대상자의 구독 레코드 존재 여부 확인 (Upsert 방지 및 무결성 유지)
    SELECT EXISTS(SELECT 1 FROM public.subscriptions WHERE user_id = target_user_id) INTO v_target_exists;
    
    IF NOT v_target_exists THEN
        -- 만약 레코드가 없다면 기본 레코드 생성 (방어적 설계)
        INSERT INTO public.subscriptions (user_id, tier, status) 
        VALUES (target_user_id, 'free', 'expired');
    END IF;

    -- 3. 동작 수행
    IF sub_action = 'approve' THEN
        UPDATE public.subscriptions
        SET 
            status = 'active',
            tier = 'premium',
            expires_at = COALESCE(expires_at_val, NOW() + INTERVAL '30 days'),
            updated_at = NOW()
        WHERE user_id = target_user_id;
    ELSIF sub_action = 'decline' OR sub_action = 'cancel' THEN
        UPDATE public.subscriptions
        SET 
            status = CASE WHEN sub_action = 'decline' THEN 'canceled' ELSE 'expired' END,
            updated_at = NOW()
        WHERE user_id = target_user_id;
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
    END IF;

    RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
