/// <reference types="@google/model-viewer" />
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '@google/model-viewer';
import { createClient } from '@supabase/supabase-js';

// TypeScript에서 model-viewer 요소를 인식하도록 선언 (전역 JSX 타입 보강)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ArPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const key = searchParams.get('key');

    if (key) {
      try {
        const { data } = supabase.storage.from('models').getPublicUrl(key);
        setModelUrl(data.publicUrl);
      } catch (e) {
        console.error(e);
        setError('모델을 불러올 수 없습니다.');
      }
    }
    setLoading(false);
  }, [location.search]);

  if (loading) {
    return (
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          gap: '16px',
          width: '100%',
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <p>모델을 불러오는 중...</p>
      </main>
    );
  }

  if (error || !modelUrl) {
    return (
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 24px',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>AR 미리보기</h1>
        <p style={{ margin: 0, color: '#555', textAlign: 'center' }}>
          {error || '불러올 3D 모델이 없습니다. 유효한 링크인지 확인해 주세요.'}
        </p>

        <button
          type="button"
          onClick={() => navigate('/upload')}
          style={{
            marginTop: '12px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          업로드로 가기
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          홈으로
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '24px' }}>AR 미리보기</h1>

      <model-viewer
        src={modelUrl}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '70vh', background: '#000' }}
      ></model-viewer>

      <button
        type="button"
        onClick={() => navigate('/upload')}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        다른 모델 업로드
      </button>

      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        홈으로
      </button>
    </main>
  );
};

export default ArPage;
