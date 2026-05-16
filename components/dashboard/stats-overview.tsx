"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, BookOpen, Clock, Award } from "lucide-react"

const stats = [
  {
    label: "Overall Score",
    value: "78%",
    icon: Target,
    description: "Based on 15 skills",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Courses Completed",
    value: "12",
    icon: BookOpen,
    description: "This month: 3",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    label: "Learning Hours",
    value: "48h",
    icon: Clock,
    description: "Weekly avg: 8h",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    label: "Certifications",
    value: "4",
    icon: Award,
    description: "2 in progress",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
]

export function StatsOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
