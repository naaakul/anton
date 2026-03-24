import { NextResponse } from "next/server"
import getServerSession from "@/utils/getServerSession"

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { dbUri?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { dbUri } = body
  if (!dbUri) return NextResponse.json({ error: "dbUri required" }, { status: 400 })

  try {
    const { Client } = await import("pg")
    const client = new Client({
      connectionString:        dbUri,
      connectionTimeoutMillis: 8000,
      ssl: !dbUri.includes("localhost") ? { rejectUnauthorized: false } : false,
    })
    await client.connect()

    await client.query(`
      CREATE TABLE IF NOT EXISTS antz_pageviews (
        id           BIGSERIAL    PRIMARY KEY,
        tracking_id  TEXT         NOT NULL,
        url          TEXT         NOT NULL,
        referrer     TEXT,
        utm_source   TEXT,
        utm_medium   TEXT,
        utm_campaign TEXT,
        utm_term     TEXT,
        utm_content  TEXT,
        country      TEXT,
        city         TEXT,
        device       TEXT,
        browser      TEXT,
        os           TEXT,
        duration_ms  INTEGER,
        visitor_hash TEXT,
        session_hash TEXT,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS antz_events (
        id           BIGSERIAL    PRIMARY KEY,
        tracking_id  TEXT         NOT NULL,
        name         TEXT         NOT NULL,
        properties   JSONB,
        url          TEXT,
        visitor_hash TEXT,
        session_hash TEXT,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS antz_sessions (
        id           BIGSERIAL    PRIMARY KEY,
        tracking_id  TEXT         NOT NULL,
        session_hash TEXT         NOT NULL UNIQUE,
        visitor_hash TEXT,
        entry_url    TEXT,
        exit_url     TEXT,
        duration_ms  INTEGER      DEFAULT 0,
        page_count   INTEGER      DEFAULT 1,
        country      TEXT,
        device       TEXT,
        browser      TEXT,
        os           TEXT,
        referrer     TEXT,
        started_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_pageviews_tracking  ON antz_pageviews(tracking_id);
      CREATE INDEX IF NOT EXISTS idx_pageviews_created   ON antz_pageviews(created_at);
      CREATE INDEX IF NOT EXISTS idx_pageviews_visitor   ON antz_pageviews(visitor_hash);
      CREATE INDEX IF NOT EXISTS idx_pageviews_session   ON antz_pageviews(session_hash);
      CREATE INDEX IF NOT EXISTS idx_events_tracking     ON antz_events(tracking_id);
      CREATE INDEX IF NOT EXISTS idx_events_created      ON antz_events(created_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_tracking   ON antz_sessions(tracking_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_started    ON antz_sessions(started_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_visitor    ON antz_sessions(visitor_hash);
    `)

    await client.end()
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Schema push failed"
    const safe = message.replace(/postgres(ql)?:\/\/[^\s]*/gi, "[uri]")
    return NextResponse.json({ error: safe }, { status: 400 })
  }
}