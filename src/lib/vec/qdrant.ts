import { QdrantClient } from '@qdrant/js-client-rest'

export const COLLECTION_CONTEXT = 'blog_context_v1'
export const VECTOR_SIZE = 1536 // text-embedding-3-small

let qdrantClient: QdrantClient | null = null

export function getQdrant() {
  const qdrantUrl = process.env.QDRANT_URL
  const qdrantApiKey = process.env.QDRANT_API_KEY

  if (!qdrantUrl || !qdrantApiKey) {
    throw new Error('QDRANT_URL and QDRANT_API_KEY environment variables are required')
  }

  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey
    })
  }

  return qdrantClient
}

export async function ensureCollections() {
  const qdrant = getQdrant()
  const existing = await qdrant.getCollections()
  const names = (existing.collections ?? []).map((c: any) => c.name)
  if (!names.includes(COLLECTION_CONTEXT)) {
    await qdrant.createCollection(COLLECTION_CONTEXT, {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' }
    })
  }
}

export async function upsertContextPoints(points: Array<{ id: string|number; text: string; city: string; neighborhood?: string; embedding: number[] }>) {
  await ensureCollections()
  const qdrant = getQdrant()
  await qdrant.upsert(COLLECTION_CONTEXT, {
    points: points.map(p => ({
      id: p.id,
      vector: p.embedding,
      payload: {
        city: p.city,
        neighborhood: p.neighborhood,
        text: p.text,
        type: p.neighborhood ? 'neighborhood' : 'city'
      }
    }))
  })
}
