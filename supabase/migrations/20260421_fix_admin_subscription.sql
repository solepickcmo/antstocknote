-- ==========================================
-- 20260421_fix_admin_subscription.sql
-- 관리자 구독 관리 버그 픽스 마이그레이션
-- ==========================================

-- 1-A. profiles 테이블에 role 컬럼 추가 및 관리자 설정
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 관리자 이메일의 profiles 레코드에 role = 'admin' 설정
UPDATE public.profiles
SET role = 'admin'
WHERE (id)::TEXT IN (
    SELECT (id)::TEXT FROM auth.users WHERE email = 'antstocknote@gmail.com'
);

-- 1-B. 관리자용 구독 조회 RPC 신설
-- RLS를 우회하고 auth.users에서 이메일을 직접 가져오는 SECURITY DEFINER 함수
CREATE OR REPLACE FUNCTION public.get_admin_subscriptions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER          -- RLS 우회, auth.users 접근 가능
SET search_path = public
AS $$
BEGIN
    -- 관리자 체크 (auth.users 이메일 기준으로 이중 검증)
    IF (SELECT email FROM auth.users WHERE (id)::TEXT = (auth.uid())::TEXT)
       != 'antstocknote@gmail.com' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Forbidden');
    END IF;

    RETURN (
        SELECT jsonb_build_object('success', true, 'data',
            COALESCE(jsonb_agg(
                jsonb_build_object(
                    'user_id',         s.user_id,
                    'email',           au.email,          -- auth.users에서 직접
                    'nickname',        COALESCE(p.nickname, 'Unknown'),
                    'tier',            s.tier,
                    'status',          s.status,
                    'expires_at',      s.expires_at,
                    'request_message', s.request_message,
                    'updated_at',      s.updated_at
                ) ORDER BY s.updated_at DESC
            ), '[]'::jsonb)
        )
        FROM public.subscriptions s
        LEFT JOIN auth.users   au ON (au.id)::TEXT  = (s.user_id)::TEXT
        LEFT JOIN public.profiles p ON (p.id)::TEXT = (s.user_id)::TEXT
        WHERE s.deleted_at IS NULL
    );
END;
$$;

-- 1-C. manage_premium_access RPC 권한 체크 강화
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
    v_record_exists BOOLEAN;
BEGIN
    -- 1. 기존: profiles.role 확인 (role 컬럼 없으면 에러)
    -- 변경: auth.users.email 기반으로 확인 (확실한 방법)
    IF (SELECT email FROM auth.users WHERE (id)::TEXT = (auth.uid())::TEXT)
       != 'antstocknote@gmail.com' THEN
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
