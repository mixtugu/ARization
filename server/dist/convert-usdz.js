"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConvertUsdzEnabled = isConvertUsdzEnabled;
exports.createConvertRouter = createConvertRouter;
const express = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const fs = require("node:fs/promises");
const path = require("node:path");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
function isConvertUsdzEnabled() {
    return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
function createConvertRouter() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수 필요');
    }
    const convertRouter = express.Router();
    convertRouter.use(express.json());
    const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
    convertRouter.post('/api/convert-usdz', async (req, res) => {
        const { bucket, key } = (req.body || {});
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
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ error: 'usdz 변환 중 오류' });
        }
    });
    return convertRouter;
}
