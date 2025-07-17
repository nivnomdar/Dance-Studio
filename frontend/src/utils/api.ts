// Global API throttling utility with per-endpoint tracking
interface EndpointThrottle {
  lastRequestTime: number;
  requestCount: number;
  backoffMultiplier: number;
}

const endpointThrottles: Map<string, EndpointThrottle> = new Map();
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds base interval
const MAX_REQUEST_INTERVAL = 10000; // 10 seconds max interval
const MAX_REQUESTS_PER_MINUTE = 30; // Max requests per minute per endpoint
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
  
  // If we've made too many requests recently, increase delay
  if (throttle.requestCount > MAX_REQUESTS_PER_MINUTE) {
    return Math.max(baseDelay, 5000); // At least 5 seconds
  }
  
  // If enough time has passed, reset backoff
  if (timeSinceLastRequest > 60000) { // 1 minute
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
    // Reset backoff on success
    throttle.backoffMultiplier = Math.max(1, throttle.backoffMultiplier / 1.2);
    throttle.requestCount++;
  } else {
    // Increase backoff on failure
    throttle.backoffMultiplier = Math.min(10, throttle.backoffMultiplier * BACKOFF_MULTIPLIER);
  }
};

/**
 * Global throttled fetch function with per-endpoint throttling
 */
export const throttledApiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const endpointKey = getEndpointKey(url);
  const delay = calculateDelay(endpointKey);
  
  // Debug logging
  if (delay > 0) {
            // console.log(`Throttling ${endpointKey}: waiting ${delay}ms`);
  }
  
  // Wait if needed
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  try {
    const response = await fetch(url, options);
    
    // Update throttle based on response
    const success = response.ok || response.status === 429; // Don't penalize for 429s
    updateThrottle(endpointKey, success);
    
    // If we get a 429, increase backoff for this endpoint
    if (response.status === 429) {
      const throttle = getEndpointThrottle(endpointKey);
      throttle.backoffMultiplier = Math.min(10, throttle.backoffMultiplier * 2);
      
      console.warn(`Rate limited (429) for ${endpointKey}. Backoff multiplier: ${throttle.backoffMultiplier}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Retry once with exponential backoff
      const retryDelay = Math.min(10000, MIN_REQUEST_INTERVAL * throttle.backoffMultiplier);
              // console.log(`Retrying ${endpointKey} after ${retryDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      const retryResponse = await fetch(url, options);
      updateThrottle(endpointKey, retryResponse.ok);
      return retryResponse;
    }
    
    return response;
  } catch (error) {
    updateThrottle(endpointKey, false);
    throw error;
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