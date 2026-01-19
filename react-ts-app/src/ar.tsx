import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ArPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 단순 UA 기반 플랫폼 판별
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const isAndroid =
    typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const key = searchParams.get('key');

    if (!key) {
      setError('모델 정보가 없습니다. 유효한 링크인지 확인해 주세요.');
      setLoading(false);
      return;
    }

    const fetchUrl = async () => {
      try {
        // 서명 URL을 생성하여 외부(구글 Scene Viewer)에서도 접근 가능하게 함
        const { data, error } = await supabase.storage
          .from('models')
          .createSignedUrl(key, 60 * 60); // 1시간 유효

        if (error || !data?.signedUrl) {
          console.error(error);
          setError('모델을 불러올 수 없습니다.');
        } else {
          setModelUrl(data.signedUrl);
        }
      } catch (e) {
        console.error(e);
        setError('모델을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [location.search]);

  // Android용 Scene Viewer 링크 생성
  const buildAndroidHref = (url: string) => {
    const base = 'https://arvr.google.com/scene-viewer/1.0';
    const params = new URLSearchParams({
      file: url,
      mode: 'ar_only', // 필요시 ar_preferred 로 변경 가능
    });
    return `${base}?${params.toString()}`;
  };

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

      {/* Android: Scene Viewer로 AR 실행 */}
      {isAndroid && (
        <>
          <p style={{ margin: 0, textAlign: 'center' }}>
            아래 버튼을 눌러 AR 모드로 확인해 주세요.
          </p>
          <a
            href={buildAndroidHref(modelUrl)}
            rel="ar"
            style={{
              marginTop: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              textDecoration: 'none',
              borderRadius: '8px',
              border: '1px solid #333',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            Android에서 AR로 보기
          </a>
        </>
      )}

      {/* iOS: Quick Look(usdz) 준비 전 안내 */}
      {isIOS && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            maxWidth: '500px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <p style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>
            현재 iOS AR Quick Look은 <code>usdz</code> 형식을 사용합니다.
            <br />
            이 링크는 Android 기기에서 AR로 확인하는 데 최적화되어 있습니다.
            <br />
            추후 iOS용 usdz 변환 기능이 추가되면,
            <br />
            iPhone에서도 바로 AR 보기 버튼이 제공될 예정입니다.
          </p>
        </div>
      )}

      {/* 데스크톱/기타 기기 안내 */}
      {!isAndroid && !isIOS && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            maxWidth: '500px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <p style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>
            현재 AR 미리보기는 모바일 기기에서 사용하는 것이 가장 좋습니다.
            <br />
            스마트폰으로 QR 코드를 스캔하여 이 페이지에 접속하면
            <br />
            Android 기기에서 AR 모드로 확인할 수 있습니다.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate('/upload')}
        style={{
          marginTop: '24px',
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
