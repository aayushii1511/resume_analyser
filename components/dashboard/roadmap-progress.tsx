"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const roadmapSteps = [
  {
    title: "HTML & CSS Fundamentals",
    status: "completed",
    duration: "2 weeks",
    description: "Master responsive layouts and modern CSS",
  },
  {
    title: "JavaScript ES6+",
    status: "completed",
    duration: "3 weeks",
    description: "Async/await, modules, and modern syntax",
  },
  {
    title: "React & State Management",
    status: "in-progress",
    duration: "4 weeks",
    description: "Hooks, context, and component patterns",
    progress: 65,
  },
  {
    title: "TypeScript Integration",
    status: "upcoming",
    duration: "2 weeks",
    description: "Type safety and advanced patterns",
  },
  {
    title: "Testing & CI/CD",
    status: "upcoming",
    duration: "2 weeks",
    description: "Jest, Testing Library, GitHub Actions",
  },
]

export function RoadmapProgress() {
  const completedCount = roadmapSteps.filter(
    (step) => step.status === "completed"
  ).length
  const totalCount = roadmapSteps.length
  const overallProgress = Math.round((completedCount / totalCount) * 100)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">
            Learning Roadmap
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Frontend Developer Path
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{overallProgress}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roadmapSteps.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                "flex gap-4 rounded-lg border border-border p-4 transition-colors",
                step.status === "in-progress" && "border-primary/50 bg-primary/5"
              )}
            >
              {/* Status Icon */}
              <div className="flex flex-col items-center">
                {step.status === "completed" && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
                {step.status === "in-progress" && (
                  <div className="relative">
                    <Circle className="h-6 w-6 text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    </div>
                  </div>
                )}
                {step.status === "upcoming" && (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
                {index < roadmapSteps.length - 1 && (
                  <div
                    className={cn(
                      "mt-2 h-full w-0.5 flex-1",
                      step.status === "completed" ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {step.duration}
                  </div>
                </div>

                {/* Progress Bar for In-Progress */}
                {step.status === "in-progress" && step.progress && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-primary">
                        {step.progress}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
