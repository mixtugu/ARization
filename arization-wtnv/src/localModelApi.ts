export type LocalModelItem = {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
  usdzName: string | null;
  usdzUrl: string | null;
  thumbnailName: string | null;
  thumbnailUrl: string | null;
};

type ListResponse = {
  items: LocalModelItem[];
};

export async function listLocalModels(): Promise<LocalModelItem[]> {
  const response = await fetch('/api/library-models');

  if (!response.ok) {
    throw new Error('Failed to load local models.');
  }

  const data = (await response.json()) as ListResponse;
  return data.items;
}
