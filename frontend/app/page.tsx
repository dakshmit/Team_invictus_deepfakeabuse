"use client"

import Link from "next/link"
import { Shield, Lock, ArrowRight, Heart, Sparkles, Eye, ShieldCheck, MessageCircleHeart, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-primary/5">
        <Link className="flex items-center gap-2.5 group" href="/">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-primary uppercase">Digital Dignity</span>
        </Link>
        <nav className="flex gap-6 items-center">
          <Link className="hidden sm:block text-xs font-bold text-primary/60 hover:text-primary transition-colors tracking-widest" href="/auth/login">
            SIGN IN
          </Link>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-xl shadow-md">
            <Link href="/auth">GET STARTED</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* HERO SECTION: Involvement focused */}
        <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 px-6 md:px-12">
          <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                <Sparkles className="h-3 w-3" /> New Standard for Digital Safety
              </div>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary tracking-tighter leading-[0.95]">
                Reclaiming Your <span className="text-accent underline decoration-accent/30 underline-offset-8">Digital Dignity</span>
              </h1>
              <p className="max-w-xl text-lg md:text-xl text-primary/60 font-medium leading-relaxed italic">
                “Protecting Digital Dignity. Supporting You with Care.”
              </p>
              <p className="max-w-lg text-foreground/70 font-medium leading-relaxed">
                A private, tech-forward sanctuary for women to navigate the complexities of digital manipulation. We provide the tools to understand, analyze, and recover—on your own terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 h-16 px-10 rounded-2xl text-base font-bold text-white group" asChild>
                  <Link href="/chat">
                    GET SUPPORT NOW <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl text-base font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all" asChild>
                  <Link href="/auth">LEARN MORE</Link>
                </Button>
              </div>
            </div>

            <div className="relative aspect-square max-w-lg mx-auto lg:mr-0 animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-[3rem] rotate-3 blur-3xl opacity-50" />
              <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[3rem] p-8 shadow-2xl glass">
                <img
                  src="/safety_illustration_1769268952584.png"
                  alt="Safety and Trust"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 p-6 bg-white rounded-3xl shadow-xl border border-primary/5 max-w-[200px] animate-bounce-slow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Live Security</span>
                  </div>
                  <p className="text-[11px] font-bold text-primary/60 leading-tight">AES-256 Encryption active for all uploaded artifacts.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GUIDED JOURNEY: Educational/Involving */}
        <section className="py-24 bg-primary/5 relative overflow-hidden">
          <div className="container mx-auto px-6 text-center space-y-16">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-primary tracking-tight">How Your Journey Begins</h2>
              <p className="text-foreground/60 font-medium">Three clear steps to reclaim your peace of mind and technical control.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              <div className="flex flex-col items-center space-y-6 group">
                <div className="relative">
                  <div className="h-20 w-20 rounded-3xl bg-white shadow-xl shadow-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Users className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shadow-lg">1</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-heading font-extrabold text-primary text-lg">Share Your Story</h4>
                  <p className="text-sm text-foreground/60 leading-relaxed px-4">Speak freely with Sakhi, our supportive companion AI trained for digital empathy.</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-6 group">
                <div className="relative">
                  <div className="h-20 w-20 rounded-3xl bg-white shadow-xl shadow-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Eye className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shadow-lg">2</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-heading font-extrabold text-primary text-lg">Technical Analysis</h4>
                  <div className="inline-flex px-2 py-0.5 rounded-md bg-accent/10 text-[9px] font-bold text-accent uppercase tracking-widest mb-1 mx-auto block w-fit">Powered by Gemini Forensics</div>
                  <p className="text-sm text-foreground/60 leading-relaxed px-4">Upload artifacts for a secure, technical scan to understand manipulation indicators.</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-6 group">
                <div className="relative">
                  <div className="h-20 w-20 rounded-3xl bg-white shadow-xl shadow-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shadow-lg">3</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-heading font-extrabold text-primary text-lg">Reclaim Control</h4>
                  <p className="text-sm text-foreground/60 leading-relaxed px-4">Generate formal complaints and get emotional guidance to move forward with dignity.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PILLARS OF DIGNITY: Feature grid */}
        <section className="py-24 px-6">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="p-10 rounded-[2.5rem] border-primary/5 bg-white shadow-xl shadow-primary/5 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-default overflow-hidden group">
                <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Lock className="h-7 w-7" />
                </div>
                <CardTitle className="font-heading text-2xl font-extrabold text-primary mb-4 tracking-tight">Radical Privacy</CardTitle>
                <p className="text-foreground/60 font-medium leading-relaxed">
                  Your data is never for sale. We use end-to-end encryption to ensure that only you can access your forensic artifacts.
                </p>
              </Card>

              <Card className="p-10 rounded-[2.5rem] border-accent/10 bg-accent/5 shadow-xl shadow-accent/5 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-default relative overflow-hidden group">
                <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8 group-hover:bg-accent group-hover:text-white transition-colors">
                  <MessageCircleHeart className="h-7 w-7" />
                </div>
                <CardTitle className="font-heading text-2xl font-extrabold text-primary mb-4 tracking-tight">Sakhi AI</CardTitle>
                <p className="text-primary/70 font-medium leading-relaxed">
                  A dedicated companion that listens without judgment, helping you break through the anxiety of digital abuse.
                </p>
                <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[80px]" />
              </Card>

              <Card className="p-10 rounded-[2.5rem] border-primary/5 bg-white shadow-xl shadow-primary/5 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-default overflow-hidden group">
                <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Zap className="h-7 w-7" />
                </div>
                <CardTitle className="font-heading text-2xl font-extrabold text-primary mb-4 tracking-tight">Fast Resolution</CardTitle>
                <p className="text-foreground/60 font-medium leading-relaxed">
                  From analysis to legal complaint ready in minutes. We handle the technical heavy lifting so you don't have to.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* DIGNITY PROMISE: High trust anchor */}
        <section className="py-24 px-6 bg-primary text-white text-center">
          <div className="container mx-auto space-y-12 max-w-4xl">
            <div className="space-y-4">
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight">The Dignity Promise</h2>
              <p className="text-white/60 font-medium italic">“We believe every woman deserves a safe digital existence.”</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <h4 className="font-heading font-extrabold mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent" /> Non-Diagnostic
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">We provide artifacts and indicators, leaving the final conclusion to you. We respect your autonomy.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <h4 className="font-heading font-extrabold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" /> Community Driven
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">Our workflows are designed with input from victims and advocates to ensure real-world effectiveness.</p>
              </div>
            </div>
            <div className="pt-8">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold h-16 px-12 rounded-2xl shadow-2xl shadow-accent/20" asChild>
                <Link href="/auth">START YOUR JOURNEY</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-primary/5 bg-white relative z-10">
        <div className="container px-6 mx-auto flex flex-col items-center justify-center gap-4">
          <Link className="flex items-center gap-2 mb-2" href="/">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-heading font-extrabold text-sm tracking-tight text-primary uppercase">Digital Dignity</span>
          </Link>
          <p className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.4em]">
            Private • Secure • Judgment-Free
          </p>
          <div className="flex items-center gap-1.5 text-xs text-primary/40 font-medium border-t border-primary/5 pt-6 w-full justify-center">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> by Team Invictus for your digital freedom.
          </div>
        </div>
      </footer>
    </div>
  )
}
