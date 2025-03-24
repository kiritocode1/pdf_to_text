import * as pdfjsLib from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";

if (typeof window !== "undefined") {
	// Import the worker directly from node_modules
	pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
}

export async function extractTextFromPdf(file: File): Promise<string> {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
		let fullText = "";

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const textContent = await page.getTextContent();
			const textItems = textContent.items
				.filter((item): item is TextItem => "str" in item)
				.map((item) => item.str)
				.join(" ");
			fullText += textItems + "\n\n";
		}

		return fullText;
	} catch (error) {
		throw error;
	}
}
