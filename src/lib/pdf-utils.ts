import * as pdfjsLib from "pdfjs-dist";
import { TextItem } from "pdfjs-dist/types/src/display/api";

if (typeof window !== "undefined") {
	// Import the worker directly from node_modules
	pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
}

interface TextPosition {
	str: string;
	x: number;
	y: number;
	width: number;
}

export async function extractTextFromPdf(file: File): Promise<string> {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
		let fullText = "";

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const textContent = await page.getTextContent();

			// Convert items to positions with coordinates
			const textItems = textContent.items
				.filter((item): item is TextItem => "str" in item && item.str.trim().length > 0)
				.map((item) => ({
					str: item.str.trim(),
					x: item.transform[4],
					y: item.transform[5],
					width: item.width || 0,
				}));

			// Sort by vertical position (top to bottom) and then horizontal (left to right)
			const sortedItems = textItems.sort((a, b) => {
				const yDiff = b.y - a.y;
				return yDiff !== 0 ? yDiff : a.x - b.x;
			});

			let currentLine: TextPosition[] = [];
			let lastY: number | null = null;
			let pageText = "";

			// Process items line by line
			for (const item of sortedItems) {
				if (lastY === null || Math.abs(item.y - lastY) > 3) {
					// New line detected
					if (currentLine.length > 0) {
						// Sort current line by x position and add to text
						const lineText = currentLine
							.sort((a, b) => a.x - b.x)
							.map((item) => item.str)
							.join(" ");
						pageText += lineText + "\n";

						// Add extra line break for paragraphs
						if (lastY !== null && Math.abs(item.y - lastY) > 15) {
							pageText += "\n";
						}
					}
					currentLine = [item];
				} else {
					// Same line, add to current line array
					currentLine.push(item);
				}
				lastY = item.y;
			}

			// Add last line
			if (currentLine.length > 0) {
				const lineText = currentLine
					.sort((a, b) => a.x - b.x)
					.map((item) => item.str)
					.join(" ");
				pageText += lineText + "\n";
			}

			fullText += pageText + "\n"; // Add page break
		}

		// Clean up the text
		return fullText
			.replace(/\n\s*\n\s*\n/g, "\n\n") // Replace multiple line breaks
			.replace(/[^\S\n]+/g, " ") // Replace multiple spaces (except line breaks)
			.replace(/\n\s+/g, "\n") // Remove spaces at start of lines
			.trim();
	} catch (error) {
		throw error;
	}
}
