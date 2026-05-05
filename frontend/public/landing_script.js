(function() {
  /**
   * AntStockNote Landing Page Script
   * 목적: 얼리버드 사전 신청 기능을 제거하고, 단순 로그인/시작 페이지 이동으로 변경
   */
  
  function init() {
    const emailInput = document.querySelector('#eb-email');
    const submitBtn = document.querySelector('.eb-submit');
    const navCta = document.querySelector('.nav-cta');

    // 1. 메인 버튼(사전 신청 버튼) 처리
    if (submitBtn) {
      submitBtn.innerText = '지금 바로 시작하기 →';
      // 스타일 조정 (이메일 입력칸이 사라지므로 버튼 너비 조정)
      submitBtn.style.width = '100%';
      submitBtn.style.maxWidth = '400px';
      submitBtn.style.margin = '0 auto';
      
      submitBtn.onclick = (e) => {
        e.preventDefault();
        const target = '/login';
        if (window.self !== window.top) {
          window.top.location.href = target;
        } else {
          window.location.href = target;
        }
      };
    }

    // 2. 이메일 입력창 숨기기
    if (emailInput) {
      emailInput.style.display = 'none';
      if (emailInput.parentElement) {
        emailInput.parentElement.style.display = 'flex';
        emailInput.parentElement.style.justifyContent = 'center';
      }
    }

    // 3. 네비게이션바 CTA 버튼 처리
    if (navCta) {
      navCta.innerText = '시작하기';
      navCta.onclick = (e) => {
        e.preventDefault();
        const target = '/login';
        if (window.self !== window.top) {
          window.top.location.href = target;
        } else {
          window.location.href = target;
        }
      };
    }

    // 4. 페이지 내 모든 "얼리버드" 문구 처리
    const cleanUpText = () => {
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      const nodesToReplace = [];
      while(node = walk.nextNode()) {
        if (node.textContent.includes('얼리버드') || node.textContent.includes('사전 신청') || node.textContent.includes('사전신청')) {
          nodesToReplace.push(node);
        }
      }

      nodesToReplace.forEach(n => {
        const text = n.textContent;
        // 버튼이나 링크 내의 문구는 적절히 대체
        if (n.parentElement.tagName === 'A' || n.parentElement.tagName === 'BUTTON' || n.parentElement.classList.contains('eb-submit')) {
          n.textContent = text.replace(/얼리버드 사전\s*신청/g, '지금 시작하기')
                             .replace(/얼리버드 신청/g, '지금 시작하기')
                             .replace(/얼리버드/g, '시작하기');
        } else {
          // 일반 텍스트는 삭제하거나 단순화
          n.textContent = text.replace(/얼리버드 사전\s*신청/g, '')
                             .replace(/얼리버드 한정/g, '인기')
                             .replace(/얼리버드/g, '');
        }
      });
    };

    cleanUpText();

    // 5. 특정 요소 숨기기 (진행바, 신청 인원 등)
    const selectorsToHide = [
      '.nav-link', // 네비게이션의 얼리버드 링크 등을 찾기 위해 (추가 로직 아래)
      'div[style*="width: 73%"]', // 진행바 예시
      '.progress-bar'
    ];

    document.querySelectorAll('a').forEach(a => {
      const txt = a.textContent.trim();
      if (txt === '얼리버드' || txt === '사전신청' || txt === '사전 신청') {
        a.style.display = 'none';
      }
    });

    document.querySelectorAll('div, p, span, h1, h2, h3').forEach(el => {
      const txt = el.textContent;
      if (txt.includes('명 목표') || txt.includes('사전 신청했습니다') || (txt.includes('73') && txt.includes('100'))) {
        el.style.display = 'none';
      }
      // "가장 먼저 시작하는 투자자에게..." 헤딩 부분 처리
      if (txt.includes('특별한 혜택을 드립니다')) {
          el.innerText = '모든 투자자에게 최적의 매매일지를 제공합니다';
      }
      // 상단 작은 태그 "얼리버드 사전 신청" 등
      if (el.classList.contains('w-embed') || txt.trim() === '얼리버드 사전 신청') {
          if (el.tagName !== 'BODY' && el.tagName !== 'HTML') {
            el.style.visibility = 'hidden';
            el.style.height = '0';
            el.style.margin = '0';
          }
      }
    });

    // 6. "얼리버드 한정" 뱃지 처리 (이미지 2 참고)
    document.querySelectorAll('*').forEach(el => {
        if (el.textContent.trim() === '얼리버드 한정') {
            el.style.display = 'none';
        }
    });
  }

  // 초기화 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // 동적 로딩 대응 (일부 프레임워크는 로딩 후 요소 생성)
  setTimeout(init, 1000);
  setTimeout(init, 3000);
})();
