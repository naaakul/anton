'use strict';

var react = require('react');
var navigation = require('next/navigation');
var jsxRuntime = require('react/jsx-runtime');

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
var VishlexContext = react.createContext({ trackEvent: () => {
} });
function useVishlex() {
  return react.useContext(VishlexContext);
}
function TrackerInner({
  trackingId,
  collectUrl,
  disabled = false
}) {
  const pathname = navigation.usePathname();
  const searchParams = navigation.useSearchParams();
  const pageEnteredAt = react.useRef(Date.now());
  const lastPathRef = react.useRef(null);
  const sendPageview = react.useCallback(
    (durationMs = null) => {
      if (disabled || typeof window === "undefined") return;
      send(buildPageviewPayload(trackingId, durationMs), collectUrl);
    },
    [trackingId, collectUrl, disabled]
  );
  react.useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    if (lastPathRef.current === currentPath) return;
    if (lastPathRef.current !== null) {
      sendPageview(Date.now() - pageEnteredAt.current);
    } else {
      sendPageview(null);
    }
    lastPathRef.current = currentPath;
    pageEnteredAt.current = Date.now();
  }, [pathname, searchParams, sendPageview]);
  react.useEffect(() => {
    if (disabled) return;
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        sendPageview(Date.now() - pageEnteredAt.current);
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [disabled, sendPageview]);
  return null;
}
function VishlexProvider({ trackingId, collectUrl, disabled = false, children }) {
  const trackEvent = react.useCallback(
    (name, properties) => {
      if (disabled || typeof window === "undefined") return;
      send(buildEventPayload(trackingId, name, properties ?? null), collectUrl);
    },
    [trackingId, collectUrl, disabled]
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(VishlexContext.Provider, { value: { trackEvent }, children: [
    /* @__PURE__ */ jsxRuntime.jsx(react.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntime.jsx(
      TrackerInner,
      {
        trackingId,
        collectUrl,
        disabled
      }
    ) }),
    children
  ] });
}

exports.VishlexProvider = VishlexProvider;
exports.useVishlex = useVishlex;
//# sourceMappingURL=next.js.map
//# sourceMappingURL=next.js.map