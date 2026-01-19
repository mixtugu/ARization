import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './Header'
import UploadPage from './upload'
import ArPage from './ar'
import Admin from './Admin'

function HomePage() {
  const navigate = useNavigate()

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        boxSizing: 'border-box',
        padding: '32px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background:
          'radial-gradient(circle at top left, #f5f7ff 0, #eef3ff 32%, #fdfbff 65%, #ffffff 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
          padding: '24px 20px 28px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
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
              AR化 STUDIO
            </span>
          </div>

          <span
            style={{
              fontSize: '11px',
              color: '#94a3b8',
            }}
          >
            GLB形式3Dモデル対応 (Supports .glb 3D Models)
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '26px',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}
            >
              3Dファイルをアップロードで、
              <br />
              AR体験ができます。
            </h1>
            <p
              style={{
                marginTop: '10px',
                marginBottom: 0,
                fontSize: '14px',
                color: '#64748b',
              }}
            >
              GLB形式の3Dモデルをアップロードすると、
              <br />
              QRコードを使ってスマホでAR表示できます。
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '4px',
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#0ea5e9',
                  fontWeight: 700,
                }}
              >
                1
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#475569',
                }}
              >
                パソコンから <strong>.glb 3Dモデル</strong> を選択します。
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#0ea5e9',
                  fontWeight: 700,
                }}
              >
                2
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#475569',
                }}
              >
                アップロード後に生成された <strong>QRコード</strong> をスマホで読み取ります。
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#0ea5e9',
                  fontWeight: 700,
                }}
              >
                3
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#475569',
                }}
              >
                スマホのカメラで <strong>AR体験</strong> を楽しめます。
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            <button
              onClick={() => navigate('/upload')}
              style={{
                padding: '14px 24px',
                fontSize: '15px',
                cursor: 'pointer',
                borderRadius: '999px',
                border: 'none',
                background:
                  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 600,
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.35)',
              }}
            >
              はじめる
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

function App() {
  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/ar" element={<ArPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  )
}

export default App
