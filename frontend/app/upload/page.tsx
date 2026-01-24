"use client"

import { useState } from "react"
import { Shield, Upload, FileImage, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)

    // Simulate encryption and upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsUploading(false)
    setUploaded(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="border-0 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-teal-600" />

          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Upload className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold">Secure Intake</CardTitle>
            <CardDescription>
              Upload the image you wish to analyze. It will be encrypted immediately.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {!uploaded ? (
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-all p-12 text-center ${dragActive ? "border-teal-600 bg-teal-50" : "border-gray-200 bg-white"
                  }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleChange}
                  accept="image/*"
                />

                {file ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100">
                      <FileImage className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      Remove file
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Click or drag image to upload</p>
                      <p className="text-sm text-gray-500">PNG, JPG or JPEG (max. 10MB)</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 py-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <Lock className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Evidence Securely Preserved</h4>
                  <p className="text-gray-500 mt-2">The image has been encrypted and moved to your private vault.</p>
                </div>
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl inline-flex items-center gap-2 text-teal-800 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Status: Encryption Successful
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50/80 p-6 flex flex-col sm:flex-row gap-3">
            {!uploaded ? (
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 h-12"
                disabled={!file || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  "Upload Securely"
                )}
              </Button>
            ) : (
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 h-12 gap-2"
                onClick={() => router.push('/upload/analyze')}
              >
                Analyze with Image Intelligence <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest font-medium">
          End-to-End Encrypted &bull; User Controlled &bull; Zero Peak Policy
        </p>
      </div>
    </div>
  )
}
