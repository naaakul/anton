import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import getServerSession from "@/utils/getServerSession"

export async function POST(req: Request) {

  const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()

  const { name, dbUri } = body

  const app = await prisma.app.create({
    data: {
      name,
      dbUri,
      userId: session.user.id
    }
  })

  return NextResponse.json(app)
}