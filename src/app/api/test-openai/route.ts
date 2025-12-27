import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY is not set in environment variables"
      }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })

    // Simple test call using free model
    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "user",
          content: "Say 'Hello, Gradex is working!' in exactly those words."
        }
      ],
      max_tokens: 50,
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      message: "OpenRouter API is working!",
      response: response,
      model: "mistralai/mistral-7b-instruct:free"
    })

  } catch (error) {
    console.error("OpenAI Test Error:", error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({
        success: false,
        error: `OpenAI API Error: ${error.message}`,
        status: error.status,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
