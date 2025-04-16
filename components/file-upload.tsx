"use client"

import type { ChangeEvent } from "react"
import { Loader, FileText } from "lucide-react"

interface FileUploadProps {
  onUpload: (files: FileList | null) => void
  isProcessing: boolean
  files: File[]
}

export function FileUpload({ onUpload, isProcessing, files }: FileUploadProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files)
    // Reset the input value so the same file can be uploaded again if needed
    e.target.value = ""
  }

  return (
    <div className="relative">
      <label
        htmlFor="file-upload"
        className={`
          flex items-center space-x-1 cursor-pointer text-xs px-2 py-1 
          border border-green-700 rounded hover:bg-green-900 transition-colors
          ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {isProcessing ? (
          <>
            <Loader className="h-3 w-3 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FileText className="h-3 w-3" />
            <span>Upload</span>
          </>
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.pdf,.md"
        disabled={isProcessing}
      />

      {files.length > 0 && (
        <div className="absolute top-full left-0 mt-1 text-xs">
          {files.map((file, index) => (
            <div key={index} className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
