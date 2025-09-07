// Global API throttling utility with per-endpoint tracking
interface EndpointThrottle {
  lastRequestTime: number;
  requestCount: number;
  backoffMultiplier: number;
}

const endpointThrottles: Map<string, EndpointThrottle> = new Map();
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds base interval
const MAX_REQUEST_INTERVAL = 30000; // 30 seconds max interval
const BACKOFF_MULTIPLIER = 1.5; // Exponential backoff multiplier

/**
 * Get endpoint key from URL
 */
const getEndpointKey = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    // Fallback for relative URLs
    return url.split('?')[0];
  }
};

/**
 * Get throttle info for endpoint
 */
const getEndpointThrottle = (endpointKey: string): EndpointThrottle => {
  if (!endpointThrottles.has(endpointKey)) {
    endpointThrottles.set(endpointKey, {
      lastRequestTime: 0,
      requestCount: 0,
      backoffMultiplier: 1
    });
  }
  return endpointThrottles.get(endpointKey)!;
};

/**
 * Calculate delay for endpoint
 */
const calculateDelay = (endpointKey: string): number => {
  const throttle = getEndpointThrottle(endpointKey);
  const now = Date.now();
  const timeSinceLastRequest = now - throttle.lastRequestTime;
  
  // Base delay with exponential backoff
  const baseDelay = Math.min(
    MIN_REQUEST_INTERVAL * throttle.backoffMultiplier,
    MAX_REQUEST_INTERVAL
  );
  
  // If enough time has passed (1 minute), reset backoff and request count.
  if (timeSinceLastRequest > 60000) { 
    throttle.backoffMultiplier = 1;
    throttle.requestCount = 0;
  }
  
  return Math.max(0, baseDelay - timeSinceLastRequest);
};

/**
 * Update throttle info after request
 */
const updateThrottle = (endpointKey: string, success: boolean): void => {
  const throttle = getEndpointThrottle(endpointKey);
  throttle.lastRequestTime = Date.now();
  
  if (success) {
    // Reset backoff more aggressively on success, but ensure it doesn't go below 1
    throttle.backoffMultiplier = Math.max(1, throttle.backoffMultiplier / 1.5); 
    throttle.requestCount++; // Increment only on successful requests (non-429 handling)
  } else {
    // For non-429 failures, reset backoff or slightly increase for general errors
    throttle.backoffMultiplier = Math.max(1, throttle.backoffMultiplier * 1.1); // Slight increase for non-429 errors
  }
};

/**
 * Global throttled fetch function with per-endpoint throttling
 */
export const throttledApiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const endpointKey = getEndpointKey(url);
  let currentThrottle = getEndpointThrottle(endpointKey);
  const maxRetries = 5; // Allow up to 5 retries for 429 errors
  let retries = 0;

  while (true) {
    const delay = calculateDelay(endpointKey);

    // Debug logging
    if (delay > 0) {
      console.log(`Throttling ${endpointKey}: waiting ${delay}ms`);
    }

    // Wait if needed
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        retries++;
        if (retries <= maxRetries) {
          // Only increase backoff for 429s, and this is the main place it should happen
          currentThrottle.backoffMultiplier = Math.min(10, currentThrottle.backoffMultiplier * BACKOFF_MULTIPLIER);
          console.warn(`Rate limited (429) for ${endpointKey}. Retrying ${retries}/${maxRetries} after backoff multiplier: ${currentThrottle.backoffMultiplier}`);
          continue; // Go to next iteration of while loop to re-calculate delay and retry
        } else {
          console.error(`Max retries reached for ${endpointKey}. Aborting request.`);
          updateThrottle(endpointKey, false); // Mark as failure after max retries
          throw new Error(`HTTP 429: Too many requests, please try again later.`);
        }
      }

      // For non-429 responses, update throttle normally
      // Success is determined by response.ok, not just !429
      updateThrottle(endpointKey, response.ok);
      return response;
    } catch (error) {
      console.error(`Error in throttledApiFetch for ${endpointKey}:`, error);
      updateThrottle(endpointKey, false); // Mark as failure
      throw error;
    }
  }
};

/**
 * Reset throttling for specific endpoint (useful for testing)
 */
export const resetEndpointThrottle = (endpointKey: string): void => {
  endpointThrottles.delete(endpointKey);
};

/**
 * Reset all throttling (useful for testing)
 */
export const resetAllThrottles = (): void => {
  endpointThrottles.clear();
};

/**
 * Debug function to get current throttle status
 */
export const getThrottleStatus = (): Record<string, EndpointThrottle> => {
  const status: Record<string, EndpointThrottle> = {};
  for (const [key, throttle] of endpointThrottles.entries()) {
    status[key] = { ...throttle };
  }
  return status;
}; 