import { getVisitorHash, getSessionHash } from "./fingerprint"
import { getDevice, getBrowser, getOS }    from "./device"
import { getUTMParams, getReferrer }        from "./utm"

export type PageviewPayload = {
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

export type EventPayload = {
  tracking_id:  string
  name:         string
  properties:   Record<string, unknown> | null
  url:          string
  visitor_hash: string
  session_hash: string
}

export function buildPageviewPayload(
  trackingId: string,
  durationMs: number | null = null
): PageviewPayload {
  const utm = getUTMParams()
  return {
    tracking_id:  trackingId,
    url:          location.pathname + location.search,
    referrer:     getReferrer(),
    ...utm,
    device:       getDevice(),
    browser:      getBrowser(),
    os:           getOS(),
    visitor_hash: getVisitorHash(),
    session_hash: getSessionHash(),
    duration_ms:  durationMs,
  }
}

export function buildEventPayload(
  trackingId: string,
  name: string,
  properties: Record<string, unknown> | null = null
): EventPayload {
  return {
    tracking_id:  trackingId,
    name,
    properties,
    url:          location.pathname + location.search,
    visitor_hash: getVisitorHash(),
    session_hash: getSessionHash(),
  }
}