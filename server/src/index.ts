import express = require('express');
import { convertRouter } from './convert-usdz';

const app = express();

// CORS 간단 처리 (프론트 Render 도메인으로 바꿔주면 더 안전)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 임시
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(convertRouter);

app.get('/', (_req, res) => {
  res.send('convert-usdz server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});