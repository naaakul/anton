import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import getServerSession from "@/utils/getServerSession"
import { decrypt }      from "@/lib/crypto"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ dbId: string }> }
) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { dbId } = await params

  const database = await prisma.database.findFirst({
    where:  { id: dbId, userId: session.user.id },
    select: { id: true, encryptedDbUri: true, dbType: true },
  })

  if (!database) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  let dbUri: string
  try {
    dbUri = decrypt(database.encryptedDbUri)
  } catch {
    return NextResponse.json(
      { error: "Failed to decrypt credentials" },
      { status: 500 }
    )
  }

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

    await prisma.database.update({
      where: { id: dbId },
      data:  { isHealthy: true, lastHealthAt: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Health check failed"
    const safe    = message.replace(/postgres(ql)?:\/\/[^\s]*/gi, "[uri]")

    await prisma.database.update({
      where: { id: dbId },
      data:  { isHealthy: false },
    })

    return NextResponse.json({ error: safe }, { status: 400 })
  }
}