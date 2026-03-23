
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import getServerSession from "@/utils/getServerSession"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apps = await prisma.app.findMany({
    where: { userId: session.user.id },
    select: {
      id:         true,
      trackingId: true,
      name:       true,
      domain:     true,
      framework:  true,
      dbType:     true,
      createdAt:  true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(apps)
}