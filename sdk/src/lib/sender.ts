
const COLLECT_URL = "https://antonalyze.com/api/collect"

export function send(payload: unknown, endpoint = COLLECT_URL): void {
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" })
    const queued = navigator.sendBeacon(endpoint, blob)
    if (queued) return
  }

  fetch(endpoint, {
    method:     "POST",
    body,
    headers:    { "Content-Type": "application/json" },
    keepalive:  true,
  }).catch(() => {
  })
}