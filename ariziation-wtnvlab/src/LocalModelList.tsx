import React, { useEffect, useState } from 'react';
import { listLocalModels, type LocalModelItem } from './localModelApi';

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const LocalModelList: React.FC = () => {
  const [items, setItems] = useState<LocalModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const nextItems = await listLocalModels();
        setItems(nextItems);
      } catch (loadError) {
        console.error(loadError);
        setError('事前登録モデルの一覧を読み込めませんでした。');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        boxSizing: 'border-box',
        padding: '32px 16px',
        display: 'flex',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, #f5f7ff 0, #eef3ff 32%, #fdfbff 65%, #ffffff 100%)',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '920px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
          padding: '28px 24px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: '#f1f5f9',
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Library List
            </div>
            <h1 style={{ margin: '14px 0 0', fontSize: '28px', color: '#0f172a' }}>
              モデル一覧
            </h1>
          </div>
        </div>

        {loading ? <p style={{ marginTop: '24px', color: '#64748b' }}>一覧を読み込み中...</p> : null}
        {error ? <p style={{ marginTop: '24px', color: '#dc2626' }}>{error}</p> : null}

        {!loading && !error && items.length === 0 ? (
          <div
            style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              color: '#475569',
            }}
          >
            登録された GLB モデルがありません。
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div style={{ marginTop: '24px', display: 'grid', gap: '14px' }}>
            {items.map((item) => (
              <article
                key={item.name}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'grid',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      flexWrap: 'nowrap',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: '128px',
                        minWidth: '128px',
                        aspectRatio: '1 / 1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background:
                          'linear-gradient(135deg, rgba(226, 232, 240, 0.9) 0%, rgba(241, 245, 249, 0.95) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={`${item.name} thumbnail`}
                          style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                          NO IMAGE
                        </span>
                      )}
                    </div>
                    <a
                      href={`/#/ar?local=${encodeURIComponent(item.name)}${item.usdzName ? `&localUsdz=${encodeURIComponent(item.usdzName)}` : ''}`}
                      style={{
                        textDecoration: 'none',
                        width: '96px',
                        minWidth: '96px',
                        aspectRatio: '1 / 1',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #4f46e5 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        padding: '12px',
                      }}
                    >
                      AR で見る
                    </a>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                      <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{item.name}</h2>
                      <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                        {formatFileSize(item.size)} · {new Date(item.updatedAt).toLocaleString()}
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: item.usdzUrl ? '#166534' : '#b45309' }}>
                        {item.usdzUrl ? 'USDZ セット準備済み' : 'USDZ なし: iPhone Quick Look 非対応'}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default LocalModelList;
