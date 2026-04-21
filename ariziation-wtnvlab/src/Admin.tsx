import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Admin: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      '本当にすべての3Dデータを削除しますか？\nこの操作は元に戻せません。',
    );

    if (!confirmed) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      // 루트 경로의 객체들을 모두 조회 (폴더 구조를 쓰지 않는 경우를 가정)
      const { data, error } = await supabase.storage
        .from('models')
        .list('', { limit: 1000 });

      if (error) {
        console.error('一覧取得エラー:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setMessage('削除する3Dデータがありません。');
        return;
      }

      const fileNames = data.map((item) => item.name);

      const { error: removeError } = await supabase.storage
        .from('models')
        .remove(fileNames);

      if (removeError) {
        console.error('削除エラー:', removeError);
        throw removeError;
      }

      setMessage('すべての3Dデータが正常に削除されました。');
    } catch (e) {
      console.error(e);
      setMessage('削除中にエラーが発生しました。コンソールログを確認してください。');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        boxSizing: 'border-box',
        gap: '16px',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '24px' }}>管理者ページ</h1>
      <p style={{ margin: 0, fontSize: '14px', color: '#555', textAlign: 'center' }}>
        下のボタンを押すと、Supabase Storage の <code>models</code> バケットに保存されているすべての3Dファイルが削除されます。
        <br />
        この操作は元に戻せないため、慎重に実行してください。
      </p>

      <button
        type="button"
        onClick={handleDeleteAll}
        disabled={isDeleting}
        style={{
          marginTop: '16px',
          padding: '12px 24px',
          fontSize: '16px',
          cursor: isDeleting ? 'default' : 'pointer',
          opacity: isDeleting ? 0.7 : 1,
        }}
      >
        {isDeleting ? '削除中...' : 'すべての3Dデータを削除'}
      </button>

      {message && (
        <div
          style={{
            marginTop: '12px',
            fontSize: '14px',
            color: message.includes('エラー') ? 'red' : 'green',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}
    </main>
  );
};

export default Admin;