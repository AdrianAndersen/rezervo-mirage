/**
 * A minimal in-memory, per-key sliding-window rate limiter used to throttle
 * admin login attempts and blunt brute-force guessing. Only failed attempts are
 * recorded; a successful login should `reset` the key. State lives in the server
 * process (no external store) — adequate for a single-instance test provider.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the key is allowed again (0 when already allowed). */
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  /** Failed attempts allowed within the window before blocking. */
  maxAttempts: number;
  /** Sliding window length in milliseconds. */
  windowMs: number;
}

export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly options: RateLimiterOptions) {}

  /** Timestamps for `key` that are still within the window ending at `now`. */
  private recent(key: string, now: number): number[] {
    const cutoff = now - this.options.windowMs;
    const pruned = (this.hits.get(key) ?? []).filter((t) => t > cutoff);
    if (pruned.length > 0) {
      this.hits.set(key, pruned);
    } else {
      this.hits.delete(key);
    }
    return pruned;
  }

  /** Whether `key` may attempt now, and if not, when it may retry. */
  check(key: string, now: number = Date.now()): RateLimitResult {
    const recent = this.recent(key, now);
    if (recent.length < this.options.maxAttempts) {
      return { allowed: true, retryAfterSeconds: 0 };
    }
    const oldest = recent[0] as number;
    const readyAt = oldest + this.options.windowMs;
    return { allowed: false, retryAfterSeconds: Math.ceil((readyAt - now) / 1000) };
  }

  /** Record a failed attempt for `key`. */
  recordFailure(key: string, now: number = Date.now()): void {
    const recent = this.recent(key, now);
    recent.push(now);
    this.hits.set(key, recent);
  }

  /** Clear all recorded attempts for `key` (e.g. after a successful login). */
  reset(key: string): void {
    this.hits.delete(key);
  }
}
