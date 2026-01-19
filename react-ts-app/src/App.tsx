import React from 'react'
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './Header'
import UploadPage from './upload'
import ArPage from './ar'

function HomePage() {
  const navigate = useNavigate()

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '24px',
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={() => navigate('/upload')}
        style={{
          padding: '16px 32px',
          fontSize: '16px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        3D 데이터 업로드
      </button>
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
      </Routes>
    </HashRouter>
  )
}

export default App
