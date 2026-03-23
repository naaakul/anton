import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import getServerSession from "@/utils/getServerSession";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; domain?: string; dbType?: string; dbUri?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, domain, dbType, dbUri } = body;

  // ── Validate required fields ──────────────────────────────────
  if (!name || !domain || !dbType || !dbUri) {
    return NextResponse.json(
      { error: "name, domain, dbType and dbUri are all required" },
      { status: 400 },
    );
  }

  if (dbType !== "POSTGRES" && dbType !== "MONGODB") {
    return NextResponse.json(
      { error: "dbType must be POSTGRES or MONGODB" },
      { status: 400 },
    );
  }

  // ── Validate URI format matches declared type ─────────────────
  const uriLower = dbUri.toLowerCase();
  if (dbType === "POSTGRES" && !uriLower.startsWith("postgres")) {
    return NextResponse.json(
      { error: "URI does not look like a PostgreSQL connection string" },
      { status: 400 },
    );
  }
  if (dbType === "MONGODB" && !uriLower.startsWith("mongodb")) {
    return NextResponse.json(
      { error: "URI does not look like a MongoDB connection string" },
      { status: 400 },
    );
  }

  // ── Sanitise domain (strip protocol if user sneaked one in) ───
  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();

  // ── Encrypt before touching the DB ────────────────────────────
  let encryptedDbUri: string;
  try {
    encryptedDbUri = encrypt(dbUri);
  } catch {
    return NextResponse.json(
      { error: "Failed to encrypt credentials" },
      { status: 500 },
    );
  }

  // ── Persist ───────────────────────────────────────────────────
  try {
    const app = await prisma.app.create({
      select: {
        id: true,
        trackingId: true,
        name: true,
        domain: true,
        dbType: true,
        createdAt: true,
      },
      data: {
        name,
        domain: cleanDomain,
        dbType,
        encryptedDbUri,
        userId: session.user.id,
      },
    });

    return NextResponse.json(app, { status: 201 });
  } catch (err) {
    console.error("[apps/create]", err);
    return NextResponse.json(
      { error: "Failed to create app" },
      { status: 500 },
    );
  }
}
