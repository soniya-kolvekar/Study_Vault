import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "No API Key found." });
    }

    try {
        // Direct REST call to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        return NextResponse.json({
            keyConfigured: true,
            status: response.status,
            availableModels: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
