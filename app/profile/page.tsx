'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'
import { getUserProfile } from '@/lib/api'
import { User, FileText, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(token)
        setProfile(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-16 transition-all duration-300 md:pl-64">
          <Navbar />
          <main className="p-6">
            <p className="text-muted-foreground">Loading profile...</p>
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
          <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              <p className="mt-1 text-muted-foreground">Your account information</p>
            </div>

            {error && (
              <Card className="mb-6 bg-red-950/30 border-red-700/50">
                <CardContent className="pt-6">
                  <p className="text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {profile && (
              <>
                {/* Account Info */}
                <Card className="mb-6 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Name
                      </p>
                      <p className="text-lg font-semibold text-foreground">{profile.name}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Email
                      </p>
                      <p className="text-lg font-semibold text-foreground">{profile.email}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Resume Status */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Resume Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Upload Status
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.resumeUploaded ? (
                          <span className="text-green-400">✓ Resume Uploaded</span>
                        ) : (
                          <span className="text-muted-foreground">No resume uploaded yet</span>
                        )}
                      </p>
                    </div>

                    {profile.lastResumeAnalysis && (
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last Analysis
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {new Date(profile.lastResumeAnalysis).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
