"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, ArrowLeft, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/api"

export default function EmailLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        otp: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isVerifying) {
                const res = await auth.verifyOtp(formData.email, formData.otp);
                const { token, user } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                router.push('/chat');
                return;
            }

            if (isRegister) {
                const { name, email, password } = formData;
                await auth.register({ name, email, password });
                setIsVerifying(true);
                alert("Registration initiated. Please enter the OTP sent to your email.");
            } else {
                const res = await auth.login({ email: formData.email, password: formData.password });
                const { token, user } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                router.push('/chat');
            }

        } catch (error: any) {
            console.error("Auth Error", error);
            if (error.response?.status === 403) {
                setIsVerifying(true);
                alert(error.response?.data?.error || "Please verify your email.");
            } else {
                alert(error.response?.data?.error || "Authentication failed");
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen font-sans">
            {/* LEFT SIDE: Branding Panel (Re-used for consistency) */}
            <div className="hidden lg:flex flex-col w-1/2 bg-primary relative p-16 justify-between overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] border-[40px] border-white/20 rounded-full" />
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-heading font-extrabold text-xl tracking-tight text-white uppercase tracking-wider">Digital Dignity</span>
                </div>
                <div className="relative z-10 space-y-4 max-w-lg">
                    <h2 className="font-heading text-4xl font-extrabold text-white">Your privacy is not a luxury, it's a right.</h2>
                    <p className="text-white/60 text-lg">We provide the technical and emotional buffer you need to face digital context with confidence.</p>
                </div>
                <div className="relative z-10">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">Private • Secure • End-to-End Encrypted</p>
                </div>
            </div>

            {/* RIGHT SIDE: Email Form Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative overflow-y-auto">
                <div className="absolute top-8 left-8">
                    <Button variant="ghost" size="sm" asChild className="text-primary/60 hover:text-primary hover:bg-primary/5 rounded-xl px-2 h-9">
                        <Link href="/auth" className="flex items-center gap-2 font-bold text-xs">
                            <ArrowLeft className="h-3.5 w-3.5" /> GO BACK
                        </Link>
                    </Button>
                </div>

                <Card className="w-full max-w-sm border-0 shadow-none bg-transparent">
                    <CardHeader className="space-y-2 pb-6 px-0">
                        <CardTitle className="font-heading text-3xl font-extrabold text-primary tracking-tight">
                            {isVerifying ? "Verify Identity" : (isRegister ? "Start Your Journey" : "Welcome Back")}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-foreground/50">
                            {isVerifying ? "Check your inbox for a secure code" : (isRegister ? "Join 1,000+ others protecting their dignity" : "Access your secure forensic companion")}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 px-0">
                            {isVerifying ? (
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">One-Time Password</Label>
                                    <Input
                                        id="otp"
                                        placeholder="000000"
                                        required
                                        maxLength={6}
                                        className="h-12 rounded-2xl border-primary/10 bg-white shadow-sm focus:ring-primary/20 text-lg font-bold tracking-[0.5em] text-center"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    />
                                    <p className="text-[10px] text-accent font-medium italic text-center">* Code is logged in backend for hackathon</p>
                                </div>
                            ) : (
                                <>
                                    {isRegister && (
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[10px] font-bold uppercase text-primary/40 tracking-wider flex items-center gap-1.5"><User className="h-3 w-3" /> Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="Anjali Sharma"
                                                className="h-12 rounded-2xl border-primary/10 bg-white shadow-sm focus:ring-primary/20 text-sm font-medium"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] font-bold uppercase text-primary/40 tracking-wider flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="anjali@example.com"
                                            required
                                            className="h-12 rounded-2xl border-primary/10 bg-white shadow-sm focus:ring-primary/20 text-sm font-medium"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[10px] font-bold uppercase text-primary/40 tracking-wider flex items-center gap-1.5"><Lock className="h-3 w-3" /> Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            className="h-12 rounded-2xl border-primary/10 bg-white shadow-sm focus:ring-primary/20 text-sm font-medium"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-6 px-0 pt-4">
                            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl smooth-transition" disabled={loading}>
                                {loading ? "Securely Processing..." : (isVerifying ? "Confirm Identity" : (isRegister ? "Create Secure Account" : "Secure Sign In"))}
                            </Button>
                            {!isVerifying && (
                                <div className="text-center text-xs font-medium text-foreground/40">
                                    {isRegister ? "Already part of the community? " : "Haven't joined yet? "}
                                    <button
                                        type="button"
                                        onClick={() => setIsRegister(!isRegister)}
                                        className="text-primary font-bold hover:underline underline-offset-4"
                                    >
                                        {isRegister ? "Sign In" : "Register Now"}
                                    </button>
                                </div>
                            )}
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
