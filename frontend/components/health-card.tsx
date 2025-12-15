import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Status = "good" | "moderate" | "hazardous"

const colorByStatus: Record<Status, string> = {
  good: "bg-[var(--color-success)] text-black",
  moderate: "bg-[var(--color-warning)] text-black",
  hazardous: "bg-[var(--color-danger)] text-white",
}

type HealthCardProps = {
  status: Status
  title: string
  recommendation: string
}

export function HealthCard({ status, title, recommendation }: HealthCardProps) {
  const badgeClass = colorByStatus[status]
  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif">{title}</CardTitle>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeClass}`}>{status.toUpperCase()}</span>
      </CardHeader>
      <CardContent>
        <p className="opacity-90">{recommendation}</p>
      </CardContent>
    </Card>
  )
}
