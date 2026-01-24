"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, ShieldCheck, CheckCircle2, ImagePlus, X, Loader2, AlertCircle, Shield, ArrowRight, MessageCircleHeart, Lock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ai, media, intelligence, report } from "@/lib/api"
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import axios from "axios"

interface Message {
  role: "user" | "model"
  parts: string
  image?: string
  isForm?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isConsented, setIsConsented] = useState(false)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ file: File, preview: string } | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [forensicLoading, setForensicLoading] = useState(false)
  const [lastUploadedImage, setLastUploadedImage] = useState<{ base64: string, mimeType: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastReportId, setLastReportId] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // Polling for verification status if we have a report
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lastReportId && !isVerified) {
      interval = setInterval(async () => {
        try {
          const res = await report.getById(lastReportId)
          if (res.data?.status === 'VERIFIED') {
            setIsVerified(true)
            clearInterval(interval)
          }
        } catch (e) {
          console.error("Status check failed", e)
        }
      }, 10000) // Check every 10 seconds
    }
    return () => clearInterval(interval)
  }, [lastReportId, isVerified])

  // Suggested Prompts
  const suggestedPrompts = [
    "I need help understanding what happened",
    "How can I report this safely?",
    "I'm feeling anxious, what should I do?"
  ]

  // Evidence Form State
  const [evidenceData, setEvidenceData] = useState({
    platform: "",
    description: "",
    date: ""
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading, showEvidenceForm])

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/');
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage({ file, preview: URL.createObjectURL(file) })
      setShowEvidenceForm(true)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  const handleSend = async (customMessage?: string, imagePayload?: any) => {
    const textToSend = customMessage || input
    if (!textToSend.trim() && !imagePayload && !selectedImage) return

    const userMessage: Message = {
      role: "user",
      parts: textToSend,
      image: selectedImage?.preview
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      let finalImage = imagePayload
      if (!finalImage && selectedImage) {
        const base64 = await fileToBase64(selectedImage.file)
        finalImage = { data: base64, mimeType: selectedImage.file.type }
      }

      setSelectedImage(null)

      const res = await ai.chat(textToSend, messages, finalImage);
      const botResponse: Message = { role: "model", parts: res.data.text }
      setMessages((prev) => [...prev, botResponse])

      // Logic trigger for evidence form
      if (res.data.text.toLowerCase().includes("securely upload") || res.data.text.toLowerCase().includes("evidence")) {
        setShowEvidenceForm(true)
      }

    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", parts: "I'm having trouble connecting. I'm here if you want to try again." }])
    } finally {
      setLoading(false)
    }
  }

  const submitEvidence = async () => {
    if (!selectedImage) return alert("Please select an image first")
    setAnalysisLoading(true)

    try {
      const base64 = await fileToBase64(selectedImage.file)
      const uploadRes = await media.uploadSecure({
        base64Data: base64,
        mimeType: selectedImage.file.type,
        description: evidenceData.description,
        metadata: {
          platform: evidenceData.platform,
          date: evidenceData.date,
          submittedAt: new Date().toISOString()
        }
      })

      const analysisRes = await intelligence.analyze({
        format: selectedImage.file.type.split('/')[1],
        size: selectedImage.file.size,
        hasExif: false
      })

      setMessages(prev => [...prev, {
        role: "model",
        parts: `**Evidence Secured & Analyzed**\n\n**Integrity Hash:** \`${uploadRes.data.hash.substring(0, 16)}...\`\n\n${analysisRes.data.explanation}`
      }])

      setShowEvidenceForm(false)
      setSelectedImage(null)
      setEvidenceData({ platform: "", description: "", date: "" })
      setLastUploadedImage({ base64, mimeType: selectedImage.file.type })
      setLastReportId(uploadRes.data.reportId)

      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "model",
          parts: "I've secured the evidence safely. Would you like me to perform a **detailed technical check** to identify manipulation indicators and help you file a complaint?"
        }])
      }, 1000)

    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        alert("Your session has expired. Please log in again.")
        router.push('/')
      } else {
        alert("Encryption encountered an issue. Your files remain private.")
      }
    } finally {
      setAnalysisLoading(false)
    }
  }

  const runDetailedForensics = async () => {
    if (!lastUploadedImage) return
    setForensicLoading(true)

    try {
      const res = await intelligence.detailedAnalysis(
        lastUploadedImage.base64,
        lastUploadedImage.mimeType,
        lastReportId || undefined
      )
      const data = res.data

      setMessages(prev => [...prev, {
        role: "model",
        parts: `### Report & Legal Guidance\n\n${data.message}\n\n**Relevant Legal Sections for Your Case:**\n${data.legalSections?.map((s: string) => `- ${s}`).join('\n')}\n\n---\n\n### 📝 Draft Complaint for Authorities\n\n${data.complaintDraft || 'No draft generated.'}\n\n**I have securely shared the technical analysis with our NGO partners.** They are ready to support you with professional oversight if you choose to proceed with a formal report.`
      }])

      if (data.reportId) setLastReportId(data.reportId) // Changed from 'reportId' to 'data.reportId'

      setLastUploadedImage(null)
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        alert("Your session has expired. Please log in again.")
        router.push('/')
      } else {
        alert("Forensic analysis failed. I'm here if you want to try again.")
      }
    } finally {
      setForensicLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!lastReportId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5021/api/report/${lastReportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `digital-dignity-complaint-${lastReportId.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-16 px-6 border-b bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/5 rounded-xl border border-primary/10">
            <MessageCircleHeart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-sm text-primary tracking-tight uppercase">Sakhi Companion</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase tracking-widest">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Online • Here to help
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-primary/30 uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full">
            <Shield className="h-3 w-3" /> Secure Infrastructure
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-primary/40 hover:text-primary rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Verification Banner */}
        {isVerified && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-green-50 border border-green-100 rounded-3xl p-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm flex items-start gap-4">
              <div className="bg-green-500 p-2 rounded-full text-white shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-green-900 text-sm">Verification Complete</h4>
                <p className="text-green-700 text-xs italic">Great news! Our NGO partners have officially verified your forensic report. We are now ready to assist you in the next steps of your journey.</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-6 pb-32">
          {/* CONSENT MODAL */}
          {!isConsented && (
            <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
              <Card className="max-w-md border-0 shadow-2xl rounded-[2rem] overflow-hidden glass translate-y-[-20px]">
                <CardHeader className="space-y-4 pt-10">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 rotate-3">
                    <ShieldCheck className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-heading text-2xl font-extrabold text-primary tracking-tight leading-none">Your Safe Space</h2>
                    <p className="text-primary/60 text-sm font-medium italic">Redefining Digital Dignity</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pb-10">
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3 text-left">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed font-medium text-primary/80">
                        Evidence is <strong>AES-256 encrypted</strong> and <strong>SHA-hashed</strong>. Your data stays in your control.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3 text-left">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed font-medium text-primary/80">
                        We provide emotional and technical support. Focus is on empathy and recovery.
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setIsConsented(true)} className="w-full bg-primary hover:bg-primary/90 hover:scale-[1.02] smooth-transition h-14 rounded-2xl text-base font-bold text-white shadow-lg shadow-primary/30">
                    I UNDERSTAND & AGREE
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-700 py-20">
              <div className="p-5 bg-white rounded-3xl shadow-xl shadow-primary/5 border border-primary/5 relative">
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white border-4 border-white">
                  <MessageCircleHeart className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-primary/70 leading-relaxed italic px-2">
                  "Hello, I'm Sakhi. Take your time... I'm here to listen and help you securely handle any digital concerns you have."
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full pt-4">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p)}
                    className="w-full p-4 text-xs font-bold text-primary/60 bg-white border border-primary/5 rounded-2xl hover:bg-primary hover:text-white hover:border-primary smooth-transition text-left shadow-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col gap-3 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === "user" ? "bg-white border-primary/10 text-primary" : "bg-primary border-primary text-white"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`rounded-[1.5rem] px-5 py-3.5 text-sm shadow-sm smooth-transition ${msg.role === "user" ? "bg-primary text-white rounded-tr-none font-medium leading-relaxed" : "bg-white text-primary rounded-tl-none border border-primary/5 prose prose-sm prose-primary max-w-none shadow-primary/5"}`}>
                  {msg.image && <img src={msg.image} className="rounded-xl mb-3 max-h-48 border border-white/20 shadow-lg object-contain" />}
                  <ReactMarkdown>{msg.parts}</ReactMarkdown>
                </div>
              </div>

              {/* AI ACTION BUTTONS */}
              {msg.role === "model" && msg.parts.includes("detailed technical check") && lastUploadedImage && (
                <div className="ml-11">
                  <Button
                    size="sm"
                    onClick={runDetailedForensics}
                    disabled={forensicLoading}
                    className="bg-accent hover:bg-accent/90 text-white h-10 px-6 rounded-xl font-bold border-0 shadow-lg shadow-accent/20 smooth-transition"
                  >
                    {forensicLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    START FORENSIC ANALYSIS
                  </Button>
                </div>
              )}
              {msg.role === "model" && msg.parts.includes("formal complaint") && (
                <div className="ml-11 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="h-10 px-6 rounded-xl font-bold border-primary/10 bg-white text-primary hover:bg-primary/5 shadow-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    DOWNLOAD COMPLAINT (PDF)
                  </Button>
                </div>
              )}
            </div>
          ))}

          {showEvidenceForm && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden border border-white/20">
                <CardHeader className="p-6 border-b border-primary/5 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                        <Shield className="text-primary h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <CardTitle className="font-heading text-base font-extrabold text-primary tracking-tight leading-none">Secure Vault Intake</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-accent tracking-widest">
                          AES-256 HASHING ACTIVE
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/40 hover:text-primary rounded-full transition-colors" onClick={() => setShowEvidenceForm(false)}><X className="h-5 w-5" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-1">Source Platform</Label>
                      <Input id="platform" placeholder="Instagram, WhatsApp..." className="h-12 rounded-2xl border-primary/5 bg-white/50 focus:bg-white text-sm font-medium shadow-sm" value={evidenceData.platform} onChange={e => setEvidenceData({ ...evidenceData, platform: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-1">Incident Date</Label>
                      <Input id="date" type="date" className="h-12 rounded-2xl border-primary/5 bg-white/50 focus:bg-white text-sm font-medium shadow-sm" value={evidenceData.date} onChange={e => setEvidenceData({ ...evidenceData, date: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-1">Brief Description</Label>
                    <Input id="description" placeholder="What does this image/video show?" className="h-12 rounded-2xl border-primary/5 bg-white/50 focus:bg-white text-sm font-medium shadow-sm" value={evidenceData.description} onChange={e => setEvidenceData({ ...evidenceData, description: e.target.value })} />
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-1">Secure Attachment</Label>
                    {selectedImage ? (
                      <div className="relative rounded-3xl overflow-hidden border-2 border-primary/5 bg-white shadow-inner p-3">
                        <img src={selectedImage.preview} className="h-40 w-full object-contain rounded-2xl bg-gray-50 border border-primary/5" />
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-6 right-6 bg-red-500/90 text-white rounded-full p-2 shadow-2xl backdrop-blur-md hover:bg-red-600 smooth-transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-primary/10 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-3 bg-white/50 hover:bg-white hover:border-primary/30 transition-all cursor-pointer group shadow-sm"
                      >
                        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 smooth-transition shadow-sm">
                          <ImagePlus className="h-7 w-7 text-primary" />
                        </div>
                        <div className="text-center">
                          <span className="block text-sm font-bold text-primary/70">Click to Select Evidence</span>
                          <span className="text-[10px] text-primary/40 uppercase tracking-widest">End-to-End Encrypted Upload</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    disabled={analysisLoading || !selectedImage}
                    className="w-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 h-14 rounded-2xl transition-all active:scale-[0.98] font-bold text-base text-white"
                    onClick={submitEvidence}
                  >
                    {analysisLoading ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-3" /> SECURING FILES...</>
                    ) : (
                      <><ShieldCheck className="h-5 w-5 mr-3" /> SUBMIT SECURE EVIDENCE</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {loading && (
            <div className="flex gap-1.5 p-4 rounded-3xl bg-white border border-primary/5 w-fit shadow-sm animate-pulse">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="bg-white/50 backdrop-blur-xl p-4 border-t border-primary/5 shrink-0 z-30">
        <div className="container max-w-3xl mx-auto flex flex-col gap-4">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex w-full gap-3 items-center">
            <input type="file" hidden ref={fileInputRef} onChange={handleImageSelect} accept="image/*" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary/40 hover:text-primary rounded-2xl h-12 w-12 bg-white shadow-sm border border-primary/5"
            >
              <ImagePlus className="h-6 w-6" />
            </Button>
            <div className="flex-1 relative flex items-center">
              <Input
                placeholder="You can speak freely here..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                className="h-14 px-6 rounded-[2rem] border-primary/5 bg-white shadow-inner focus:ring-primary/20 text-sm font-medium pr-16"
              />
              <Button
                type="submit"
                disabled={loading || (!input.trim() && !selectedImage)}
                className="absolute right-2 h-10 w-10 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/20 smooth-transition active:scale-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="flex justify-center">
            <p className="text-[9px] font-bold text-primary/20 uppercase tracking-[0.2em]">
              Your files are encrypted and handled securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
