import React, { useEffect, useState } from 'react';
import { useCommunityStore, type CommunityPost } from '../store/communityStore';
import { useAuthStore } from '../store/authStore';
import { TierGate } from '../components/common/TierGate';
import { PostCreateModal } from '../components/community/PostCreateModal';
import { MessageSquare, Heart, Clock, User as UserIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { HelpTooltip } from '../components/ui/HelpTooltip';

export const CommunityPage: React.FC = () => {
  const { posts, isLoadingPosts, fetchPosts, myProfile, fetchMyProfile } = useCommunityStore();
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyProfile();
      fetchPosts();
    }
  }, [user]);

  return (
    <TierGate feature="community">
      <div className="p-6 max-w-4xl mx-auto min-h-screen">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              개미의 집 커뮤니티
              <HelpTooltip content="프리미엄 전용 커뮤니티입니다. 다른 투자자들과 매매 기록, 분석, 인사이트를 자유롭게 나누고 소통해보세요!" iconSize={24} className="ml-2" />
            </h1>
            <p className="text-gray-500 mt-1">다른 개미들의 투자 철학과 매매 내역을 살펴보세요.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-[#F0B90B] text-black font-semibold rounded-lg hover:bg-[#d6a509] transition-colors shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            새 게시물 작성
          </button>
        </div>

        {/* Profile Onboarding */}
        {!myProfile && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-2 flex flex-col sm:flex-row items-center justify-between shadow-sm">
            <div className="mb-2 sm:mb-0">
              <h3 className="font-bold text-primary mb-1">커뮤니티 프로필 설정이 필요합니다</h3>
              <p className="text-sm text-secondary">게시물을 작성하고 소통하려면 닉네임을 설정해주세요.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-4 py-2 bg-primary text-primary-contrast rounded-lg hover:bg-primary-hover text-sm font-bold transition-colors whitespace-nowrap"
            >
              프로필 만들기
            </button>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-2">
          {isLoadingPosts ? (
            <div className="text-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0B90B] mx-auto mb-2"></div>
              게시물을 불러오는 중...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all">
              <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">아직 작성된 게시물이 없습니다.<br/>첫 게시물의 주인공이 되어보세요!</p>
            </div>
          ) : (
            posts.map((post: CommunityPost) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {post.author?.nickname || '알 수 없는 개미'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-yellow-100 dark:bg-[#F0B90B]/20 text-yellow-800 dark:text-[#F0B90B] text-xs rounded-full font-bold">
                          Lv.{post.author?.level || 1}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock size={12} className="mr-1" />
                        {format(new Date(post.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-2 text-gray-800 dark:text-gray-200">
                  {post.title && <h3 className="text-lg font-bold mb-1">{post.title}</h3>}
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{post.content}</p>
                </div>

                {/* 첨부된 매매 (trade_id가 있을 경우 표시) */}
                {post.trade_id && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 mb-2 flex items-center text-sm border border-gray-100 dark:border-gray-800">
                    <span className="text-blue-500 font-medium mr-2">📊 첨부된 매매 기록</span>
                    <span className="text-gray-500 dark:text-gray-400">#TR-{post.trade_id}</span>
                  </div>
                )}

                <div className="flex items-center pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <button className="flex items-center hover:text-red-500 dark:hover:text-red-400 transition-colors mr-6">
                    <Heart size={18} className="mr-1.5" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    <MessageSquare size={18} className="mr-1.5" />
                    <span>댓글</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <PostCreateModal 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </TierGate>
  );
};
