(function() {
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzRLwWlTUX-n-R-sAyo8tC5uY6p97chOEG3U2GE9kMe1Mo8KiWqcyN12e03JX9-iURwqQ/exec';
  
  function init() {
    const emailInput = document.querySelector('#eb-email');
    const submitBtn = document.querySelector('.eb-submit');
    const navCta = document.querySelector('.nav-cta');

    if (!emailInput || !submitBtn) {
      setTimeout(init, 500);
      return;
    }

    submitBtn.onclick = async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email || !email.includes('@')) {
        alert('올바른 이메일 주소를 입력해 주세요.');
        return;
      }
      
      submitBtn.disabled = true;
      const originalText = submitBtn.innerText;
      submitBtn.innerText = '처리 중...';
      
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        
        // 요청하신 문구로 변경
        alert('얼리버드 신청 완료!');
        emailInput.value = '';
      } catch (err) {
        console.error(err);
        alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    };

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
