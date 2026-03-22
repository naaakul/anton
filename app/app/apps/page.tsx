"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type DbType = "POSTGRES" | "MONGODB"
type TestStatus = "idle" | "testing" | "ok" | "fail"

export default function AppsPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [dbType, setDbType] = useState<DbType>("POSTGRES")
  const [dbUri, setDbUri] = useState("")
  const [testStatus, setTestStatus] = useState<TestStatus>("idle")
  const [testError, setTestError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleTestConnection() {
    setTestStatus("testing")
    setTestError("")

    const res = await fetch("/api/apps/test-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dbUri, dbType }),
    })

    if (res.ok) {
      setTestStatus("ok")
    } else {
      const data = await res.json()
      setTestStatus("fail")
      setTestError(data.error ?? "Connection failed")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (testStatus !== "ok") return // must test first

    setLoading(true)

    const res = await fetch("/api/apps/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain, dbType, dbUri }),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/apps") // or wherever your app list lives
    }
  }

  const canSubmit = testStatus === "ok" && name && domain && dbUri && !loading

  return (
    <div className="max-w-xl mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-2">Add App</h1>
      <p className="text-sm text-gray-500 mb-8">
        Your DB URI is encrypted before storage and never logged.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="App Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          placeholder="Domain (e.g. mysite.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value.replace(/^https?:\/\//, ""))}
          className="w-full border p-3 rounded"
          required
        />

        <select
          value={dbType}
          onChange={(e) => {
            setDbType(e.target.value as DbType)
            setTestStatus("idle") // reset test if type changes
          }}
          className="w-full border p-3 rounded bg-white"
        >
          <option value="POSTGRES">PostgreSQL</option>
          <option value="MONGODB">MongoDB</option>
        </select>

        <div className="space-y-2">
          <input
            type="password"       // password field so URI isn't visible in browser history
            placeholder={
              dbType === "POSTGRES"
                ? "postgres://user:pass@host:5432/db"
                : "mongodb+srv://user:pass@cluster.mongodb.net/db"
            }
            value={dbUri}
            onChange={(e) => {
              setDbUri(e.target.value)
              setTestStatus("idle") // reset test if URI changes
            }}
            className="w-full border p-3 rounded font-mono text-sm"
            required
          />

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={!dbUri || testStatus === "testing"}
            className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-40"
          >
            {testStatus === "testing" ? "Testing..." : "Test Connection"}
          </button>

          {testStatus === "ok" && (
            <p className="text-sm text-green-600">Connection successful</p>
          )}
          {testStatus === "fail" && (
            <p className="text-sm text-red-500">{testError}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-40 w-full"
          disabled={!canSubmit}
        >
          {loading ? "Creating..." : "Create App"}
        </button>
      </form>
    </div>
  )
}