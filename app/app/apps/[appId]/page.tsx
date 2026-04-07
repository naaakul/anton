// app/apps/[appId]/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter }             from "next/navigation"
import Link                                 from "next/link"
import Image                                from "next/image"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { Settings, ChevronDown, CalendarDays, ArrowUpRight, ExternalLink } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

type Range = "7d" | "30d" | "90d"
type Metric = "visitors" | "pageviews" | "bounceRate"

type Stats = {
  status:      string
  pageviews:   number
  visitors:    number
  sessions:    number
  bounceRate:  number
  topPages:    { url: string;       views: number }[]
  topReferrers:{ referrer: string;  count: number }[]
  topUtm:      { utm_source: string; utm_medium: string; utm_campaign: string; count: number }[]
  countries:   { country: string;   count: number }[]
  devices:     { device: string;    count: number }[]
  browsers:    { browser: string;   count: number }[]
  oses:        { os: string;        count: number }[]
}

type TimeRow = {
  date:      string
  pageviews: number
  visitors:  number
}

type AppMeta = {
  id:        string
  name:      string
  domain:    string
  status:    string
  lastSeenAt: string | null
}

type Session = { user: { image: string } }

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const RANGE_LABELS: Record<Range, string> = {
  "7d":  "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-neutral-400 mb-1">{fmtDate(label)}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.dataKey === "visitors" ? "Visitors" : "Pageviews"}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ── Tab button ────────────────────────────────────────────────────────────────

function Tab({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm transition-colors ${
        active
          ? "bg-[#2a2a2a] text-white"
          : "text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {label}
    </button>
  )
}

// ── Bar row ───────────────────────────────────────────────────────────────────

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-neutral-300 truncate">{label}</span>
          <span className="text-xs text-neutral-500 ml-2 flex-shrink-0">{fmt(value)}</span>
        </div>
        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500/70 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  tabs, activeTab, onTab, rows, rowKey, rowVal, colLabel = "Visitors",
}: {
  tabs:      string[]
  activeTab: string
  onTab:     (t: string) => void
  rows:      { label: string; value: number }[]
  rowKey:    string
  rowVal:    string
  colLabel?: string
}) {
  const max = rows[0]?.value ?? 0
  return (
    <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <Tab key={t} label={t} active={activeTab === t} onClick={() => onTab(t)} />
          ))}
        </div>
        <span className="text-xs text-neutral-600">{colLabel}</span>
      </div>
      <div className="space-y-0.5">
        {rows.length === 0 ? (
          <p className="text-xs text-neutral-600 py-4 text-center">No data yet</p>
        ) : (
          rows.map((r, i) => (
            <BarRow key={i} label={r.label} value={r.value} max={max} />
          ))
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AppDashboard() {
  const { appId }  = useParams<{ appId: string }>()
  const router     = useRouter()

  const [session,    setSession]    = useState<Session | null>(null)
  const [appMeta,    setAppMeta]    = useState<AppMeta | null>(null)
  const [stats,      setStats]      = useState<Stats | null>(null)
  const [timeseries, setTimeseries] = useState<TimeRow[]>([])
  const [loading,    setLoading]    = useState(true)
  const [range,      setRange]      = useState<Range>("7d")
  const [rangeOpen,  setRangeOpen]  = useState(false)
  const [metric,     setMetric]     = useState<Metric>("visitors")

  // Tabs state
  const [pagesTab,   setPagesTab]   = useState("Pages")
  const [refTab,     setRefTab]     = useState("Referrers")
  const [devTab,     setDevTab]     = useState("Devices")

  useEffect(() => {
    fetch("/api/session").then(r => r.json()).then(setSession)
  }, [])

  // Load app meta
  useEffect(() => {
    fetch(`/api/apps/${appId}/meta`)
      .then(r => r.json())
      .then(setAppMeta)
  }, [appId])

  const loadStats = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/apps/${appId}/stats`).then(r => r.json()),
      fetch(`/api/apps/${appId}/timeseries?range=${range}`).then(r => r.json()),
    ]).then(([s, t]) => {
      setStats(s)
      setTimeseries(Array.isArray(t) ? t : [])
    }).finally(() => setLoading(false))
  }, [appId, range])

  useEffect(() => { loadStats() }, [loadStats])

  // ── Derive rows for each section ─────────────────────────────────────────────

  const pagesRows = (() => {
    if (!stats) return []
    if (pagesTab === "Pages")    return stats.topPages.map(r => ({ label: r.url,      value: Number(r.views) }))
    if (pagesTab === "Routes")   return stats.topPages.map(r => ({ label: r.url.split("?")[0], value: Number(r.views) }))
    if (pagesTab === "Hostname") return [{ label: appMeta?.domain ?? "—", value: stats.pageviews }]
    return []
  })()

  const refRows = (() => {
    if (!stats) return []
    if (refTab === "Referrers")      return stats.topReferrers.map(r => ({ label: r.referrer, value: Number(r.count) }))
    if (refTab === "UTM Parameter")  return stats.topUtm.map(r => ({ label: r.utm_source ?? "—", value: Number(r.count) }))
    return []
  })()

  const devRows = (() => {
    if (!stats) return []
    if (devTab === "Devices")  return stats.devices.map(r => ({ label: r.device,  value: Number(r.count) }))
    if (devTab === "Browsers") return stats.browsers.map(r => ({ label: r.browser, value: Number(r.count) }))
    return []
  })()

  const countryRows = stats?.countries.map(r => ({ label: r.country ?? "Unknown", value: Number(r.count) })) ?? []
  const osRows      = stats?.oses.map(r => ({ label: r.os, value: Number(r.count) })) ?? []

  // ── Concurrent viewers (poll every 12s) ──────────────────────────────────────
  const [concurrent, setConcurrent] = useState<number>(0)
  useEffect(() => {
    function poll() {
      fetch(`/api/apps/${appId}/concurrent`)
        .then(r => r.json())
        .then(d => setConcurrent(d.count ?? 0))
        .catch(() => {})
    }
    poll()
    const id = setInterval(poll, 12_000)
    return () => clearInterval(id)
  }, [appId])

  // ── Chart data label ──────────────────────────────────────────────────────────
  const chartKey = metric === "bounceRate" ? "visitors" : metric

  const metricConfig = {
    visitors:   { label: "Visitors",    color: "#3b82f6", value: stats?.visitors   ?? 0 },
    pageviews:  { label: "Page Views",  color: "#3b82f6", value: stats?.pageviews  ?? 0 },
    bounceRate: { label: "Bounce Rate", color: "#3b82f6", value: stats?.bounceRate ?? 0 },
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#0a0a0a] border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/apps" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Vishlex" className="w-6 h-6" />
            <span className="text-white">Vishlex</span>
          </Link>
          <span className="text-neutral-600">/</span>
          <Link href="/apps" className="text-neutral-400 hover:text-white transition-colors">Apps</Link>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-200">{appMeta?.name ?? "..."}</span>
          {appMeta && (
            <button className="ml-1 text-neutral-600 hover:text-neutral-300 transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white border border-white/[0.08] rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors">
            <Settings className="w-3.5 h-3.5" />
            Setting
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
            {session?.user?.image && (
              <Image src={session.user.image} alt="" width={32} height={32} className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 max-w-[960px] mx-auto space-y-3">

        {/* ── Sub-header — domain + online count ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href={`https://${appMeta?.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-neutral-300 hover:text-white transition-colors"
            >
              {appMeta?.domain ?? "—"}
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-50" />
            </a>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-neutral-400">{concurrent} online</span>
            </div>
          </div>
        </div>

        {/* ── Chart card ── */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4">

          {/* Metric tabs + range picker */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {(["visitors", "pageviews", "bounceRate"] as Metric[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    metric === m
                      ? "bg-[#2a2a2a] text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {metricConfig[m].label}
                  {stats && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                      metric === m ? "bg-green-500/20 text-green-400" : "bg-white/5 text-neutral-500"
                    }`}>
                      {m === "bounceRate"
                        ? `${metricConfig[m].value}%`
                        : fmt(metricConfig[m].value)
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Range picker */}
            <div className="relative">
              <button
                onClick={() => setRangeOpen(v => !v)}
                className="flex items-center gap-2 text-xs text-neutral-300 border border-white/[0.08] rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
              >
                <CalendarDays className="w-3.5 h-3.5 text-neutral-500" />
                {RANGE_LABELS[range]}
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>
              {rangeOpen && (
                <div className="absolute right-0 top-9 z-20 w-40 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-xl py-1 text-xs text-neutral-300">
                  {(["7d", "30d", "90d"] as Range[]).map(r => (
                    <button
                      key={r}
                      className={`w-full text-left px-3 py-2 hover:bg-white/5 transition-colors ${range === r ? "text-white" : ""}`}
                      onClick={() => { setRange(r); setRangeOpen(false) }}
                    >
                      {RANGE_LABELS[r]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[280px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeseries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray=""
                    stroke="rgba(255,255,255,0.04)"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDate}
                    tick={{ fill: "#666", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fill: "#666", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-4}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="linear"
                    dataKey={chartKey}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Middle row — Pages + Referrers ── */}
        <div className="grid grid-cols-2 gap-3">
          <SectionCard
            tabs={["Pages", "Routes", "Hostname"]}
            activeTab={pagesTab}
            onTab={setPagesTab}
            rows={pagesRows}
            rowKey="url"
            rowVal="views"
          />
          <SectionCard
            tabs={["Referrers", "UTM Parameter"]}
            activeTab={refTab}
            onTab={setRefTab}
            rows={refRows}
            rowKey="referrer"
            rowVal="count"
          />
        </div>

        {/* ── Bottom row — Countries + Devices/Browsers + OS ── */}
        <div className="grid grid-cols-3 gap-3">
          <SectionCard
            tabs={["Countries"]}
            activeTab="Countries"
            onTab={() => {}}
            rows={countryRows}
            rowKey="country"
            rowVal="count"
          />
          <SectionCard
            tabs={["Devices", "Browsers"]}
            activeTab={devTab}
            onTab={setDevTab}
            rows={devRows}
            rowKey="device"
            rowVal="count"
          />
          <SectionCard
            tabs={["Operating Systems"]}
            activeTab="Operating Systems"
            onTab={() => {}}
            rows={osRows}
            rowKey="os"
            rowVal="count"
          />
        </div>

      </div>
    </div>
  )
}