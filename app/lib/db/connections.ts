// lib/db/connections.ts

import { decrypt } from "@/lib/crypto"

const QUERY_TIMEOUT_MS = 10_000

// ── Connection cache ───────────────────────────────────────────────────────────
// Keyed by appId so we reuse connections across requests instead of
// opening a new one on every dashboard query.

const pgPool   = new Map<string, import("pg").Pool>()
const mongoMap = new Map<string, import("mongodb").MongoClient>()

// ── Postgres ───────────────────────────────────────────────────────────────────

export async function getPgPool(appId: string, encryptedUri: string) {
  if (pgPool.has(appId)) return pgPool.get(appId)!

  const { Pool } = await import("pg")

  const pool = new Pool({
    connectionString:        decrypt(encryptedUri),
    max:                     3,           // small pool — this is a user's DB, be respectful
    idleTimeoutMillis:       30_000,
    connectionTimeoutMillis: QUERY_TIMEOUT_MS,
    ssl: shouldUseSsl(decrypt(encryptedUri)) ? { rejectUnauthorized: false } : false,
  })

  // Verify it actually works before caching
  const client = await pool.connect()
  await client.query("SELECT 1")
  client.release()

  pool.on("error", () => {
    // If the pool breaks, evict it so the next request gets a fresh one
    pgPool.delete(appId)
  })

  pgPool.set(appId, pool)
  return pool
}

export async function runPgQuery<T = unknown>(
  appId:  string,
  rawUri: string,       
  sql:    string,
  params: unknown[] = []
): Promise<T[]> {
  const { Pool } = await import("pg")

  if (!pgPool.has(appId)) {
    const pool = new Pool({
      connectionString:        rawUri,
      max:                     3,
      idleTimeoutMillis:       30_000,
      connectionTimeoutMillis: 10_000,
      ssl: !rawUri.includes("localhost") ? { rejectUnauthorized: false } : false,
    })
    pool.on("error", () => pgPool.delete(appId))
    pgPool.set(appId, pool)
  }

  const pool   = pgPool.get(appId)!
  const client = await pool.connect()

  try {
    await client.query(`SET statement_timeout = 10000`)
    const result = await client.query(sql, params)
    return result.rows as T[]
  } finally {
    client.release()
  }
}

// ── MongoDB ────────────────────────────────────────────────────────────────────

export async function getMongoClient(appId: string, encryptedUri: string) {
  if (mongoMap.has(appId)) return mongoMap.get(appId)!

  const { MongoClient } = await import("mongodb")

  const client = new MongoClient(decrypt(encryptedUri), {
    maxPoolSize:              3,
    serverSelectionTimeoutMS: QUERY_TIMEOUT_MS,
    socketTimeoutMS:          QUERY_TIMEOUT_MS,
  })

  await client.connect()

  client.on("error", () => {
    mongoMap.delete(appId)
  })

  mongoMap.set(appId, client)
  return client
}

export async function getMongoDb(appId: string, encryptedUri: string, dbName?: string) {
  const client = await getMongoClient(appId, encryptedUri)
  return client.db(dbName) // if dbName is undefined, uses the db from the URI
}

// ── Unified query runner ───────────────────────────────────────────────────────
// This is what your dashboard API routes will call — they don't need to
// know which driver is underneath.

import type { DbType } from "@prisma/client"

type AppConnection = {
  appId:         string
  dbType:        DbType
  encryptedUri:  string
  dbName?:       string   // optional override for mongo DB name
}

export type QueryRunner = {
  pg:    (sql: string, params?: unknown[]) => Promise<unknown[]>
  mongo: (fn: (db: import("mongodb").Db) => Promise<unknown>) => Promise<unknown>
}

export async function getQueryRunner({
  appId,
  dbType,
  encryptedUri,
  dbName,
}: AppConnection): Promise<QueryRunner> {
  return {
    pg: (sql, params = []) => {
      if (dbType !== "POSTGRES") throw new Error("This app is not a Postgres app")
      return runPgQuery(appId, encryptedUri, sql, params)
    },
    mongo: async (fn) => {
      if (dbType !== "MONGODB") throw new Error("This app is not a MongoDB app")
      const db = await getMongoDb(appId, encryptedUri, dbName)
      return fn(db)
    },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function shouldUseSsl(uri: string): boolean {
  // Most hosted Postgres (Supabase, Neon, Railway, RDS) require SSL.
  // Localhost connections usually don't.
  return !uri.includes("localhost") && !uri.includes("127.0.0.1")
}

// ── Cleanup (call in long-running processes / tests) ──────────────────────────

export async function closeAll() {
  await Promise.all([
    ...[...pgPool.values()].map((p) => p.end()),
    ...[...mongoMap.values()].map((c) => c.close()),
  ])
  pgPool.clear()
  mongoMap.clear()
}

