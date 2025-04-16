// Simple utility to extract text from files without external dependencies
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type

  // For text files and markdown
  if (fileType === "text/plain" || fileType === "text/markdown") {
    return await file.text()
  }

  // For PDF files - we need to explain the limitations
  if (fileType === "application/pdf") {
    // In a production app, you would use PDF.js to extract text
    // Since we can't use external libraries in this demo, we'll provide instructions
    return `[This is a PDF document: ${file.name}]

IMPORTANT: In this demo environment, I cannot directly extract text from PDF files.
To chat about your PDF, please copy and paste some text from your PDF below.

For example:
1. Open your PDF in another window
2. Copy a section of text you want to discuss
3. Paste it in the chat with a message like "Here's the content from my PDF: [paste text here]"

I'll then be able to help you understand that specific content.`
  }

  return `File uploaded: ${file.name} (${file.type})
File size: ${(file.size / 1024).toFixed(2)} KB

This file type may not be fully supported for text extraction in this demo.
You can still ask questions about the file metadata.`
}
