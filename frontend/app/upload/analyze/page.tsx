"use client"

import { useState } from "react"
import { Shield, Eye, CheckCircle, Info, ArrowRight, ShieldAlert, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { intelligence } from "@/lib/api"
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'

export default function ImageIntelligencePage() {
    const [step, setStep] = useState(1) // 1: Intake, 2: Consent, 3: Results
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const router = useRouter()

    const startAnalysis = async () => {
        setLoading(true)
        try {
            // For demo, we pass mock metadata. In real flow, this follows an actual upload.
            const res = await intelligence.analyze({ width: 450, height: 300, format: 'jpeg', size: 30000, hasExif: false })
            setResult(res.data)
            setStep(3)
        } catch (error) {
            console.error("Analysis Error", error)
            alert("Analysis failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 items-center justify-center p-4">
            <div className="w-full max-w-2xl">

                {/* Step 1: Intake Status */}
                {step === 1 && (
                    <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
                                <CheckCircle className="h-8 w-8 text-teal-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Image Securely Preserved</CardTitle>
                            <CardDescription>
                                Your image has been encrypted and stored in our secure local vault.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <div className="rounded-xl bg-teal-50 p-4 border border-teal-100">
                                <p className="text-sm text-teal-800 flex items-center justify-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Evidence Preservation State: ACTIVE
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">
                                Analysis is optional. We never peak without your permission.
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button onClick={() => setStep(2)} className="bg-teal-600 hover:bg-teal-700 gap-2">
                                Continue to Analysis <ArrowRight className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Step 2: Consent */}
                {step === 2 && (
                    <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-right-4">
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                                <Eye className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle>Human-in-the-loop: Verification</CardTitle>
                            <CardDescription>
                                Would you like Sakhi to search for common digital artifacts (such as compression patterns or edge anomalies)?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <Info className="h-4 w-4" /> Why do this?
                                </p>
                                <p>Artifacts can help you understand if an image has been manipulated, but they are not conclusive proof of deepfakes.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-4">
                            <Button variant="outline" onClick={() => router.push('/chat')} className="flex-1">
                                Skip for now
                            </Button>
                            <Button onClick={startAnalysis} disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
                                {loading ? "Analyzing..." : "Analyze Image"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Step 3: Results */}
                {step === 3 && result && (
                    <Card className="border-0 shadow-lg animate-in fade-in zoom-in-95">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${result.confidence === 'HIGH' ? 'bg-red-100' : result.confidence === 'MODERATE' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                                    <ShieldAlert className={`h-6 w-6 ${result.confidence === 'HIGH' ? 'text-red-600' : result.confidence === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'}`} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Analysis Summary</CardTitle>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Internal Assessment: {result.confidence}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="prose prose-sm max-w-none text-gray-700 bg-white p-4 rounded-xl border">
                                <ReactMarkdown>{result.explanation}</ReactMarkdown>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> Detected Indicators
                                </h4>
                                <ul className="space-y-2">
                                    {result.indicators.map((ind: any, i: number) => (
                                        <li key={i} className="text-sm flex items-start gap-2 bg-gray-100 p-2 rounded-lg">
                                            <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                                            <div>
                                                <strong>{ind.type}:</strong> {ind.detail}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                                <p className="text-xs text-orange-800 leading-relaxed italic">
                                    <strong>DISCLAIMER:</strong> Digital artifacts can occur through normal photo editing, multiple re-saves, or compression during social media sharing. These results should be considered observations, not conclusive evidence of manipulation.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-4 border-t pt-6">
                            <Button variant="outline" className="flex-1" onClick={() => router.push('/chat')}>
                                Finish
                            </Button>
                            <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => router.push('/chat')}>
                                Draft Complaint with Sakhi
                            </Button>
                        </CardFooter>
                    </Card>
                )}

            </div>
        </div>
    )
}
