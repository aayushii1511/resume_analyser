'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'
import { generateInterviewQuestions } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { Mic, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

interface Question {
  question: string
  type: 'behavioral' | 'technical' | 'situational'
}

export default function InterviewPrepPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [])

  const handleGenerateQuestions = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setGenerating(true)
    setError('')
    setCurrentIndex(0)
    setAnswers({})

    try {
      // For MVP, use placeholder resume text
      // In production, fetch user's resume
      const resumeText = 'Software engineer with 5+ years of experience in full-stack development'
      const targetRole = 'Senior Full Stack Engineer'

      const generated = await generateInterviewQuestions(resumeText, targetRole, token)

      if (generated && generated.length > 0) {
        setQuestions(generated)
      } else {
        setError('Failed to generate questions. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentIndex]: value,
    })
  }

  const handleReset = () => {
    setQuestions([])
    setCurrentIndex(0)
    setAnswers({})
    setError('')
  }

  const currentQuestion = questions[currentIndex]
  const hasAnswer = !!answers[currentIndex]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-16 transition-all duration-300 md:pl-64">
        <Navbar />
        <main className="p-6">
          <div className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Mic className="h-8 w-8 text-purple-400" />
                Interview Prep
              </h1>
              <p className="mt-1 text-muted-foreground">Practice with AI-generated interview questions</p>
            </div>

            {error && (
              <Card className="mb-6 bg-red-950/30 border-red-700/50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-red-400 font-semibold">{error}</p>
                    {error.includes('temporarily overloaded') && (
                      <p className="text-xs text-red-300">💡 AI service is busy. Try again in a moment.</p>
                    )}
                    {error.includes('No token') && (
                      <p className="text-xs text-red-300">💡 Please login and try again</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {questions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-12 text-center">
                  <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold text-foreground mb-2">No questions generated yet</p>
                  <p className="text-muted-foreground mb-6">
                    Generate a set of interview questions tailored to your role and experience
                  </p>
                  <Button onClick={handleGenerateQuestions} disabled={generating} className="gap-2">
                    {generating ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Question Display */}
                <Card className="mb-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Question {currentIndex + 1} of {questions.length}
                      </CardTitle>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-900/30 text-purple-300">
                        {currentQuestion.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-foreground">{currentQuestion.question}</p>
                  </CardContent>
                </Card>

                {/* Answer Section */}
                <Card className="mb-6 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Your Answer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Type your answer here... Think about specific examples and outcomes."
                      value={answers[currentIndex] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="min-h-32 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions
                    </p>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                      style={{
                        width: `${((currentIndex + 1) / questions.length) * 100}%`,
                      }}
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={currentIndex === questions.length - 1}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 p-4 rounded-lg bg-secondary/50 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Answered
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {Object.keys(answers).length} / {questions.length}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      size="sm"
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      New Questions
                    </Button>
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
