import React, { useState } from 'react';
import '@google/model-viewer';
import QRCode from 'react-qr-code';
import { createClient } from '@supabase/supabase-js';

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

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError('');
    setShareUrl(null);

    if (!file) {
      setPreviewURL(null);
      return;
    }

    const allowedExtensions = ['.glb', '.gltf', '.obj', '.fbx', '.stl'];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) {
      setError('지원하지 않는 파일 형식입니다. glb/gltf/obj/fbx/stl 형식만 업로드할 수 있습니다.');
      setSelectedFile(null);
      setPreviewURL(null);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewURL(localUrl);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('먼저 3D 모델 파일을 선택해 주세요.');
      return;
    }

    setError('');
    setIsUploading(true);
    setShareUrl(null);

    try {
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const fileName = `${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('models')
        .upload(fileName, selectedFile, {
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        throw new Error('업로드 실패');
      }

      const urlForShare = `${window.location.origin}/ar?key=${encodeURIComponent(fileName)}`;
      setShareUrl(urlForShare);
    } catch (e) {
      console.error(e);
      setError('업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      setPreviewURL(null);
      setShareUrl(null);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

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
      <h1 style={{ margin: 0, fontSize: '24px' }}>3D 모델 업로드</h1>
      <p style={{ margin: 0, color: '#555', textAlign: 'center' }}>
        3D 모델을 업로드하고, 생성된 QR코드를 모바일로 스캔하여 AR로 확인하세요.
      </p>

      <div
        style={{
          marginTop: '16px',
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <input
          type="file"
          accept=".glb,.gltf,.obj,.fbx,.stl"
          onChange={handleFileChange}
          style={{
            width: '100%',
          }}
        />

        {error && (
          <div
            style={{
              color: 'red',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          style={{
            marginTop: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: isUploading ? 'default' : 'pointer',
            opacity: isUploading ? 0.7 : 1,
            width: '100%',
          }}
        >
          {isUploading ? '업로드 중...' : '업로드'}
        </button>
      </div>

      {previewURL && (
        <div
          style={{
            marginTop: '24px',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              margin: 0,
              marginBottom: '8px',
            }}
          >
            PC 미리보기
          </h2>
          <model-viewer
            src={previewURL}
            camera-controls
            auto-rotate
            style={{ width: '100%', height: '50vh', background: '#999' }}
          ></model-viewer>
        </div>
      )}

      {shareUrl && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            maxWidth: '320px',
            width: '100%',
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            모바일에서 AR로 보려면 QR코드를 스캔하세요.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <QRCode value={shareUrl} size={160} />
          </div>
        </div>
      )}
    </main>
  );
};

export default UploadPage;
