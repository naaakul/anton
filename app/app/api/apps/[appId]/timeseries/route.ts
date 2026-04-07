import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import getServerSession from "@/utils/getServerSession"
import { decrypt }      from "@/lib/crypto"
import { runPgQuery }   from "@/lib/db/connections"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { appId } = await params
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") ?? "7d"

  const app = await prisma.app.findFirst({
    where:  { id: appId, userId: session.user.id },
    select: { id: true, database: { select: { encryptedDbUri: true } } },
  })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const dbUri    = decrypt(app.database.encryptedDbUri)
  const interval = range === "30d" ? "30 days" : range === "90d" ? "90 days" : "7 days"
  const trunc    = range === "90d" ? "week" : "day"

  const rows = await runPgQuery(app.id, dbUri, `
    SELECT
      date_trunc($1, created_at)             AS date,
      COUNT(*)                               AS pageviews,
      COUNT(DISTINCT visitor_hash)           AS visitors
    FROM antz_pageviews
    WHERE created_at >= NOW() - INTERVAL '${interval}'
    GROUP BY 1
    ORDER BY 1 ASC
  `, [trunc])

  return NextResponse.json(rows)
}