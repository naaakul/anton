import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight, Clock, Globe } from "lucide-react"

type App = {
  id:         string
  trackingId: string
  name:       string
  domain:     string
  framework:  string
  dbType:     string
  createdAt:  string
}


export default function AppCard({ app }: { app: App }) {
  return (
    <Card className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none">{app.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{app.domain}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="text-xs gap-1.5 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400"
        >
          <Clock className="w-3 h-3" />
          Waiting to connect
        </Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Card>
  )
}