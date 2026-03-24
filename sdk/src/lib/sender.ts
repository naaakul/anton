export function send(payload: unknown, endpoint: string): void {
  const body = JSON.stringify(payload)

  if (typeof navigator === "undefined") return

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" })
    const queued = navigator.sendBeacon(endpoint, blob)
    if (queued) return
  }

  fetch(endpoint, {
    method:    "POST",
    body,
    headers:   { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => {})
}