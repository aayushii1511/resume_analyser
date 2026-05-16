"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Navbar } from "@/components/dashboard/navbar"
import { SkillProgressCards } from "@/components/dashboard/skill-progress-cards"
import { RoadmapProgress } from "@/components/dashboard/roadmap-progress"
import { ResumeUpload } from "@/components/dashboard/resume-upload"
import { StatsOverview } from "@/components/dashboard/stats-overview"

export default function Dashboard() {
  const router = useRouter()

useEffect(() => {
  const token = localStorage.getItem("token")

  if (!token) {
    router.push("/login")
  }
}, [])
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="pl-16 transition-all duration-300 md:pl-64">
        <Navbar />
        
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back, John
            </h2>
            <p className="mt-1 text-muted-foreground">
              Track your progress and continue your learning journey
            </p>
          </div>

          {/* Stats Overview */}
          <section className="mb-8">
            <StatsOverview />
          </section>

          {/* Skill Progress Cards */}
          <section className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Skill Progress
            </h3>
            <SkillProgressCards />
          </section>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Roadmap Progress - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RoadmapProgress />
            </div>

            {/* Resume Upload - Takes 1 column */}
            <div>
              <ResumeUpload />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
