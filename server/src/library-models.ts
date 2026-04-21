import express = require('express');
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const libraryRouter = express.Router();

const defaultLibraryModelsDir = path.resolve(__dirname, '../storage/library-models');

export const libraryModelsDir = process.env.LIBRARY_MODELS_DIR
  ? path.resolve(process.env.LIBRARY_MODELS_DIR)
  : defaultLibraryModelsDir;

type LibraryModelItem = {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
  usdzName: string | null;
  usdzUrl: string | null;
  thumbnailName: string | null;
  thumbnailUrl: string | null;
};

const thumbnailExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];

async function listLibraryModels(): Promise<LibraryModelItem[]> {
  await fs.mkdir(libraryModelsDir, { recursive: true });
  const entries = await fs.readdir(libraryModelsDir, { withFileTypes: true });
  const fileNames = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.glb')
      .map(async (entry) => {
        const fullPath = path.join(libraryModelsDir, entry.name);
        const stats = await fs.stat(fullPath);
        const usdzName = entry.name.replace(/\.glb$/i, '.usdz');
        const hasUsdz = fileNames.has(usdzName);
        const baseName = entry.name.replace(/\.glb$/i, '');
        const thumbnailName =
          thumbnailExtensions
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
      }),
  );

  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

libraryRouter.get('/api/library-models', async (_req, res) => {
  try {
    const items = await listLibraryModels();
    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list library models.' });
  }
});
