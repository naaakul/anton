"use client"

import { useEffect, useState } from "react"
import { Button }            from "@/components/ui/button"
import AppCard               from "@/components/ui/appCard"
import CreateAppModal        from "@/components/ui/createAppModel"
import DatabaseModal         from "@/components/ui/databaseModal"
import { Plus, Loader2, Database } from "lucide-react"
import Link                  from "next/link"

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

type Session = {
  user: { image: string }
}

export default function AppsPage() {
  const [apps,        setApps]        = useState<App[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [appModal,    setAppModal]    = useState(false)
  const [dbModal,     setDbModal]     = useState(false)
  const [session,     setSession]     = useState<Session | null>(null)

  useEffect(() => {
    fetch("/api/session")
      .then(r => r.json())
      .then(d => setSession(d))
  }, [])

  useEffect(() => {
    fetch("/api/apps")
      .then(r => r.json())
      .then(d => setApps(Array.isArray(d) ? d : []))
      .finally(() => setLoadingApps(false))
  }, [])

  function handleAppCreated(app: App) {
    setApps(prev => [app, ...prev])
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Vishlex" className="w-7 h-7" />
            <span className="text-white">Vishlex</span>
          </div>
          <span className="text-neutral-500">/</span>
          <span className="text-neutral-400">Apps</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Database button */}
          <button
            onClick={() => setDbModal(true)}
            className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
              <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" />
            </svg>
            <span>Database</span>
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0">
            {session?.user?.image && (
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="px-3">
        <div className="rounded-2xl bg-[#111111] border border-white/[0.06] h-[calc(100vh-70px)] w-full flex flex-col px-3">

          <div className="flex w-full justify-between py-3">
            <p className="text-sm text-muted-foreground mt-0.5">
              {apps.length === 0
                ? "No apps yet"
                : `${apps.length} app${apps.length > 1 ? "s" : ""}`}
            </p>
            <Button
              className="bg-black cursor-pointer"
              size="sm"
              onClick={() => setAppModal(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create app
            </Button>
          </div>

          <div className="h-[1px] w-full bg-[#1F1F1F]" />

          <div className="w-full flex-1 overflow-hidden">
            {loadingApps ? (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : apps.length === 0 ? (
              <div className="text-center w-full h-full flex justify-center items-center flex-col gap-1">
                <Database className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-sm font-medium">No apps yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Create your first app to start tracking analytics
                </p>
                <Button
                  className="bg-black cursor-pointer"
                  size="sm"
                  onClick={() => setAppModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create app
                </Button>
              </div>
            ) : (
              <div className="grid auto-rows-min grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 py-3 h-full overflow-y-auto custom-scroll">
                {apps.map(app => (
                  <Link key={app.id} href={`/apps/${app.id}`} className="h-fit rounded-2xl">
                    <AppCard app={app} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
      <CreateAppModal
        open={appModal}
        onClose={() => setAppModal(false)}
        onCreated={handleAppCreated}
      />
      <DatabaseModal
        open={dbModal}
        onClose={() => setDbModal(false)}
      />

    </div>
  )
}