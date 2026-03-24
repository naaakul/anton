import { NextResponse }  from "next/server"
import { prisma }        from "@/lib/prisma"
import { decrypt }       from "@/lib/crypto"
import { runPgQuery }    from "@/lib/db/connections"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

type PageviewPayload = {
  type:         "pageview"
  tracking_id:  string
  url:          string
  referrer:     string | null
  utm_source:   string | null
  utm_medium:   string | null
  utm_campaign: string | null
  utm_term:     string | null
  utm_content:  string | null
  device:       string
  browser:      string
  os:           string
  visitor_hash: string
  session_hash: string
  duration_ms:  number | null
}

type EventPayload = {
  type:         "event"
  tracking_id:  string
  name:         string
  properties:   Record<string, unknown> | null
  url:          string
  visitor_hash: string
  session_hash: string
}

type Payload = PageviewPayload | EventPayload

export async function POST(req: Request) {
  let payload: Payload

  try {
    payload = await req.json()
  } catch {
    return new Response(null, { status: 204, headers: CORS })
  }

  const trackingId = payload?.tracking_id
  if (!trackingId || typeof trackingId !== "string") {
    return new Response(null, { status: 204, headers: CORS })
  }

  const app = await prisma.app.findUnique({
    where:  { trackingId },
    select: { id: true, encryptedDbUri: true, dbType: true, lastSeenAt: true },
  })

  if (!app) {
    return new Response(null, { status: 204, headers: CORS })
  }

  let dbUri: string
  try {
    dbUri = decrypt(app.encryptedDbUri)
  } catch {
    return new Response(null, { status: 204, headers: CORS })
  }

  try {
    if (!payload.type || payload.type === "pageview") {
      await handlePageview(app.id, dbUri, payload as PageviewPayload)
    } else if (payload.type === "event") {
      await handleEvent(app.id, dbUri, payload as EventPayload)
    }

    if (!app.lastSeenAt) {
      await prisma.app.update({
        where: { id: app.id },
        data:  { lastSeenAt: new Date() },
      })
    } else {
      await prisma.app.update({
        where: { id: app.id },
        data:  { lastSeenAt: new Date() },
      })
    }
  } catch (err) {
    console.error("[collect] write error", err)
  }

  return new Response(null, { status: 204, headers: CORS })
}

async function handlePageview(
  appId:   string,
  dbUri:   string,
  p:       PageviewPayload,
) {
  await runPgQuery(appId, dbUri, `
    INSERT INTO antz_sessions (
      tracking_id, session_hash, visitor_hash,
      entry_url, device, browser, os, referrer,
      started_at, updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW(), NOW())
    ON CONFLICT (session_hash) DO UPDATE SET
      exit_url   = EXCLUDED.entry_url,
      page_count = antz_sessions.page_count + 1,
      updated_at = NOW(),
      duration_ms = CASE
        WHEN $9::INTEGER IS NOT NULL
        THEN COALESCE(antz_sessions.duration_ms, 0) + $9::INTEGER
        ELSE antz_sessions.duration_ms
      END
  `, [
    p.tracking_id,
    p.session_hash,
    p.visitor_hash,
    p.url,
    p.device,
    p.browser,
    p.os,
    p.referrer,
    p.duration_ms,
  ])

  // Insert pageview
  await runPgQuery(appId, dbUri, `
    INSERT INTO antz_pageviews (
      tracking_id, url, referrer,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      device, browser, os,
      duration_ms, visitor_hash, session_hash,
      created_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, NOW()
    )
  `, [
    p.tracking_id,
    p.url,
    p.referrer,
    p.utm_source,
    p.utm_medium,
    p.utm_campaign,
    p.utm_term,
    p.utm_content,
    p.device,
    p.browser,
    p.os,
    p.duration_ms,
    p.visitor_hash,
    p.session_hash,
  ])
}

async function handleEvent(
  appId: string,
  dbUri: string,
  p:     EventPayload,
) {
  await runPgQuery(appId, dbUri, `
    INSERT INTO antz_events (
      tracking_id, name, properties,
      url, visitor_hash, session_hash, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6, NOW())
  `, [
    p.tracking_id,
    p.name,
    p.properties ? JSON.stringify(p.properties) : null,
    p.url,
    p.visitor_hash,
    p.session_hash,
  ])
}