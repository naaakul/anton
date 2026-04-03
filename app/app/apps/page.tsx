"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import AppCard from "@/components/ui/appCard"
import CreateAppModal from "@/components/ui/createAppModel"
import {
  Plus,
  Loader2,
  Database,
} from "lucide-react"
import Link from "next/link"

type App = {
  id:         string
  trackingId: string
  name:       string
  domain:     string
  framework:  string
  dbType:     string
  createdAt:  string
}


export default function AppsPage() {
  const [apps,        setApps]        = useState<App[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)

  useEffect(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((data) => setApps(Array.isArray(data) ? data : []))
      .finally(() => setLoadingApps(false))
  }, [])

  function handleAppCreated(app: App) {
    setApps((prev) => [app, ...prev])
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Apps</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {apps.length === 0 ? "No apps yet" : `${apps.length} app${apps.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create app
        </Button>
      </div>

      {/* List */}
      {loadingApps ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : apps.length === 0 ? (
        <div className="border border-dashed rounded-xl py-20 text-center">
          <Database className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No apps yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create your first app to start tracking analytics
          </p>
          <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create app
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {apps.map((app) => (
            <Link href={`/apps/${app.id}`}>
            <AppCard key={app.id} app={app} />
            </Link> 
          ))}
        </div>
      )}

      <CreateAppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleAppCreated}
      />
    </div>
  )
}