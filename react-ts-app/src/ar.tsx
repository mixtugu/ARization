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
  const [usdzUrl, setUsdzUrl] = useState<string | null>(null);

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
      setError('モデル情報がありません。有効なリンクか確認してください。');
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
          setError('モデルを読み込むことができません。');
        } else {
          setModelUrl(data.signedUrl);

          // iOS용 Quick Look을 위한 usdz 파일도 시도 (같은 이름 + .usdz 확장자 가정)
          const usdzKey = key.replace(/\.[^/.]+$/, '.usdz');
          if (usdzKey !== key) {
            const { data: usdzData } = await supabase.storage
              .from('models')
              .createSignedUrl(usdzKey, 60 * 60);

            if (usdzData?.signedUrl) {
              setUsdzUrl(usdzData.signedUrl);
            }
          }
        }
      } catch (e) {
        console.error(e);
        setError('モデル読み込み中にエラーが発生しました。');
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
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          background:
            'radial-gradient(circle at top left, #f5f7ff 0, #eef3ff 32%, #fdfbff 65%, #ffffff 100%)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'min(560px, 92vw)',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
            padding: '22px 20px',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#f1f5f9',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              AR PREVIEW
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              color: '#0f172a',
              letterSpacing: '-0.01em',
            }}
          >
            モデルを読み込んでいます...
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#64748b' }}>
            ネットワーク状況により少し時間がかかる場合があります。
          </p>
        </div>
      </main>
    );
  }

  if (error || !modelUrl) {
    return (
      <main
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          background:
            'radial-gradient(circle at top left, #f5f7ff 0, #eef3ff 32%, #fdfbff 65%, #ffffff 100%)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'min(720px, 92vw)',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
            padding: '24px 22px 22px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: '#fef2f2',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#b91c1c',
                  fontWeight: 700,
                }}
              >
                ERROR
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>AR Preview</span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              lineHeight: 1.35,
              letterSpacing: '-0.02em',
              color: '#0f172a',
            }}
          >
            ARプレビューを開くことができません。
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: '14px',
              color: '#64748b',
            }}
          >
            {error || '読み込む3Dモデルがありません。有効なリンクか確認してください。'}
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '999px',
                border: 'none',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 600,
                boxShadow: '0 10px 22px rgba(37, 99, 235, 0.30)',
                flex: '1 1 220px',
              }}
            >
              アップロードへ戻る
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '999px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 600,
                flex: '1 1 160px',
              }}
            >
              ホームへ戻る
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background:
          'radial-gradient(circle at top left, #f5f7ff 0, #eef3ff 32%, #fdfbff 65%, #ffffff 100%)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: 'min(880px, 92vw)',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
          padding: '24px 22px 22px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#f1f5f9',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              AR PREVIEW
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Android: Scene Viewer · iOS: Quick Look
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: '22px',
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            color: '#0f172a',
          }}
        >
          モバイルでARを確認
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#64748b' }}>
          ご利用のデバイスに合わせてARモードを起動してください。
        </p>

        {/* Android */}
        {isAndroid && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
            }}
          >
            <p style={{ margin: 0, textAlign: 'center', fontSize: '13px', color: '#475569' }}>
              下のボタンを押して<strong>Google Scene Viewer</strong>でARを起動してください。
            </p>
            <a
              href={buildAndroidHref(modelUrl)}
              rel="ar"
              style={{
                marginTop: '12px',
                display: 'block',
                padding: '12px 16px',
                fontSize: '14px',
                textDecoration: 'none',
                borderRadius: '999px',
                border: 'none',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 700,
                textAlign: 'center',
                boxShadow: '0 10px 22px rgba(37, 99, 235, 0.30)',
              }}
            >
              AndroidでAR起動
            </a>
            <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              ARが起動しない場合はChromeで開いてください。
            </p>
          </div>
        )}

        {/* iOS */}
        {isIOS && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
            }}
          >
            {usdzUrl ? (
              <>
                <p style={{ margin: 0, textAlign: 'center', fontSize: '13px', color: '#475569' }}>
                  下のボタンを押して<strong>AR Quick Look</strong>でモデルを確認してください。
                </p>
                <a
                  href={usdzUrl}
                  rel="ar"
                  style={{
                    marginTop: '12px',
                    display: 'block',
                    padding: '12px 16px',
                    fontSize: '14px',
                    textDecoration: 'none',
                    borderRadius: '999px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  iOSでAR起動
                </a>
                <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                  Safariで開くと最も安定して動作します。
                </p>
              </>
            ) : (
              <p style={{ margin: 0, textAlign: 'center', fontSize: '13px', color: '#475569' }}>
                iOSのAR Quick Lookは<code>usdz</code>形式を使用します。
                <br />
                同じ名前の<code>.usdz</code>が用意されていれば、iPhoneでもすぐにAR起動ボタンが表示されます。
              </p>
            )}
          </div>
        )}

        {/* Desktop/Other */}
        {!isAndroid && !isIOS && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
            }}
          >
            <p style={{ margin: 0, textAlign: 'center', fontSize: '13px', color: '#475569' }}>
              このページはモバイルAR起動用の案内ページです。
              <br />
              スマートフォンでQRコードを読み取るとAR起動ボタンが有効になります。
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '999px',
              border: 'none',
              background:
                'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 600,
              boxShadow: '0 10px 22px rgba(37, 99, 235, 0.30)',
              flex: '1 1 220px',
            }}
          >
            別のモデルをアップロード
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '999px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 600,
              flex: '1 1 160px',
            }}
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    </main>
  );
};

export default ArPage;
