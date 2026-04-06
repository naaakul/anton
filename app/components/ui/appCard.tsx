"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type AppStatus = "WAITING" | "LIVE" | "INACTIVE"

type App = {
  id:         string
  trackingId: string
  name:       string
  domain:     string
  framework:  string
  status:     AppStatus
  createdAt:  string
}

export default function AppCard({ app }: { app: App }) {
  const router    = useRouter()
  const [menu, setMenu] = useState(false)

  const statusConfig = {
    LIVE:     { label: "Live",              dot: "bg-green-400",  pill: "bg-green-500/15 text-green-400"  },
    WAITING:  { label: "Waiting to connect", dot: "bg-orange-400", pill: "bg-orange-500/15 text-orange-400" },
    INACTIVE: { label: "Inactive",          dot: "bg-neutral-500", pill: "bg-neutral-500/15 text-neutral-400" },
  }

  const { label, dot, pill } = statusConfig[app.status ?? "WAITING"]

  const daysAgo = Math.floor(
    (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="relative bg-[#1a1a1a] border border-white/[0.07] rounded-2xl px-4 pt-3 pb-4 flex flex-col gap-3 hover:border-white/[0.14] transition-colors cursor-pointer">

      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot} ${app.status === "LIVE" ? "animate-pulse" : ""}`} />
          {label}
        </span>

        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); setMenu(v => !v) }}
            className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <circle cx="8" cy="3"  r="1.2" />
              <circle cx="8" cy="8"  r="1.2" />
              <circle cx="8" cy="13" r="1.2" />
            </svg>
          </button>

          {menu && (
            <div
              className="absolute right-0 top-8 z-20 w-36 bg-[#222] border border-white/10 rounded-xl shadow-xl py-1 text-sm text-neutral-300"
              onClick={e => e.preventDefault()}
            >
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors"
                onClick={() => router.push(`/apps/${app.id}`)}
              >
                Open
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors">
                Settings
              </button>
              <button className="w-full text-left px-3 py-1.5 hover:bg-white/5 transition-colors text-red-400">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex-shrink-0 overflow-hidden">
          <img
            src={`https://www.google.com/s2/favicons?domain=https://${app.domain}&sz=64`}
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium leading-tight truncate">{app.name}</p>
          <p className="text-neutral-500 text-xs truncate mt-0.5">{app.domain}</p>
        </div>
        <div className="flex items-center gap-1 text-neutral-500 text-xs flex-shrink-0">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3.5l2 1.5" strokeLinecap="round" />
          </svg>
          <span>{daysAgo === 0 ? "today" : `${daysAgo}d ago`}</span>
        </div>
      </div>

    </div>
  )
}