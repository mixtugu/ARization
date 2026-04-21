import express = require('express');
import * as path from 'node:path';
import { createConvertRouter, isConvertUsdzEnabled } from './convert-usdz';
import { libraryModelsDir, libraryRouter } from './library-models';

const app = express();

// CORS 간단 처리 (프론트 Render 도메인으로 바꿔주면 더 안전)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 임시
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

if (isConvertUsdzEnabled()) {
  app.use(createConvertRouter());
} else {
  console.warn('convert-usdz disabled: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}
app.use(libraryRouter);
app.use('/library-models', express.static(path.resolve(libraryModelsDir)));

app.get('/', (_req, res) => {
  res.send('convert-usdz server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Library models dir: ${libraryModelsDir}`);
});
