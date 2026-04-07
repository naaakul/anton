import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import getServerSession from "@/utils/getServerSession"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { appId } = await params
  const app = await prisma.app.findFirst({
    where:  { id: appId, userId: session.user.id },
    select: { id: true, name: true, domain: true, status: true, lastSeenAt: true },
  })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(app)
}