"use client"

import { useState } from "react"
import { Shield, Lock, Eye, EyeOff, ArrowRight, Binary } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await axios.post("http://localhost:5021/api/auth/login", {
                email,
                password
            })

            const { token, user } = res.data

            if (user.role === 'USER') {
                setError("Access Denied: This portal is reserved for authorized NGO personnel only.")
                setLoading(false)
                return
            }

            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(user))

            router.push("/admin")
        } catch (err: any) {
            setError(err.response?.data?.error || "Authentication failed. Please check your credentials.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-800 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md z-10 space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 mb-2">
                        <Shield className="h-10 w-10 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-heading font-black text-white tracking-tighter uppercase italic">
                        Digital <span className="text-blue-500 underline decoration-blue-500/30 decoration-8 underline-offset-4">Dignity</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Forensic Investigation & NGO Oversight Portal</p>
                </div>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 text-center border-b border-slate-800/50">
                        <CardTitle className="text-xl font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">
                            <Lock className="h-4 w-4 text-blue-400" /> Authorized Access
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Please provide your specialized NGO credentials to proceed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl font-medium animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Institutional Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@ngo-domain.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 bg-slate-950/50 border-slate-800 text-white rounded-2xl focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-700 font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Forensic Access Key</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-14 bg-slate-950/50 border-slate-800 text-white rounded-2xl focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-700 font-medium pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 group uppercase tracking-widest"
                            >
                                {loading ? "Verifying Keys..." : (
                                    <span className="flex items-center gap-2">
                                        Enter Evidence Vault <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
                            <div className="inline-flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">
                                <Binary className="h-3 w-3" /> E2EE Secured • Chain of Custody Enforced
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-600 text-xs font-medium">
                    Unauthorized access to victim forensic data is strictly prohibited and subject to legal action under the IT Act.
                </p>
            </div>
        </div>
    )
}
