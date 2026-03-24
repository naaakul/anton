export function getVisitorHash(): string {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency ?? "",
  ].join("|")

  return hashString(raw)
}

export function getSessionHash(): string {
  const bucket = Math.floor(Date.now() / (1000 * 60 * 30))
  return hashString(getVisitorHash() + "|" + bucket)
}

function hashString(str: string): string {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = (hash * 16777619) >>> 0
  }
  return hash.toString(16).padStart(8, "0")
}