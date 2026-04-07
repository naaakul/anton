// app/api/apps/[appId]/concurrent/route.ts
import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import getServerSession from "@/utils/getServerSession"
import { decrypt }      from "@/lib/crypto"
import { runPgQuery }   from "@/lib/db/connections"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { appId } = await params
  const app = await prisma.app.findFirst({
    where:  { id: appId, userId: session.user.id },
    select: { id: true, trackingId: true, database: { select: { encryptedDbUri: true } } },
  })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const dbUri = decrypt(app.database.encryptedDbUri)

  // Concurrent = unique visitors active in last 5 minutes
  const rows = await runPgQuery<{ count: string }>(app.id, dbUri, `
    SELECT COUNT(DISTINCT visitor_hash) AS count
    FROM antz_pageviews
    WHERE tracking_id = $1
      AND created_at >= NOW() - INTERVAL '5 minutes'
  `, [app.trackingId])

  return NextResponse.json({ count: Number(rows[0]?.count ?? 0) })
}