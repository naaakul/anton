import { NextResponse } from "next/server"
import getServerSession from "@/utils/getServerSession"

const TIMEOUT_MS = 5000

async function testPostgres(uri: string): Promise<void> {
  const { Client } = await import("pg")
  const client = new Client({ connectionString: uri, connectionTimeoutMillis: TIMEOUT_MS })
  await client.connect()
  await client.query("SELECT 1")
  await client.end()
}

async function testMongo(uri: string): Promise<void> {
  const { MongoClient } = await import("mongodb")
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: TIMEOUT_MS })
  await client.connect()
  await client.db().admin().ping()
  await client.close()
}

export async function POST(req: Request) {
  const session = await getServerSession()
  console.log("SESSION DEBUG:", JSON.stringify(session, null, 2))

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { dbUri?: string; dbType?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { dbUri, dbType } = body

  if (!dbUri || !dbType) {
    return NextResponse.json(
      { error: "dbUri and dbType are required" },
      { status: 400 }
    )
  }

  if (dbType !== "POSTGRES" && dbType !== "MONGODB") {
    return NextResponse.json(
      { error: "dbType must be POSTGRES or MONGODB" },
      { status: 400 }
    )
  }

  // Race the actual test against a hard timeout
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Connection timed out after 5s")), TIMEOUT_MS)
  )

  try {
    if (dbType === "POSTGRES") {
      await Promise.race([testPostgres(dbUri), timeout])
    } else {
      await Promise.race([testMongo(dbUri), timeout])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed"

    // Scrub the URI from any driver error messages before sending to client
    const safeMessage = message.replace(/mongodb(\+srv)?:\/\/[^\s]*/gi, "[uri]")
                               .replace(/postgres(ql)?:\/\/[^\s]*/gi, "[uri]")

    return NextResponse.json({ error: safeMessage }, { status: 400 })
  }
}