import { NextResponse } from "next/server"
import { prisma }       from "@/lib/prisma"
import getServerSession from "@/utils/getServerSession"

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { name?: string; domain?: string; framework?: string; databaseId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { name, domain, framework, databaseId } = body

  if (!name || !domain || !databaseId) {
    return NextResponse.json(
      { error: "name, domain and databaseId are required" },
      { status: 400 }
    )
  }

  // Verify the database belongs to this user
  const database = await prisma.database.findFirst({
    where:  { id: databaseId, userId: session.user.id },
    select: { id: true },
  })

  if (!database) {
    return NextResponse.json(
      { error: "Database not found" },
      { status: 404 }
    )
  }

  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase()

  try {
    const app = await prisma.app.create({
      data: {
        name,
        domain:     cleanDomain,
        framework:  framework ?? "nextjs",
        databaseId,
        userId:     session.user.id,
        status:     "WAITING",
      },
      select: {
        id:         true,
        trackingId: true,
        name:       true,
        domain:     true,
        framework:  true,
        status:     true,
        createdAt:  true,
        database: {
          select: {
            id:        true,
            name:      true,
            dbType:    true,
            isHealthy: true,
          },
        },
      },
    })

    return NextResponse.json(app, { status: 201 })
  } catch (err) {
    console.error("[apps/create]", err)
    return NextResponse.json({ error: "Failed to create app" }, { status: 500 })
  }
}