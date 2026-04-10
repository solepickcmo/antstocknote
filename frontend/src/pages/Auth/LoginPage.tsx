import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../api/supabase';
import './AuthPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (authError) {
        throw authError;
      }
      
      // onAuthStateChange in App.tsx will handle the routing and store update
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setIsForgotLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (resetError) {
        throw resetError;
      }
      
      setForgotMessage('비밀번호 재설정 링크가 이메일로 발송되었습니다.');
    } catch (err: any) {
      setForgotMessage(err.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h1 className="auth-title">개미의 집</h1>
        <p className="auth-subtitle">로그인하여 수익을 기록하세요</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="user@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <span className="auth-link" style={{ fontSize: '0.85rem' }} onClick={() => setIsForgotOpen(true)}>비밀번호를 잊으셨나요?</span>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="auth-footer">
          계정이 없으신가요? <span className="auth-link" onClick={() => navigate('/register')}>회원가입</span>
        </div>
      </div>

      {isForgotOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
            <h2 className="modal-title">비밀번호 찾기</h2>
            <p className="modal-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
            {forgotMessage && <div className="auth-error" style={{ background: forgotMessage.includes('성공') ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 77, 79, 0.2)', color: forgotMessage.includes('성공') ? '#00c853' : '#ff4d4f' }}>{forgotMessage}</div>}
            
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <input 
                  type="email" 
                  value={forgotEmail} 
                  onChange={e => setForgotEmail(e.target.value)} 
                  required 
                  placeholder="이메일 주소"
                  className="modal-input"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', marginBottom: '1rem' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsForgotOpen(false)}>닫기</button>
                <button type="submit" className="btn btn-primary" disabled={isForgotLoading}>
                  {isForgotLoading ? '전송중...' : '이메일 전송'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
