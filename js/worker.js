/**
 * Web Worker for streaming Monte Carlo sampling.
 * Posts batches of points+values back to the main thread.
 */
import { methods } from './methods.js';

onmessage = function (e) {
  const { methodKey, total, batchSize } = e.data;
  let count = 0;
  const fn = methods[methodKey] || methods.quarter;
  while (count < total) {
    const thisBatch = Math.min(batchSize, total - count);
    const { points, values } = fn(thisBatch);
    postMessage({ points, values });
    count += thisBatch;
  }
  postMessage({ done: true });
};
