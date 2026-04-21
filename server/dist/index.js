"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("node:path");
const convert_usdz_1 = require("./convert-usdz");
const library_models_1 = require("./library-models");
const app = express();
// CORS 간단 처리 (프론트 Render 도메인으로 바꿔주면 더 안전)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // 임시
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS')
        return res.sendStatus(200);
    next();
});
if ((0, convert_usdz_1.isConvertUsdzEnabled)()) {
    app.use((0, convert_usdz_1.createConvertRouter)());
}
else {
    console.warn('convert-usdz disabled: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}
app.use(library_models_1.libraryRouter);
app.use('/library-models', express.static(path.resolve(library_models_1.libraryModelsDir)));
app.get('/', (_req, res) => {
    res.send('convert-usdz server is running');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Library models dir: ${library_models_1.libraryModelsDir}`);
});
