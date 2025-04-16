"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Terminal } from "@/components/terminal"
import { FileUpload } from "@/components/file-upload"
import { extractTextFromFile } from "@/lib/document-utils"
import { AlertCircle, FileText } from "lucide-react"
import { handleTerminalCommand } from "@/lib/terminal-commands"

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatError,
    append,
    setMessages,
    setInput,
    reload,
  } = useChat({
    api: "/api/chat",
    body: {
      extractedText,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Welcome to Terminal Chat. Type /help to see available commands or start typing to chat.",
      },
    ],
    onError: (err) => {
      console.error("Chat error:", err)
      setError(`Error: ${err.message || "Failed to get a response"}`)
    },
    onFinish: () => {
      // Clear any previous errors when we get a successful response
      if (error) setError(null)
    },
  })

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setIsProcessing(true)
    setError(null)
    const newFiles = Array.from(uploadedFiles)
    setFiles((prev) => [...prev, ...newFiles])

    try {
      const file = newFiles[0]
      const text = await extractTextFromFile(file)
      setExtractedText(text)

      // Add a system message about the uploaded file
      setMessages((prev) => [
        ...prev,
        {
          id: `system-file-${Date.now()}`,
          role: "system",
          content: `File uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        },
      ])

      // For PDF files, add a helpful message about how to use them
      if (file.type === "application/pdf") {
        setMessages((prev) => [
          ...prev,
          {
            id: `system-pdf-help-${Date.now()}`,
            role: "assistant",
            content: `I see you've uploaded a PDF file (${file.name}).

In this demo, I can't directly read the content of PDF files. To chat about your PDF:

1. Open your PDF in another window
2. Copy some text from it
3. Paste it here with a message like "Here's some content from my PDF: [paste text]"

You can also type /pdf-help for more detailed instructions.`,
          },
        ])
      } else {
        // For non-PDF files, add a user message to trigger the AI
        append(
          {
            role: "user",
            content: `I've uploaded a document called "${file.name}". Please help me understand its content.`,
          },
          {
            body: {
              extractedText: text,
            },
          },
        )
      }
    } catch (error) {
      console.error("Error processing file:", error)
      setError(`Error processing file: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle command history navigation
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Simple tab completion for commands
      if (input.startsWith("/")) {
        const commands = ["/help", "/clear", "/reset", "/about", "/file", "/pdf-help"]
        const matchingCommands = commands.filter((cmd) => cmd.startsWith(input))
        if (matchingCommands.length === 1) {
          setInput(matchingCommands[0])
        }
      }
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Don't submit empty messages
    if (!input.trim()) return

    // Add to command history if not empty
    if (input.trim()) {
      setCommandHistory((prev) => [...prev, input])
      setHistoryIndex(-1)
    }

    // Check if it's a terminal command
    if (input.startsWith("/")) {
      const result = handleTerminalCommand({
        command: input,
        setMessages,
        setError,
        setExtractedText,
        setFiles,
        files,
        extractedText,
        reload,
      })

      if (result.handled) {
        setInput("")
        return
      }
    }

    // Check if the user is pasting PDF content
    if (
      (input.toLowerCase().includes("here's the content") ||
        input.toLowerCase().includes("here is the content") ||
        input.toLowerCase().includes("from my pdf") ||
        input.toLowerCase().includes("from the pdf")) &&
      input.length > 100
    ) {
      // Update the extracted text with the pasted content
      setExtractedText(input)
    }

    // Otherwise, proceed with normal submission
    handleSubmit(e)
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [messages])

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-mono p-4">
      <div className="flex-none mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs">terminal@chat:~</span>
          </div>
          <div className="text-xs text-green-700 flex items-center">
            {files.length > 0 && (
              <>
                <FileText className="h-3 w-3 mr-1" />
                <span>{files[0].name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 p-2 mb-4 rounded flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Terminal messages={messages} isLoading={isLoading} ref={terminalRef} />

      <div className="flex-none mt-4">
        <div className="flex items-center space-x-2">
          <FileUpload onUpload={handleFileUpload} isProcessing={isProcessing} files={files} />

          <form onSubmit={handleFormSubmit} className="flex-1 flex items-center">
            <span className="text-green-500 mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or /help for commands..."
              className="flex-1 bg-transparent border-none outline-none text-green-500 placeholder-green-700"
              disabled={isLoading || isProcessing}
              autoComplete="off"
            />
            <span className="cursor-blink ml-1">|</span>
          </form>
        </div>
      </div>
    </div>
  )
}
