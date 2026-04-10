import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import './AuthPage.css';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');



    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setMessage('비밀번호가 성공적으로 변경되었습니다. 다시 로그인 해 주세요.');
      
      // 로그아웃 처리 후 이동 (확실한 보안을 위해)
      await supabase.auth.signOut();

      // 2초 뒤 로그인으로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">비밀번호 재설정</h2>
        <p className="auth-subtitle">새로운 비밀번호를 입력해 주세요.</p>

        {error && <div className="auth-error" style={{ background: 'rgba(255, 77, 79, 0.2)', color: '#ff4d4f' }}>{error}</div>}
        {message && <div className="auth-error" style={{ background: 'rgba(0, 200, 83, 0.2)', color: '#00c853' }}>{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">새 비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? '처리 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  );
};
