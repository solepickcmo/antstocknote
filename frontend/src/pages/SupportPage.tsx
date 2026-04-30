import React, { useState } from 'react';
import { Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { HelpTooltip } from '../components/ui/HelpTooltip';

const FAQS = [
  {
    question: '실현 손익(PnL)은 어떻게 계산되나요?',
    answer: 'AntStockNote는 "이동평균법"을 사용하여 실현 손익을 계산합니다. 분할 매수 시마다 평단가가 합산/갱신되며, 매도 시 해당 시점의 평단가를 기준으로 손익을 산출하여 실제 체감 수익률과 가장 가깝게 표시합니다.'
  },
  {
    question: '프리미엄(PREMIUM) 플랜 혜택은 무엇인가요?',
    answer: '월 기본 30건 이상의 무제한 매매 기록이 가능해지며, 투자 시뮬레이터, 내 포트폴리오, 매매패턴 분석 등 심화 기능과 프리미엄 투자자 전용 커뮤니티(개미의 집) 이용 혜택이 주어집니다.'
  },
  {
    question: '기록된 데이터는 안전하게 보관되나요?',
    answer: '사용자의 모든 매매 데이터는 클라우드 데이터베이스의 강력한 보안 정책(Row Level Security)으로 격리되어 보관됩니다. 사용자 본인 외에는 관리자도 열람할 수 없으니 안심하고 기록하세요.'
  },
  {
    question: '비밀번호를 분실했는데 어떻게 하나요?',
    answer: '로그인 화면 하단의 "비밀번호 찾기" 링크를 통해 가입하신 이메일로 비밀번호 재설정 링크를 받으실 수 있습니다.'
  }
];

export const SupportPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <div className="flex items-center mb-2">
        <h1 className="page-title mb-0">도움말 및 자주 묻는 질문</h1>
        <HelpTooltip content="가장 많이 접수된 질문들과 고객센터 연락처를 안내하는 페이지입니다." />
      </div>

      <div className="bg-card rounded-xl p-2 border border-border/50 mb-2">
        <h2 className="text-lg font-bold mb-2 font-body">자주 묻는 질문 (FAQ)</h2>
        <div className="space-y-2">
          {FAQS.map((faq, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-left"
                onClick={() => toggleAccordion(index)}
              >
                <span className="font-bold text-[15px] text-gray-900 dark:text-gray-100">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp size={18} className="text-primary flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />
                )}
              </button>
              {openIndex === index && (
                <div className="p-5 bg-white dark:bg-black/20 border-t border-border/50 text-gray-600 dark:text-gray-300 text-[13px] leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-2 border border-border/50">
        <div className="flex items-center mb-2">
          <Mail className="text-primary mr-2" size={20} />
          <h2 className="text-lg font-bold font-body">이메일 문의</h2>
        </div>
        <p className="text-gray-400 text-sm mb-2 leading-relaxed">
          서비스 이용 중 불편한 점이나 추가 기능 제안이 있으신가요?<br />
          아래 이메일로 연락주시면 최대한 빠르게 답변해 드리겠습니다.
        </p>
        <div className="bg-background rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border gap-4">
          <span className="font-mono text-primary font-medium text-lg">antstocknote@gmail.com</span>
          <a 
            href="mailto:antstocknote@gmail.com" 
            className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md text-sm font-semibold w-full sm:w-auto text-center"
          >
            메일 보내기
          </a>
        </div>
      </div>
    </div>
  );
};
