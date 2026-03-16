"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AppsPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [dbUri, setDbUri] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    const res = await fetch("/api/apps/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, dbUri })
    })

    setLoading(false)

    if (res.ok) {
      router.refresh()
      setName("")
      setDbUri("")
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-20">

      <h1 className="text-2xl font-bold mb-6">
        Add Database
      </h1>

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
          placeholder="Database URI"
          value={dbUri}
          onChange={(e) => setDbUri(e.target.value)}
          className="w-full border p-3 rounded"
          required
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Create App"}
        </button>

      </form>
    </div>
  )
}