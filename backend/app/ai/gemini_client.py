import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize the new google-genai client
_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

TOOLS_CATALOG = """
BROWSER TOOLS:
- browser.open_youtube       → Args: {query: string}   | "search naino mein sapna on youtube", "youtube search lo-fi"
- browser.google_search      → Args: {query: string}   | "google this", "search for python tutorials"
- browser.open_website       → Args: {url: string}      | "open github.com", "go to netflix"
- browser.open_new_tab       → Args: {url: string}      | "new tab", "open new tab with google"

SYSTEM TOOLS:
- system.take_screenshot     → Args: {}                 | "take screenshot", "capture screen", "screenshot le"
- system.open_camera         → Args: {}                 | "take a picture", "click a photo", "open camera", "selfie"
- system.open_app            → Args: {app_name: string} | "open notepad", "launch chrome", "start VS code"
- system.minimize_window     → Args: {}                 | "minimize", "minimize window"
- system.maximize_window     → Args: {}                 | "maximize", "full screen"
- system.volume_up           → Args: {amount: number}   | "volume up", "increase volume", "thoda aur loud karo"
- system.volume_down         → Args: {amount: number}   | "volume down", "decrease volume", "quiet karo"
- system.mute                → Args: {}                 | "mute", "silent karo", "band karo sound"
- system.shutdown            → Args: {} [CONFIRM]       | "shutdown", "band karo pc"
- system.restart             → Args: {} [CONFIRM]       | "restart", "reboot"

CLIPBOARD TOOLS:
- clipboard.read             → Args: {}                 | "read clipboard", "what did I copy"
- clipboard.clear            → Args: {}                 | "clear clipboard"

FILE TOOLS:
- file.open_downloads        → Args: {}                 | "open downloads", "downloads folder dikhao"
- file.open_documents        → Args: {}                 | "open documents", "my documents"
- file.open_desktop          → Args: {}                 | "open desktop", "show desktop files"
- file.create_folder         → Args: {name, location}   | "create folder named Projects"

AI TOOLS:
- ai.answer_question         → Args: {question: string} | general questions, facts, calculations
- ai.generate_email          → Args: {topic, recipient} | "write email about leave", "draft email to boss"
- ai.explain_topic           → Args: {topic: string}    | "explain quantum computing", "what is RAG"
- ai.summarize_text          → Args: {text: string}     | "summarize this: ..."

NOTES TOOLS:
- notes.create               → Args: {title, content}   | "create note", "save this as note", "note banao"
- notes.list                 → Args: {}                 | "show my notes", "list notes"

WEATHER TOOL:
- weather.get                → Args: {location: string} | "weather in Delhi", "aaj ka mausam", "what's the weather"

MEDIA TOOLS:
- media.play_youtube         → Args: {query: string}    | "play Arijit Singh", "chala do koi song", "play lo-fi"
- media.pause_media          → Args: {}                 | "pause", "ruko", "stop music"
"""

SYSTEM_PROMPT = f"""You are JARVIS, an AI assistant for a Windows desktop app. Your ONLY job is to map the user's voice command to the correct tool from the catalog below and return a JSON response.

TOOL CATALOG:
{TOOLS_CATALOG}

RULES:
1. Return ONLY raw JSON — no markdown, no explanation, no code blocks.
2. For ambiguous commands, use ai.answer_question.
3. For shutdown/restart, set requires_confirmation to true.
4. Keep response_text SHORT (1-2 sentences, spoken aloud by TTS).
5. Understand Indian English slang: "yaar", "bhai", "chala do", "dikha do", "abhi", "thoda", etc.
6. For music requests → media.play_youtube. For generic YouTube search → browser.open_youtube.
7. Multi-step commands like "open YouTube and search lo-fi" → use the primary action tool.

REQUIRED JSON FORMAT (return exactly this structure):
{{
  "tool": "category.action",
  "args": {{}},
  "response_text": "Short, friendly spoken response",
  "response_mode": "short",
  "requires_confirmation": false
}}"""


async def map_intent(command: str, context: str = None) -> dict:
    """Use Gemini to map natural language to a tool + args."""
    if not _client:
        return {
            "tool": "ai.answer_question",
            "args": {"question": command},
            "response_text": "Gemini API key is not configured yet. Please add it to your .env file.",
            "response_mode": "short",
            "requires_confirmation": False,
        }

    try:
        user_prompt = f'User command: "{command}"'
        if context:
            user_prompt += f"\nContext: {context}"

        response = await _client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=[SYSTEM_PROMPT, user_prompt],
            config={
                "temperature": 0.1,
                "max_output_tokens": 512,
            },
        )

        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        parsed = json.loads(raw)

        # Ensure all required fields exist
        parsed.setdefault("args", {})
        parsed.setdefault("response_mode", "short")
        parsed.setdefault("requires_confirmation", False)

        return parsed

    except json.JSONDecodeError:
        return {
            "tool": "ai.answer_question",
            "args": {"question": command},
            "response_text": "I understood your request but had trouble parsing it. Let me try to help.",
            "response_mode": "short",
            "requires_confirmation": False,
        }
    except Exception as e:
        return {
            "tool": "ai.answer_question",
            "args": {"question": command},
            "response_text": f"Something went wrong: {str(e)[:80]}",
            "response_mode": "short",
            "requires_confirmation": False,
        }
