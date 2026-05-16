"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Sparkles, CheckCircle2 } from "lucide-react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

export function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = (file: File) => {
    setUploadedFile(file.name)
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Resume Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Drag and drop your resume here, or
            </p>
            <label htmlFor="resume-upload">
              <Button variant="outline" className="mt-3" asChild>
                <span className="cursor-pointer">Browse Files</span>
              </Button>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="mt-3 text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{uploadedFile}</p>
                <p className="text-xs text-muted-foreground">
                  {isAnalyzing ? "Analyzing..." : "Analysis complete"}
                </p>
              </div>
              {!isAnalyzing && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
              {isAnalyzing && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>

            {!isAnalyzing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <span className="text-sm text-muted-foreground">
                    Skills Identified
                  </span>
                  <span className="font-semibold text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <span className="text-sm text-muted-foreground">
                    Skill Gaps Found
                  </span>
                  <span className="font-semibold text-chart-3">5</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <span className="text-sm text-muted-foreground">
                    Match Score
                  </span>
                  <span className="font-semibold text-primary">78%</span>
                </div>
                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  View Full Analysis
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
