import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are the AI Assistant for StudyVault, a student resource sharing platform for Sahyadri College of Engineering.
Your goal is to help students navigate the app, find resources, and understand their study materials.

**Project Context:**
- **Team**: Soniya (Team Lead), Tanish Poojari, Saishree Shet, Varun.
- **Purpose**: Share notes, question papers, and resources seamlessly.
- **Departments**: Computer Science (CS), Information Science (IS), Robotics and Automation, Electronics & Communication (E&C), Mechanical (Mech).

**Capabilities:**
- You can summarize notes and question papers if the user provides them.
- You can identify important topics from Question Papers (PYQs).

**Rules:**
1. Answer ONLY questions related to StudyVault or the study materials provided.
2. If the user provided a document (PDF/Image), focus your answer on analyzing that document.
3. Be friendly, encouraging, and concise.
`;

export async function POST(req: Request) {
    try {
        const { message, history, contextFileUrl, contextFileType, resourceList } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ text: "Error: Gemini API Key is missing. Please check .env.local" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Helper function to run chat with a specific model
        const runChat = async (modelName: string, chatParts: any[]) => {
            console.log(`Attempting to generate with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            // Construct System Prompt with Context
            let contextPrompt = SYSTEM_PROMPT;
            if (resourceList && resourceList.length > 0) {
                contextPrompt += `\n\n**Current Folder Content:**\nThe user is viewing a folder with the following files: \n- ${resourceList.join("\n- ")}\n\nYou can refer to these files if the user asks what is available. However, you can ONLY read the content of a file if the user actively opens it (providing a contextFileUrl).`;
            }

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: contextPrompt }] },
                    { role: "model", parts: [{ text: "Understood." }] },
                    ...history.map((msg: any) => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }],
                    }))
                ],
            });
            return await chat.sendMessage(chatParts);
        }

        // Prepare parts
        const parts: any[] = [];
        if (contextFileUrl) {
            try {
                const fileResp = await fetch(contextFileUrl);
                const arrayBuffer = await fileResp.arrayBuffer();
                const base64Data = Buffer.from(arrayBuffer).toString("base64");

                let mimeType = "image/jpeg";
                if (contextFileType === "pdf" || contextFileUrl.endsWith(".pdf")) mimeType = "application/pdf";

                parts.push({ inlineData: { data: base64Data, mimeType } });
                parts.push({ text: "\n\nAnalyze this document context. " });
            } catch (err) {
                console.error("Error fetching context file:", err);
            }
        }
        parts.push({ text: message });

        let result;
        let responseText = "";

        // STRATEGY: Try Flash Latest (Your available model)
        try {
            // Attempt 1: Gemini Flash Latest (Confirmed available on your key)
            result = await runChat("gemini-flash-latest", parts);
            responseText = result.response.text();
        } catch (err1) {
            console.error("Attempt 1 (Flash Latest) failed:", err1);

            try {
                // Attempt 2: Gemini Pro Latest (Fallback)
                console.log("Falling back to Gemini Pro Latest...");
                result = await runChat("gemini-pro-latest", parts);
                responseText = result.response.text();
            } catch (err2) {
                console.error("Attempt 2 (Pro Latest) failed:", err2);
                const errorMessage = (err2 as any).message || "Unknown error";
                return NextResponse.json({ text: `Connection Failed: ${errorMessage}` }, { status: 500 });
            }
        }

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error("Gemini API Fatal Error:", error);
        return NextResponse.json({ text: "Sorry, something went wrong on the server." }, { status: 500 });
    }
}
