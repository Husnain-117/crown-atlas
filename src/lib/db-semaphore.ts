/**
 * Database Connection Semaphore & Circuit Breaker
 * 
 * Prevents connection pool exhaustion by:
 * 1. Limiting concurrent database queries globally via semaphore
 * 2. Circuit breaker pattern to prevent retry storms during high load
 * 3. Queue management with timeout and priority support
 * 4. Graceful degradation under pressure
 */

interface QueueItem {
  resolve: (value: void) => void
  reject: (error: Error) => void
  timestamp: number
  timeoutId: NodeJS.Timeout
}

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  state: 'closed' | 'open' | 'half-open'
  nextAttemptTime: number
}

class DatabaseSemaphore {
  private queue: QueueItem[] = []
  private activeCount = 0
  private readonly maxConcurrent: number
  private readonly queueTimeout: number
  private circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed',
    nextAttemptTime: 0,
  }

  // Circuit breaker configuration
  private readonly failureThreshold = 10 // Open circuit after 10 failures
  private readonly resetTimeout = 30000 // Try to close circuit after 30s
  private readonly halfOpenMaxAttempts = 3 // Allow 3 attempts in half-open state

  constructor(maxConcurrent: number = Number(process.env.DB_SEMAPHORE_MAX || 8), queueTimeoutMs: number = 45000) {
    this.maxConcurrent = maxConcurrent
    this.queueTimeout = queueTimeoutMs
  }

  /**
   * Acquire a semaphore slot. Waits in queue if all slots are taken.
   * Throws if circuit is open or queue timeout is exceeded.
   */
  async acquire(): Promise<() => void> {
    // Check circuit breaker
    this.updateCircuitState()
    
    if (this.circuitBreaker.state === 'open') {
      const waitTime = Math.ceil((this.circuitBreaker.nextAttemptTime - Date.now()) / 1000)
      throw new Error(
        `Circuit breaker is OPEN. Database is overloaded. Retry in ${waitTime}s.`
      )
    }

    // If under limit, grant immediately
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++
      return this.createReleaseFunction()
    }

    // Otherwise, wait in queue
    return new Promise<() => void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        // Remove from queue on timeout
        const index = this.queue.findIndex((item) => item.timeoutId === timeoutId)
        if (index !== -1) {
          this.queue.splice(index, 1)
        }
        reject(
          new Error(
            `Database semaphore queue timeout after ${this.queueTimeout}ms. ` +
            `Active: ${this.activeCount}, Queued: ${this.queue.length}`
          )
        )
      }, this.queueTimeout)

      const queueItem: QueueItem = {
        resolve: () => {
          clearTimeout(timeoutId)
          this.activeCount++
          resolve(this.createReleaseFunction())
        },
        reject: (error: Error) => {
          clearTimeout(timeoutId)
          reject(error)
        },
        timestamp: Date.now(),
        timeoutId,
      }

      this.queue.push(queueItem)
    })
  }

  /**
   * Create a release function that returns the semaphore slot
   */
  private createReleaseFunction(): () => void {
    let released = false
    return () => {
      if (released) return
      released = true
      
      this.activeCount--
      this.processQueue()
    }
  }

  /**
   * Process the next item in queue if slots are available
   */
  private processQueue(): void {
    if (this.queue.length === 0 || this.activeCount >= this.maxConcurrent) {
      return
    }

    const next = this.queue.shift()
    if (next) {
      next.resolve()
    }
  }

  /**
   * Record a successful query (helps close circuit)
   */
  recordSuccess(): void {
    if (this.circuitBreaker.state === 'half-open') {
      // Successful query in half-open state -> close circuit
      this.circuitBreaker.state = 'closed'
      this.circuitBreaker.failures = 0
      console.log('[DB Semaphore] Circuit breaker CLOSED (recovered)')
    } else if (this.circuitBreaker.failures > 0) {
      // Gradually reduce failure count on success
      this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1)
    }
  }

  /**
   * Record a failed query (may open circuit)
   */
  recordFailure(error: Error): void {
    const errorMessage = error.message.toLowerCase()
    
    // Only count connection/timeout errors, not business logic errors
    const isConnectionError =
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('econnreset') ||
      errorMessage.includes('pool')

    if (!isConnectionError) {
      return // Don't count non-connection errors
    }

    this.circuitBreaker.failures++
    this.circuitBreaker.lastFailureTime = Date.now()

    if (this.circuitBreaker.failures >= this.failureThreshold) {
      this.circuitBreaker.state = 'open'
      this.circuitBreaker.nextAttemptTime = Date.now() + this.resetTimeout
      console.error(
        `[DB Semaphore] Circuit breaker OPENED after ${this.circuitBreaker.failures} failures. ` +
        `Will retry in ${this.resetTimeout / 1000}s`
      )
    }
  }

  /**
   * Update circuit breaker state based on time
   */
  private updateCircuitState(): void {
    const now = Date.now()

    if (this.circuitBreaker.state === 'open' && now >= this.circuitBreaker.nextAttemptTime) {
      // Transition to half-open to test if system recovered
      this.circuitBreaker.state = 'half-open'
      this.circuitBreaker.failures = 0
      console.log('[DB Semaphore] Circuit breaker HALF-OPEN (testing recovery)')
    }
  }

  /**
   * Get current semaphore statistics
   */
  getStats(): {
    active: number
    queued: number
    maxConcurrent: number
    circuitState: string
    failures: number
  } {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      circuitState: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures,
    }
  }

  /**
   * Manually reset circuit breaker (for admin/debugging)
   */
  resetCircuit(): void {
    this.circuitBreaker.state = 'closed'
    this.circuitBreaker.failures = 0
    this.circuitBreaker.lastFailureTime = 0
    this.circuitBreaker.nextAttemptTime = 0
    console.log('[DB Semaphore] Circuit breaker manually RESET')
  }
}

// Global singleton instance
// Max concurrent: 8 by default. Build workers and serverless instances can run
// in parallel, so keep the per-instance query fan-out below the pool size.
// Queue timeout: 45s (less than Next.js serverless timeout)
const globalDbSemaphore = new DatabaseSemaphore(
  Number(process.env.DB_SEMAPHORE_MAX_CONCURRENT || process.env.DB_SEMAPHORE_MAX || 8),
  Number(process.env.DB_SEMAPHORE_QUEUE_TIMEOUT_MS || 45000)
)

/**
 * Execute a database query with semaphore protection
 * 
 * Usage:
 * ```ts
 * const result = await withDbSemaphore(async () => {
 *   const pool = await getPool()
 *   return pool.query('SELECT * FROM properties WHERE id = $1', [id])
 * })
 * ```
 */
export async function withDbSemaphore<T>(
  queryFn: () => Promise<T>,
  options: { skipSemaphore?: boolean } = {}
): Promise<T> {
  // Allow bypassing semaphore for critical queries (e.g., health checks)
  if (options.skipSemaphore) {
    return queryFn()
  }

  const release = await globalDbSemaphore.acquire()
  
  try {
    const result = await queryFn()
    globalDbSemaphore.recordSuccess()
    return result
  } catch (error) {
    globalDbSemaphore.recordFailure(error as Error)
    throw error
  } finally {
    release()
  }
}

/**
 * Get semaphore statistics (for monitoring/debugging)
 */
export function getDbSemaphoreStats() {
  return globalDbSemaphore.getStats()
}

/**
 * Reset circuit breaker (for admin endpoints)
 */
export function resetDbCircuitBreaker() {
  globalDbSemaphore.resetCircuit()
}
