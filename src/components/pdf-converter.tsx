"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "./file-uploader";
import { extractTextFromPdf } from "@/lib/pdf-utils";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2 } from "lucide-react";

export function PdfConverter() {
	const [extractedText, setExtractedText] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>("");

	const handleFileUpload = async (file: File) => {
		if (!file) return;

		try {
			setIsLoading(true);
			setFileName(file.name);
			// Using PDF.js (pdfjs-dist) to extract text
			const text = await extractTextFromPdf(file);
			setExtractedText(text);
		} catch (error) {
			console.error("Error extracting text:", error);
			setExtractedText("Error extracting text from PDF. Please try another file.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = () => {
		if (!extractedText) return;

		const blob = new Blob([extractedText], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName.replace(".pdf", ".txt");
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Convert PDF to Text</CardTitle>
				<CardDescription>Upload a PDF file to extract its text content</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<FileUploader onFileUpload={handleFileUpload} />

				{isLoading && (
					<div className="flex justify-center items-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-2">Extracting text...</span>
					</div>
				)}

				{extractedText && !isLoading && (
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium">Extracted Text</h3>
							<Button
								variant="outline"
								size="sm"
								onClick={handleDownload}
								className="flex items-center gap-1"
							>
								<Download className="h-4 w-4" />
								Download
							</Button>
						</div>
						<Textarea
							value={extractedText}
							readOnly
							className="min-h-[300px] font-mono text-sm whitespace-pre-wrap p-4"
							style={{
								lineHeight: "1.6",
								letterSpacing: "0.01em",
								tabSize: 4,
							}}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
