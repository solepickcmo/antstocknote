-- 커뮤니티 프로필 테이블
CREATE TABLE community_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    exp INTEGER NOT NULL DEFAULT 0,
    active_skin_id TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 커뮤니티 게시물 테이블
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES community_profiles(user_id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    trade_id INTEGER, -- FK 없이 독립 참조
    likes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);

-- 커뮤니티 댓글 테이블
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES community_profiles(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_community_comments_post_id ON community_comments(post_id, created_at);

-- RLS 활성화
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Profiles 정책: 
CREATE POLICY "Anyone can view community profiles" ON community_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON community_profiles FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);
CREATE POLICY "Users can update their own profile" ON community_profiles FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Posts 정책:
CREATE POLICY "Anyone can view community posts" ON community_posts FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id::uuid);

-- Comments 정책:
CREATE POLICY "Anyone can view community comments" ON community_comments FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users can create comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);
CREATE POLICY "Users can update their own comments" ON community_comments FOR UPDATE USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can delete their own comments" ON community_comments FOR DELETE USING (auth.uid() = user_id::uuid);
