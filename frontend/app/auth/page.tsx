"use client"

import { useState, useEffect } from "react"
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { auth } from "@/lib/api"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Shield, Mail, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await auth.google(credential as string);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* LEFT SIDE: Branding Panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-primary relative p-16 justify-between overflow-hidden">
        {/* Abstract Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] border-[40px] border-white/20 rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] border-[20px] border-white/20 rounded-full" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white uppercase">Digital Dignity</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="font-heading text-4xl xl:text-5xl font-extrabold text-white leading-[1.1]">
            A safe space to report, understand, and recover.
          </h2>
          <p className="text-white/70 text-lg font-medium leading-relaxed">
            Protecting your digital identity with empathy, privacy, and technical guidance.
            You're not alone in this journey.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
            Private • Secure • Judgment-Free
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Link className="flex items-center gap-2 group" href="/">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-heading font-extrabold text-sm tracking-tight text-primary uppercase">Digital Dignity</span>
          </Link>
        </div>

        <Card className="w-full max-w-sm border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-2 pb-8 px-0 text-center lg:text-left">
            <CardTitle className="font-heading text-3xl font-extrabold text-primary tracking-tight">
              Welcome Back
            </CardTitle>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-accent uppercase tracking-wider">
              <Lock className="h-3 w-3" />
              <span>Your privacy is our priority</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-0">
            <div className="flex justify-center w-full overflow-hidden rounded-2xl border border-primary/10 shadow-sm hover:shadow-md smooth-transition">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                shape="rectangular"
                width="100%"
                size="large"
                text="signin_with"
                theme="filled_blue"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/5" />
              </div>
              <div className="relative flex justify-center text-[10px] items-center font-extrabold uppercase tracking-widest text-primary/30">
                <span className="bg-background px-4">OR CONTINUE WITH</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 gap-3 border-primary/10 hover:border-primary/30 hover:bg-primary/5 rounded-2xl smooth-transition font-bold text-primary" asChild>
              <Link href="/auth/login">
                <Mail className="h-4 w-4" />
                Use Email Address
              </Link>
            </Button>

            <div className="pt-4 text-center">
              <p className="text-xs text-foreground/50 font-medium">
                New here? <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-4">Create an account</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Home button for mobile */}
        <div className="mt-12 lg:hidden">
          <Button variant="ghost" size="sm" asChild className="text-primary/40 text-xs font-bold gap-2">
            <Link href="/">
              <ArrowLeft className="h-3 w-3" /> BACK TO HOME
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
