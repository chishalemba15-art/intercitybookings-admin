import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client (singleton)
let hfClient: HfInference | null = null;

function getHfClient(): HfInference | null {
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('HUGGINGFACE_API_KEY not set, ML features disabled');
    return null;
  }

  if (!hfClient) {
    hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  return hfClient;
}

// In-memory cache for embeddings (use Redis in production)
const embeddingsCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 1000;

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Get text embedding using Hugging Face Inference API
 * Uses sentence-transformers/all-MiniLM-L6-v2 (lightweight, fast, good quality)
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    const hf = getHfClient();
    if (!hf) {
      return null;
    }

    // Normalize text
    const normalizedText = text.toLowerCase().trim();

    // Check cache first
    if (embeddingsCache.has(normalizedText)) {
      return embeddingsCache.get(normalizedText)!;
    }

    // Get embedding from Hugging Face
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: normalizedText,
    });

    // The response can be number | number[] | number[][]
    // We need a flat number[] for our embedding
    let embedding: number[] | null = null;

    if (Array.isArray(response)) {
      // If it's already a number[], use it directly
      if (typeof response[0] === 'number') {
        embedding = response as number[];
      }
      // If it's number[][], flatten it (take first row for sentence embeddings)
      else if (Array.isArray(response[0])) {
        embedding = (response as number[][])[0] || null;
      }
    }

    if (embedding && embedding.length > 0) {
      // Cache the embedding (with size limit)
      if (embeddingsCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry (first key)
        const firstKey = embeddingsCache.keys().next().value;
        if (firstKey) {
          embeddingsCache.delete(firstKey);
        }
      }
      embeddingsCache.set(normalizedText, embedding);
    }

    return embedding;
  } catch (error) {
    console.error('Error getting embedding from Hugging Face:', error);
    return null;
  }
}

/**
 * Find semantically similar items from a list
 */
export async function findSimilarItems<T>(
  query: string,
  items: T[],
  textExtractor: (item: T) => string,
  options: {
    topK?: number;
    minSimilarity?: number;
  } = {}
): Promise<Array<T & { similarity: number }>> {
  const { topK = 10, minSimilarity = 0.3 } = options;

  try {
    // Get query embedding
    const queryEmbedding = await getEmbedding(query);
    if (!queryEmbedding) {
      return [];
    }

    // Calculate similarities
    const scoredItems = await Promise.all(
      items.map(async (item) => {
        const itemText = textExtractor(item);
        const itemEmbedding = await getEmbedding(itemText);

        if (!itemEmbedding) {
          return { ...item, similarity: 0 };
        }

        const similarity = cosineSimilarity(queryEmbedding, itemEmbedding);
        return { ...item, similarity };
      })
    );

    // Filter and sort
    return scoredItems
      .filter((item) => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error('Error finding similar items:', error);
    return [];
  }
}

/**
 * Check if ML features are available
 */
export function isMLAvailable(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}

/**
 * Clear embeddings cache (useful for testing or memory management)
 */
export function clearEmbeddingsCache(): void {
  embeddingsCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: embeddingsCache.size,
    maxSize: MAX_CACHE_SIZE,
    utilization: (embeddingsCache.size / MAX_CACHE_SIZE) * 100,
  };
}
