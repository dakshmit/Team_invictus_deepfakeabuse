"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import { Shield, Bell, Phone, Info, AlertTriangle, CheckCircle, MessageCircleHeart, ArrowRight, Lock, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function UserDashboard() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/auth/login")
            return
        }
        fetchReports(token)
    }, [])

    const fetchReports = async (token: string) => {
        try {
            const res = await axios.get("http://localhost:5021/api/report", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setReports(res.data)
        } catch (err) {
            console.error("Failed to fetch reports", err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/")
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
            {/* Dashboard Navigation */}
            <header className="px-6 lg:px-12 h-20 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-50">
                <Link className="flex items-center gap-2.5 group" href="/">
                    <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                        <Shield className="h-5 w-5" />
                    </div>
                    <span className="font-heading font-extrabold text-xl tracking-tight text-primary uppercase">Digital Dignity</span>
                </Link>
                <nav className="flex gap-4 items-center">
                    <Button asChild variant="ghost" className="hidden sm:flex items-center gap-2 text-slate-600 font-bold hover:text-primary">
                        <Link href="/dashboard"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-xl shadow-md gap-2">
                        <Link href="/chat">
                            <MessageCircleHeart className="h-4 w-4" /> TALK TO SAKHI
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleLogout} className="border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </nav>
            </header>

            <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">
                            Welcome <span className="text-primary italic">Back</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Monitoring your path to digital recovery and dignity.</p>
                    </div>
                    <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-white border-2 border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-widest group shadow-xl shadow-primary/5 transition-all">
                        <Link href="/chat">
                            Open Forensic Chat <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>

                {/* CASE STATUS NOTIFICATIONS */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="font-heading text-xl font-extrabold text-slate-800 uppercase tracking-tight">Case status & Notifications</h2>
                    </div>

                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-40 bg-slate-200 rounded-[2rem]" />)}
                        </div>
                    ) : reports.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200 bg-white/50 rounded-[2.5rem] p-20 text-center">
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                                <LayoutDashboard className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400 mb-2">No Reports Found</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mb-8 font-medium">You haven't submitted any images for analysis yet. Talk to Sakhi to get started.</p>
                            <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20">
                                <Link href="/chat">Start First Analysis</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {reports.map((report) => (
                                <Card key={report.id} className="border-none bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all border border-slate-100">
                                    <CardHeader className="p-8 pb-0">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">INTAKE ID: {report.id.slice(-12)}</p>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none italic">
                                                        Case <span className="text-primary italic underline decoration-primary/20 decoration-8 underline-offset-4">{report.status}</span>
                                                    </h3>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "uppercase font-black text-[10px] tracking-[0.1em] px-4 h-8 rounded-full shadow-sm",
                                                report.status === 'VALID' ? "bg-green-500 text-white" :
                                                    report.status === 'RESOLVED' ? "bg-slate-950 text-white" :
                                                        report.status === 'NEEDS_CLARIFICATION' ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                                            )}>
                                                {report.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-8 space-y-6">
                                        {/* NGO VICTIM SUPPORT MESSAGE */}
                                        {report.status === 'VALID' && report.officialResponse && (
                                            <div className="p-6 bg-green-50 border border-green-100 rounded-3xl space-y-4 animate-in fade-in zoom-in duration-500">
                                                <div className="flex items-center gap-2 text-green-800 font-bold text-sm uppercase tracking-widest">
                                                    <CheckCircle className="h-5 w-5" /> Verified Support Protocol Active
                                                </div>
                                                <p className="text-base text-green-700 font-medium italic leading-relaxed">"{report.officialResponse}"</p>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1 flex items-center gap-4 p-4 bg-white rounded-2xl border border-green-100 shadow-sm">
                                                        <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                                            <Phone className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-green-800 uppercase tracking-widest leading-none mb-1">Assigned Support Line</span>
                                                            <span className="text-sm font-bold text-slate-900">{report.supportContact}</span>
                                                        </div>
                                                    </div>
                                                    <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-bold h-full px-8 rounded-2xl gap-2">
                                                        <Link href="/chat">Discuss Next Steps</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* REJECTION / CLARIFICATION MESSAGE */}
                                        {(report.status === 'RESOLVED' || report.status === 'NEEDS_CLARIFICATION' || report.rejectionDetails) && (
                                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                                                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase tracking-widest">
                                                    <Info className="h-5 w-5 text-primary" /> Forensic Officer Feedback
                                                </div>
                                                <div className="p-5 bg-white border border-slate-100 rounded-2xl text-slate-600 font-medium leading-relaxed italic text-sm">
                                                    {report.rejectionDetails || "Your case has been updated. Please speak with Sakhi for a detailed briefing."}
                                                </div>
                                                {report.status === 'NEEDS_CLARIFICATION' && (
                                                    <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/20">
                                                        <Link href="/chat">Submit Required Clarification</Link>
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {!report.officialResponse && !report.rejectionDetails && (
                                            <div className="flex items-center gap-4 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl">
                                                <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center animate-pulse">
                                                    <Shield className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <p className="text-sm text-blue-800/60 font-medium leading-relaxed italic">
                                                    Forensic investigators are currently performing pixel-pattern analysis and metadata verification on your submission. You will be notified here shortly.
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Lock className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">E2EE Protected • Victim-Centered Storage</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Analysis Token: DD-{report.id.substring(0, 6)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* SUPPORT FOOTER */}
            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-slate-400 text-xs font-medium mb-4 italic">“Your dignitiy is our priority. We are with you every step of the way.”</p>
                    <div className="flex justify-center gap-6">
                        <Link href="#" className="text-[10px] font-bold text-slate-300 hover:text-primary uppercase tracking-widest">Privacy Policy</Link>
                        <Link href="#" className="text-[10px] font-bold text-slate-300 hover:text-primary uppercase tracking-widest">Security Audit</Link>
                        <Link href="#" className="text-[10px] font-bold text-slate-300 hover:text-primary uppercase tracking-widest">Legal Rights</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
