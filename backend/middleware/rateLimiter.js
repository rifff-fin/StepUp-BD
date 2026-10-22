/**
 * Small in-memory rate limiter (fixed window per client IP), enough for a single API
 * instance. Use a shared store (e.g. Redis) if the API is ever scaled to several instances.
 *
 *   router.post('/', rateLimiter({ windowMs: 10 * 60 * 1000, max: 20 }), handler)
 */
const rateLimiter = ({ windowMs = 60 * 1000, max = 30, message } = {}) => {
  const hits = new Map(); // ip -> { count, resetAt }

  // Drop expired windows now and then so the map cannot grow forever
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(ip);
    }
  }, windowMs);
  sweep.unref();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    let entry = hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(ip, entry);
    }
    entry.count += 1;

    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({
        message: message || 'Too many requests, please try again in a few minutes',
      });
    }
    next();
  };
};

module.exports = { rateLimiter };
