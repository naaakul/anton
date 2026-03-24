"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { buildPageviewPayload, buildEventPayload } from "../lib/payload"
import { send } from "../lib/sender"


type VishlexContextValue = {
  trackEvent: (name: string, properties?: Record<string, unknown>) => void
}

const VishlexContext = createContext<VishlexContextValue>({
  trackEvent: () => {},
})

export function useVishlex() {
  return useContext(VishlexContext)
}


type Props = {
  trackingId:   string
  collectUrl?:  string  
  disabled?:    boolean
  children:     ReactNode
}

export function VishlexProvider({
  trackingId,
  collectUrl,
  disabled = false,
  children,
}: Props) {
  const pathname        = usePathname()
  const searchParams    = useSearchParams()
  const pageEnteredAt   = useRef<number>(Date.now())
  const lastPathRef     = useRef<string | null>(null)

  const sendPageview = useCallback(
    (durationMs: number | null = null) => {
      if (disabled || typeof window === "undefined") return
      const payload = buildPageviewPayload(trackingId, durationMs)
      send(payload, collectUrl)
    },
    [trackingId, collectUrl, disabled]
  )

  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams}` : "")

    if (lastPathRef.current === currentPath) return

    if (lastPathRef.current !== null) {
      const duration = Date.now() - pageEnteredAt.current
      sendPageview(duration)
    } else {
      sendPageview(null)
    }

    lastPathRef.current  = currentPath
    pageEnteredAt.current = Date.now()
  }, [pathname, searchParams, sendPageview])

  useEffect(() => {
    if (disabled) return

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        const duration = Date.now() - pageEnteredAt.current
        const payload = buildPageviewPayload(trackingId, duration)
        send(payload, collectUrl)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [trackingId, collectUrl, disabled])

  const trackEvent = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      if (disabled || typeof window === "undefined") return
      const payload = buildEventPayload(trackingId, name, properties ?? null)
      send(payload, collectUrl)
    },
    [trackingId, collectUrl, disabled]
  )

  return (
    <VishlexContext.Provider value={{ trackEvent }}>
      {children}
    </VishlexContext.Provider>
  )
}