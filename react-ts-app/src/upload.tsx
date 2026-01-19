import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { createClient } from '@supabase/supabase-js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function convertToUsdzWithThree(file: File): Promise<Blob> {
  const exporter = new USDZExporter();
  const loader = new GLTFLoader();

  // GLTFLoader는 주로 URL 로드를 사용하므로 Blob URL을 생성한다
  const blobUrl = URL.createObjectURL(file);

  try {
    const gltf = await loader.loadAsync(blobUrl);

    // USDZExporter는 THREE.Object3D(일반적으로 scene)을 입력으로 받는다.
    // iOS Quick Look에서 모델이 잘 보이지 않는 상황을 줄이기 위해 바운딩 박스 중심을 원점으로 이동한다.
    const root = gltf.scene;
    const box = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    box.getCenter(center);
    root.position.sub(center);

    // Exporter는 씬 그래프를 순회한다.
    const usdzArrayBuffer = await exporter.parseAsync(root);

    return new Blob([usdzArrayBuffer], { type: 'model/vnd.usdz+zip' });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

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
      setError('対応していないファイル形式です。glb / gltf / obj / fbx / stl のみアップロードできます。');
      setSelectedFile(null);
      setPreviewURL(null);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewURL(localUrl);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('先に3Dモデルファイルを選択してください。');
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
        throw new Error('アップロードに失敗しました');
      }

      // iOS Quick Look(AR)에서는 GLB/GLTF 파일에 대해 USDZ 형식이 필요하다.
      // 브라우저에서 Three.js USDZExporter로 변환한 뒤, 동일한 이름(.usdz)으로 Supabase에 업로드한다.
      const lowerSafeName = safeName.toLowerCase();
      const isGltfFamily = lowerSafeName.endsWith('.glb') || lowerSafeName.endsWith('.gltf');

      if (isGltfFamily) {
        try {
          const usdzBlob = await convertToUsdzWithThree(selectedFile);
          const usdzKey = fileName.replace(/\.(glb|gltf)$/i, '.usdz');

          const { error: usdzUploadError } = await supabase
            .storage
            .from('models')
            .upload(usdzKey, usdzBlob, {
              upsert: true,
              contentType: 'model/vnd.usdz+zip',
            });

          if (usdzUploadError) {
            console.error('USDZのアップロードに失敗しました（元ファイルのアップロードは完了しています）：', usdzUploadError);
          }
        } catch (convertError) {
          console.error('ブラウザでのUSDZ変換に失敗しました（元ファイルのアップロードは完了しています）：', convertError);
        }
      }

      const urlForShare = `${window.location.origin}/#/ar?key=${encodeURIComponent(fileName)}`;
      setShareUrl(urlForShare);
    } catch (e) {
      console.error(e);
      setError('アップロード中にエラーが発生しました。しばらくしてからもう一度お試しください。');
      setPreviewURL(null);
      setShareUrl(null);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const viewerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!previewURL || !viewerRef.current) return;

    const container = viewerRef.current;
    container.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(previewURL, (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      camera.position.set(size * 0.5, size * 0.5, size * 1.5);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    });

    (async () => {
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    })();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [previewURL]);

  return (
    <main
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 16px',
        background: 'radial-gradient(circle at top left, #f8fafc, #eef2ff, #e0e7ff)',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffffcc',
          backdropFilter: 'blur(6px)',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>3Dモデルアップロード</h1>
          <p style={{ marginTop: '8px', color: '#555', fontSize: '15px' }}>
            3Dモデルをアップロードすると自動でQRコードが生成され、<br />
            スマホですぐに確認できます。
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label
            style={{
              fontWeight: 600,
              marginBottom: '-4px',
              fontSize: '14px',
            }}
          >
            ファイル選択
          </label>

          <input
            type="file"
            accept=".glb,.gltf,.obj,.fbx,.stl"
            onChange={handleFileChange}
            style={{
              width: '94%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              background: '#fff',
            }}
          />

          {error && (
            <div style={{ color: 'red', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            style={{
              marginTop: '8px',
              padding: '14px 24px',
              fontSize: '16px',
              borderRadius: '8px',
              border: 'none',
              background: isUploading ? '#94a3b8' : '#6366f1',
              color: '#fff',
              cursor: isUploading ? 'default' : 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              transition: '0.2s',
            }}
          >
            {isUploading ? 'アップロード中...' : 'アップロードしてQRを作成'}
          </button>
        </div>

        {shareUrl && (
          <div
            style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '12px',
              background: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 12px', fontSize: '15px' }}>
              モバイルでAR表示するにはQRコードをスキャンしてください。
            </p>
            <QRCode value={shareUrl} size={160} />
          </div>
        )}

        {previewURL && (
          <div style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>3Dプレビュー</h2>
            <div
              ref={viewerRef}
              style={{
                width: '100%',
                height: '45vh',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default UploadPage;
