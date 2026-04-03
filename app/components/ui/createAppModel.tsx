"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Globe,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Database,
  ChevronRight,
} from "lucide-react"

type Step = 1 | 2 | 3

type ConnectStatus = "idle" | "testing" | "pushing" | "ok" | "fail"

type App = {
  id:         string
  trackingId: string
  name:       string
  domain:     string
  framework:  string
  dbType:     string
  createdAt:  string
}

function getSnippet(trackingId: string) {
  return `import { AntonalyzeProvider } from "antonalyze/next"

// app/layout.tsx  — wrap your root layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AntonalyzeProvider trackingId="${trackingId}">
          {children}
        </AntonalyzeProvider>
      </body>
    </html>
  )
}`
}

export default function CreateAppModal({
  open,
  onClose,
  onCreated,
}: {
  open:      boolean
  onClose:   () => void
  onCreated: (app: App) => void
}) {
  const [step,          setStep]          = useState<Step>(1)
  const [name,          setName]          = useState("")
  const [domain,        setDomain]        = useState("")
  const [framework,     setFramework]     = useState("nextjs")
  const [dbUri,         setDbUri]         = useState("")
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("idle")
  const [connectError,  setConnectError]  = useState("")
  const [submitting,    setSubmitting]    = useState(false)
  const [createdApp,    setCreatedApp]    = useState<App | null>(null)
  const [copied,        setCopied]        = useState(false)

  function resetModal() {
    setStep(1)
    setName("")
    setDomain("")
    setFramework("nextjs")
    setDbUri("")
    setConnectStatus("idle")
    setConnectError("")
    setSubmitting(false)
    setCreatedApp(null)
    setCopied(false)
  }

  function handleClose() {
    resetModal()
    onClose()
  }

  async function handleConnect() {
    setConnectStatus("testing")
    setConnectError("")

    // Step 1 — test connection
    const testRes = await fetch("/api/apps/test-connection", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ dbUri, dbType: "POSTGRES" }),
    })

    if (!testRes.ok) {
      const data = await testRes.json()
      setConnectStatus("fail")
      setConnectError(data.error ?? "Connection failed")
      return
    }

    // Step 2 — push schema
    setConnectStatus("pushing")

    const pushRes = await fetch("/api/apps/push-schema", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ dbUri }),
    })

    if (!pushRes.ok) {
      const data = await pushRes.json()
      setConnectStatus("fail")
      setConnectError(data.error ?? "Schema push failed")
      return
    }

    setConnectStatus("ok")
  }

  async function handleCreate() {
    setSubmitting(true)

    const res = await fetch("/api/apps/create", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name,
        domain,
        framework,
        dbType: "POSTGRES",
        dbUri,
      }),
    })

    setSubmitting(false)

    if (!res.ok) return

    const app = await res.json()
    setCreatedApp(app)
    setStep(3)
  }

  function handleCopy() {
    if (!createdApp) return
    navigator.clipboard.writeText(getSnippet(createdApp.trackingId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleFinish() {
    if (createdApp) onCreated(createdApp)
    handleClose()
  }

  const step1Valid = name.trim() && domain.trim() && framework

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold">
            {step === 1 && "Create app"}
            {step === 2 && "Connect database"}
            {step === 3 && "You're all set"}
          </DialogTitle>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mt-3">
            {([1, 2, 3] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-6 bg-foreground"
                    : s < step
                    ? "w-4 bg-foreground/30"
                    : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <Separator />

        {/* ── Step 1 — App details ── */}
        {step === 1 && (
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="app-name">App name</Label>
              <Input
                id="app-name"
                placeholder="My Website"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="domain">Domain</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="domain"
                  placeholder="mysite.com"
                  className="pl-9"
                  value={domain}
                  onChange={(e) =>
                    setDomain(e.target.value.replace(/^https?:\/\//, ""))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextjs">Next.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* ── Step 2 — DB connection ── */}
        {step === 2 && (
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste your Neon (or any Postgres) URI. We'll test the connection
              and push the analytics schema automatically.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="db-uri">Postgres URI</Label>
              <div className="flex gap-2">
                <Input
                  id="db-uri"
                  type="password"
                  placeholder="postgres://user:pass@host:5432/db"
                  className="font-mono text-sm flex-1"
                  value={dbUri}
                  onChange={(e) => {
                    setDbUri(e.target.value)
                    setConnectStatus("idle")
                    setConnectError("")
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9"
                  disabled={!dbUri || connectStatus === "testing" || connectStatus === "pushing"}
                  onClick={handleConnect}
                >
                  {connectStatus === "testing" && (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Testing</>
                  )}
                  {connectStatus === "pushing" && (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Pushing</>
                  )}
                  {(connectStatus === "idle" || connectStatus === "fail") && (
                    <><Database className="w-3.5 h-3.5 mr-1.5" />Connect</>
                  )}
                  {connectStatus === "ok" && (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-500" />Connected</>
                  )}
                </Button>
              </div>

              {connectStatus === "fail" && (
                <p className="text-xs text-destructive mt-1">{connectError}</p>
              )}

              {connectStatus === "ok" && (
                <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2 mt-2">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                    Connected — analytics schema pushed successfully
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    Tables: antz_pageviews, antz_events, antz_sessions
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3 — SDK snippet ── */}
        {step === 3 && createdApp && (
          <div className="px-6 py-5 space-y-4">
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-800 dark:text-green-300">
                  App created
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                  Tracking ID: <span className="font-mono">{createdApp.trackingId}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Add this to your app/layout.tsx
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleCopy}
                >
                  {copied
                    ? <><Check className="w-3 h-3 mr-1" />Copied</>
                    : <><Copy className="w-3 h-3 mr-1" />Copy</>
                  }
                </Button>
              </div>
              <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre">
                {getSnippet(createdApp.trackingId)}
              </pre>
            </div>

            <p className="text-xs text-muted-foreground">
              Your app will show <span className="font-medium text-foreground">Waiting to connect</span> until
              the first event is received from your site.
            </p>
          </div>
        )}

        <Separator />

        {/* ── Footer buttons ── */}
        <div className="px-6 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            {step === 3 ? "Close" : "Cancel"}
          </Button>

          <div className="flex gap-2">
            {step === 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}

            {step === 1 && (
              <Button
                size="sm"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}

            {step === 2 && (
              <Button
                size="sm"
                disabled={connectStatus !== "ok" || submitting}
                onClick={handleCreate}
              >
                {submitting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Creating...</>
                  : <>Next <ChevronRight className="w-3.5 h-3.5 ml-1" /></>
                }
              </Button>
            )}

            {step === 3 && (
              <Button size="sm" onClick={handleFinish}>
                Done
              </Button>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}