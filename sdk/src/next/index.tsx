// sdk/src/next/index.tsx
"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  type ReactNode,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { buildPageviewPayload, buildEventPayload } from "../lib/payload"
import { send } from "../lib/sender"

type VishlexContextValue = {
  trackEvent: (name: string, properties?: Record<string, unknown>) => void
}

const VishlexContext = createContext<VishlexContextValue>({ trackEvent: () => {} })

export function useVishlex() {
  return useContext(VishlexContext)
}

type Props = {
  trackingId:  string
  collectUrl:  string
  disabled?:   boolean
  children:    ReactNode
}

function TrackerInner({
  trackingId,
  collectUrl,
  disabled = false,
}: Omit<Props, "children">) {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const pageEnteredAt = useRef<number>(Date.now())
  const lastPathRef   = useRef<string | null>(null)

  const sendPageview = useCallback(
    (durationMs: number | null = null) => {
      if (disabled || typeof window === "undefined") return
      send(buildPageviewPayload(trackingId, durationMs), collectUrl)
    },
    [trackingId, collectUrl, disabled]
  )

  useEffect(() => {
    const currentPath =
      pathname + (searchParams?.toString() ? `?${searchParams}` : "")

    if (lastPathRef.current === currentPath) return

    if (lastPathRef.current !== null) {
      sendPageview(Date.now() - pageEnteredAt.current)
    } else {
      sendPageview(null)
    }

    lastPathRef.current   = currentPath
    pageEnteredAt.current = Date.now()
  }, [pathname, searchParams, sendPageview])

  useEffect(() => {
    if (disabled) return
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        sendPageview(Date.now() - pageEnteredAt.current)
      }
    }
    document.addEventListener("visibilitychange", onHide)
    return () => document.removeEventListener("visibilitychange", onHide)
  }, [disabled, sendPageview])

  return null
}

export function VishlexProvider({ trackingId, collectUrl, disabled = false, children }: Props) {
  const trackEvent = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      if (disabled || typeof window === "undefined") return
      send(buildEventPayload(trackingId, name, properties ?? null), collectUrl)
    },
    [trackingId, collectUrl, disabled]
  )

  return (
    <VishlexContext.Provider value={{ trackEvent }}>
      <Suspense fallback={null}>
        <TrackerInner
          trackingId={trackingId}
          collectUrl={collectUrl}
          disabled={disabled}
        />
      </Suspense>
      {children}
    </VishlexContext.Provider>
  )
}