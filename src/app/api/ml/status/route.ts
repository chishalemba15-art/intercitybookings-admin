import { NextResponse } from 'next/server';
import { isMLAvailable, getEmbedding, getCacheStats } from '@/lib/ml/semantic-search';

export const dynamic = 'force-dynamic';

/**
 * Check ML system status and health
 */
export async function GET() {
  try {
    const mlAvailable = isMLAvailable();

    if (!mlAvailable) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'disabled',
          mlEnabled: false,
          reason: 'HUGGINGFACE_API_KEY not configured',
          cache: null,
          testResults: null,
        },
      });
    }

    // Test ML functionality with a simple embedding
    const testStart = Date.now();
    let testStatus = 'unknown';
    let testError = null;

    try {
      const testEmbedding = await getEmbedding('test');
      const testDuration = Date.now() - testStart;

      if (testEmbedding && testEmbedding.length > 0) {
        testStatus = 'operational';
      } else {
        testStatus = 'degraded';
        testError = 'Embedding generation returned null or empty';
      }

      const cacheStats = getCacheStats();

      return NextResponse.json({
        success: true,
        data: {
          status: testStatus,
          mlEnabled: true,
          cache: cacheStats,
          testResults: {
            responseTime: testDuration,
            embeddingSize: testEmbedding ? testEmbedding.length : 0,
            status: testStatus,
            error: testError,
          },
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          provider: 'Hugging Face Inference API',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      testStatus = 'error';
      testError = error instanceof Error ? error.message : 'Unknown error';

      return NextResponse.json({
        success: true,
        data: {
          status: testStatus,
          mlEnabled: true,
          cache: getCacheStats(),
          testResults: {
            responseTime: Date.now() - testStart,
            embeddingSize: 0,
            status: testStatus,
            error: testError,
          },
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          provider: 'Hugging Face Inference API',
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error checking ML status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check ML status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
