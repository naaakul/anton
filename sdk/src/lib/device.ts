type DeviceType = "desktop" | "mobile" | "tablet"

export function getDevice(): DeviceType {
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet"
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return "mobile"
  return "desktop"
}

export function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes("Edg/"))     return "Edge"
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera"
  if (ua.includes("Chrome/"))  return "Chrome"
  if (ua.includes("Firefox/")) return "Firefox"
  if (ua.includes("Safari/"))  return "Safari"
  return "Other"
}

export function getOS(): string {
  const ua = navigator.userAgent
  if (/windows/i.test(ua))      return "Windows"
  if (/macintosh|mac os/i.test(ua)) return "macOS"
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
  if (/android/i.test(ua))     return "Android"
  if (/linux/i.test(ua))       return "Linux"
  return "Other"
}