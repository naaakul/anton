"use client"

import { useEffect, useState } from "react"
import { useParams }           from "next/navigation"

type Stats = {
  pageviews:   number
  visitors:    number
  sessions:    number
  bounceRate:  number
  topPages:    { url: string;      views: number }[]
  topReferrers:{ referrer: string; count: number }[]
  topUtm:      { utm_source: string; utm_medium: string; utm_campaign: string; count: number }[]
  countries:   { country: string;  count: number }[]
  devices:     { device: string;   count: number }[]
  browsers:    { browser: string;  count: number }[]
  oses:        { os: string;       count: number }[]
}

function Num({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-mono font-bold">{value}</p>
    </div>
  )
}

function Table({ title, rows, cols }: {
  title: string
  rows:  Record<string, unknown>[]
  cols:  string[]
}) {
  if (!rows.length) return null
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm font-semibold mb-3">{title}</p>
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-left text-gray-400 border-b">
            {cols.map(c => <th key={c} className="pb-1 pr-4 font-normal">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => (
                <td key={c} className="py-1 pr-4 truncate max-w-xs">
                  {String(row[c] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AppStatsPage() {
  const { appId }               = useParams<{ appId: string }>()
  const [stats, setStats]       = useState<Stats | null>(null)
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(true)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  useEffect(() => {
    setLoading(true)
    fetch(`/api/apps/${appId}/stats`)
      .then(r => r.json())
      .then(d => { setStats(d); setLastRefresh(Date.now()) })
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false))
  }, [appId])

  if (loading) return <p className="p-8 text-sm text-gray-400">Loading...</p>
  if (error)   return <p className="p-8 text-sm text-red-500">{error}</p>
  if (!stats)  return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Stats — last 30 days</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            last refresh {new Date(lastRefresh).toLocaleTimeString()}
          </span>
          <button
            onClick={() => setLastRefresh(Date.now() - 1)}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Core numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Num label="Pageviews"   value={stats.pageviews.toLocaleString()} />
        <Num label="Visitors"    value={stats.visitors.toLocaleString()} />
        <Num label="Sessions"    value={stats.sessions.toLocaleString()} />
        <Num label="Bounce Rate" value={`${stats.bounceRate}%`} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Table
          title="Top pages"
          rows={stats.topPages}
          cols={["url", "views"]}
        />
        <Table
          title="Top referrers"
          rows={stats.topReferrers}
          cols={["referrer", "count"]}
        />
        <Table
          title="Countries"
          rows={stats.countries}
          cols={["country", "count"]}
        />
        <Table
          title="Devices"
          rows={stats.devices}
          cols={["device", "count"]}
        />
        <Table
          title="Browsers"
          rows={stats.browsers}
          cols={["browser", "count"]}
        />
        <Table
          title="Operating systems"
          rows={stats.oses}
          cols={["os", "count"]}
        />
        <Table
          title="UTM parameters"
          rows={stats.topUtm}
          cols={["utm_source", "utm_medium", "utm_campaign", "count"]}
        />
      </div>

    </div>
  )
}