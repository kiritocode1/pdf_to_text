import { type NextRequest, NextResponse } from "next/server"
import * as pdfjsLib from "pdfjs-dist"

// Ensure the worker is properly set up
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
    let fullText = ""

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const textItems = textContent.items.map((item: any) => item.str).join(" ")
      fullText += textItems + "\n\n"
    }

    return NextResponse.json({ text: fullText })
  } catch (error) {
    console.error("Error extracting text:", error)
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 })
  }
}

