import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/client';
import './AuthPage.css';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/register', { email, password, nickname });
      const { accessToken, refreshToken, userId } = response.data;
      
      if (accessToken) {
        setAuth({ id: userId, email, nickname }, accessToken, refreshToken || '');
        navigate('/');
      }
    } catch (err: any) {
      let errorMsg = '회원가입에 실패했습니다.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = `[시스템/네트워크 오류] ${err.message}`;
      }
      setError(errorMsg);
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
