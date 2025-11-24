import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
function getHfClient(): HfInference | null {
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.warn('HUGGINGFACE_API_KEY not set, ML search analysis disabled');
    return null;
  }
  return new HfInference(process.env.HUGGINGFACE_API_KEY);
}

/**
 * Extract location from search query using zero-shot classification
 * Can identify if user is searching from a specific location or for a destination
 */
export async function extractLocationFromQuery(query: string): Promise<string | null> {
  try {
    const hf = getHfClient();
    if (!hf) return null;

    // Common Zambian cities and locations
    const zambianCities = [
      'Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola', 'Mufulira',
      'Livingstone', 'Kasama', 'Chipata', 'Solwezi', 'Mansa', 'Mongu'
    ];

    // Simple regex matching first (fast path)
    const normalizedQuery = query.toLowerCase();
    for (const city of zambianCities) {
      if (normalizedQuery.includes(city.toLowerCase())) {
        return city;
      }
    }

    // If no direct match, use ML for semantic understanding
    // Use zero-shot classification to determine if query mentions a location
    const response = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: query,
      parameters: {
        candidate_labels: zambianCities,
      },
    });

    // Return the most likely location if confidence is high enough
    if (Array.isArray(response)) {
      // Handle array response
      const firstResult: any = response[0];
      if (firstResult?.scores?.[0] > 0.5) {
        return firstResult.labels[0];
      }
    } else {
      // Handle object response
      const result: any = response;
      if (result?.scores?.[0] > 0.5) {
        return result.labels[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting location from query:', error);
    return null;
  }
}

/**
 * Classify search intent using zero-shot classification
 * Determines what the user is trying to do with their search
 */
export async function classifySearchIntent(query: string, destination?: string): Promise<string | null> {
  try {
    const hf = getHfClient();
    if (!hf) return null;

    // Define possible search intents
    const intents = [
      'booking_intent',      // User wants to book a ticket
      'price_check',         // User is checking prices
      'schedule_inquiry',    // User wants to see departure times
      'destination_search',  // User is exploring destinations
      'route_comparison',    // User is comparing different routes
    ];

    // Simple keyword-based classification (fast path)
    const normalizedQuery = query.toLowerCase();

    if (normalizedQuery.includes('book') || normalizedQuery.includes('ticket') || normalizedQuery.includes('buy')) {
      return 'booking_intent';
    }
    if (normalizedQuery.includes('price') || normalizedQuery.includes('cost') || normalizedQuery.includes('how much')) {
      return 'price_check';
    }
    if (normalizedQuery.includes('time') || normalizedQuery.includes('schedule') || normalizedQuery.includes('when')) {
      return 'schedule_inquiry';
    }

    // Use ML for more nuanced classification
    const response = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: query,
      parameters: {
        candidate_labels: intents,
      },
    });

    // Return the most likely intent if confidence is reasonable
    if (Array.isArray(response)) {
      const firstResult: any = response[0];
      if (firstResult?.scores?.[0] > 0.4) {
        return firstResult.labels[0];
      }
    } else {
      const result: any = response;
      if (result?.scores?.[0] > 0.4) {
        return result.labels[0];
      }
    }

    return 'destination_search'; // Default intent
  } catch (error) {
    console.error('Error classifying search intent:', error);
    return null;
  }
}

/**
 * Analyze search query comprehensively
 * Extracts both location and intent in one call
 */
export async function analyzeSearchQuery(query: string, destination?: string): Promise<{
  extractedLocation: string | null;
  searchIntent: string | null;
}> {
  try {
    // Run both analyses in parallel
    const [location, intent] = await Promise.all([
      extractLocationFromQuery(query),
      classifySearchIntent(query, destination),
    ]);

    return {
      extractedLocation: location,
      searchIntent: intent,
    };
  } catch (error) {
    console.error('Error analyzing search query:', error);
    return {
      extractedLocation: null,
      searchIntent: null,
    };
  }
}

/**
 * Check if ML search analysis is available
 */
export function isSearchAnalysisAvailable(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}
