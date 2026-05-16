"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const skills = [
  {
    name: "React",
    level: 85,
    change: 12,
    trend: "up",
    color: "bg-chart-1",
  },
  {
    name: "TypeScript",
    level: 72,
    change: 8,
    trend: "up",
    color: "bg-chart-2",
  },
  {
    name: "Node.js",
    level: 68,
    change: -3,
    trend: "down",
    color: "bg-chart-3",
  },
  {
    name: "System Design",
    level: 45,
    change: 0,
    trend: "neutral",
    color: "bg-chart-4",
  },
]

export function SkillProgressCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {skills.map((skill) => (
        <Card key={skill.name} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {skill.name}
            </CardTitle>
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                skill.trend === "up" && "bg-primary/10 text-primary",
                skill.trend === "down" && "bg-destructive/10 text-destructive",
                skill.trend === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {skill.trend === "up" && <TrendingUp className="h-3 w-3" />}
              {skill.trend === "down" && <TrendingDown className="h-3 w-3" />}
              {skill.trend === "neutral" && <Minus className="h-3 w-3" />}
              {skill.change > 0 ? `+${skill.change}%` : `${skill.change}%`}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {skill.level}%
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full rounded-full transition-all", skill.color)}
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
