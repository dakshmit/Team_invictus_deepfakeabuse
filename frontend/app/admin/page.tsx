"use client"

import { useState, useEffect } from "react"
import { Shield, Search, Filter, Eye, AlertTriangle, CheckCircle, Clock, ChevronRight, BarChart3, Binary, Lock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

export default function AdminPortal() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [evidenceData, setEvidenceData] = useState<{ [id: string]: string }>({})
    const [integrityStatus, setIntegrityStatus] = useState<{ [id: string]: string }>({})
    const [updatingStatus, setUpdatingStatus] = useState(false)

    useEffect(() => {
        fetchReports()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("You are not logged in. Please log in as an NGO officer.");
                setLoading(false);
                return;
            }
            const res = await axios.get("http://localhost:5021/api/admin/forensics", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setReports(res.data)
        } catch (err: any) {
            console.error("Failed to fetch reports", err)
            if (err.response?.status === 403) {
                setError("Access Denied: You do not have the NGO_ADMIN role. Please re-login after promotion.");
            } else if (err.response?.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError("Could not connect to the forensic server. Please check if the backend is running on port 5021.");
            }
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (status: string) => {
        if (!selectedReport) return
        setUpdatingStatus(true)
        try {
            const token = localStorage.getItem('token');
            let notes = "";
            if (status === 'VALID') {
                notes = "Forensic integrity verified. Proceeding with support.";
            } else {
                const userNotes = prompt(`Please provide a reason/notes for ${status}:`);
                if (userNotes === null) { // User cancelled prompt
                    setUpdatingStatus(false);
                    return;
                }
                notes = userNotes;

                if (!notes && (status === 'RESOLVED' || status === 'NEEDS_CLARIFICATION')) {
                    alert("A reason is required to notify the user of this decision.");
                    setUpdatingStatus(false);
                    return;
                }
            }

            await axios.put(`http://localhost:5021/api/admin/forensics/${selectedReport.reportId}/status`,
                { status, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            alert(`Case status updated to ${status}`)
            fetchReports()
            setSelectedReport((prev: any) => ({ ...prev, status }))
        } catch (err) {
            console.error("Status update failed", err)
            alert("Failed to update status.")
        } finally {
            setUpdatingStatus(false)
        }
    }

    const viewEvidence = async (evidenceId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5021/api/admin/evidence/${evidenceId}/view`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const integrity = response.headers['x-forensic-integrity'];
            setIntegrityStatus(prev => ({ ...prev, [evidenceId]: integrity }));

            const url = URL.createObjectURL(response.data);
            setEvidenceData(prev => ({ ...prev, [evidenceId]: url }));
        } catch (err) {
            alert("Access Denied: You are not authorized to view this evidence.");
        }
    }

    const handleSelectReport = async (report: any) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5021/api/admin/forensics/${report.reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            // Merge response (which now includes feedback fields) with existing report metadata
            setSelectedReport({ ...report, ...res.data })
            setEvidenceData({})
            setIntegrityStatus({})
        } catch (err) {
            console.error("Failed to fetch report details", err)
            setSelectedReport(report)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6 hidden lg:block">
                <div className="flex items-center gap-3 mb-10">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <span className="font-heading font-bold text-lg tracking-tight uppercase">NGO Portal</span>
                </div>
                <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-white/10 text-white hover:bg-white/20">
                        <BarChart3 className="h-4 w-4" /> Intake Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-white/5">
                        <Binary className="h-4 w-4" /> Forensic Logs
                    </Button>
                    <div className="pt-10">
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                            <Lock className="h-4 w-4" /> Logout Session
                        </Button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">Technical Forensics Queue</h1>
                        <p className="text-slate-500 font-medium">Professional oversight for Digital Dignity reports.</p>
                    </div>
                </header>

                {error && (
                    <Card className="mb-8 border-red-200 bg-red-50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-red-700 font-medium">
                                <AlertTriangle className="h-5 w-5" />
                                {error}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/login'} className="border-red-300 text-red-800 hover:bg-red-100 font-bold">
                                    Go to Login
                                </Button>
                                <Button variant="outline" size="sm" onClick={fetchReports} className="border-red-200 text-red-700 hover:bg-red-100">
                                    Retry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Reports List */}
                    <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
                        {loading ? (
                            <div className="text-center py-10 text-slate-400">Loading forensics...</div>
                        ) : error ? (
                            <div className="text-center py-10 text-slate-300 italic">Queue unavailable due to error.</div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 italic">No reports pending review.</div>
                        ) : (
                            reports.map((report) => (
                                <Card
                                    key={report.id}
                                    className={`cursor-pointer transition-all hover:border-blue-300 border-2 ${selectedReport?.id === report.id ? 'border-primary shadow-lg' : 'border-transparent'}`}
                                    onClick={() => handleSelectReport(report)}
                                >
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={report.confidenceScore > 0.7 ? "destructive" : "secondary"} className="h-5 text-[10px] font-bold">
                                                {report.confidenceScore ? `RISK: ${(report.confidenceScore * 100).toFixed(0)}%` : "No Score"}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 font-mono">{new Date(report.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="font-bold text-slate-800 text-xs">ID: {report.reportId.slice(-12)}...</div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
                                                <Binary className="h-3 w-3" /> {report.evidenceCount} ITEMS
                                            </div>
                                            <Badge className={`text-[9px] uppercase tracking-tighter ${report.status === 'VALID' ? 'bg-green-100 text-green-700' : report.status === 'ESCALATED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {report.status}
                                            </Badge>
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
                                    <CardHeader className="bg-slate-900 text-white p-6">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-xl font-bold">Case Review: {selectedReport.reportId.slice(-6)}</CardTitle>
                                            <Badge className="bg-blue-600">CONFIDENCE: {(selectedReport.confidenceScore * 100).toFixed(0)}%</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        {/* Technical Summary */}
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
                                                <Binary className="h-4 w-4 text-blue-500" /> Forensic Analysis Summary
                                            </h4>
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed font-medium">
                                                {selectedReport.analysisSummary || "No technical summary generated."}
                                            </div>
                                        </div>

                                        {/* Evidence Access Panel */}
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
                                                <Lock className="h-4 w-4 text-amber-500" /> Secure Evidence Vault
                                            </h4>
                                            <div className="grid gap-4">
                                                {selectedReport.evidence?.map((item: any, idx: number) => (
                                                    <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-3">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-bold text-slate-800">Evidence ID: {item.id.slice(-6)}</div>
                                                                <div className="text-[10px] text-slate-400 font-mono">Hash: {item.fileHash}</div>
                                                            </div>
                                                            {integrityStatus[item.id] && (
                                                                <Badge variant={integrityStatus[item.id] === 'verified' ? "secondary" : "destructive"} className="text-[10px]">
                                                                    {integrityStatus[item.id] === 'verified' ? '✅ Integrity Verified' : '❌ Integrity Failed'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {evidenceData[item.id] ? (
                                                            <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                                <img src={evidenceData[item.id]} alt="Decrypted Evidence" className="w-full h-auto max-h-[400px] object-contain" />
                                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                                                                    In-Memory Stream (RAM)
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                onClick={() => viewEvidence(item.id)}
                                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-none h-12 rounded-xl"
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" /> UNLOCK & VIEW EVIDENCE
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Complaint Draft */}
                                        {selectedReport.complaint && (
                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <h4 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
                                                    <Shield className="h-4 w-4 text-green-600" /> User-facing Draft
                                                </h4>
                                                <div className="p-6 bg-green-50/30 rounded-2xl border border-green-100 text-slate-700 leading-relaxed font-medium text-xs">
                                                    {selectedReport.complaint.content}
                                                    <div className="mt-4">
                                                        <Button
                                                            variant="outline" size="sm"
                                                            className="text-[10px] font-bold h-8 rounded-lg bg-white border-green-200"
                                                            onClick={async () => {
                                                                try {
                                                                    const token = localStorage.getItem('token');
                                                                    const response = await axios.get(`http://localhost:5021/api/report/${selectedReport.reportId}/complaint-download`, {
                                                                        headers: { Authorization: `Bearer ${token}` },
                                                                        responseType: 'blob'
                                                                    });
                                                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                                                    const link = document.createElement('a');
                                                                    link.href = url;
                                                                    link.setAttribute('download', `complaint-${selectedReport.reportId.slice(-6)}.pdf`);
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    link.remove();
                                                                } catch (err) {
                                                                    alert("Failed to export complaint PDF.");
                                                                }
                                                            }}
                                                        >
                                                            <Download className="h-3 w-3 mr-1" /> EXPORT COMPLAINT (PDF)
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Block */}
                                        <div className="pt-6 border-t border-slate-100 space-y-4">
                                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Professional Action & Case Handling</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <Button
                                                    onClick={() => handleUpdateStatus('VALID')}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs h-12"
                                                >
                                                    MARK VALID
                                                </Button>
                                                <Button
                                                    onClick={() => handleUpdateStatus('ESCALATED')}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs h-12"
                                                >
                                                    ESCALATE
                                                </Button>
                                                <Button
                                                    onClick={() => handleUpdateStatus('NEEDS_CLARIFICATION')}
                                                    variant="outline"
                                                    className="border-slate-200 text-slate-700 font-bold rounded-xl text-xs h-12"
                                                >
                                                    CLARIFY
                                                </Button>
                                                <Button
                                                    onClick={() => handleUpdateStatus('RESOLVED')}
                                                    className="bg-slate-900 text-white font-bold rounded-xl text-xs h-12"
                                                >
                                                    CLOSE CASE
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 p-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                <div className="bg-slate-100 p-6 rounded-full">
                                    <Eye className="h-12 w-12" />
                                </div>
                                <p className="font-medium text-center max-w-xs uppercase tracking-tighter text-sm">Select a case for professional forensic review.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
