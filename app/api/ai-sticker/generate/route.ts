import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Hugging Face API key is not configured" },
                { status: 500 }
            );
        }

        // Enhance prompt for sticker style
        const enhancedPrompt = `${prompt}, sticker design, die-cut, white background, vector art, 2d, high quality, vibrant colors`;

        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: enhancedPrompt }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Hugging Face API error: ${response.status} ${errorText}` },
                { status: response.status }
            );
        }

        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "image/jpeg",
                "Content-Length": buffer.length.toString(),
            },
        });
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
