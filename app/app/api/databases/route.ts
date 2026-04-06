import { NextResponse }   from "next/server"
import { prisma }         from "@/lib/prisma"
import getServerSession   from "@/utils/getServerSession"
import { encrypt }        from "@/lib/crypto"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const databases = await prisma.database.findMany({
    where:   { userId: session.user.id },
    select: {
      id:           true,
      name:         true,
      dbType:       true,
      isHealthy:    true,
      lastHealthAt: true,
      createdAt:    true,
      _count:       { select: { apps: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(databases)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { name?: string; dbUri?: string; dbType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { name, dbUri, dbType } = body

  if (!name || !dbUri || !dbType) {
    return NextResponse.json(
      { error: "name, dbUri and dbType are required" },
      { status: 400 }
    )
  }

  if (dbType !== "POSTGRES" && dbType !== "MONGODB") {
    return NextResponse.json(
      { error: "dbType must be POSTGRES or MONGODB" },
      { status: 400 }
    )
  }

  // Test connection before saving
  try {
    const { Client } = await import("pg")
    const client = new Client({
      connectionString:        dbUri,
      connectionTimeoutMillis: 5000,
      ssl: !dbUri.includes("localhost") ? { rejectUnauthorized: false } : false,
    })
    await client.connect()
    await client.query("SELECT 1")
    await client.end()
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed"
    const safe    = message.replace(/postgres(ql)?:\/\/[^\s]*/gi, "[uri]")
    return NextResponse.json({ error: safe }, { status: 400 })
  }

  let encryptedDbUri: string
  try {
    encryptedDbUri = encrypt(dbUri)
  } catch {
    return NextResponse.json(
      { error: "Failed to encrypt credentials" },
      { status: 500 }
    )
  }

  try {
    const database = await prisma.database.create({
      data: {
        name,
        dbType,
        encryptedDbUri,
        userId:      session.user.id,
        isHealthy:   true,
        lastHealthAt: new Date(),
      },
      select: {
        id:           true,
        name:         true,
        dbType:       true,
        isHealthy:    true,
        lastHealthAt: true,
        createdAt:    true,
        _count:       { select: { apps: true } },
      },
    })

    return NextResponse.json(database, { status: 201 })
  } catch (err) {
    console.error("[databases/create]", err)
    return NextResponse.json({ error: "Failed to save database" }, { status: 500 })
  }
}