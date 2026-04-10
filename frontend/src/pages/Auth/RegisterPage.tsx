import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import './AuthPage.css';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nickname: nickname
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (signupError) throw signupError;
      
      // onAuthStateChange will handle redirection if email verification is off
      if (!data.session) {
        alert('회원가입이 완료되었습니다. 이메일 인증을 확인해 주세요.');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h1 className="auth-title">개미의 집 시작하기</h1>
        <p className="auth-subtitle">계정을 생성하고 매매일지를 작성해보세요</p>
        
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
              placeholder="6자리 이상 입력"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input 
              type="text" 
              id="nickname" 
              value={nickname} 
              onChange={e => setNickname(e.target.value)} 
              required 
              placeholder="표시될 이름"
              maxLength={20}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입 완료'}
          </button>
        </form>
        
        <div className="auth-footer">
          이미 계정이 있으신가요? <span className="auth-link" onClick={() => navigate('/login')}>로그인</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
