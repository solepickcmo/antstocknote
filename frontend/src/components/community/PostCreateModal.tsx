import React, { useState } from 'react';
import { useCommunityStore } from '../../store/communityStore';
import { useTradeStore, type Trade } from '../../store/tradeStore';
import { X, Send, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';

interface PostCreateModalProps {
  onClose: () => void;
}

export const PostCreateModal: React.FC<PostCreateModalProps> = ({ onClose }) => {
  const { createPost, myProfile, updateMyProfile } = useCommunityStore();
  const trades = useTradeStore((state) => state.trades);
  
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedTradeId, setSelectedTradeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // 만약 프로필이 없다면 먼저 프로필 생성처리
    if (!myProfile) {
      if (!nickname.trim()) {
        alert('닉네임을 입력해주세요.');
        setIsSubmitting(false);
        return;
      }
      const profileCreated = await updateMyProfile(nickname);
      if (!profileCreated) {
        alert('프로필 생성에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }
    }

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    const success = await createPost(content, undefined, selectedTradeId || undefined);
    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      alert('게시물 작성에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {!myProfile ? '커뮤니티 프로필 설정' : '새 게시물 작성'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!myProfile ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                커뮤니티 닉네임
              </label>
              <input
                type="text"
                placeholder="사용할 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F0B90B] focus:border-[#F0B90B] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-2">닉네임은 다른 사용자에게 보여지며 나중에 변경할 수 있습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                placeholder="어떤 투자 인사이트를 공유하고 싶으신가요?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-32 px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-[#F0B90B] focus:border-[#F0B90B] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <BarChart2 size={16} className="mr-1 text-blue-500" />
                  매매 내역 첨부 (선택)
                </label>
                <select
                  value={selectedTradeId || ''}
                  onChange={(e) => setSelectedTradeId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F0B90B] focus:border-[#F0B90B] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- 첨부하지 않음 --</option>
                  {trades.slice(0, 20).map((trade: Trade) => (
                    <option key={trade.id} value={trade.id}>
                      {format(new Date(trade.traded_at), 'MM/dd')} | {trade.name} ({trade.type === 'buy' ? '매수' : '매도'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1 pl-1">최근 20건의 매매 내역 중 선택할 수 있습니다.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 bg-[#F0B90B] text-black font-semibold rounded-lg hover:bg-[#d6a509] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '처리 중...' : (
              <>
                <Send size={16} className="mr-2" />
                {!myProfile ? '닉네임 설정하고 작성하기' : '작성하기'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
