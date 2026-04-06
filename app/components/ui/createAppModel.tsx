"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Database,
  ChevronRight,
  BookText,
  Plus,
} from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3;

type ConnectStatus = "idle" | "testing" | "pushing" | "ok" | "fail";

type App = {
  id: string;
  trackingId: string;
  name: string;
  domain: string;
  framework: string;
  status: "WAITING" | "LIVE" | "INACTIVE";
  createdAt: string;
};

type DbRecord = {
  id: string;
  name: string;
  dbType: string;
  isHealthy: boolean;
  lastHealthAt: string | null;
};

function getSnippet(trackingId: string) {
  return `import { VishlexProvider } from "vishlex/next"

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <VishlexProvider
          trackingId="${trackingId}"
          collectUrl={process.env.NEXT_PUBLIC_COLLECT_URL}
        >
          {children}
        </VishlexProvider>
      </body>
    </html>
  )
}`;
}

export default function CreateAppModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (app: App) => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [dbUri, setDbUri] = useState("");
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("idle");
  const [connectError, setConnectError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdApp, setCreatedApp] = useState<App | null>(null);
  const [copied, setCopied] = useState(false);
  const [databases, setDatabases] = useState<DbRecord[]>([]);
  const [selectedDbId, setSelectedDbId] = useState<string>("");
  const [showNewDbForm, setShowNewDbForm] = useState(false);
  const [newDbName, setNewDbName] = useState("");
  const [newDbUri, setNewDbUri] = useState("");
  const [savingDb, setSavingDb] = useState(false);

  function resetModal() {
    setStep(1);
    setName("");
    setDomain("");
    setFramework("nextjs");
    setDbUri("");
    setConnectStatus("idle");
    setConnectError("");
    setSubmitting(false);
    setCreatedApp(null);
    setCopied(false);
  }

  useEffect(() => {
    if (step !== 2) return;
    fetch("/api/databases")
      .then((r) => r.json())
      .then((data) => setDatabases(Array.isArray(data) ? data : []));
  }, [step]);

  async function handleConnect() {
    if (!selectedDbId) return;
    setConnectStatus("testing");
    setConnectError("");

    const testRes = await fetch(`/api/databases/${selectedDbId}/health`, {
      method: "POST",
    });

    if (!testRes.ok) {
      const data = await testRes.json();
      setConnectStatus("fail");
      setConnectError(data.error ?? "Health check failed");
      return;
    }

    setConnectStatus("pushing");

    const pushRes = await fetch("/api/apps/push-schema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ databaseId: selectedDbId }),
    });

    if (!pushRes.ok) {
      const data = await pushRes.json();
      setConnectStatus("fail");
      setConnectError(data.error ?? "Schema push failed");
      return;
    }

    setConnectStatus("ok");
  }

  async function handleSaveNewDb() {
    setSavingDb(true);
    const res = await fetch("/api/databases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newDbName,
        dbUri: newDbUri,
        dbType: "POSTGRES",
      }),
    });
    setSavingDb(false);
    if (!res.ok) return;
    const db = await res.json();
    setDatabases((prev) => [db, ...prev]);
    setSelectedDbId(db.id);
    setShowNewDbForm(false);
    setNewDbName("");
    setNewDbUri("");
  }

  function handleClose() {
    resetModal();
    onClose();
  }

  async function handleCreate() {
    setSubmitting(true);
    const res = await fetch("/api/apps/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        domain,
        framework,
        databaseId: selectedDbId,
      }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    const app = await res.json();
    setCreatedApp(app);
    setStep(3);
  }

  function handleCopy() {
    if (!createdApp) return;
    navigator.clipboard.writeText(getSnippet(createdApp.trackingId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleFinish() {
    if (createdApp) onCreated(createdApp);
    handleClose();
  }

  const step1Valid = name.trim() && domain.trim() && framework;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden bg-[#0A0A0A] text-white border-[#1F1F1F]">
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
                    ? "w-6 bg-muted"
                    : s < step
                      ? "w-4 bg-neutral-600/20"
                      : "w-4 bg-neutral-600"
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

            {/* <div className="space-y-1.5">
              <Label>Framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextjs">Next.js</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
        )}

        {/* ── Step 2 — DB connection ── */}
        {step === 2 && (
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a database to store this app's analytics.
            </p>

            {/* DB list */}
            <div className="space-y-2">
              {databases.length === 0 && !showNewDbForm && (
                <p className="text-xs text-muted-foreground py-2">
                  No databases yet — add one below.
                </p>
              )}

              {databases.map((db) => (
                <div
                  key={db.id}
                  onClick={() => {
                    setSelectedDbId(db.id);
                    setConnectStatus("idle");
                  }}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    selectedDbId === db.id
                      ? "border-foreground bg-muted/40"
                      : "border-border hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {db.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {db.dbType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        db.isHealthy
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}
                    >
                      {db.isHealthy ? "Healthy" : "Unknown"}
                    </span>
                    {selectedDbId === db.id && (
                      <CheckCircle2 className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add new DB form */}
            {showNewDbForm ? (
              <div className="border rounded-lg p-3 space-y-2.5">
                <p className="text-xs font-medium">New database</p>
                <Input
                  placeholder="Label (e.g. Production DB)"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  type="password"
                  placeholder="postgres://user:pass@host:5432/db"
                  value={newDbUri}
                  onChange={(e) => setNewDbUri(e.target.value)}
                  className="h-8 text-sm font-mono"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={!newDbName || !newDbUri || savingDb}
                    onClick={handleSaveNewDb}
                  >
                    {savingDb ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setShowNewDbForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs border-dashed"
                onClick={() => setShowNewDbForm(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add new database
              </Button>
            )}

            {/* Connect button + status */}
            {selectedDbId && !showNewDbForm && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  className="w-full"
                  disabled={
                    connectStatus === "testing" ||
                    connectStatus === "pushing" ||
                    connectStatus === "ok"
                  }
                  onClick={handleConnect}
                >
                  {connectStatus === "testing" && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Testing connection
                    </>
                  )}
                  {connectStatus === "pushing" && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Pushing schema
                    </>
                  )}
                  {connectStatus === "ok" && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                      Ready
                    </>
                  )}
                  {(connectStatus === "idle" || connectStatus === "fail") &&
                    "Connect & push schema"}
                </Button>

                {connectStatus === "fail" && (
                  <p className="text-xs text-destructive">{connectError}</p>
                )}
                {connectStatus === "ok" && (
                  <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2">
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                      Schema ready — antz_pageviews, antz_events, antz_sessions
                    </p>
                  </div>
                )}
              </div>
            )}
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
                  Tracking ID:{" "}
                  <span className="font-mono">{createdApp.trackingId}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Add this to your app/layout.tsx
                </Label>
                <div className="flex itmes-center">
                  <Link href={"/docs"} className="px-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs cursor-pointer"
                    >
                      <BookText className="w-3 h-3 mr-1" />
                      Docs
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs cursor-pointer"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <pre className="bg-[#131313] rounded-md p-3 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre">
                {getSnippet(createdApp.trackingId)}
              </pre>
            </div>

            <p className="text-xs text-muted-foreground">
              Your app will show{" "}
              <span className="font-medium text-foreground">
                Waiting to connect
              </span>{" "}
              until the first event is received from your site.
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
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
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
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Creating...
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
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
  );
}
