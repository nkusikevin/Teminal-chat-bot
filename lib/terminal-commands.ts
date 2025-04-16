import type { Message } from "ai"
import type { Dispatch, SetStateAction } from "react"

interface TerminalCommandProps {
  command: string
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void
  setError: Dispatch<SetStateAction<string | null>>
  setExtractedText: Dispatch<SetStateAction<string>>
  setFiles: Dispatch<SetStateAction<File[]>>
  files: File[]
  extractedText: string
  reload?: () => void
}

interface CommandResult {
  handled: boolean
  message?: string
}

export function handleTerminalCommand({
  command,
  setMessages,
  setError,
  setExtractedText,
  setFiles,
  files,
  extractedText,
  reload,
}: TerminalCommandProps): CommandResult {
  const cmd = command.trim().toLowerCase()

  // Handle /clear command
  if (cmd === "/clear") {
    setMessages([
      {
        id: "system-clear",
        role: "system",
        content: "Terminal cleared.",
      },
    ])
    return { handled: true }
  }

  // Handle /reset command
  if (cmd === "/reset") {
    setMessages([
      {
        id: "system-reset",
        role: "system",
        content: "Chat history has been reset.",
      },
    ])
    setExtractedText("")
    setFiles([])
    return { handled: true }
  }

  // Handle /help command
  if (cmd === "/help") {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: "/help",
      },
      {
        id: `system-help-${Date.now()}`,
        role: "assistant",
        content: `Available commands:

/help - Show this help message
/clear - Clear the terminal screen
/reset - Reset the chat history and remove uploaded files
/about - Show information about this application
/file - Show information about the uploaded file
/file clear - Remove the uploaded file
/reload - Reload the chat with the current document
/pdf-help - Show instructions for working with PDF files`,
      },
    ])
    return { handled: true }
  }

  // Handle /pdf-help command
  if (cmd === "/pdf-help") {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: "/pdf-help",
      },
      {
        id: `system-pdf-help-${Date.now()}`,
        role: "assistant",
        content: `Working with PDFs in Terminal Chat:

Due to technical limitations in this demo environment, I cannot directly extract text from PDF files.
To chat about your PDF content, please follow these steps:

1. Open your PDF in another window or application
2. Select and copy (Ctrl+C or Cmd+C) the text you want to discuss
3. Return to this chat and paste (Ctrl+V or Cmd+V) the text
4. Add a message like "Here's the content from my PDF: [pasted text]"

I'll then be able to analyze and respond to the specific content you've shared.

For a production application, PDF text extraction would be implemented using libraries like PDF.js.`,
      },
    ])
    return { handled: true }
  }

  // Handle /about command
  if (cmd === "/about") {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: "/about",
      },
      {
        id: `system-about-${Date.now()}`,
        role: "assistant",
        content: `Terminal Chat v1.0.0

A command-line style chat interface with document upload capabilities.
Built with Next.js, OpenAI, and the AI SDK.

Type /help to see available commands.`,
      },
    ])
    return { handled: true }
  }

  // Handle /file command
  if (cmd === "/file") {
    if (files.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: "/file",
        },
        {
          id: `system-file-${Date.now()}`,
          role: "assistant",
          content: "No files have been uploaded.",
        },
      ])
    } else {
      const fileInfo = files
        .map((file) => `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`)
        .join("\n")

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: "/file",
        },
        {
          id: `system-file-${Date.now()}`,
          role: "assistant",
          content: `Uploaded files:\n${fileInfo}\n\nExtracted text length: ${extractedText.length} characters`,
        },
      ])
    }
    return { handled: true }
  }

  // Handle /file clear command
  if (cmd === "/file clear") {
    setFiles([])
    setExtractedText("")
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: "/file clear",
      },
      {
        id: `system-file-clear-${Date.now()}`,
        role: "assistant",
        content: "All uploaded files have been removed.",
      },
    ])
    return { handled: true }
  }

  // Handle /reload command
  if (cmd === "/reload" && reload) {
    if (files.length === 0) {
      setError("No file to reload. Please upload a file first.")
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: "/reload",
        },
        {
          id: `system-reload-${Date.now()}`,
          role: "system",
          content: "Reloading chat with the current document...",
        },
      ])

      // Use the reload function from useChat
      reload()
    }
    return { handled: true }
  }

  // If the command starts with / but isn't recognized
  if (cmd.startsWith("/")) {
    setError(`Unknown command: ${cmd}. Type /help for available commands.`)
    return { handled: true }
  }

  // Not a command
  return { handled: false }
}
