import express = require('express');
import { createClient } from '@supabase/supabase-js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const convertRouter = express.Router();
convertRouter.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수 필요');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const execFileAsync = promisify(execFile);

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
    const usdzPath = path.join(tmpDir, `${baseName}.usdz`);

    await fs.writeFile(glbPath, Buffer.from(await data.arrayBuffer()));

    // ⚠️ 여기 usdzconvert 바이너리가 실제로 서버에 있어야 함
    await execFileAsync('/usr/local/bin/usdzconvert', [glbPath, usdzPath]);

    const usdzBuffer = await fs.readFile(usdzPath);
    const usdzKey = `${baseName}.usdz`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(usdzKey, usdzBuffer, {
        upsert: true,
        contentType: 'model/vnd.usdz+zip',
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: 'usdz 업로드 실패' });
    }

    return res.json({ ok: true, usdzKey });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'usdz 변환 중 오류' });
  }
});