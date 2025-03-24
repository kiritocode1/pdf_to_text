"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, X } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      onFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      onFileUpload(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          selectedFile ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUp className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Drag and drop your PDF here, or</p>
              <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="mt-2">
                Browse files
              </Button>
            </div>
            <p className="text-xs text-gray-500">Only PDF files are supported</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileUp className="h-6 w-6 text-primary mr-2" />
              <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
      </div>
    </div>
  )
}

