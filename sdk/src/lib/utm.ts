export type UTMParams = {
  utm_source:   string | null
  utm_medium:   string | null
  utm_campaign: string | null
  utm_term:     string | null
  utm_content:  string | null
}

export function getUTMParams(search: string = location.search): UTMParams {
  const p = new URLSearchParams(search)
  return {
    utm_source:   p.get("utm_source"),
    utm_medium:   p.get("utm_medium"),
    utm_campaign: p.get("utm_campaign"),
    utm_term:     p.get("utm_term"),
    utm_content:  p.get("utm_content"),
  }
}

export function getReferrer(): string | null {
  const ref = document.referrer
  if (!ref) return null
  try {
    const refHost = new URL(ref).hostname
    if (refHost === location.hostname) return null
  } catch {
    return null
  }
  return ref
}