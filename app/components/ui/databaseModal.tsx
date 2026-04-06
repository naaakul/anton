"use client"

import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Database, Plus, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react"

type DbRecord = {
  id:           string
  name:         string
  dbType:       string
  isHealthy:    boolean
  lastHealthAt: string | null
  createdAt:    string
  _count:       { apps: number }
}

export default function DatabaseModal({
  open,
  onClose,
}: {
  open:    boolean
  onClose: () => void
}) {
  const [databases,    setDatabases]    = useState<DbRecord[]>([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [name,         setName]         = useState("")
  const [dbUri,        setDbUri]        = useState("")
  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState("")
  const [pingId,       setPingId]       = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch("/api/databases")
      .then(r => r.json())
      .then(d => setDatabases(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [open])

  async function handleSave() {
    setSaving(true)
    setSaveError("")
    const res = await fetch("/api/databases", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, dbUri, dbType: "POSTGRES" }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setSaveError(d.error ?? "Failed to save")
      return
    }
    const db = await res.json()
    setDatabases(prev => [db, ...prev])
    setShowForm(false)
    setName("")
    setDbUri("")
  }

  async function handlePing(dbId: string) {
    setPingId(dbId)
    const res = await fetch(`/api/databases/${dbId}/health`, { method: "POST" })
    const updated = await res.json()
    setDatabases(prev =>
      prev.map(d =>
        d.id === dbId
          ? { ...d, isHealthy: res.ok, lastHealthAt: new Date().toISOString() }
          : d
      )
    )
    setPingId(null)
  }

  function handleClose() {
    setShowForm(false)
    setName("")
    setDbUri("")
    setSaveError("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden bg-[#0A0A0A] text-white border-[#1F1F1F]">

        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-400" />
            Databases
          </DialogTitle>
          <p className="text-xs text-neutral-500 mt-1">
            Databases are shared across apps. One DB can power multiple apps.
          </p>
        </DialogHeader>

        <Separator className="bg-[#1F1F1F]" />

        <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            </div>
          ) : databases.length === 0 && !showForm ? (
            <div className="text-center py-8">
              <Database className="w-7 h-7 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">No databases yet</p>
            </div>
          ) : (
            databases.map(db => (
              <div
                key={db.id}
                className="flex items-center justify-between bg-[#141414] border border-white/[0.06] rounded-xl px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Database className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{db.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {db.dbType} · {db._count.apps} app{db._count.apps !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    db.isHealthy
                      ? "bg-green-500/15 text-green-400"
                      : "bg-red-500/15 text-red-400"
                  }`}>
                    {db.isHealthy
                      ? <CheckCircle2 className="w-3 h-3" />
                      : <XCircle      className="w-3 h-3" />
                    }
                    {db.isHealthy ? "Healthy" : "Unhealthy"}
                  </span>
                  <button
                    onClick={() => handlePing(db.id)}
                    disabled={pingId === db.id}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/5 transition-colors disabled:opacity-40"
                    title="Ping"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pingId === db.id ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add new DB form */}
        {showForm && (
          <>
            <Separator className="bg-[#1F1F1F]" />
            <div className="px-6 py-4 space-y-3">
              <p className="text-xs font-medium text-neutral-300">Add database</p>
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">Label</Label>
                <Input
                  placeholder="Production DB"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-8 text-sm bg-[#141414] border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">Postgres URI</Label>
                <Input
                  type="password"
                  placeholder="postgres://user:pass@host:5432/db"
                  value={dbUri}
                  onChange={e => setDbUri(e.target.value)}
                  className="h-8 text-sm font-mono bg-[#141414] border-white/10"
                />
              </div>
              {saveError && (
                <p className="text-xs text-red-400">{saveError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  disabled={!name || !dbUri || saving}
                  onClick={handleSave}
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save & test"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-neutral-400"
                  onClick={() => { setShowForm(false); setSaveError("") }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator className="bg-[#1F1F1F]" />

        <div className="px-6 py-4 flex justify-between items-center">
          {!showForm && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-dashed border-white/10 text-neutral-400 hover:text-white"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add database
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-neutral-400"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}