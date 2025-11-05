/**
 * Performance Tests
 * Basic performance testing utilities for API endpoints
 */

import { performance } from 'perf_hooks';

export interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  totalDuration: number;
}

export interface LoadTestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  concurrentUsers?: number;
  requestsPerUser?: number;
  timeout?: number;
}

/**
 * Perform a load test on an endpoint
 */
export async function performLoadTest(
  options: LoadTestOptions
): Promise<PerformanceMetrics> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    concurrentUsers = 10,
    requestsPerUser = 10,
    timeout = 30000,
  } = options;

  const responseTimes: number[] = [];
  let successCount = 0;
  let failureCount = 0;

  const startTime = performance.now();

  // Create promises for concurrent users
  const userPromises = Array.from({ length: concurrentUsers }, async () => {
    for (let i = 0; i < requestsPerUser; i++) {
      const requestStart = performance.now();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal: controller.signal,
        };

        if (body && method !== 'GET') {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        const requestEnd = performance.now();

        responseTimes.push(requestEnd - requestStart);

        if (response.ok) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        const requestEnd = performance.now();
        responseTimes.push(requestEnd - requestStart);
        failureCount++;
      }
    }
  });

  await Promise.all(userPromises);

  const endTime = performance.now();
  const totalDuration = (endTime - startTime) / 1000; // Convert to seconds

  const averageResponseTime =
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);

  return {
    totalRequests: responseTimes.length,
    successfulRequests: successCount,
    failedRequests: failureCount,
    averageResponseTime,
    minResponseTime,
    maxResponseTime,
    requestsPerSecond: responseTimes.length / totalDuration,
    totalDuration,
  };
}

/**
 * Stress test - gradually increase load
 */
export async function performStressTest(
  options: LoadTestOptions,
  stages: { duration: number; concurrentUsers: number }[]
): Promise<PerformanceMetrics[]> {
  const results: PerformanceMetrics[] = [];

  for (const stage of stages) {
    const stageOptions = {
      ...options,
      concurrentUsers: stage.concurrentUsers,
    };

    const metrics = await performLoadTest(stageOptions);
    results.push(metrics);

    // Wait between stages
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Response time benchmark
 */
export async function benchmarkResponseTime(
  url: string,
  iterations: number = 100
): Promise<{ average: number; median: number; p95: number; p99: number }> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fetch(url);
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);

  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];

  return { average, median, p95, p99 };
}
