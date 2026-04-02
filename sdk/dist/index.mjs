// src/lib/fingerprint.ts
function getVisitorHash() {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    (/* @__PURE__ */ new Date()).getTimezoneOffset(),
    navigator.hardwareConcurrency ?? ""
  ].join("|");
  return hashString(raw);
}
function getSessionHash() {
  const bucket = Math.floor(Date.now() / (1e3 * 60 * 30));
  return hashString(getVisitorHash() + "|" + bucket);
}
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = hash * 16777619 >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// src/lib/device.ts
function getDevice() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return "mobile";
  return "desktop";
}
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/")) return "Safari";
  return "Other";
}
function getOS() {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

// src/lib/utm.ts
function getUTMParams(search = location.search) {
  const p = new URLSearchParams(search);
  return {
    utm_source: p.get("utm_source"),
    utm_medium: p.get("utm_medium"),
    utm_campaign: p.get("utm_campaign"),
    utm_term: p.get("utm_term"),
    utm_content: p.get("utm_content")
  };
}
function getReferrer() {
  const ref = document.referrer;
  if (!ref) return null;
  try {
    const refHost = new URL(ref).hostname;
    if (refHost === location.hostname) return null;
  } catch {
    return null;
  }
  return ref;
}

// src/lib/sender.ts
function send(payload, endpoint) {
  const body = JSON.stringify(payload);
  if (typeof navigator === "undefined") return;
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const queued = navigator.sendBeacon(endpoint, blob);
    if (queued) return;
  }
  fetch(endpoint, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true
  }).catch(() => {
  });
}

// src/lib/payload.ts
function buildPageviewPayload(trackingId, durationMs = null) {
  const utm = getUTMParams();
  return {
    tracking_id: trackingId,
    url: location.pathname + location.search,
    referrer: getReferrer(),
    ...utm,
    device: getDevice(),
    browser: getBrowser(),
    os: getOS(),
    visitor_hash: getVisitorHash(),
    session_hash: getSessionHash(),
    duration_ms: durationMs
  };
}
function buildEventPayload(trackingId, name, properties = null) {
  return {
    tracking_id: trackingId,
    name,
    properties,
    url: location.pathname + location.search,
    visitor_hash: getVisitorHash(),
    session_hash: getSessionHash()
  };
}

export { buildEventPayload, buildPageviewPayload, getBrowser, getDevice, getOS, getReferrer, getSessionHash, getUTMParams, getVisitorHash, send };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map