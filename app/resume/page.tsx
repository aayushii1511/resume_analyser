'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Upload, CheckCircle2, AlertCircle, Zap, BookOpen, TrendingUp, File } from 'lucide-react';

interface AnalysisResult {
  extractedSkills: string[];
  missingSkills: string[];
  careerMatchScore: number;
  recommendations: string[];
}

function parseAnalysis(raw: string): AnalysisResult {
  const extractedSkills: string[] = [];
  const missingSkills: string[] = [];
  const recommendations: string[] = [];
  let careerMatchScore = 0;
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  let section = '';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('strength')) { section = 'strengths'; continue; }
    if (lower.includes('weakness') || lower.includes('missing')) { section = 'missing'; continue; }
    if (lower.includes('suggestion') || lower.includes('recommendation')) { section = 'recommendations'; continue; }
    if (lower.includes('ats') || lower.includes('score')) { section = 'score'; continue; }

    if (section === 'score') {
      const match = line.match(/(\d+)\s*\/\s*100|(\d+)%/);
      if (match) careerMatchScore = parseInt(match[1] || match[2]);
      if (line.length > 10 && !/^\d/.test(line)) recommendations.push(line.replace(/^[-*]\s*/, ''));
      continue;
    }

    if (!line.match(/^[-*]/) && !line.match(/^\d+\./)) continue;
    const clean = line.replace(/^[-*]\s*|\d+\.\s*/, '').trim();
    if (!clean || clean.length < 3) continue;

    if (section === 'strengths') extractedSkills.push(clean);
    else if (section === 'missing') missingSkills.push(clean);
    else if (section === 'recommendations') recommendations.push(clean);
  }

  if (!careerMatchScore) {
    const m = raw.match(/(\d+)\s*\/\s*100/);
    if (m) careerMatchScore = parseInt(m[1]);
  }

  return {
    extractedSkills: extractedSkills.slice(0, 10),
    missingSkills: missingSkills.slice(0, 8),
    careerMatchScore: careerMatchScore || 50,
    recommendations: recommendations.slice(0, 6),
  };
}

async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      resolve(text && text.length > 10 ? text : `Resume: ${file.name}`);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default function ResumeAnalyzerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [rawAnalysis, setRawAnalysis] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, []);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > 5 * 1024 * 1024) { setError('File too large (max 5MB)'); return; }
    setFile(f);
    setFileName(f.name);
    setError('');
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) { setError('Please upload a file first'); return; }
    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const resumeText = await extractTextFromFile(file);
      if (resumeText.trim().length < 20) throw new Error('Could not extract text. Try a .txt file.');

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setRawAnalysis(data.analysis);
      setAnalysisResult(parseAnalysis(data.analysis));
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileName('');
    setError('');
    setAnalysisResult(null);
    setRawAnalysis('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Resume Analyzer</h1>
          </div>
          <p className="text-slate-400">Upload your resume for AI-powered feedback and ATS score</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            <Card className="bg-slate-800/50 border-slate-700/50">
              <div className="p-6">
                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileChange(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-lg p-10 text-center hover:border-blue-500/50 transition-colors cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">Drop your resume here</p>
                  <p className="text-slate-400 text-sm">or click to browse (PDF, DOCX, TXT — max 5MB)</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
              </div>
            </Card>

            {error && (
              <Alert className="bg-red-950/30 border-red-700/50">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {fileName && !error && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white text-sm font-medium">{fileName}</p>
                      <p className="text-slate-400 text-xs">{((file?.size ?? 0) / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={handleClear} className="text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
              </Card>
            )}

            <Button onClick={handleAnalyze} disabled={!file || loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 disabled:opacity-50">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span>Analyzing...</span>
                </div>
              ) : 'Analyze Resume'}
            </Button>

            {analysisResult && (
              <div className="space-y-4 mt-4">

                <Card className="bg-gradient-to-br from-blue-900/30 to-slate-800/30 border-blue-700/30">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-white">ATS Score</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-blue-400">{analysisResult.careerMatchScore}<span className="text-xl">/100</span></div>
                      <div className="flex-1">
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${analysisResult.careerMatchScore}%` }} />
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          {analysisResult.careerMatchScore >= 70 ? 'Good' : analysisResult.careerMatchScore >= 50 ? 'Moderate' : 'Needs work'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {analysisResult.extractedSkills.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <h3 className="text-base font-semibold text-white">Strengths</h3>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.extractedSkills.map((s, i) => (
                          <div key={i} className="px-3 py-2 bg-green-900/20 border border-green-700/50 rounded-lg text-green-300 text-sm">{s}</div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {analysisResult.missingSkills.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                        <h3 className="text-base font-semibold text-white">Weaknesses</h3>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.missingSkills.map((s, i) => (
                          <div key={i} className="px-3 py-2 bg-amber-900/20 border border-amber-700/50 rounded-lg text-amber-300 text-sm">{s}</div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {analysisResult.recommendations.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-5 w-5 text-purple-400" />
                        <h3 className="text-base font-semibold text-white">Recommendations</h3>
                      </div>
                      <div className="space-y-2">
                        {analysisResult.recommendations.map((r, i) => (
                          <div key={i} className="p-3 bg-purple-900/10 border border-purple-700/30 rounded-lg text-slate-200 text-sm">
                            <span className="text-purple-400 font-semibold">Tip {i + 1}: </span>{r}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <details className="p-4">
                    <summary className="text-slate-400 text-sm cursor-pointer hover:text-white">View raw AI output</summary>
                    <pre className="mt-3 text-xs text-slate-400 whitespace-pre-wrap">{rawAnalysis}</pre>
                  </details>
                </Card>

              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50 sticky top-4">
              <div className="p-6">
                <h3 className="text-base font-semibold text-white mb-4">How it Works</h3>
                <div className="space-y-4 text-sm">
                  {[
                    { step: '1', title: 'Upload', desc: 'Drop your resume file here' },
                    { step: '2', title: 'Analyze', desc: 'Gemini AI reads and scores your resume' },
                    { step: '3', title: 'Get Insights', desc: 'See strengths, gaps and recommendations' },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-700 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">{step}</div>
                      <div>
                        <p className="text-white font-medium">{title}</p>
                        <p className="text-slate-400 text-xs">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <div className="p-6">
                <h3 className="text-base font-semibold text-white mb-3">Supported Formats</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {['PDF Files', 'Word Documents (DOCX)', 'Plain Text (TXT)', 'Max 5MB'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}