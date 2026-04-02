declare function getVisitorHash(): string;
declare function getSessionHash(): string;

type DeviceType = "desktop" | "mobile" | "tablet";
declare function getDevice(): DeviceType;
declare function getBrowser(): string;
declare function getOS(): string;

type UTMParams = {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
};
declare function getUTMParams(search?: string): UTMParams;
declare function getReferrer(): string | null;

declare function send(payload: unknown, endpoint: string): void;

type PageviewPayload = {
    tracking_id: string;
    url: string;
    referrer: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
    device: string;
    browser: string;
    os: string;
    visitor_hash: string;
    session_hash: string;
    duration_ms: number | null;
};
type EventPayload = {
    tracking_id: string;
    name: string;
    properties: Record<string, unknown> | null;
    url: string;
    visitor_hash: string;
    session_hash: string;
};
declare function buildPageviewPayload(trackingId: string, durationMs?: number | null): PageviewPayload;
declare function buildEventPayload(trackingId: string, name: string, properties?: Record<string, unknown> | null): EventPayload;

export { type EventPayload, type PageviewPayload, type UTMParams, buildEventPayload, buildPageviewPayload, getBrowser, getDevice, getOS, getReferrer, getSessionHash, getUTMParams, getVisitorHash, send };
