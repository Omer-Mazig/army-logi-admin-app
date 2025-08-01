import { QueryClient } from "@tanstack/react-query";
import { QueryCache } from "@tanstack/react-query";
import { ZodError } from "zod";
import axios from "axios";

/**
 * Query client instance
 * @description Query client instance for the application
 * @returns {QueryClient} Query client instance
 */
export const queryClientInstance = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // For development, log the error and query (e.g. validator errors)
      if (import.meta.env.DEV) {
        console.error({ error, query });
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => handleRetry(failureCount, error),
    },
    mutations: {
      onError: (error, variables, context) => {
        // For development, log the error and query (e.g. validator errors)
        if (import.meta.env.DEV) {
          console.error({ error, variables, context });
        }
      },
    },
  },
});

/**
 * Handles retry logic for API calls.
 * @param failureCount - The number of times the call has failed.
 * @param error - The error object.
 * @param retryLimit - The maximum number of retries.
 * @returns True if the call should be retried, false otherwise.
 */
export const handleRetry = (
  failureCount: number,
  error: unknown,
  retryLimit: number = 3
) => {
  // Don't retry if we've exceeded the retry limit
  if (failureCount >= retryLimit) {
    return false;
  }

  // Don't retry on Zod validation errors
  if (error instanceof ZodError) {
    return false;
  }

  if (
    axios.isAxiosError(error) &&
    "response" in error &&
    error.response &&
    "status" in error.response
  ) {
    if (error.response.status === 400) {
      return false;
    }
    if (error.response.status === 401) {
      // Could check if it's a token expiry and we have refresh capability
      // If we can refresh the token, we might want to retry
      return false;
    }
    if (error.response.status === 403) {
      return false;
    }
    if (error.response.status === 404) {
      return false;
    }
    if (error.response.status === 413) {
      // Definitely don't retry - payload size won't change
      return false;
    }
    if (error.response.status === 429) {
      // TODO: Should check Retry-After header and retry accordingly
      // ... implement delay logic
      return true;
    }
  }

  return true;
};
