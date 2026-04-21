"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.libraryModelsDir = exports.libraryRouter = void 0;
const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");
exports.libraryRouter = express.Router();
const defaultLibraryModelsDir = path.resolve(__dirname, '../storage/library-models');
exports.libraryModelsDir = process.env.LIBRARY_MODELS_DIR
    ? path.resolve(process.env.LIBRARY_MODELS_DIR)
    : defaultLibraryModelsDir;
const thumbnailExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
async function listLibraryModels() {
    await fs.mkdir(exports.libraryModelsDir, { recursive: true });
    const entries = await fs.readdir(exports.libraryModelsDir, { withFileTypes: true });
    const fileNames = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
    const files = await Promise.all(entries
        .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.glb')
        .map(async (entry) => {
        const fullPath = path.join(exports.libraryModelsDir, entry.name);
        const stats = await fs.stat(fullPath);
        const usdzName = entry.name.replace(/\.glb$/i, '.usdz');
        const hasUsdz = fileNames.has(usdzName);
        const baseName = entry.name.replace(/\.glb$/i, '');
        const thumbnailName = thumbnailExtensions
            .map((extension) => `${baseName}${extension}`)
            .find((candidate) => fileNames.has(candidate)) ?? null;
        return {
            name: entry.name,
            url: `/library-models/${encodeURIComponent(entry.name)}`,
            size: stats.size,
            updatedAt: stats.mtime.toISOString(),
            usdzName: hasUsdz ? usdzName : null,
            usdzUrl: hasUsdz ? `/library-models/${encodeURIComponent(usdzName)}` : null,
            thumbnailName,
            thumbnailUrl: thumbnailName ? `/library-models/${encodeURIComponent(thumbnailName)}` : null,
        };
    }));
    return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
exports.libraryRouter.get('/api/library-models', async (_req, res) => {
    try {
        const items = await listLibraryModels();
        res.json({ items });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to list library models.' });
    }
});
