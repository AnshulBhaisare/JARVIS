import os
import httpx
from google import genai
from dotenv import load_dotenv

load_dotenv()


def _get_genai_client():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


async def answer_question(question: str) -> str:
    client = _get_genai_client()
    if not client:
        return "Gemini API key not configured. Please add it to your .env file."
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Answer this question clearly and concisely (max 3 paragraphs): {question}",
        )
        return response.text
    except Exception as e:
        return f"Error fetching answer: {str(e)}"


async def generate_email(topic: str, recipient: str = None) -> str:
    client = _get_genai_client()
    if not client:
        return "Gemini API key not configured."
    try:
        prompt = f"Write a professional email draft about: {topic}"
        if recipient:
            prompt += f". The email is addressed to: {recipient}"
        prompt += "\n\nFormat it as a complete email with Subject, greeting, body, and sign-off."
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        return f"Error generating email: {str(e)}"


async def explain_topic(topic: str) -> str:
    client = _get_genai_client()
    if not client:
        return "Gemini API key not configured."
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Explain this topic clearly with examples (suitable for a student or developer): {topic}",
        )
        return response.text
    except Exception as e:
        return f"Error explaining topic: {str(e)}"


async def summarize_text(text: str) -> str:
    client = _get_genai_client()
    if not client:
        return "Gemini API key not configured."
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Summarize the following text in bullet points:\n\n{text}",
        )
        return response.text
    except Exception as e:
        return f"Error summarizing: {str(e)}"


async def get_weather(location: str = "") -> str:
    try:
        query = location.strip() if location else ""
        url = f"https://wttr.in/{query}?format=3" if query else "https://wttr.in/?format=3"
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)
            return response.text.strip()
    except Exception as e:
        return f"Could not fetch weather: {str(e)}"
