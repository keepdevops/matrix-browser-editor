'use strict';

// Simple sliding-window rate limiter — no external deps.
// Tracks request timestamps per IP in a Map; evicts old entries on each check.

const windows = new Map(); // ip → number[]

/**
 * @param {number} max   max requests allowed in the window
 * @param {number} windowMs  window size in milliseconds
 */
function rateLimit(max, windowMs) {
  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const cutoff = now - windowMs;

    const hits = (windows.get(ip) ?? []).filter(t => t > cutoff);
    if (hits.length >= max) {
      const retryAfter = Math.ceil((hits[0] - cutoff) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: `Too many requests — please wait ${retryAfter}s before retrying.`,
      });
    }

    hits.push(now);
    windows.set(ip, hits);
    next();
  };
}

// Periodically clear IPs with no recent activity to prevent memory growth
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [ip, hits] of windows) {
    if (!hits.some(t => t > cutoff)) windows.delete(ip);
  }
}, 60_000);

module.exports = { rateLimit };
