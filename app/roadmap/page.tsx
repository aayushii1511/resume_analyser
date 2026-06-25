'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'
import { getUserRoadmap, generateRoadmap, saveRoadmap, updateMilestone } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { Map, CheckCircle2, Circle, RefreshCw } from 'lucide-react'

interface Milestone {
  title: string
  description: string
  estimatedWeeks: number
  skills: string[]
  completed?: boolean
}

export default function RoadmapPage() {
  const router = useRouter()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [resumeText, setResumeText] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const loadRoadmap = async () => {
      try {
        console.log('📍 Loading user roadmap...')
        const data = await getUserRoadmap(token)
        console.log('📊 Loaded roadmap:', data)
        
        if (data.milestones && data.milestones.length > 0) {
          console.log('✅ Roadmap exists with', data.milestones.length, 'milestones')
          setMilestones(data.milestones)
        } else {
          console.log('⏳ No roadmap found, user will need to generate one')
        }
        setLoading(false)
      } catch (err: any) {
        console.warn('⚠️  Could not load roadmap:', err.message)
        // Don't set error here - let user try to generate instead
        setLoading(false)
      }
    }

    loadRoadmap()
  }, [])

  const handleGenerateRoadmap = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No authentication token found. Please login.')
      return
    }

    setGenerating(true)
    setError('')

    try {
      // In a real scenario, we'd get the resume text from the backend
      // For MVP, we'll use a placeholder if no resume exists
      const text = resumeText || 'Software engineer with 5+ years of professional experience in full-stack development, specializing in modern web technologies'

      console.log('📝 Generating roadmap for:', text.substring(0, 50) + '...')
      const generated = await generateRoadmap(text, token)
      
      console.log('✅ Generated milestones:', generated.length)
      if (generated && generated.length > 0) {
        setMilestones(generated)
        
        // Try to save but don't fail if save fails
        try {
          console.log('💾 Saving roadmap to database...')
          await saveRoadmap(generated, token)
          console.log('✅ Roadmap saved')
        } catch (saveErr) {
          console.warn('⚠️  Could not save roadmap to DB, but displaying locally:', saveErr)
        }
      } else {
        setError('No milestones were generated. Please try again.')
      }
    } catch (err: any) {
      console.error('❌ Roadmap generation error:', err)
      setError(err.message || 'Failed to generate roadmap. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleMilestone = async (index: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const newCompleted = !milestones[index].completed
      await updateMilestone(index, newCompleted, token)
      
      const updated = [...milestones]
      updated[index].completed = newCompleted
      setMilestones(updated)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-16 transition-all duration-300 md:pl-64">
          <Navbar />
          <main className="p-6">
            <p className="text-muted-foreground">Loading roadmap...</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-16 transition-all duration-300 md:pl-64">
        <Navbar />
        <main className="p-6">
          <div className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Map className="h-8 w-8 text-blue-400" />
                Career Roadmap
              </h1>
              <p className="mt-1 text-muted-foreground">Your personalized path to career growth</p>
            </div>

            {error && (
              <Card className="mb-6 bg-red-950/30 border-red-700/50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-red-400 font-semibold">{error}</p>
                    {error.includes('temporarily overloaded') && (
                      <p className="text-xs text-red-300">💡 Try again in 30 seconds</p>
                    )}
                    {error.includes('No token') && (
                      <p className="text-xs text-red-300">💡 Please login and try again</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {milestones.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-12 text-center">
                  <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-foreground mb-2">No roadmap yet</p>
                  <p className="text-muted-foreground mb-6">Generate a personalized career roadmap based on your resume</p>
                  <Button onClick={handleGenerateRoadmap} disabled={generating} className="gap-2">
                    {generating ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Generate Roadmap
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end mb-6">
                  <Button
                    variant="outline"
                    onClick={handleGenerateRoadmap}
                    disabled={generating}
                    className="gap-2"
                  >
                    {generating ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <Card
                      key={index}
                      className={`border-l-4 cursor-pointer transition-all ${
                        milestone.completed
                          ? 'border-l-green-500 bg-green-950/20 border-border'
                          : 'border-l-blue-500 bg-card border-border hover:border-border'
                      }`}
                      onClick={() => handleToggleMilestone(index)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {milestone.completed ? (
                              <CheckCircle2 className="h-6 w-6 text-green-400" />
                            ) : (
                              <Circle className="h-6 w-6 text-blue-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3
                                className={`text-lg font-semibold ${
                                  milestone.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                                }`}
                              >
                                {milestone.title}
                              </h3>
                              <span className="text-xs font-semibold text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                {milestone.estimatedWeeks} weeks
                              </span>
                            </div>

                            <p
                              className={`text-sm mb-3 ${
                                milestone.completed ? 'text-muted-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {milestone.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {milestone.skills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Progress</p>
                  <p>
                    {milestones.filter(m => m.completed).length} of {milestones.length} milestones completed
                  </p>
                  <div className="mt-3 w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(milestones.filter(m => m.completed).length / milestones.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
