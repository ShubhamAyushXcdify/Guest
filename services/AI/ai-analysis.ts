import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getReportTemplate, getTemplateInstructions, type ReportTemplateData } from './report-template';

interface FileAnalysisParams {
    fileBase64: string;
    fileName: string;
    contentType: string;
    fileBuffer: ArrayBuffer;
    messages?: any[];
}

export class AiAnalysis {
    private readonly apiKey: string;
    private readonly modelName: string;
    private readonly analysisProvider: string;

    constructor(apiKey?: string, modelName: string = 'gemini-2.5-flash') {
        if (!apiKey && !process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        this.apiKey = apiKey || process.env.GEMINI_API_KEY!;
        this.analysisProvider = process.env.ANALYSIS_PROVIDER! || 'gemini';
        this.modelName = modelName;
    }

    /**
     * Main method to analyze a file and return a streaming response
     */
    async analyzeFile(params: FileAnalysisParams) {
        const { fileBase64, fileName, contentType, fileBuffer, messages = [] } = params;

        const isPdf = this.isPdfFile(contentType, fileName);
        const isImage = this.isImageFile(contentType);
        const mimeType = this.getMimeType(contentType, fileName, isPdf, isImage);

        const model = this.getModel();
        const userMessage = this.buildUserMessage(messages, isPdf, isImage, fileName, contentType);
        const contentParts = this.buildContentParts(userMessage, fileBase64, mimeType, isPdf, isImage, contentType, fileBuffer);
        const systemPrompt = this.getSystemPrompt(fileName, contentType);

        const result = streamText({
            model,
            messages: [
                {
                    role: 'user',
                    content: contentParts,
                },
            ],
            system: systemPrompt,
        });

        return result;
    }

    /**
     * Determines if a file is a PDF
     */
    private isPdfFile(contentType: string, fileName: string): boolean {
        return contentType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');
    }

    /**
     * Determines if a file is an image
     */
    private isImageFile(contentType: string): boolean {
        return contentType.startsWith('image/');
    }

    /**
     * Gets the appropriate MIME type for the file
     */
    private getMimeType(contentType: string, fileName: string, isPdf: boolean, isImage: boolean): string {
        if (isPdf) return 'application/pdf';
        if (isImage) return contentType;
        return 'application/octet-stream';
    }

    /**
     * Gets the Google Gemini model instance
     */
    private getModel() {
        return google(this.modelName);
    }

    /**
     * Builds the user message for the AI analysis
     */
    private buildUserMessage(messages: any[], isPdf: boolean, isImage: boolean, fileName: string, contentType: string): string {
        if (messages.length > 0 && typeof messages[messages.length - 1]?.content === 'string') {
            return messages[messages.length - 1].content;
        }

        const fileTypeDescription = isPdf ? 'PDF document' : isImage ? 'image' : 'file';
        const templateData: ReportTemplateData = {
            fileName,
            analysisDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            fileType: isPdf ? 'PDF' : isImage ? contentType.split('/')[1].toUpperCase() : contentType
        };
        const template = getReportTemplate(templateData);

        return `Please analyze this ${fileTypeDescription} and provide a detailed analysis. 

Use the following HTML template structure and fill in your analysis content in the main section while maintaining the header and footer:

${template}

Follow the template structure exactly - keep the header with file information and date, add your detailed analysis in the main content area, and maintain the footer with disclaimer.`;
    }

    /**
     * Builds the content parts array for the AI model
     */
    private buildContentParts(
        userMessage: string,
        fileBase64: string,
        mimeType: string,
        isPdf: boolean,
        isImage: boolean,
        contentType: string,
        fileBuffer: ArrayBuffer
    ): any[] {
        const contentParts: any[] = [
            {
                type: 'text',
                text: userMessage,
            },
        ];

        // Add file as image based on type (Gemini supports both images and PDFs as base64)
        if (isPdf || isImage) {
            // For PDFs and images, use image format with data URI
            contentParts.push({
                type: 'image',
                image: `data:${mimeType};base64,${fileBase64}`,
                mimeType: mimeType,
            });
        } else {
            // For other files, provide text description
            contentParts.push({
                type: 'text',
                text: `Note: This file type (${contentType}) may not be fully analyzable. File size: ${Math.round(fileBuffer.byteLength / 1024)}KB`,
            });
        }

        return contentParts;
    }

    /**
     * Gets the system prompt for medical file analysis
     */
    private getSystemPrompt(fileName: string, contentType: string): string {
        const templateInstructions = getTemplateInstructions();

        return `You are a helpful medical assistant that analyzes files (such as PDFs, images, or medical documents) and provides detailed analysis.

                ${templateInstructions}

                Your analysis should:
                - Be thorough and professional
                - Include sections for Findings, Diagnosis, Recommendations, and Observations when applicable
                - Use tables for structured data (lab results, measurements, etc.)
                - Use lists for multiple findings or recommendations
                - Apply Tailwind CSS classes consistently for styling
                - Ensure the output is visually appealing and well-organized
                - Maintain accessibility with proper semantic HTML

                The file being analyzed is: ${fileName} (${contentType})
                Make sure the header and footer match the template structure provided in the user message.`;
    }
}
