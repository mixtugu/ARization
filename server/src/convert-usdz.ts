import express = require('express');
import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const { processGltf } = require('gltf-pipeline');

export const convertRouter = express.Router();
convertRouter.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수 필요');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

convertRouter.post('/api/convert-usdz', async (req, res) => {
  const { bucket, key } = (req.body || {}) as { bucket?: string; key?: string };

  if (!bucket || !key) {
    return res.status(400).json({ error: 'bucket, key가 필요합니다.' });
  }

  try {
    // 1) glb 다운로드
    const { data, error } = await supabase.storage.from(bucket).download(key);
    if (error || !data) {
      console.error(error);
      return res.status(500).json({ error: 'glb 다운로드 실패' });
    }

    const tmpDir = '/tmp';
    const baseName = path.basename(key, path.extname(key));
    const glbPath = path.join(tmpDir, `${baseName}.glb`);
    const gltfPath = path.join(tmpDir, `${baseName}.gltf`);

    await fs.writeFile(glbPath, Buffer.from(await data.arrayBuffer()));

    // 2) gltf-pipeline으로 glb를 gltf로 변환 (usdz 대신 gltf 저장)
    const glbBuffer = await fs.readFile(glbPath);
    const gltfResult = await processGltf(glbBuffer, {
      separateTextures: true,
      dracoOptions: { compressionLevel: 7 },
    });

    await fs.writeFile(gltfPath, JSON.stringify(gltfResult.gltf, null, 2));

    // 3) gltf 업로드
    const gltfBuffer = await fs.readFile(gltfPath);
    const gltfKey = `${baseName}.gltf`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(gltfKey, gltfBuffer, {
        upsert: true,
        contentType: 'model/gltf+json',
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: 'gltf 업로드 실패' });
    }

    return res.json({ ok: true, gltfKey });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'gltf 변환 중 오류' });
  }
});