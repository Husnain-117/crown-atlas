import { NextResponse } from "next/server"
import { getDbSemaphoreStats, resetDbCircuitBreaker } from "@/lib/db-semaphore"
import { getPool } from "@/lib/db"
import { authorizeServerRequest } from "@/lib/server-route-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, "admin")
  if (unauthorized) return unauthorized

  try {
    const semaphoreStats = getDbSemaphoreStats()
    
    let poolStats = null
    try {
      const pool = await getPool()
      poolStats = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount,
      }
    } catch (poolError) {
      poolStats = { error: (poolError as Error).message }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      semaphore: semaphoreStats,
      pool: poolStats,
      healthy: semaphoreStats.circuitState === 'closed' && semaphoreStats.queued < 10,
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const unauthorized = authorizeServerRequest(request, "admin")
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    
    if (body.action === 'reset-circuit') {
      resetDbCircuitBreaker()
      return NextResponse.json({ 
        success: true, 
        message: 'Circuit breaker reset successfully' 
      })
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
