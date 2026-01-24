"use client"

import { useState, useEffect } from "react"
import { Shield, Search, Filter, Eye, AlertTriangle, CheckCircle, Clock, ChevronRight, BarChart3, Binary, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

export default function AdminPortal() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<any>(null)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const res = await axios.get("http://localhost:5021/api/admin/forensics")
            setReports(res.data)
        } catch (err) {
            console.error("Failed to fetch reports", err)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!selectedReport) return
        try {
            await axios.post(`http://localhost:5021/api/admin/forensics/${selectedReport.reportId}/verify`)
            alert("Report successfully verified! The victim has been notified.")
            fetchReports() // Refresh list
            setSelectedReport((prev: any) => ({ ...prev, status: 'VERIFIED' }))
        } catch (err) {
            console.error("Verification failed", err)
            alert("Failed to verify report. Please try again.")
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6 hidden lg:block">
                <div className="flex items-center gap-3 mb-10">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <span className="font-heading font-bold text-lg tracking-tight uppercase">Admin Console</span>
                </div>
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-white/10 text-white hover:bg-white/20">
                        <BarChart3 className="h-4 w-4" /> Reports Overview
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5">
                        <Binary className="h-4 w-4" /> Forensic Logs
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5">
                        <Lock className="h-4 w-4" /> Secure Vault Keys
                    </Button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Technical Forensics Queue</h1>
                        <p className="text-slate-500 font-medium">Human-in-the-loop professional oversight for Digital Dignity reports.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="gap-2 border-slate-200">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                        <Button variant="outline" className="gap-2 border-slate-200">
                            <Search className="h-4 w-4" /> Search
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Reports List */}
                    <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                        {loading ? (
                            <div className="text-center py-10 text-slate-400">Loading forensics...</div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 italic">No reports pending review.</div>
                        ) : (
                            reports.map((report) => (
                                <Card
                                    key={report.id}
                                    className={`cursor-pointer transition-all hover:border-blue-300 border-2 ${selectedReport?.id === report.id ? 'border-primary shadow-lg' : 'border-transparent'}`}
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={report.confidenceScore > 0.7 ? "destructive" : "secondary"}>
                                                {report.confidenceScore ? `${(report.confidenceScore * 100).toFixed(0)}% Conf` : "No Score"}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 font-mono">{new Date(report.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="font-bold text-slate-800 truncate">Report ID: {report.reportId}</div>
                                        <div className="flex items-center text-xs text-slate-500 gap-1">
                                            <Clock className="h-3 w-3" /> Status: <span className={`${report.status === 'VERIFIED' ? 'text-green-600' : 'text-blue-600'} font-bold uppercase tracking-wider`}>{report.status || 'Pending Review'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="lg:col-span-2">
                        {selectedReport ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                                    <CardHeader className="bg-slate-900 text-white p-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <CardTitle className="text-2xl font-bold">Forensic Signal Breakdown</CardTitle>
                                            <Badge className="bg-blue-500 text-white border-none py-1 px-4">CASE #{selectedReport.reportId?.slice(-6)}</Badge>
                                        </div>
                                        <CardDescription className="text-slate-400">
                                            Technical detailed summary as analyzed by Gemini Vision (Hidden from User).
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        {/* Confidence Meter */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Aggregated Confidence</span>
                                                <span className="text-2xl font-black text-slate-900">{(selectedReport.confidenceScore * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${selectedReport.confidenceScore > 0.7 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${selectedReport.confidenceScore * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Technical Summary */}
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 font-bold text-slate-800">
                                                <Binary className="h-4 w-4 text-blue-500" /> AI Diagnostic Summary
                                            </h4>
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed font-medium">
                                                {selectedReport.analysisSummary || "No technical summary generated."}
                                            </div>
                                        </div>

                                        {/* Indicators List */}
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 font-bold text-slate-800">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" /> Visual Artifacts & Metadata Flags
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {selectedReport.indicators?.map((indicator: string, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm italic text-xs text-slate-600">
                                                        <CheckCircle className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                                                        {indicator}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Block */}
                                        <div className="pt-6 border-t border-slate-100 flex gap-4">
                                            {selectedReport.status === 'VERIFIED' ? (
                                                <Button disabled className="flex-1 bg-green-500 text-white h-12 rounded-xl font-bold cursor-default">
                                                    <CheckCircle className="h-4 w-4 mr-2" /> VERIFIED
                                                </Button>
                                            ) : (
                                                <Button onClick={handleVerify} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold">
                                                    VERIFY & PROCEED
                                                </Button>
                                            )}
                                            <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold">
                                                FLAG FOR REVIEW
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 p-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                <div className="bg-slate-100 p-6 rounded-full">
                                    <Eye className="h-12 w-12" />
                                </div>
                                <p className="font-medium text-center max-w-xs">Select a report from the queue to view technical forensic analysis.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
